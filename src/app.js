import { REGIONS, PARTIES, PARTY_ORDER, CONFIDENCE_LABEL, colorFor, setSelection, resetAll } from './data.js';
import { loadMap, renderMap } from './map.js';
import { renderTally } from './statistics.js';
import { readHash, syncHash, saveLocal, loadLocal, clearLocal, copyShareUrl, exportPng, toast } from './sharing.js';

const $ = (s) => document.querySelector(s);
const picker = $('#picker'), backdrop = $('#picker-backdrop');
let svg, current = null, opener = null;

function renderAll() {
  renderMap(svg, REGIONS);
  renderTally($('#tally'), REGIONS);
}
function commit() { saveLocal(); syncHash(); renderAll(); }

/* ---------- picker ---------- */
function buildPicker() {
  const body = $('#picker-options');
  body.innerHTML = PARTY_ORDER.map((p) => {
    const P = PARTIES[p];
    const levels = P.lean ? ['strong', 'lean'] : [null];
    const btns = levels.map((c) =>
      `<button type="button" data-party="${p}" data-conf="${c || ''}"><i style="background:${colorFor(p, c)}"></i>${c ? CONFIDENCE_LABEL[c] : '選擇'}</button>`).join('');
    return `<div class="opt-row"><span>${P.name}</span><div>${btns}</div></div>`;
  }).join('');
}
function openPicker(id, pt) {
  const r = REGIONS.find((x) => x.id === id);
  current = id;
  opener = document.activeElement;
  $('#picker-title').textContent = r.name;
  picker.querySelectorAll('button[data-party]').forEach((b) => {
    const on = b.dataset.party === r.party && (b.dataset.conf || null) === r.confidence;
    b.setAttribute('aria-pressed', on);
  });
  picker.hidden = backdrop.hidden = false;
  if (matchMedia('(min-width: 721px)').matches) {
    const w = picker.offsetWidth, h = picker.offsetHeight;
    picker.style.left = Math.max(8, Math.min(pt.x + 14, innerWidth - w - 8)) + 'px';
    picker.style.top = Math.max(8, Math.min(pt.y + 14, innerHeight - h - 8)) + 'px';
  } else { picker.style.left = picker.style.top = ''; }
  (picker.querySelector('[aria-pressed="true"]') || picker.querySelector('button')).focus({ preventScroll: true });
}
function closePicker() {
  if (picker.hidden) return;
  picker.hidden = backdrop.hidden = true;
  current = null;
  opener?.focus?.({ preventScroll: true });
}
picker.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-party]');
  if (b && current) {
    setSelection(current, b.dataset.party, b.dataset.conf);
    commit();
    closePicker();
  }
  if (e.target.closest('#picker-close')) closePicker();
});
backdrop.addEventListener('click', closePicker);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePicker(); });

/* ---------- init ---------- */
async function init() {
  buildPicker();
  try {
    svg = await loadMap($('#map-host'), openPicker);
  } catch (err) {
    console.error(err);
    $('#map-host').innerHTML = '<p class="map-error">地圖載入失敗。請重新整理頁面再試。</p>';
    return;
  }
  $('#map-host').removeAttribute('aria-busy');
  const h = readHash();
  if (h === 'invalid') {
    toast('分享網址格式不正確，已改為顯示你上次的預測');
    history.replaceState(null, '', location.pathname + location.search);
    loadLocal();
  } else if (h === 'none') {
    loadLocal();
  }
  renderAll();
}

$('#btn-export').addEventListener('click', () => svg && exportPng(svg));
$('#btn-copy').addEventListener('click', copyShareUrl);
$('#btn-reset').addEventListener('click', () => {
  if (!confirm('確定要把全部縣市重設為「未定」嗎？')) return;
  resetAll(); clearLocal(); syncHash(); renderAll();
  toast('已重新預測');
});
window.addEventListener('hashchange', () => {
  if (svg && readHash() === 'ok') renderAll();
});
init();
