// Minimal DOM helpers.

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | undefined> | null = null,
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === false) continue;
      if (k === 'class') el.className = String(v);
      else if (k === 'html') el.innerHTML = String(v);
      else if (k === 'style') el.setAttribute('style', String(v));
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export function html(s: string): HTMLElement {
  const t = document.createElement('template');
  t.innerHTML = s.trim();
  return t.content.firstElementChild as HTMLElement;
}

export function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export const KEY_LABEL: Record<string, string> = {
  Mouse0: 'LMB', Mouse2: 'RMB', Space: 'Space', ShiftLeft: 'Shift', ControlLeft: 'Ctrl', Tab: 'Tab', Escape: 'Esc',
};
export function kbd(k: string) {
  return `<span class="kbd">${esc(k)}</span>`;
}

export function snowOverlay(count = 70) {
  const wrap = h('div', { class: 'snowfall' });
  for (let i = 0; i < count; i++) {
    const s = 2 + Math.random() * 5;
    const el = h('i', {
      style: `left:${Math.random() * 100}%;--s:${s}px;--o:${0.3 + Math.random() * 0.6};--b:${s > 5 ? 1.5 : 0}px;--d:${8 + Math.random() * 12}s;--delay:${-Math.random() * 20}s;--x:${(Math.random() - 0.5) * 200}px`,
    });
    wrap.append(el);
  }
  return wrap;
}

export const CATEGORY_ICON: Record<string, string> = { wish: '🎁', deed: '📜', rumor: '👂' };
export const CATEGORY_NAME: Record<string, string> = { wish: 'Wishes', deed: 'Deeds', rumor: 'Rumours' };
