import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { useStyles } from "../../App";
import { ButtonToolBox } from "../../my-components-v1/button-toolbox/ButtonToolBox";
import { RibbonGroup, RibbonSmallButton } from "../../my-components-v1/button-toolbox/RibbonGroup";
import { BsDatabaseAdd } from "react-icons/bs";
import LuaRunner from "../../my-components-v1/lua/LuaRunner";
import "./SQLApp.css"
import { useEffect, useState } from "react";
import { sqlConnect, sqlListTable, sqlTableInfo } from "../../tauri-api/sqlConnection";
import { Table, tableFromIPC } from "apache-arrow"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";


function tableToObjects(table: Table): Record<string, any>[] {
  const fields = table.schema.fields.map(f => f.name);
  console.log(fields);
  return table.toArray().map(row => {
    const obj: Record<string, any> = {};
    for (const name of fields) {
      obj[name] = row[name];  // 動態取得欄位值
    }
    return obj;
  });
}

function inferColumnsFromTable(table: Table): ColumnDef<any>[] {
  return table.schema.fields.map((field) => ({
    accessorFn: (row) => row[field.name],
    header: field["name"],
  }));
}

export const SQLApp = () => {
  const styles = useStyles();
  const [errString, setErrString] = useState<string | null>(null);
  // const [data, setData] = useState<any[]>([]);
  // const [columns, setColumns] = useState<ColumnDef<any>[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const path = "C:/Users/USER/Desktop/dotnet_test/React-test/my-workspace/data.duckdb";
      const result = await sqlConnect({ path });
      console.log(result);
      if (!result.success && result.error) {
        setErrString(result.error)
        return;
      }
      const tables = await sqlListTable({ path });
      console.log(tables);
      const tableInfo = await sqlTableInfo({ path });
      console.log(tableInfo);
      const table = tableFromIPC(tableInfo);
      console.log(table)
      const obj = tableToObjects(table);
      console.table(obj);
    }

    fetch();
  }, [])


  // const table = useReactTable({
  //   data,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  // });

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.root}>
        <ButtonToolBox>
          <RibbonGroup label="檔案">
            <RibbonSmallButton 
              icon={<BsDatabaseAdd size={32}/>} 
              label="加載" 
              onClick={() => confirm("開啟檔案")}
              tipContent="開啟 .db .sqlite .duckdb 連線"
            />  
          </RibbonGroup>
        </ButtonToolBox>

        <main className={styles.content}>
          <div style={{overflow: "auto"}}>
            <div>
              {errString}
            </div>
            {/* <table>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table> */}
            <h1>vm</h1>
            <LuaRunner />
          </div>
        </main>
      </div>
    </FluentProvider>
  )
}