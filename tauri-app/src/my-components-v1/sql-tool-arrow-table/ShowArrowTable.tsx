import React, { CSSProperties, useEffect } from 'react'
import { Table as ATable} from "apache-arrow";
import { Header, Cell, ColumnDef, createColumnHelper, flexRender, getCoreRowModel, Row, useReactTable, GroupingState, getExpandedRowModel, getGroupedRowModel, getFilteredRowModel, } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import { Button, Divider, makeStyles, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, tokens  } from "@fluentui/react-components";
import { ColumnResizeMode } from '@tanstack/react-table';
import { MdNumbers } from "react-icons/md";
import { useVirtualizer } from '@tanstack/react-virtual';
import { MdOutlineDragIndicator } from "react-icons/md";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
const useArrowTableStyles = makeStyles({
  container: {
    height: "100%",
    overflow: "auto",
    // 增加外框線以符合圖片的整體感
    border : `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: "8px",
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace", // 使用等寬字體更像IDE
    position: "relative",
  },
  table: {
    borderCollapse: "collapse",
    tableLayout: "fixed",
    minWidth: "160px",
  },
  tableHeader: {
    display: "grid",
    position: "sticky",
    top: "0px",
    left: "0px",
    willChange: "transform",
    zIndex: 1,
  },
  tableHeaderCell: {
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingTop: "6px",
    paddingBottom: "6px",
    fontWeight: "bolder", // 圖片中的表頭文字沒有粗體
    fontSize: "15px",
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    position: "relative",
    minWidth: "60px",
    "& > div > span": {
      overflow: "hidden",
      textOverflow: "ellipsis", // 超出範圍時顯示...
    },
    // "&:first-of-type > div" : {
    //   justifyContent: "end",
    // }
  },
  headerDragger: {
  },
  headerSizer: {
    position: "absolute",
    right: "-10px",
    height: "100%",
    width: "6px",
    cursor: "w-resize",
    userSelect: "none",
    zIndex: 1,
    "&:hover": {
      backgroundColor: "rgba(136, 140, 141, 0.24)",
    },
    "&:active": {
      backgroundColor: "rgba(4, 53, 214, 0.56)",
    }
  },
  tableBody: {
    display: "grid",
    position: "relative",
  },
  headerRow: {
    display: "flex",
    width: "100%",
    borderBottom: "none",
  },
  virtualRow: {
    display: "flex",
    position: "absolute",
    top: "0px",
    left: "0px",
    willChange: "transform",
    borderBottom: "none",
    // 新增第一欄 (Row Number) 的特殊樣式
    "& > td:first-of-type": {
      backgroundColor: tokens.colorNeutralBackground2,
      color: tokens.colorBrandForeground1,
      // justifyContent: "end",
      fontWeight: "bolder",
      borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
      fontSize: "16px",
    },
  },
  tableCell: {
    boxSizing: "border-box",
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingTop: "6px",
    paddingBottom: "6px",
    textAlign: "left",
    fontSize: "14px",
    whiteSpace: "nowrap", // 避免內文換行
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    minWidth: "60px",
    alignItems: "center",
    "& > span": {
      overflow: "hidden",
      textOverflow: "ellipsis", // 超出範圍時顯示...
    }
  },
  nullValue: {
    backgroundColor: tokens.colorNeutralStroke2,
    paddingRight: "4px",
    paddingLeft: "4px",
    borderRadius: "4px",
    fontStyle: "italic",
    fontWeight: "bold",
  },
  boolValue: {
    paddingRight: "4px",
    paddingLeft: "4px",
    borderRadius: "4px",
    backgroundColor: tokens.colorNeutralStroke2,
    fontWeight: "bold",
  }
});

// 傳入 arrow Table 然後呈現一個 tanstack 表格
export interface ArrowTableProps {
  table: ATable,
}

export const ShowArrowTable: React.FC<ArrowTableProps> = ({
  table,
}) => 
{
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const styles = useArrowTableStyles();
  const tableObj = useMemo(() => tableToObjects(table), [table]);
  const randNum = useMemo(() => Math.random().toString(36).slice(2), [table]);
  const columns = useMemo(() => inferColumnsFromTable(table, styles, randNum), [table, styles, randNum]);
  // 製作排序表
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  // 製作 grouping 模式
  const [grouping, setGrouping] = useState<GroupingState>([]);

  useEffect(() => {
    setColumnOrder(() => 
      columns
        .map(c => c.id!)
    );
    setGrouping([]);
  }, [columns])

  // Initialize TanStack Table
  const tableInstance = useReactTable({
    data: tableObj,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnOrder, grouping },
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
  });
  // ✨ 修改 handleDragStart
  const handleDragStart = () => {
    // 拖曳開始時，暫時禁用垂直捲動
    if (tableContainerRef.current) {
      tableContainerRef.current.style.overflowY = 'hidden';
    }
  };
  // ✨ 修改 handleDragEnd
  const handleDragEnd = (event: DragEndEvent) => {
    // 拖曳結束時，恢復垂直捲動
    if (tableContainerRef.current) {
      tableContainerRef.current.style.overflowY = 'auto';
    }
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder(columnOrder => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex)
      })
    }
  }
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  
  const { rows } = tableInstance.getRowModel();

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 44, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 6,
  })
  
  return (
    <DndContext
      autoScroll = {false}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div id="arrow-table-container" className={styles.container} ref={tableContainerRef}>
        <Table className={styles.table}>
          <TableHeader className={styles.tableHeader}>
            {tableInstance.getHeaderGroups().map(headerGroup => (
              <SortableContext
                key={headerGroup.id}
                items={columnOrder}
                strategy={horizontalListSortingStrategy}
              >
                <TableRow className={styles.headerRow}>
                  {
                    headerGroup.headers.map(header => {
                      return <DraggableTableHeader header={header} key={header.id} styles={styles} />
                    })
                  }
                </TableRow>
              </SortableContext>
            ))}
          </TableHeader>
          <TableBody className={styles.tableBody} 
            style={{
              height: rowVirtualizer.getTotalSize(),
            }}
          >
            {
              rowVirtualizer.getVirtualItems().map(item => {
                const row = rows[item.index] as Row<any>
                return (
                  <TableRow 
                    key={row.id}
                    className={styles.virtualRow} 
                    style={{ 
                      transform: `translateY(${item.start}px)`, //this should always be a `style` as it changes on scroll
                    }}
                  >
                    {
                      row.getVisibleCells().map((cell) => {
                        return (
                          <SortableContext
                              key={cell.id}
                              items={columnOrder}
                              strategy={horizontalListSortingStrategy}
                            >
                              <DragAlongCell key={cell.id} row={row} cell={cell} styles={styles}/>
                          </SortableContext>
                        );
                      })
                    }
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}

const DraggableTableHeader = ({
  header, styles
}: {
  header: Header<any, unknown>
  styles: any
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    })
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    boxShadow: isDragging ? tokens.shadow28 : "none",
    // transition: 'width transform 0.2s ease-in-out',
    width: header.column.getSize(),
    zIndex: isDragging ? 2 : 0,
  }

  return (
    <TableHeaderCell 
      key={header.id} 
      colSpan={header.colSpan} 
      ref={setNodeRef}
      className={styles.tableHeaderCell}
      style={{ ...style, width: header.getSize() }}
    >
      <Button {...attributes} {...listeners} 
        className={styles.headerDragger}
        appearance='subtle'
        icon={<MdOutlineDragIndicator/>}
      />
      {header.column.getCanGroup() ? (
        // If the header can be grouped, let's add a toggle
        <button
          {...{
            onClick: header.column.getToggleGroupingHandler(),
            style: {
              cursor: 'pointer',
            },
          }}
        >
          {header.column.getIsGrouped()
            ? `🛑(${header.column.getGroupedIndex()}) `
            : `👊 `}
        </button>
      ) : null}{' '}
      {
        header.isPlaceholder
        ? null
        : flexRender(
            header.column.columnDef.header,
            header.getContext()
          )
      } 
      <Divider vertical={true} className={styles.headerSizer}
        {...{
          onMouseDown: header.getResizeHandler(),
          onTouchStart: header.getResizeHandler(),
        }}
      />
    </TableHeaderCell>
  )
}

const DragAlongCell = ({ row, cell, styles }: { row: Row<any>, cell: Cell<any, unknown>, styles: any }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    // transition: 'width transform 0.2s ease-in-out',
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }
  if(cell.getIsPlaceholder()) 
    style.borderBottom = "0px";
  else if(cell.getIsGrouped() && row.getIsExpanded()) 
    style.borderBottom = "0px";

  const parent = row.getParentRow();
  const isLastInGroup = parent
    ? parent.subRows[parent.subRows.length - 1].id === row.id
    : false;
  if(isLastInGroup) style.borderBottom = undefined;
  
  return (
    <TableCell 
      className={styles.tableCell} 
      ref={setNodeRef}
      key={cell.id}
      {...{
        style: {
          ...style, 
          width: cell.column.getSize(),
          background: cell.getIsGrouped()
            ? tokens.colorNeutralBackground1
            : cell.getIsAggregated()
              ? tokens.colorNeutralBackground2
              : tokens.colorNeutralBackground1
        },
      }}
    >
      {cell.getIsGrouped() ? (
        // If it's a grouped cell, add an expander and row count
        <>
          <button
            {...{
              onClick: row.getToggleExpandedHandler(),
              style: {
                cursor: row.getCanExpand()
                  ? 'pointer'
                  : 'normal',
              },
            }}
          >
            {row.getIsExpanded() ? '👇' : '👉'}{' '}
            {flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            )}{' '}
            ({row.subRows.length})
          </button>
        </>
      ) : cell.getIsAggregated() ? (
        // If the cell is aggregated, use the Aggregated
        // renderer for cell
        flexRender(
          cell.column.columnDef.aggregatedCell ??
            cell.column.columnDef.cell,
          cell.getContext()
        )
      ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
        // Otherwise, just render the regular cell
        flexRender(
          cell.column.columnDef.cell,
          cell.getContext()
        )
      )}
    </TableCell>
  )
}

function tableToObjects(table: ATable): Record<string, any>[] {
  const rows = [];
  let counter = 0;
  for(const row of table.toArray()) {
    if(++counter > 100_000) break;
    rows.push(row.toJSON())
  }
  return rows;
}

function inferColumnsFromTable(table: ATable, styles: Record<any, string>, randNum: string): ColumnDef<any>[] {
  const columnHelper = createColumnHelper<any>();
  const rowNumberCol = columnHelper.display({
      id: `auto-add-row-number-${randNum}`,
      enableGrouping: false,
      header: (_row) => <MdNumbers />,
      // cell 的 info 物件包含 row 屬性，其 index 是從 0 開始的行索引
      cell: info => info.row.index + 1,
      size: 80,
  });
  const dataCols = table.schema.fields.map((field) => {
    const colName = field.name;
    return columnHelper.accessor(  
      row => row[colName], 
      {
        id: `${colName}-${randNum}`,
        header: () => <span>{colName}</span>,
        size: 200,
        getGroupingValue: row => row[colName],
        aggregationFn: "count",
        aggregatedCell: ({ getValue }) => `Count: ${getValue()}`,
        cell: info => {
          const value: any = info.getValue();
          if (value === null) return <span className={styles.nullValue}>{"null"}</span>;
          // boolean
          if (field.typeId === 6) return <span className={styles.boolValue}>{`${value}`}</span>;
          if (field.typeId === 8) {
            const ms = Number(value);
            const date = new Date(ms);
            // 轉成 YYYY-MM-DD HH:mm:ss
            const formatted = date.toISOString().split("T")[0];
            return <span>{formatted}</span>;
          }

          if (field.typeId === 10) {
            const ms = Number(value);
            const date = new Date(ms);
            const formatted = date?.toISOString();
            return <span>{formatted}</span>;
          }
          
          return <span>{ String(value) }</span>;
        },
        footer: () => <span>{colName}</span>
      })
    }); 
  return [rowNumberCol, ...dataCols];
}