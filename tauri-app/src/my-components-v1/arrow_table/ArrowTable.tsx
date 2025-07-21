import { Table as ATable} from "apache-arrow";
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable, } from "@tanstack/react-table";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";

// 傳入 arrow Table 然後呈現一個 tanstack 表格
export interface ArrowTableProps {
  table: ATable | null,
}

export const ArrowTable: React.FC<ArrowTableProps> = ({
  table,
}) => 
{
  console.log("render");
  if(table === null) return null;
  const tableObj = useMemo(() => tableToObjects(table), [table]);
  const columns = useMemo(() => inferColumnsFromTable(table), [table]);

  // Initialize TanStack Table
  const tableInstance = useReactTable({
    data: tableObj,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div id="arrow-table-container">
      <Table>
        <TableHeader>
            {tableInstance.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHeaderCell key={header.id} colSpan={header.colSpan} >
                    {
                      header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                    }
                  </TableHeaderCell>
                ))}
              </TableRow>
            ))}
        </TableHeader>
        <TableBody>
          {tableInstance.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
         {/* <tfoot>
          {tableInstance.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot> */}
      </Table>
    </div>
  );
}

function tableToObjects(table: ATable): Record<string, any>[] {
  return table.toArray().map(row => row.toJSON());
}

function inferColumnsFromTable(table: ATable): ColumnDef<any>[] {
  const columnHelper = createColumnHelper<any>();
  return table.schema.fields.map((field) => {
    const colName = field.name;
    return columnHelper.accessor(  
      row => row[colName], 
      {
        id: colName,
        cell: info => {
          const value: any = info.getValue();
          if (value === null) return <i style={{ color: "grey"}}>{"<null>"}</i>;
          return <span>{ String(value) }</span>;
        },
        footer: () => <span>{colName}</span>
      })
    }); 
}