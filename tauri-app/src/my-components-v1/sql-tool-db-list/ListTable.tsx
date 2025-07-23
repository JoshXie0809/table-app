import { Button, Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { showDBTable$ } from "../sql-tool-arrow-table/SetShowArrowTable";
import { ImTable2 } from "react-icons/im";
import { LuInfo } from "react-icons/lu";

export interface ListTableProps {
  dbPath: string,
  tableList: string[] | undefined,
}
export const ListTable: React.FC<ListTableProps> = ({
  dbPath,
  tableList,
}) => {
  if(tableList === undefined) return null;
  return (
    <Tree>
      {
        tableList.map((value, index) => {
          return (
            <TreeItem 
              key={`#${index}--${value}`} 
              itemType="leaf"
              aria-description="the table of a db connecion"
            >
              <TreeItemLayout iconBefore={<ImTable2 />}
                actions={{
                  visible: true,
                  children: (
                    <Button
                      icon={<LuInfo/>}
                      appearance="subtle"
                      onClick={(event) => {
                        event.stopPropagation()
                        showDBTable$.next({
                          dbPath,
                          tableName: value,
                          type: "TableInfo"
                        })}
                      }
                      title="show the schema of table"
                    >
                      info
                    </Button>
                  )
                }}
                onClick={() => {
                  showDBTable$.next({
                    dbPath,
                    tableName: value,
                    type: "ShowAllTable"
                  })
                }}
              >
                {value}
              </TreeItemLayout>
            </TreeItem>
          )
        })
      }
    </Tree>
  );
}