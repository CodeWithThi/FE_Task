import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export function DataTable({ data, columns, keyExtractor, onRowClick, emptyMessage = 'Không có dữ liệu', className, pagination, rowClassName }) {
  return (<div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
    <div className="overflow-auto max-h-[600px] scrollbar-thin">
      <Table className="table-fixed w-full">
        <TableHeader className="table-header-fixed">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (<TableHead key={column.key} className={cn('bg-slate-600 text-white font-bold uppercase', column.className)}>
              {column.header}
            </TableHead>))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (<TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>) : (data.map((item) => (<TableRow
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(onRowClick && 'cursor-pointer', rowClassName?.(item))}
          >
            {columns.map((column) => (<TableCell key={column.key} className={column.className}>
              {column.render
                ? column.render(item)
                : item[column.key]}
            </TableCell>))}
          </TableRow>)))}
        </TableBody>
      </Table>
    </div>
    {pagination && (
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Trang {pagination.currentPage} / {pagination.totalPages || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= (pagination.totalPages || 1)}
          >
            Tiếp
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )}
  </div>);
}
