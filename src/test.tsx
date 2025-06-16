import React from "react";
import { useVirtualCells, UseVirtualCellsOptions } from "./my-components-v1/hooks/useVirtualCell";

interface VirtualCellsRendererProps {
  options: UseVirtualCellsOptions;
}

export const VirtualCellsRenderer: React.FC<VirtualCellsRendererProps> = ({ options }) => {
  const virtual = useVirtualCells(options); // ✅ Hook 只會在 options 存在時呼叫
  
  // Debug 或日後渲染資料用
  console.log("VirtualCellsInstance", virtual);

  // 如果你有 Canvas 或 GridComponent，可在這裡插入
  return (
    <div style={{ flex: 1, border: "1px solid #ccc" }}>
      <pre style={{ fontSize: 12, maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(virtual, null, 2)}
      </pre>
    </div>
  );
};
