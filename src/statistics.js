import { PARTIES, PARTY_ORDER, SELECTIONS, colorFor, CONFIDENCE_LABEL } from './data.js';

export function computeStats(regions) {
  const parties = {};
  PARTY_ORDER.forEach((p) => { parties[p] = { count: 0, strong: 0, lean: 0 }; });
  const segments = SELECTIONS.map((s) => ({ ...s, count: 0 }));
  regions.forEach((r) => {
    parties[r.party].count++;
    if (r.confidence) parties[r.party][r.confidence]++;
    segments.find((s) => s.party === r.party && s.conf === r.confidence).count++;
  });
  const sum = PARTY_ORDER.reduce((a, p) => a + parties[p].count, 0);
  if (sum !== regions.length) console.error('Seat total mismatch', sum);
  return { total: regions.length, parties, segments };
}

const order = ['2', '3', '4', '5', '6', '7', '1', '0'];

export function renderTally(root, regions) {
  const s = computeStats(regions);
  const segs = order.map((c) => s.segments.find((x) => x.code === c)).filter((x) => x.count > 0);
  const bar = segs.map((x) =>
    `<span class="seg" style="flex:${x.count};background:${colorFor(x.party, x.conf)}"></span>`).join('');
  const summary = PARTY_ORDER.map((p) => `${PARTIES[p].name} ${s.parties[p].count}`).join('，');
  const rows = PARTY_ORDER.map((p) => {
    const d = s.parties[p], P = PARTIES[p];
    const sw = `<i style="background:${P.strong}"></i>` + (P.lean ? `<i style="background:${P.lean}"></i>` : '');
    const sub = P.lean ? `<span class="t-sub">${CONFIDENCE_LABEL.strong} ${d.strong}／${CONFIDENCE_LABEL.lean} ${d.lean}</span>` : '';
    return `<li class="tally-row"><span class="sw-pair">${sw}</span><span class="t-name">${P.name}${sub}</span><span class="t-count">${d.count}</span></li>`;
  }).join('');
  root.innerHTML =
    `<div class="tally-bar" role="img" aria-label="${summary}">${bar}</div>` +
    `<ul class="tally-list">${rows}</ul><p class="tally-total">共 ${s.total} 個縣市</p>`;
}
