'use client';
import React from 'react';
import { Search } from 'lucide-react';
import { ParsedTranscriptFile } from "@/types";
import SearchResultItem from './SearchResultItem';


interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchData: ParsedTranscriptFile[];
  onResultSelect: (id: string) => void;

}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  searchData,
  onResultSelect
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center relative">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for anything here..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border bg-[#EBEEF4] border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {searchData && searchQuery && Array.isArray(searchData) && (
        <div className="absolute top-20 left-2 z-50 bg-white w-1/2 h-[50vh] overflow-scroll">
          {searchData.map((result: ParsedTranscriptFile | [] | any) => (
            <SearchResultItem
              key={result.filename}
              result={result}
              onClick={onResultSelect}
            />
        ))}
        </div>
        )}
    </div>
  );
};

export default SearchHeader;