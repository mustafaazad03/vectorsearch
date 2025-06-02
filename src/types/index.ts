export interface SearchResult {
  id: string;
  company: string;
  title: string;
  date: string;
  time: string;
  type: 'earnings' | 'product' | 'conference';
  isSelected?: boolean;
}

export interface Participant {
  name: string;
  title: string;
  company: string;
}

export interface TranscriptSegment {
  speaker: string;
  content: string;
  timestamp?: string;
}

export interface TranscriptData {
  title: string;
  date: string;
  participants: Participant[];
  segments: TranscriptSegment[];
}

export interface DateRange {
  label: string;
  value: string;
  selected: boolean;
}

export interface Participant {
  name: string;
  title: string;
  company: string;
}

export interface TranscriptSegment {
  speaker: string;
  content: string;
}

export interface TranscriptData {
  title: string;
  date: string;
  participants: Participant[];
  segments: TranscriptSegment[];
}

export interface ParsedTranscriptFile {
  filename: string;
  data: TranscriptData;
}