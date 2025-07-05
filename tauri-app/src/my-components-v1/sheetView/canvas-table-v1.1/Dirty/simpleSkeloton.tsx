// src/components/SimpleCellSkeleton.jsx
import { makeStyles } from '@fluentui/react-components';
import React from 'react';

const useStyles = makeStyles({
  skeletonContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // 讓骨架屏居中
    boxSizing: 'border-box',
    padding: '0 8px', // 配合您的 Cell 預設 padding
  },

  skeletonItem: {
    width: "55%",
    height: "40%",
    backgroundColor: "lightgrey",
    borderRadius: '4px',
    opacity: "0.5",
  }
});

/**
 * 一個簡單的 React 組件，專門用於渲染 Cell 內部的 Skeleton 骨架屏。
 * @param {object} props
 * @param {Array<number>} props.cellIndexPath - [row, col] 用於輔助 Skeleton 的視覺參考，如果需要。
 */

export const SimpleCellSkeleton: React.FC = React.memo(()  => {
  const styles = useStyles();
  
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonItem } />
    </div>
    
  );
})

