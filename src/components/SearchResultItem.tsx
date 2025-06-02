import React from 'react';
import { ParsedTranscriptFile } from '../types';

interface SearchResultItemProps {
  result: ParsedTranscriptFile | any;
  onClick: (id: string) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onClick }) => {
  const getCompanyColor = (company: string) => {
    switch (company) {
      case 'GOOGL':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earnings':
        return '📊';
      case 'product':
        return '🛍️';
      case 'conference':
        return '🎯';
      default:
        return '📄';
    }
  };

  return (
    <div
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
        result.isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onClick(result.filename)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <span className="mr-2">{getTypeIcon(result.type)}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getCompanyColor(result.filename.split(" ")[1])}`}>
            {result.filename.split(" ")[1]}
          </span>
        </div>
        <span className="text-xs text-gray-500">{result.data.date}</span>
      </div>
      <h4 className="text-sm font-medium text-gray-900 leading-5 mb-1">
        {result.data.title}
      </h4>
      {result.type === 'product' && (
        <div className="text-xs text-gray-500 mt-2">
          From: {result.data.date} → To: May 23, 2025
        </div>
      )}
    </div>
  );
};

export default SearchResultItem;