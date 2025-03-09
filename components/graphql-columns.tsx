// components/graphql-columns.tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GraphQLLogData } from '@/types';

export const graphqlColumns: ColumnDef<GraphQLLogData>[] = [
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Timestamp
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const timestamp = new Date(row.getValue('timestamp'));
      return <div>{timestamp.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'operationName',
    header: 'Operation',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('operationName') || 'Unnamed'}</Badge>,
  },
  {
    accessorKey: 'query',
    header: 'Query',
    cell: ({ row }) => {
      const query = row.getValue('query') as string;
      return <div className="font-mono text-xs truncate max-w-[200px]">{query}</div>;
    },
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Duration
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const duration = (row.getValue('duration') || 0) as number;
      return <div>{duration.toFixed(2)} ms</div>;
    },
  },
  {
    accessorKey: 'userAgent',
    header: 'User Agent',
    cell: ({ row }) => <div className="text-xs truncate max-w-[150px]">{row.getValue('userAgent')}</div>,
  },
  {
    accessorKey: 'userId',
    header: 'User ID',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('userId') || 'N/A'}</div>,
  },
  {
    accessorKey: 'requestID',
    header: 'Request ID',
    cell: ({ row }) => <div className="font-mono text-xs truncate max-w-[150px]">{row.getValue('requestID')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => window.dispatchEvent(new CustomEvent('view-log-details', { detail: row.original }))}
      >
        <ExternalLink className="h-4 w-4" />
        Details
      </Button>
    ),
  },
];
