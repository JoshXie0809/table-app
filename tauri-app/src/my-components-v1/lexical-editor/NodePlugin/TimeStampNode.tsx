// src/nodes/TimestampNode.ts
import { DecoratorNode, EditorConfig, NodeKey } from 'lexical';
import * as React from 'react';
import { TimestampComponent } from '../components/Timestamp'; // 導入你的 React 組件

export type SerializedTimestampNode = {
  timestamp: string;
  type: 'timestamp';
  version: 1;
};

export class TimestampNode extends DecoratorNode<React.ReactNode> {
  __timestamp: string;

  static getType(): string {
    return 'timestamp';
  }

  static clone(node: TimestampNode): TimestampNode {
    return new TimestampNode(node.__timestamp, node.__key);
  }

  constructor(timestamp: string, key?: NodeKey) {
    super(key);
    this.__timestamp = timestamp;
  }

  exportJSON(): SerializedTimestampNode {
    return {
      timestamp: this.__timestamp,
      type: 'timestamp',
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedTimestampNode): TimestampNode {
    return new TimestampNode(serializedNode.timestamp);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement('span');
    element.classList.add('editor-timestamp-node');
    return element;
  }

  updateDOM(_prevNode: TimestampNode, _dom: HTMLElement): boolean {
    // 返回 false 表示 Lexical 不需要重新渲染 DOM 元素，React 會處理內容更新
    return false;
  }

  decorate(): React.ReactNode {
    return <TimestampComponent initialTimestamp={this.__timestamp} />;
  }
}

// 輔助函數：更方便地創建節點實例
export function $createTimestampNode(timestamp: string): TimestampNode {
  return new TimestampNode(timestamp);
}