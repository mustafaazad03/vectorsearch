'use client';
import SearchHeader from "@/components/SearchHeader";
import SearchResults from "@/components/SearchResult";
import SearchSidebar from "@/components/SearchSidebar";
import Sidebar from "@/components/Sidebar";
import TranscriptViewer from "@/components/TranscriptViewer";
import { mockDateRanges } from "@/data/mockData";
import { getAllTranscripts } from "@/service/transcriptService";
import { ParsedTranscriptFile } from "@/types";
import { useVectorSearch } from "@/hooks/useVectorSearch";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

// Optimized debounce with cleanup
function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): [(...args: Parameters<T>) => void, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedFunc = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => func(...args), wait);
  }, [func, wait]);
  
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  
  useEffect(() => cleanup, [cleanup]);
  
  return [debouncedFunc, cleanup];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultId, setSelectedResultId] = useState('');
  const [dateRanges, setDateRanges] = useState(mockDateRanges);
  const [showLess, setShowLess] = useState(true);
  const [transcriptData, setTranscriptData] = useState<ParsedTranscriptFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<ParsedTranscriptFile[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Initialize vector search
  const { isInitialized, isSearching, initializationError, performSearch } = useVectorSearch(transcriptData);

  const loadTranscript = async () => {
    setLoading(true);
    try {
      const data = await getAllTranscripts() as ParsedTranscriptFile[];
      console.log('Loaded transcripts:', data.length);
      
      if (data.length > 0) {
        setSelectedResultId(data[0]?.filename || '');
        setTranscriptData(data);
      }
    } catch (error) {
      console.error('Error loading transcripts:', error);
      setSearchError('Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranscript();
  }, []);

  // Optimized fallback search
  const fallbackSearch = useCallback((query: string): ParsedTranscriptFile[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const queryTerms = lowerQuery.split(/\s+/).filter(term => term.length > 2);
    
    return transcriptData.filter((result: ParsedTranscriptFile) => {
      // Quick filename check
      if (result.filename?.toLowerCase().includes(lowerQuery)) return true;
      
      // Quick title check
      if (result.data.title?.toLowerCase().includes(lowerQuery)) return true;
      
      // Check if any query term matches
      return queryTerms.some(term => {
        // Check participants
        if (result.data.participants?.some(participant => 
          participant.name.toLowerCase().includes(term) ||
          participant.company.toLowerCase().includes(term) ||
          participant.title.toLowerCase().includes(term)
        )) return true;
        
        // Check first 20 segments only for performance
        if (result.data.segments?.slice(0, 20).some(segment => 
          segment.content.toLowerCase().includes(term) ||
          segment.speaker.toLowerCase().includes(term)
        )) return true;
        
        return false;
      });
    }).slice(0, 50); // Limit results to prevent UI lag
  }, [transcriptData]);

  // Search function with error handling
  const performSearchWithFallback = useCallback((query: string) => {
    setSearchError(null);
    
    try {
      if (!query.trim()) {
        setSearchData([]);
        return;
      }

      if (isInitialized) {
        const results = performSearch(query);
        setSearchData(results);
      } else {
        const results = fallbackSearch(query);
        setSearchData(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
      setSearchData([]);
    }
  }, [isInitialized, performSearch, fallbackSearch]);

  // Debounced search
  const [debouncedSearch] = useDebounce(performSearchWithFallback, 300);

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  const handleResultSelect = useCallback((id: string) => {
    setSelectedResultId(id);
    setSearchQuery('');
    setSearchData([]);
  }, []);

  const handleDateRangeChange = useCallback((value: string) => {
    setDateRanges((prev: any) => 
      prev.map((range: any) => ({
        ...range,
        selected: range.value === value
      }))
    );
  }, []);

  // Memoized computed values
  const results = useMemo(() => 
    transcriptData.map((result: ParsedTranscriptFile) => ({
      ...result,
      isSelected: result?.filename === selectedResultId
    })), [transcriptData, selectedResultId]
  );

  const filteredData = useMemo(() => 
    transcriptData.filter((result: ParsedTranscriptFile) => 
      result?.filename === selectedResultId
    ), [transcriptData, selectedResultId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading transcripts...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      <div className="h-full">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchData={searchData}
          onResultSelect={handleResultSelect}
        />
        
        {/* Status indicators */}
        {!isInitialized && transcriptData.length > 0 && !initializationError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-sm">
            <p>🔄 Initializing optimized vector search... Using fast search meanwhile.</p>
          </div>
        )}
        
        {initializationError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-sm">
            <p>⚠️ Vector search initialization failed. Using fallback search.</p>
          </div>
        )}
        
        {isSearching && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 text-sm">
            <p>🔍 Searching with optimized vector similarity...</p>
          </div>
        )}
        
        {searchError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-sm">
            <p>❌ {searchError}</p>
          </div>
        )}
        
        <div className="flex">
          <SearchSidebar
            dateRanges={dateRanges}
            onDateRangeChange={handleDateRangeChange}
            onShowLess={() => setShowLess(!showLess)}
            showLess={showLess}
          />
          <SearchResults
            results={results}
            onResultSelect={handleResultSelect}
            totalResults={transcriptData.length}
          />
          <TranscriptViewer transcript={filteredData[0]} />
        </div>
      </div>
    </div>
  );
}