import React from 'react';
import { Table } from 'react-bootstrap';
import { useAdvanceTableContext } from 'providers/AdvanceTableProvider';
import { flexRender, Header, Row, Cell } from '@tanstack/react-table';
import classNames from 'classnames';

interface CustomColumnMeta {
  headerProps?: React.HTMLAttributes<HTMLTableHeaderCellElement>;
  cellProps?: React.HTMLAttributes<HTMLTableDataCellElement>;
}

interface AdvanceTableProps {
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string;
  tableProps?: React.ComponentProps<typeof Table>;
}

const AdvanceTable: React.FC<AdvanceTableProps> = ({
  headerClassName,
  bodyClassName,
  rowClassName,
  tableProps
}) => {
  const table = useAdvanceTableContext();
  const { getRowModel, getFlatHeaders } = table;

  return (
    <div className="table-responsive scrollbar">
      <Table {...tableProps}>
        <thead className={headerClassName}>
          <tr>
            {getFlatHeaders().map((header: Header<any, unknown>) => {
              return (
                <th
                  key={header.id}
                  {...(header.column.columnDef.meta as CustomColumnMeta)?.headerProps}
                  className={classNames(
                    'fs-10',
                    (header.column.columnDef.meta as CustomColumnMeta)?.headerProps?.className,
                    {
                      sort: header.column.getCanSort(),
                      desc: header.column.getIsSorted() === 'desc',
                      asc: header.column.getIsSorted() === 'asc'
                    }
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={bodyClassName}>
          {getRowModel().rows.map((row: Row<any>) => (
            <tr key={row.id} className={rowClassName}>
              {row.getVisibleCells().map((cell: Cell<any, unknown>) => (
                <td key={cell.id} {...(cell.column.columnDef.meta as CustomColumnMeta)?.cellProps}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdvanceTable;
