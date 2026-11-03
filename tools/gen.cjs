const topo=require("topojson-client"),d3=require("d3-geo"),fs=require("fs");
const t=require("./package/counties-10t.json");
const W=640,H=800;
const slug={A:"taipei",F:"new-taipei",H:"taoyuan",B:"taichung",D:"tainan",E:"kaohsiung",G:"yilan",J:"hsinchu-county",O:"hsinchu-city",K:"miaoli",N:"changhua",M:"nantou",P:"yunlin",Q:"chiayi-county",I:"chiayi-city",T:"pingtung",V:"taitung",U:"hualien",C:"keelung",X:"penghu",W:"kinmen",Z:"lienchiang"};
const fc=topo.feature(t,t.objects.counties);
// drop far-flung islets (Pratas, Spratly) that would distort the frame
const inBox=c=>c[0]>117.9&&c[1]>21.8&&c[1]<26.6;
const feats=fc.features.map(f=>{
  const polys=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
  const keep=polys.filter(p=>inBox(d3.geoCentroid({type:"Polygon",coordinates:p})));
  return {id:slug[f.properties.COUNTYID],name:f.properties.COUNTYNAME.replace("台","臺"),eng:f.properties.COUNTYENG,polys:keep};
});
const all={type:"FeatureCollection",features:feats.map(f=>({type:"Feature",geometry:{type:"MultiPolygon",coordinates:f.polys}}))};
const proj=d3.geoMercator().fitExtent([[10,10],[W-10,H-10]],all);
const path=d3.geoPath(proj).digits(1);
const out=[];const lab={};
for(const f of feats){
  const geo={type:"MultiPolygon",coordinates:f.polys};
  let best=f.polys.reduce((a,b)=>d3.geoArea({type:"Polygon",coordinates:a})>d3.geoArea({type:"Polygon",coordinates:b})?a:b);
  const c=path.centroid({type:"Polygon",coordinates:best});
  out.push({...f,d:path(geo),c});
}
fs.writeFileSync("regions.json",JSON.stringify(out.map(o=>({id:o.id,name:o.name,eng:o.eng,c:o.c,len:o.d.length}))));
fs.writeFileSync("paths.json",JSON.stringify(Object.fromEntries(out.map(o=>[o.id,o.d]))));
console.log(out.map(o=>`${o.id} ${o.name} c=${o.c.map(v=>v.toFixed(0))} len=${o.d.length}`).join("\n"));
console.log("total",out.reduce((s,o)=>s+o.d.length,0));
