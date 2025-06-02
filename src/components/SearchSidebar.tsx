import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { DateRange } from '../types';

interface SearchSidebarProps {
  dateRanges: DateRange[];
  onDateRangeChange: (value: string) => void;
  onShowLess: () => void;
  showLess: boolean;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({
  dateRanges,
  onDateRangeChange,
  onShowLess,
  showLess
}) => {
  return (
    <div className="w-72 bg-gray-50 border-r border-gray-200 p-4 h-screen overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Date range
        </h3>
        <div className="space-y-2">
          {dateRanges.slice(0, showLess ? 4 : dateRanges.length).map((range) => (
            <label key={range.value} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="dateRange"
                value={range.value}
                checked={range.selected}
                onChange={() => onDateRangeChange(range.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {range.label}
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={onShowLess}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {showLess ? 'Show more' : 'Show less'}
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showLess ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  );
};

export default SearchSidebar;
