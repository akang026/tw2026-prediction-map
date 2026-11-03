const fs=require("fs");
const R=JSON.parse(fs.readFileSync("regions.json")),P=JSON.parse(fs.readFileSync("paths.json"));
const ov=JSON.parse(fs.readFileSync("labels.json"));
const islands=new Set(["kinmen","lienchiang","penghu","keelung","taipei","chiayi-city","hsinchu-city"]);
let s=`<svg id="taiwan-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800" role="group" aria-label="臺灣22縣市互動地圖">\n<g id="regions">\n`;
for(const r of R){
  s+=`<g class="region" id="region-${r.id}" data-region="${r.id}" tabindex="0" role="button" aria-label="${r.name}">`;
  if(islands.has(r.id)) s+=`<path class="halo" d="${P[r.id]}" fill="none" stroke="transparent" stroke-width="14"/>`;
  s+=`<path class="shape" id="path-${r.id}" d="${P[r.id]}" fill="#D5D5D5" stroke="#5B6573" stroke-width="0.8" stroke-linejoin="round"/></g>\n`;
}
s+=`</g>\n<g id="labels" pointer-events="none" font-family="'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif" font-weight="600" text-anchor="middle">\n`;
for(const r of R){
  const o=ov[r.id]||{};const x=o.x??r.c[0],y=o.y??r.c[1],fs_=o.fs||13;
  if(o.from) s+=`<line data-leader-for="${r.id}" x1="${o.from[0]}" y1="${o.from[1]}" x2="${o.lx??x}" y2="${o.ly??y-4}" stroke="#5B6573" stroke-width="0.8"/>\n`;
  s+=`<text data-label-for="${r.id}" x="${x}" y="${y}" font-size="${fs_}" fill="#1F2937"${o.out?' data-outside="1" pointer-events="auto" style="cursor:pointer"':''}${o.a?` text-anchor="${o.a}"`:''}>${r.name}</text>\n`;
}
s+=`</g>\n</svg>\n`;
fs.writeFileSync("../assets/taiwan-map.svg",s);
console.log(s.length);
