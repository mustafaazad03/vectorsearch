import { ParsedTranscriptFile } from '../types';

interface VectorSearchResult {
  document: ParsedTranscriptFile;
  score: number;
  matchedFields: string[];
}

interface DocumentIndex {
  id: string;
  terms: Map<string, number>; // term -> tf score
  magnitude: number;
  fieldData: {
    filename: string[];
    title: string[];
    participants: string[];
    content: string[];
  };
}

class VectorSearchService {
  private documents: ParsedTranscriptFile[] = [];
  private documentIndex: Map<string, DocumentIndex> = new Map();
  private idfScores: Map<string, number> = new Map();
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // Optimized stop words set
  private readonly stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  // Memory-efficient text preprocessing
  private preprocessText(text: string): string[] {
    if (!text || typeof text !== 'string') return [];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word))
      .slice(0, 500); // Limit to first 500 meaningful words to prevent memory issues
  }

  // Extract field-specific text with memory optimization
  private extractFieldTexts(doc: ParsedTranscriptFile): {
    filename: string[];
    title: string[];
    participants: string[];
    content: string[];
  } {
    return {
      filename: this.preprocessText(doc.filename || ''),
      title: this.preprocessText(doc.data.title || ''),
      participants: this.preprocessText(
        doc.data.participants?.slice(0, 10) // Limit participants to prevent memory bloat
          ?.map(p => `${p.name} ${p.company} ${p.title}`)
          .join(' ') || ''
      ),
      content: this.preprocessText(
        doc.data.segments?.slice(0, 100) // Limit to first 100 segments
          ?.map(s => `${s.speaker}: ${s.content}`)
          .join(' ') || ''
      )
    };
  }

  // Efficient TF calculation
  private calculateTF(words: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    const totalWords = words.length;
    
    if (totalWords === 0) return tf;
    
    for (const word of words) {
      tf.set(word, (tf.get(word) || 0) + 1);
    }
    
    // Normalize
    for (const [word, count] of tf.entries()) {
      tf.set(word, count / totalWords);
    }
    
    return tf;
  }

  // Batch processing for initialization
  private async processDocumentsBatch(docs: ParsedTranscriptFile[], batchSize: number = 50): Promise<void> {
    const termCounts = new Map<string, number>();
    
    // Process in batches to prevent blocking
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      
      // Process batch
      for (const doc of batch) {
        const fieldTexts = this.extractFieldTexts(doc);
        const allWords = [
          ...fieldTexts.filename,
          ...fieldTexts.title,
          ...fieldTexts.participants,
          ...fieldTexts.content
        ];
        
        const tfScores = this.calculateTF(allWords);
        
        // Calculate vector magnitude efficiently
        let magnitude = 0;
        for (const score of tfScores.values()) {
          magnitude += score * score;
        }
        magnitude = Math.sqrt(magnitude);
        
        // Store optimized document index
        this.documentIndex.set(doc.filename, {
          id: doc.filename,
          terms: tfScores,
          magnitude,
          fieldData: fieldTexts
        });
        
        // Count terms for IDF
        const uniqueTerms = new Set(allWords);
        for (const term of uniqueTerms) {
          termCounts.set(term, (termCounts.get(term) || 0) + 1);
        }
      }
      
      // Yield control to prevent blocking
      if (i + batchSize < docs.length) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    // Calculate IDF scores efficiently
    const totalDocs = docs.length;
    for (const [term, docCount] of termCounts.entries()) {
      this.idfScores.set(term, Math.log(totalDocs / (docCount + 1)));
    }
  }

  // Optimized cosine similarity with early termination
  private calculateSimilarity(queryTerms: Map<string, number>, docIndex: DocumentIndex): number {
    let dotProduct = 0;
    let queryMagnitude = 0;
    
    // Calculate only for terms that exist in both query and document
    for (const [term, queryTf] of queryTerms.entries()) {
      const docTf = docIndex.terms.get(term);
      if (docTf) {
        const idf = this.idfScores.get(term) || 0;
        const queryTfIdf = queryTf * idf;
        const docTfIdf = docTf * idf;
        
        dotProduct += queryTfIdf * docTfIdf;
        queryMagnitude += queryTfIdf * queryTfIdf;
      }
    }
    
    queryMagnitude = Math.sqrt(queryMagnitude);
    
    if (queryMagnitude === 0 || docIndex.magnitude === 0) return 0;
    
    return dotProduct / (queryMagnitude * docIndex.magnitude);
  }

  // Get matched fields efficiently
  private getMatchedFields(docIndex: DocumentIndex, queryWords: string[]): string[] {
    const matched: string[] = [];
    const querySet = new Set(queryWords);
    
    if (docIndex.fieldData.filename.some(word => querySet.has(word))) {
      matched.push('filename');
    }
    if (docIndex.fieldData.title.some(word => querySet.has(word))) {
      matched.push('title');
    }
    if (docIndex.fieldData.participants.some(word => querySet.has(word))) {
      matched.push('participants');
    }
    if (docIndex.fieldData.content.some(word => querySet.has(word))) {
      matched.push('content');
    }
    
    return matched;
  }

  // Public API
  async initializeVectorDatabase(documents: ParsedTranscriptFile[]): Promise<void> {
    if (this.isInitialized || this.initializationPromise) {
      return this.initializationPromise || Promise.resolve();
    }

    this.initializationPromise = (async () => {
      try {
        this.documents = documents;
        await this.processDocumentsBatch(documents);
        this.isInitialized = true;
      } catch (error) {
        console.error('Vector database initialization failed:', error);
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  vectorSearch(query: string, threshold: number = 0.05, limit: number = 20): VectorSearchResult[] {
    if (!query.trim() || !this.isInitialized) return [];

    const queryWords = this.preprocessText(query);
    if (queryWords.length === 0) return [];

    const queryTerms = this.calculateTF(queryWords);
    const results: VectorSearchResult[] = [];

    // Early termination for performance
    let processed = 0;
    const maxProcessed = Math.min(this.documents.length, 1000); // Process max 1000 docs

    for (const doc of this.documents) {
      if (processed >= maxProcessed) break;
      
      const docIndex = this.documentIndex.get(doc.filename);
      if (!docIndex) continue;

      const similarity = this.calculateSimilarity(queryTerms, docIndex);
      
      if (similarity >= threshold) {
        const matchedFields = this.getMatchedFields(docIndex, queryWords);
        
        results.push({
          document: doc,
          score: similarity,
          matchedFields
        });
      }
      
      processed++;
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Cleanup method for memory management
  cleanup(): void {
    this.documentIndex.clear();
    this.idfScores.clear();
    this.documents = [];
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  getInitializationStatus(): { isInitialized: boolean; progress?: number } {
    return { 
      isInitialized: this.isInitialized,
      progress: this.initializationPromise ? undefined : 100
    };
  }
}

export const vectorSearchService = new VectorSearchService();