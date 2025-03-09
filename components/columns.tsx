'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'timestamp',

    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const timestamp = new Date(row.getValue('timestamp'));
      return <div>{timestamp.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'request.method',
    header: 'Method',
    cell: ({ row }) => {
      const method = row.original.request.method as string;
      return (
        <Badge
          variant={method === 'GET' ? 'default' : method === 'POST' ? 'secondary' : method === 'PUT' ? 'outline' : 'destructive'}
        >
          {method}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'request.url.path',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Endpoint
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    id: 'endpoint',
  },
  {
    accessorKey: 'response.status_code',
    header: 'Status',
    cell: ({ row }) => {
      const statusCode = row.original.response.status_code as number;
      return <Badge variant={statusCode < 300 ? 'secondary' : statusCode < 400 ? 'outline' : 'destructive'}>{statusCode}</Badge>;
    },
  },
  {
    accessorKey: 'response.time',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Response Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const time = Number.parseFloat(row.original.response.time);
      // Format based on magnitude (nanoseconds to appropriate unit)
      if (time < 1000) {
        return <div>{time.toFixed(2)} ns</div>;
      } else if (time < 1000000) {
        return <div>{(time / 1000).toFixed(2)} μs</div>;
      } else {
        return <div>{(time / 1000000).toFixed(2)} ms</div>;
      }
    },
  },
  {
    accessorKey: 'request.ip',
    header: 'IP Address',
    cell: ({ row }) => {
      const ip = row.original.request.ip as string;
      return <div className="font-mono text-xs">{ip}</div>;
    },
  },
  {
    accessorKey: 'hostname',
    header: 'Host',
    cell: ({ row }) => {
      const hostname = row.getValue('hostname') as string;
      return <div className="truncate max-w-[150px]">{hostname}</div>;
    },
  },
  {
    accessorKey: 'request.requestID',
    header: 'Request ID',
    cell: ({ row }) => {
      const requestId = row.original.request.requestID as string;
      return <div className="font-mono text-xs truncate max-w-[150px]">{requestId}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const log = row.original;

      return (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => window.dispatchEvent(new CustomEvent('view-log-details', { detail: log }))}
        >
          <ExternalLink className="h-4 w-4" />
          Details
        </Button>
      );
    },
  },
];
