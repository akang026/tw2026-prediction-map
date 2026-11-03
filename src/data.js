// Central data model: parties, selectable states, and the 22 regions.
export const PARTIES = {
  kmt: { name: '國民黨', strong: '#2868B2', lean: '#91B8E5' },
  dpp: { name: '民進黨', strong: '#269B60', lean: '#91D2AE' },
  tpp: { name: '民眾黨', strong: '#FFFFFF', lean: '#EEEEEE' },
  ind: { name: '無黨籍', strong: '#929292' },
  und: { name: '未定', strong: '#D5D5D5' },
};
export const PARTY_ORDER = ['kmt', 'dpp', 'tpp', 'ind', 'und'];
export const CONFIDENCE_LABEL = { strong: '有把握', lean: '傾向' };

// code = single character used in share URLs / LocalStorage
export const SELECTIONS = [
  { code: '0', party: 'und', conf: null },
  { code: '1', party: 'ind', conf: null },
  { code: '2', party: 'kmt', conf: 'strong' },
  { code: '3', party: 'kmt', conf: 'lean' },
  { code: '4', party: 'dpp', conf: 'strong' },
  { code: '5', party: 'dpp', conf: 'lean' },
  { code: '6', party: 'tpp', conf: 'strong' },
  { code: '7', party: 'tpp', conf: 'lean' },
];

export function colorFor(party, conf) {
  const p = PARTIES[party];
  return conf === 'lean' && p.lean ? p.lean : p.strong;
}

const NAMES = [
  ['taipei', '臺北市'], ['new-taipei', '新北市'], ['taoyuan', '桃園市'],
  ['taichung', '臺中市'], ['tainan', '臺南市'], ['kaohsiung', '高雄市'],
  ['keelung', '基隆市'], ['hsinchu-city', '新竹市'], ['chiayi-city', '嘉義市'],
  ['hsinchu-county', '新竹縣'], ['miaoli', '苗栗縣'], ['changhua', '彰化縣'],
  ['nantou', '南投縣'], ['yunlin', '雲林縣'], ['chiayi-county', '嘉義縣'],
  ['pingtung', '屏東縣'], ['yilan', '宜蘭縣'], ['hualien', '花蓮縣'],
  ['taitung', '臺東縣'], ['penghu', '澎湖縣'], ['kinmen', '金門縣'],
  ['lienchiang', '連江縣'],
];

// The single source of truth. Statistics are always derived from this array.
export const REGIONS = NAMES.map(([id, name]) => ({
  id, name, pathId: `path-${id}`, party: 'und', confidence: null,
}));

export function setSelection(id, party, confidence) {
  const r = REGIONS.find((x) => x.id === id);
  if (!r || !PARTIES[party]) return false;
  r.party = party;
  r.confidence = PARTIES[party].lean ? (confidence === 'lean' ? 'lean' : 'strong') : null;
  return true;
}

export function resetAll() {
  REGIONS.forEach((r) => { r.party = 'und'; r.confidence = null; });
}

const codeOf = (r) =>
  (SELECTIONS.find((s) => s.party === r.party && s.conf === r.confidence) || SELECTIONS[0]).code;

export function encodeState() {
  return 'v1-' + REGIONS.map(codeOf).join('');
}

// Returns true only if the whole string is valid; otherwise nothing is changed.
export function decodeState(str) {
  const m = /^v1-([0-7]+)$/.exec(String(str || '').trim());
  if (!m || m[1].length !== REGIONS.length) return false;
  [...m[1]].forEach((ch, i) => {
    const s = SELECTIONS.find((x) => x.code === ch);
    REGIONS[i].party = s.party;
    REGIONS[i].confidence = s.conf;
  });
  return true;
}
