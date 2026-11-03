import svgText from '../assets/taiwan-map.svg';
import { PARTIES, colorFor, CONFIDENCE_LABEL } from './data.js';

const NS = 'http://www.w3.org/2000/svg';

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

// Colours are written as SVG attributes (not CSS) so html2canvas can export them.
export function renderMap(svg, regions) {
  regions.forEach((r) => {
    const color = colorFor(r.party, r.confidence);
    svg.querySelector(`#${r.pathId}`)?.setAttribute('fill', color);
    const label = svg.querySelector(`[data-label-for="${r.id}"]`);
    if (label && !label.hasAttribute('data-outside')) {
      label.setAttribute('fill', luminance(color) < 0.2 ? '#FFFFFF' : '#1F2937');
    }
    const g = svg.querySelector(`#region-${r.id}`);
    const conf = r.confidence ? CONFIDENCE_LABEL[r.confidence] : '';
    g?.setAttribute('aria-label', `${r.name}：${PARTIES[r.party].name}${conf}`);
  });
}

export async function loadMap(host, onPick) {
  host.innerHTML = svgText; // 地圖在建置時內嵌，直接開啟 index.html 也能運作
  const svg = host.querySelector('svg');
  const outline = document.createElementNS(NS, 'path');
  Object.entries({ id: 'hover-outline', fill: 'none', stroke: '#111827', 'stroke-width': 2,
    'stroke-linejoin': 'round', 'pointer-events': 'none' }).forEach(([k, v]) => outline.setAttribute(k, v));
  svg.insertBefore(outline, svg.querySelector('#labels'));

  const idOf = (el) => {
    const n = el.closest && el.closest('[data-region],[data-label-for]');
    return n ? (n.dataset.region || n.dataset.labelFor) : null;
  };
  let shown = null;
  const show = (id) => {
    if (id === shown) return;
    shown = id;
    outline.setAttribute('d', id ? svg.querySelector(`#path-${id}`).getAttribute('d') : '');
  };
  svg.addEventListener('click', (e) => {
    const id = idOf(e.target);
    if (id) onPick(id, { x: e.clientX, y: e.clientY });
  });
  svg.addEventListener('pointerover', (e) => { if (e.pointerType !== 'touch') show(idOf(e.target)); });
  svg.addEventListener('pointerleave', () => show(null));
  svg.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) show(idOf(e.target)); });
  svg.addEventListener('focusout', () => show(null));
  svg.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const id = idOf(e.target);
    if (!id) return;
    e.preventDefault();
    const b = e.target.getBoundingClientRect();
    onPick(id, { x: b.left + b.width / 2, y: b.top + b.height / 2 });
  });
  return svg;
}
