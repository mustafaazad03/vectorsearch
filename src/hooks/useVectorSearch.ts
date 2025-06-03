import { useState, useEffect, useCallback, useRef } from 'react';
import { ParsedTranscriptFile } from '../types';
import { vectorSearchService } from '../service/vectorSearchService';

export const useVectorSearch = (documents: ParsedTranscriptFile[]) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const initializationRef = useRef(false);
  const documentsRef = useRef<ParsedTranscriptFile[]>([]);

  // Initialize vector database when documents change
  useEffect(() => {
    const initializeVectorDB = async () => {
      // Prevent multiple initializations
      if (initializationRef.current || !documents || documents.length === 0) {
        return;
      }

      // Check if documents actually changed
      if (documents === documentsRef.current) {
        return;
      }

      initializationRef.current = true;
      documentsRef.current = documents;
      setInitializationError(null);

      try {
        console.log('Initializing vector search for', documents.length, 'documents');
        await vectorSearchService.initializeVectorDatabase(documents);
        setIsInitialized(true);
        console.log('Vector search initialized successfully');
      } catch (error) {
        console.error('Failed to initialize vector database:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown error');
        initializationRef.current = false;
      }
    };

    initializeVectorDB();
  }, [documents]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      vectorSearchService.cleanup();
    };
  }, []);

  // Optimized search function
  const performSearch = useCallback(
    (query: string): ParsedTranscriptFile[] => {
      if (!query.trim() || !isInitialized) {
        return [];
      }

      setIsSearching(true);
      try {
        const results = vectorSearchService.vectorSearch(query, 0.05, 20);
        return results.map(r => r.document);
      } catch (error) {
        console.error('Search failed:', error);
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    [isInitialized]
  );

  return {
    isInitialized,
    isSearching,
    initializationError,
    performSearch
  };
};