import { REGIONS, encodeState, decodeState } from './data.js';
import { renderMap } from './map.js';
import { renderTally } from './statistics.js';

const KEY = 'tw2026-mayor-prediction-v1';
const TITLE = '我的 2026 台灣縣市長選舉預測';

export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- LocalStorage ---------- */
export function saveLocal() {
  try { localStorage.setItem(KEY, encodeState()); } catch (_) { /* private mode etc. */ }
}
export function loadLocal() {
  try { return decodeState(localStorage.getItem(KEY)); } catch (_) { return false; }
}
export function clearLocal() {
  try { localStorage.removeItem(KEY); } catch (_) { /* ignore */ }
}

/* ---------- URL hash ---------- */
export function readHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!raw) return 'none';
  return decodeState(raw) ? 'ok' : 'invalid';
}
export function syncHash() {
  const allUndecided = REGIONS.every((r) => r.party === 'und');
  const url = location.pathname + location.search + (allUndecided ? '' : '#' + encodeState());
  history.replaceState(null, '', url);
}
export function shareUrl() {
  return location.origin + location.pathname + '#' + encodeState();
}
export async function copyShareUrl() {
  const url = shareUrl();
  try {
    await navigator.clipboard.writeText(url);
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) { window.prompt('請手動複製分享網址：', url); return; }
  }
  toast('已複製分享網址');
}

/* ---------- PNG export ---------- */
function buildCard(mapSvg) {
  const card = document.createElement('div');
  card.className = 'export-card';
  const svg = mapSvg.cloneNode(true);
  svg.querySelector('#hover-outline')?.remove();
  svg.setAttribute("width", 500);
  svg.setAttribute("height", 625);
  svg.removeAttribute('style');
  renderMap(svg, REGIONS);
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  card.innerHTML = `<h2>${TITLE}</h2><p class="ec-sub">每個縣市選出你心目中的勝選政黨</p>
    <div class="ec-body"><div class="ec-map"></div><div class="ec-stats"></div></div>
    <div class="ec-foot"><span>製作時間：${stamp}</span><span>由 ${location.host}${location.pathname.replace(/index\.html$/, '')} 製作</span></div>`;
  card.querySelector('.ec-map').appendChild(svg);
  renderTally(card.querySelector('.ec-stats'), REGIONS);
  return card;
}

export async function exportPng(mapSvg) {
  if (typeof html2canvas !== 'function') { toast('匯出元件載入失敗，請重新整理後再試'); return; }
  const card = buildCard(mapSvg);
  document.body.classList.add('exporting');
  document.body.appendChild(card);
  const y = window.scrollY;
  window.scrollTo(0, 0);
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = await html2canvas(card, {
      backgroundColor: '#ffffff', scale: Math.min(3, Math.max(2, window.devicePixelRatio || 2)),
      useCORS: true, scrollX: 0, scrollY: 0, windowWidth: 1100,
    });
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) throw new Error('empty canvas');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'taiwan-2026-prediction.png';
    document.body.appendChild(a); a.click(); a.remove();
    // iOS Safari may ignore `download`; keep the blob alive so the user can long-press save.
    if (/iP(hone|ad|od)/.test(navigator.userAgent)) window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    toast('已產生圖片');
  } catch (err) {
    console.error(err);
    toast('圖片匯出失敗，請稍後再試');
  } finally {
    card.remove();
    document.body.classList.remove('exporting');
    window.scrollTo(0, y);
  }
}
