const GATES = {
  AND:  {f:(a,b)=>a&b,       d:"Output is 1 only when both inputs are 1."},
  OR:   {f:(a,b)=>a|b,       d:"Output is 1 when at least one input is 1."},
  NOT:  {f:(a)=>a?0:1,       d:"Inverts the input. Uses only input A.", one:true},
  NAND: {f:(a,b)=>(a&b)?0:1, d:"AND followed by NOT. Output is 0 only when both inputs are 1."},
  NOR:  {f:(a,b)=>(a|b)?0:1, d:"OR followed by NOT. Output is 1 only when both inputs are 0."},
  XOR:  {f:(a,b)=>a^b,       d:"Output is 1 when the inputs are different."},
  XNOR: {f:(a,b)=>(a^b)?0:1, d:"Output is 1 when the inputs are the same."}
};
const NAMES = Object.keys(GATES);
const $ = id => document.getElementById(id);
const col = v => v ? "var(--on)" : "var(--off)";

// Drawing: gate body path by type (viewBox 0 0 120 70)
function body(t){
  const base = t.replace(/^N(?=AND|OR)/,"").replace(/^XN/,"X");
  if (t==="NOT") return '<path class="body" d="M30 12 L70 35 L30 58 Z"/>';
  if (base==="AND") return '<path class="body" d="M30 12 H55 A23 23 0 0 1 55 58 H30 Z"/>';
  if (base==="OR")  return '<path class="body" d="M28 12 Q62 12 82 35 Q62 58 28 58 Q42 35 28 12 Z"/>';
  if (base==="XOR") return '<path class="body" d="M28 12 Q62 12 82 35 Q62 58 28 58 Q42 35 28 12 Z"/><path class="body" d="M20 12 Q34 35 20 58"/>';
}
function inverted(t){ return t==="NOT"||t==="NAND"||t==="NOR"||t==="XNOR"; }
function drawGate(t,a,b,y){
  const one = GATES[t].one;
  const ox = t==="NOT" ? 70 : (t==="AND"||t==="NAND") ? 78 : 82;
  const bub = inverted(t);
  const ex = bub ? ox+8 : ox;
  let s = body(t);
  if (one) s += `<line x1="4" y1="35" x2="30" y2="35" stroke="${col(a)}" stroke-width="3"/><text x="4" y="30">A</text>`;
  else {
    const xi = (t==="OR"||t==="NOR"||t==="XOR"||t==="XNOR") ? 33 : 30;
    s += `<line x1="4" y1="24" x2="${xi}" y2="24" stroke="${col(a)}" stroke-width="3"/><text x="4" y="19">A</text>`;
    s += `<line x1="4" y1="46" x2="${xi}" y2="46" stroke="${col(b)}" stroke-width="3"/><text x="4" y="62">B</text>`;
  }
  if (bub) s += `<circle cx="${ox+4}" cy="35" r="4" class="body" style="stroke-width:2"/>`;
  s += `<line x1="${ex}" y1="35" x2="112" y2="35" stroke="${col(y)}" stroke-width="3"/><text x="106" y="30">Y</text>`;
  return s;
}

function toggleHTML(names, vals, fn){
  return names.map((n,i)=>`<button class="sw ${vals[i]?'on':''}" aria-pressed="${!!vals[i]}" onclick="${fn}(${i})">${n} = ${vals[i]}</button>`).join("");
}

// ---------- Mode 1: single gate ----------
let cur = "AND", inp = [0,0];
function renderSingle(){
  const g = GATES[cur], one = g.one;
  const y = g.f(inp[0], inp[1]);
  $("gateBtns").innerHTML = NAMES.map(n=>`<button class="${n===cur?'active':''}" onclick="pick('${n}')">${n}</button>`).join("");
  $("svg1").innerHTML = drawGate(cur, inp[0], inp[1], y);
  $("tog1").innerHTML = toggleHTML(one?["A"]:["A","B"], inp, "flip1");
  const yb = $("y1"); yb.textContent = y; yb.className = "bit " + (y?"on":"off");
  $("desc1").textContent = g.d;
  let rows = one ? [[0],[1]] : [[0,0],[0,1],[1,0],[1,1]];
  let h = "<tr>" + (one?"<th>A</th>":"<th>A</th><th>B</th>") + "<th>Y</th></tr>";
  rows.forEach(r=>{
    const isCur = one ? r[0]===inp[0] : (r[0]===inp[0] && r[1]===inp[1]);
    h += `<tr class="${isCur?'cur':''}">` + r.map(v=>`<td>${v}</td>`).join("") + `<td>${g.f(r[0],r[1])}</td></tr>`;
  });
  $("tt").innerHTML = h;
}
function pick(n){ cur = n; renderSingle(); }
function flip1(i){ inp[i] ^= 1; renderSingle(); }

// ---------- Mode 2: three-gate circuit ----------
let c = {a:[0,0], b:[0,0]};
function flipC(grp,i){ c[grp][i] ^= 1; renderCirc(); }
function renderCirc(){
  const n1=$("g1").value, n2=$("g2").value, n3=$("g3").value;
  const y1 = GATES[n1].f(c.a[0], c.a[1]);
  const y2 = GATES[n2].f(c.b[0], c.b[1]);
  const y3 = GATES[n3].f(y1, y2);
  $("s1").innerHTML = drawGate(n1, c.a[0], c.a[1], y1);
  $("s2").innerHTML = drawGate(n2, c.b[0], c.b[1], y2);
  $("s3").innerHTML = drawGate(n3, y1, y2, y3);
  $("t1").innerHTML = toggleHTML(GATES[n1].one?["A"]:["A","B"], c.a, "flipA");
  $("t2").innerHTML = toggleHTML(GATES[n2].one?["C"]:["C","D"], c.b, "flipB");
  const yb=$("y3"); yb.textContent=y3; yb.className="bit "+(y3?"on":"off");
}
function flipA(i){ flipC("a",i); }
function flipB(i){ flipC("b",i); }

function setMode(m){
  $("mode1").classList.toggle("hide", m!==1);
  $("mode2").classList.toggle("hide", m!==2);
  $("tab1").classList.toggle("active", m===1);
  $("tab2").classList.toggle("active", m===2);
  if (m===2) renderCirc();
}

["g1","g2","g3"].forEach((id,i)=>{
  $(id).innerHTML = NAMES.map(n=>`<option>${n}</option>`).join("");
  $(id).value = ["AND","OR","XOR"][i];
});
renderSingle();