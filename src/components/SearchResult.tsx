import { ParsedTranscriptFile, SearchResult } from '../types';
import { ChevronDown } from 'lucide-react';
import SearchResultItem from './SearchResultItem';

interface SearchResultsProps {
  results: SearchResult[] | any;
  onResultSelect: (id: string) => void;
  totalResults: number;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onResultSelect,
  totalResults
}) => {
  console.log(results, "Results");
  return (
    <div className="w-96 bg-[#F1F1F1] border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4 m-2 border-b border-gray-200 bg-white sticky top-0 z-10 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900">Results</span>
            <span className="ml-2 text-sm text-gray-500">{totalResults}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span>Sort by</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
      <div className='p-4 m-2 border-b border-gray-200 bg-white h-4/5 overflow-scroll rounded-lg'>
        {results.map((result: ParsedTranscriptFile | [] | any) => (
          <SearchResultItem
            key={result.filename}
            result={result}
            onClick={onResultSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;