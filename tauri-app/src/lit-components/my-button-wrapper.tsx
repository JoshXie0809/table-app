import { useRef, useEffect } from 'react';
import '../lit-components/my-button'; // 確保元件被註冊

export function MyButtonWrapper(props: { label: string; onClick?: () => void }) {
  const ref = useRef<HTMLElement & { label?: string }>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handle = (_e: Event) => {
      props.onClick?.();
    };

    el.addEventListener('btn-click', handle);
    return () => el.removeEventListener('btn-click', handle);
  }, [props.onClick]);

  useEffect(() => {
    if (ref.current) {
      ref.current.label = props.label;
    }
  }, [props.label]);

  return <my-button ref={ref}></my-button>;
}
