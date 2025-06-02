import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { TranscriptParser } from '@/utils/transcriptFunctions';
import { ParsedTranscriptFile } from '@/types';

export async function GET() {
  try {
    const transcriptsDir = path.join(process.cwd(), 'src', 'data', 'ADBE_transcripts');
    
    // Check if directory exists
    try {
      await fs.access(transcriptsDir);
    } catch {
      return NextResponse.json(
        { error: 'Transcripts directory not found' },
        { status: 404 }
      );
    }

    // Read all files in the directory
    const files = await fs.readdir(transcriptsDir);
    const transcriptFiles = files.filter(file => 
      file.endsWith('.txt') || file.endsWith('.md')
    );

    const parsedTranscripts: ParsedTranscriptFile[] = [];

    // Parse each file
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
        // Continue with other files even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      count: parsedTranscripts.length,
      transcripts: parsedTranscripts
    });

  } catch (error) {
    console.error('Error reading transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to read transcripts' },
      { status: 500 }
    );
  }
}

export async function GET_SINGLE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('file');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename parameter required' },
      { status: 400 }
    );
  }

  try {
    const transcriptsDir = path.join(process.cwd(), 'data', 'ADBE_transcripts');
    const filePath = path.join(transcriptsDir, filename);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const parsedData = TranscriptParser.parseTranscript(content);
    
    return NextResponse.json({
      success: true,
      filename,
      data: parsedData
    });

  } catch (error) {
    console.error(`Error reading transcript ${filename}:`, error);
    return NextResponse.json(
      { error: 'Failed to read transcript file' },
      { status: 500 }
    );
  }
}