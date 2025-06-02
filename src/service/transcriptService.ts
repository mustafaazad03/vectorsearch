'use server';
import { ParsedTranscriptFile, TranscriptData } from '@/types';
import { TranscriptParser } from '@/utils/transcriptFunctions';
import fs from 'fs/promises';
import path from 'path';

const API_BASE = 'http://localhost:3000/api/transcript'

export async function getAllTranscripts(): Promise<ParsedTranscriptFile[]> {
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transcripts: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API returned error response');
    }

    return data.transcripts;
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    throw error;
  }
}

export async function getTranscriptByFilename(filename: string): Promise<TranscriptData> {
  try {
    const response = await fetch(`${API_BASE}?file=${encodeURIComponent(filename)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API returned error response');
    }

    return data.data;
  } catch (error) {
    console.error(`Error fetching transcript ${filename}:`, error);
    throw error;
  }
}

export async function getTranscriptsServerSide(): Promise<ParsedTranscriptFile[]> {

  try {
    const transcriptsDir = path.join(process.cwd(), 'data', 'transcripts');
    
    // Check if directory exists
    try {
      await fs.access(transcriptsDir);
    } catch {
      console.warn('Transcripts directory not found, creating empty array');
      return [];
    }

    const files = await fs.readdir(transcriptsDir);
    const transcriptFiles = files.filter(file => 
      file.endsWith('.txt') || file.endsWith('.md')
    );

    const parsedTranscripts: ParsedTranscriptFile[] = [];

    for (const filename of transcriptFiles) {
      try {
        const filePath = path.join(transcriptsDir, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsedData = TranscriptParser.parseTranscript(content);
        
        parsedTranscripts.push({
          filename,
          data: parsedData
        });
      } catch (error) {
        console.error(`Error parsing file ${filename}:`, error);
      }
    }

    return parsedTranscripts;
  } catch (error) {
    console.error('Error reading transcripts server-side:', error);
    throw error;
  }
}

// function filterTranscripts(
//   transcripts: ParsedTranscriptFile[], 
//   searchTerm: string
// ): ParsedTranscriptFile[] {
//   const term = searchTerm.toLowerCase();
  
//   return transcripts.filter(transcript => {
//     const { title, participants } = transcript.data;
    
//     // Search in title
//     if (title.toLowerCase().includes(term)) {
//       return true;
//     }
    
//     // Search in participants
//     return participants.some(participant => 
//       participant.name.toLowerCase().includes(term) ||
//       participant.company.toLowerCase().includes(term) ||
//       participant.title.toLowerCase().includes(term)
//     );
//   });
// }

// function sortTranscriptsByDate(
//   transcripts: ParsedTranscriptFile[], 
//   order: 'asc' | 'desc' = 'desc'
// ): ParsedTranscriptFile[] {
//   return [...transcripts].sort((a, b) => {
//     const dateA = new Date(a.data.date);
//     const dateB = new Date(b.data.date);
    
//     if (order === 'asc') {
//       return dateA.getTime() - dateB.getTime();
//     } else {
//       return dateB.getTime() - dateA.getTime();
//     }
//   });
// }