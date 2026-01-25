'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { TicketStatus, TicketPriority } from '@prisma/client';

export function TicketFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentStatus = searchParams.get('status') as TicketStatus | null;
  const currentPriority = searchParams.get('priority') as TicketPriority | null;
  const currentSort = searchParams.get('sort') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  const updateParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    
    if (!newParams.page) {
      params.set('page', '1');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={currentStatus || ''}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value={TicketStatus.OPEN}>Open</option>
            <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
            <option value={TicketStatus.CLOSED}>Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={currentPriority || ''}
            onChange={(e) => updateParams({ priority: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Priorities</option>
            <option value={TicketPriority.LOW}>Low</option>
            <option value={TicketPriority.MEDIUM}>Medium</option>
            <option value={TicketPriority.HIGH}>High</option>
            <option value={TicketPriority.URGENT}>Urgent</option>
          </select>
        </div>

=        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Created (Newest)</option>
            <option value="createdAt_asc">Created (Oldest)</option>
            <option value="updatedAt_desc">Updated (Newest)</option>
            <option value="updatedAt_asc">Updated (Oldest)</option>
            <option value="priority_desc">Priority (High to Low)</option>
            <option value="priority_asc">Priority (Low to High)</option>
          </select>
        </div>

=        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Per Page
          </label>
          <select
            value={pageSize}
            onChange={(e) => updateParams({ pageSize: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

=        <div className="flex items-end">
          <button
            onClick={() => updateParams({ 
              status: null, 
              priority: null, 
              sort: null, 
              pageSize: '10' 
            })}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
