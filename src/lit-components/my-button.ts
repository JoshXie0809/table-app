import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-button')
export class MyButton extends LitElement {
  @property() label = 'Click me';

  static styles = css`button { font-size: 1.2rem; }`;

  render() {
    return html`<button @click=${this._click}>${this.label}</button>`;
  }

  private _click() {
    this.dispatchEvent(new CustomEvent('btn-click', {
      detail: { msg: 'Hello from Lit' },
      bubbles: true,
      composed: true,
    }));
  }
}
