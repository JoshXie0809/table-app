import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import { showDBTable$ } from "../sql-tool-arrow-table/SetShowArrowTable";
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
              onClick={() => showDBTable$.next({
                dbPath,
                tableName: value
              })}
            >
              <TreeItemLayout>
                {value}
              </TreeItemLayout>
            </TreeItem>
          )
        })
      }
    </Tree>
  );
}