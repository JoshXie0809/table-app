import { Button, Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { showDBTable$ } from "../sql-tool-arrow-table/SetShowArrowTable";
import { ImTable2 } from "react-icons/im";
import { LuInfo } from "react-icons/lu";
import { DBInfo } from "./ListDB";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
export interface ListTableProps {
  alias: string,
  dbInfo: DBInfo | undefined,
}
export const ListTable: React.FC<ListTableProps> = ({
  alias,
  dbInfo,
}) => {
  if(dbInfo === undefined) return null;
  const tableList = dbInfo.tableList;
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
                  // visible: true,
                  children: (
                    <>
                      <Button
                        icon={<LuInfo/>}
                        appearance="transparent"
                        onClick={(event) => {
                          event.stopPropagation()
                          showDBTable$.next({
                            alias,
                            tableName: value,
                            type: "TableInfo"
                          })}
                        }
                        title="show the schema of table"
                      >
                        info
                      </Button>
                      <Button
                        icon={<MoreHorizontal20Regular/>}
                        appearance="transparent"
                      >

                      </Button>
                    </>
                    
                  )
                }}
                onClick={() => {
                  showDBTable$.next({
                    alias,
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