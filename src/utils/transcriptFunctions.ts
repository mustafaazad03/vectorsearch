import { TranscriptData, Participant, TranscriptSegment } from '@/types';

export class TranscriptParser {
  
  static parseTranscript(content: string): TranscriptData {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract title and date
    const { title, date } = this.extractTitleAndDate(lines);
    
    // Extract participants
    const participants = this.extractParticipants(lines);
    
    // Extract segments
    const segments = this.extractSegments(lines, participants);
    
    return {
      title,
      date,
      participants,
      segments
    };
  }

  private static extractTitleAndDate(lines: string[]): { title: string; date: string } {
    let title = '';
    let date = '';
    
    // Look for title in the first few lines
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      
      // Extract company name from lines like "Adobe Inc. - Special Call"
      if (line.includes(' - ') && !title) {
        title = line;
      }
      
      // Extract date from various formats
      if (this.isDateLine(line)) {
        date = this.formatDate(line);
        break;
      }
    }
    
    return { title: title || 'Transcript Call', date: date || 'Date not found' };
  }

  private static extractParticipants(lines: string[]): Participant[] {
    const participants: Participant[] = [];
    let inParticipantsSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect participants section
      if (line.toLowerCase().includes('corporate participants') || 
          line.toLowerCase().includes('conference call participants')) {
        inParticipantsSection = true;
        continue;
      }
      
      // End of participants section
      if (inParticipantsSection && 
          (line.toLowerCase().includes('prepared remarks') || 
           line.toLowerCase().includes('event transcript') ||
           line.toLowerCase().includes('question and answer'))) {
        break;
      }
      
      // Parse participant info
      if (inParticipantsSection && line.length > 0) {
        const participant = this.parseParticipantLine(line);
        if (participant) {
          participants.push(participant);
        }
      }
    }
    
    return participants;
  }

  private static parseParticipantLine(line: string): Participant | null {
    // Pattern: "Name Company · Title"
    const match = line.match(/^(.+?)\s+(.+?)\s+·\s+(.+)$/);
    if (match) {
      const [, name, company, title] = match;
      return {
        name: name.trim(),
        title: title.trim(),
        company: company.trim()
      };
    }
    
    // Alternative pattern: Look for name followed by company and title
    const words = line.split(/\s+/);
    if (words.length >= 3) {
      // Try to identify name (usually first 2-3 words)
      const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.?\s+[A-Z][a-z]+)*)/);
      if (nameMatch) {
        const name = nameMatch[1];
        const remaining = line.substring(name.length).trim();
        
        // Split remaining into company and title
        const parts = remaining.split('·');
        if (parts.length === 2) {
          return {
            name: name.trim(),
            company: parts[0].trim(),
            title: parts[1].trim()
          };
        }
      }
    }
    
    return null;
  }

  private static extractSegments(lines: string[], participants: Participant[]): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    let currentSpeaker = '';
    let currentContent = '';
    let inTranscriptSection = false;
    
    // Create a map of participant names for easier lookup
    const participantNames = new Set(participants.map(p => p.name));
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect start of transcript content
      if (line.toLowerCase().includes('prepared remarks') || 
          line.toLowerCase().includes('question and answer') ||
          line.toLowerCase().includes('event transcript')) {
        inTranscriptSection = true;
        continue;
      }
      
      if (!inTranscriptSection) continue;
      
      // Check if line is a speaker name
      const speakerName = this.extractSpeakerName(line, participantNames);
      
      if (speakerName) {
        // Save previous segment if exists
        if (currentSpeaker && currentContent.trim()) {
          segments.push({
            speaker: currentSpeaker,
            content: currentContent.trim()
          });
        }
        
        // Start new segment
        currentSpeaker = speakerName;
        currentContent = '';
      } else if (currentSpeaker && line.length > 0) {
        // Add to current content
        currentContent += (currentContent ? ' ' : '') + line;
      }
    }
    
    // Add final segment
    if (currentSpeaker && currentContent.trim()) {
      segments.push({
        speaker: currentSpeaker,
        content: currentContent.trim()
      });
    }
    
    return segments;
  }

  private static extractSpeakerName(line: string, participantNames: Set<string>): string | null {
    // Remove company info and title info that might follow the name
    const cleanLine = line.replace(/Adobe Inc\.|Sanford C\. Bernstein & Co\., LLC\.|Research Division|Senior Research Analyst|Chief Product Officer|Executive VP|Vice President/g, '').trim();
    
    // Check if any participant name is in this line
    for (const name of participantNames) {
      if (line.includes(name)) {
        return name;
      }
    }
    
    // Try to extract name from patterns like "NameCompanyInfo"
    const nameMatch = cleanLine.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.?\s*[A-Z][a-z]+)*)/);
    if (nameMatch) {
      const potentialName = nameMatch[1].trim();
      // Check if it's a reasonable name (2-4 words, proper capitalization)
      const words = potentialName.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        return potentialName;
      }
    }
    
    return null;
  }

  private static isDateLine(line: string): boolean {
    // Check for various date formats
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,           // MM/DD/YYYY
      /\b\d{4}-\d{1,2}-\d{1,2}\b/,            // YYYY-MM-DD
      /\b[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}\b/, // Month DD, YYYY
      /\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b/,  // DD Month YYYY
    ];
    
    return datePatterns.some(pattern => pattern.test(line));
  }

  private static formatDate(line: string): string {
    // Extract and format date
    const dateMatch = line.match(/([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/);
    if (dateMatch) {
      return dateMatch[1].replace(',', '');
    }
    
    // Handle other date formats and convert to readable format
    const isoMatch = line.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    return line.trim();
  }
}