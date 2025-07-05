// src/global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'my-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      label?: string;
    };
  }
}
