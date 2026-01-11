import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { cn } from '@/lib/utils';
export function DataTable({ data, columns, keyExtractor, onRowClick, emptyMessage = 'Không có dữ liệu', className, }) {
    return (<div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      <div className="overflow-auto max-h-[600px] scrollbar-thin">
        <Table>
          <TableHeader className="table-header-fixed">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (<TableHead key={column.key} className={cn('bg-muted font-semibold', column.className)}>
                  {column.header}
                </TableHead>))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (<TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>) : (data.map((item) => (<TableRow key={keyExtractor(item)} onClick={() => onRowClick?.(item)} className={cn(onRowClick && 'cursor-pointer')}>
                  {columns.map((column) => (<TableCell key={column.key} className={column.className}>
                      {column.render
                    ? column.render(item)
                    : item[column.key]}
                    </TableCell>))}
                </TableRow>)))}
          </TableBody>
        </Table>
      </div>
    </div>);
}
