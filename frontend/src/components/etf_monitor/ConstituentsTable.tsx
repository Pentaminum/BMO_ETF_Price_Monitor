import { useState, useMemo } from 'react';
import type { Constituent } from '../../types/etf_data';

interface ConstituentsTableProps {
  list: Constituent[];
}

// Defining allowed keys for sorting to ensure type safety
type SortKey = 'name' | 'weight' | 'latest_close_price';

export const ConstituentsTable = ({ list }: ConstituentsTableProps) => {
  // --- UI States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('weight');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const displayList = useMemo(() => {
    // 1. Filter the list based on the user's search input (Case-insensitive)
    const filtered = list.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort the filtered results based on selected column and direction
    return [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue === bValue) return 0;
      
      // Basic comparison logic
      const result = aValue > bValue ? 1 : -1;
      
      // Flip the result if the order is 'descending'
      return sortOrder === 'asc' ? result : -result;
    });
  }, [list, searchTerm, sortKey, sortOrder]); // Dependencies: Only re-run if these change

  // --- Handlers ---
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      // Toggle direction if clicking the same header
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Switch to a new column and default to descending (standard for finance)
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Helper to render sorting arrows without causing layout shifts
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <span className="inline-block w-4" />; 
    return <span className="inline-block w-4 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Input Area */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search constituent name..."
          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
            <tr>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-[#0078c1] transition-colors w-[40%]"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">CONSTITUENT NAME {renderSortIcon('name')}</div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-[#0078c1] transition-colors w-[30%]"
                onClick={() => handleSort('weight')}
              >
                <div className="flex items-center">WEIGHT {renderSortIcon('weight')}</div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-[#0078c1] transition-colors text-right w-[30%]"
                onClick={() => handleSort('latest_close_price')}
              >
                <div className="flex items-center justify-end">MOST RECENT CLOSE PRICE {renderSortIcon('latest_close_price')}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayList.map((item) => (
              <tr key={item.name} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-6 py-4 text-sm font-bold text-slate-700 truncate">{item.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span className="tabular-nums font-medium">{(item.weight * 100).toFixed(2)} %</span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-700 text-right font-medium">
                  ${item.latest_close_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State Display */}
        {displayList.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm italic">
            No constituent details available.
          </div>
        )}
      </div>
    </div>
  );
};