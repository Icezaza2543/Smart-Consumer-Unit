const metrics = [["Power","W"],["Voltage","V"],["Current","A"],["Temperature","°C"],["Humidity","% RH"],["Frequency","Hz"],["Power factor",""]];
const get = id => document.getElementById(id);
const metric = get("metric"), period = get("period"), cursor = get("cursor"), chart = get("chart");
const clock = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Bangkok",hour:"2-digit",minute:"2-digit"});
const date = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Bangkok",day:"numeric",month:"short"});
let rows = [], visible = [], marker, x, y;
function draw(tag, attributes, label) {
  const node = document.createElementNS("http://www.w3.org/2000/svg",tag);
  for (const [key,value] of Object.entries(attributes)) node.setAttribute(key,value);
  if (label !== undefined) node.textContent = label;
  chart.append(node);
  return node;
}
function inspect() {
  const row = visible[Number(cursor.value)];
  if (!row) return;
  const index = Number(metric.value);
  marker.setAttribute("cx",x(row[0]));
  marker.setAttribute("cy",y(row[index+2]));
  const time = row[0]*1000;
  get("reading").textContent = date.format(time)+" · "+clock.format(time)+"–"+clock.format(time+300000)+" · "+row[index+2]+" "+metrics[index][1]+" · "+row[1]+" source readings";
}
function render() {
  const index = Number(metric.value), [name,unit] = metrics[index];
  visible = rows.filter(r => (!period.value || date.format(r[0]*1000)===period.value) && r[index+2]!==null);
  chart.replaceChildren();
  cursor.disabled = !visible.length;
  get("reading").textContent = "";
  get("summary").textContent = name+(unit?" ("+unit+")":"")+" · "+visible.length+" recorded intervals";
  if (!visible.length) return;
  const values = visible.map(r=>r[index+2]);
  const min = Math.min(...values), max = Math.max(...values);
  const margin = (max-min)*0.06 || 1, lo = min-margin, hi = max+margin;
  const start = visible[0][0], end = visible.at(-1)[0];
  x = t => 76+(t-start)*790/(end-start||1);
  y = v => 258-(v-lo)*235/(hi-lo);
  for (let i=0;i<5;i++) {
    const v = lo+(hi-lo)*i/4;
    draw("line",{x1:76,x2:866,y1:y(v),y2:y(v),stroke:"#d7e3de"});
    draw("text",{x:67,y:y(v)+5,"text-anchor":"end",fill:"#405e5b"},Number(v.toFixed(2)));
  }
  for (let i=0;i<=4;i++) {
    const t=start+(end-start)*i/4;
    draw("text",{x:x(t),y:290,"text-anchor":"middle",fill:"#405e5b"},period.value?clock.format(t*1000):date.format(t*1000));
  }
  let path="";
  visible.forEach((r,i)=>{
    const gap=!i || r[0]-visible[i-1][0]>300;
    path+=(gap?"M":"L")+x(r[0])+" "+y(r[index+2])+" ";
    if (gap) draw("circle",{cx:x(r[0]),cy:y(r[index+2]),r:2,fill:"#147773"});
  });
  draw("path",{d:path,fill:"none",stroke:"#147773","stroke-width":2});
  marker=draw("circle",{r:5,fill:"#bf4c1f"});
  cursor.max=visible.length-1;
  cursor.value=0;
  inspect();
}
async function start() {
  const response = await fetch("readings.json");
  if (!response.ok) throw Error();
  rows = await response.json();
  metrics.forEach(([name],i)=>metric.add(new Option(name,i)));
  for (const day of new Set(rows.map(r=>date.format(r[0]*1000)))) period.add(new Option(day,day));
  metric.onchange=period.onchange=render;
  cursor.oninput=inspect;
  render();
}
start().catch(()=>{get("summary").textContent="Could not load the recorded dataset. Reload this page to try again.";});
