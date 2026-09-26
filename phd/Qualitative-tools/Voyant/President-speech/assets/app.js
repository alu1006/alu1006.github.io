const state={data:null,speechIndex:7,speechSearch:'',highlight:'',group:'china',chart:'trend',terms:{china:new Set(['中國','兩岸','對岸','北京']),economy:new Set(['經濟','產業','國家','台灣／臺灣'])},contextGroup:'china',contextYear:'',contextCategory:'',contextSearch:'',contextLimit:20};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rxEsc=v=>String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const fmt=(v,d=0)=>Number(v).toLocaleString('zh-TW',{minimumFractionDigits:d,maximumFractionDigits:d});

async function init(){
  try{state.data=await fetch('/phd/Qualitative-tools/Voyant/President-speech/data/site-data.json').then(r=>{if(!r.ok)throw new Error('資料載入失敗');return r.json()})}
  catch(e){document.body.innerHTML=`<main class="empty"><p>${esc(e.message)}</p></main>`;return}
  $('#context-total').textContent=state.data.contexts.length;
  buildSpeechControls();renderSpeech();buildChartControls();renderChart();buildContextFilters();renderContexts();renderConclusions();bindEvents();
}

function buildSpeechControls(){
  $('#speech-years').innerHTML=state.data.speeches.map((s,i)=>`<button role="tab" aria-selected="${i===state.speechIndex}" class="${i===state.speechIndex?'active':''}" data-index="${i}">${s.year}<span>${esc(s.president)}</span></button>`).join('');
  const terms=[...new Set(Object.values(state.data.groups).flatMap(g=>g.terms))];
  $('#speech-highlight').innerHTML='<option value="">不標示</option>'+terms.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');
}
function highlighted(text,query){if(!query)return esc(text);const variants=query==='台灣／臺灣'?['台灣','臺灣']:[query];const pattern=new RegExp(`(${variants.map(rxEsc).join('|')})`,'gi');return esc(text).replace(pattern,'<mark>$1</mark>')}
function renderSpeech(){
  const s=state.data.speeches[state.speechIndex];
  $('#speech-meta').innerHTML=`<div class="year">${s.year}</div><h3>${esc(s.president)}</h3><p>${esc(s.term)}總統就職演說</p><dl><dt>全文字數</dt><dd>${fmt(s.characters)} 字</dd><dt>資料來源</dt><dd>${esc(s.sourceName)}</dd></dl><a class="source-link" href="${esc(s.sourceUrl)}" target="_blank" rel="noopener">查看總統府原文 ↗</a>`;
  const q=state.speechSearch||state.highlight;$('#speech-text').innerHTML=highlighted(s.text,q);
  const count=q?(q==='台灣／臺灣'?(s.text.match(/台灣|臺灣/g)||[]).length:(s.text.match(new RegExp(rxEsc(q),'g'))||[]).length):0;
  $('#reader-status').textContent=q?`在 ${s.year} 年演說中找到 ${count} 個「${q}」`:'顯示完整演說稿；可使用上方搜尋或快速標示。';
  $$('#speech-years button').forEach((b,i)=>{b.classList.toggle('active',i===state.speechIndex);b.setAttribute('aria-selected',String(i===state.speechIndex))});
}

function buildChartControls(){
  $('#group-tabs').addEventListener('click',e=>{const b=e.target.closest('button[data-group]');if(!b)return;state.group=b.dataset.group;$$('#group-tabs button').forEach(x=>x.classList.toggle('active',x===b));renderChart()});
  $('#chart-tabs').addEventListener('click',e=>{const b=e.target.closest('button[data-chart]');if(!b)return;state.chart=b.dataset.chart;$$('#chart-tabs button').forEach(x=>x.classList.toggle('active',x===b));renderChart()});
}
function renderTermControls(){
  const group=state.data.groups[state.group],selected=state.terms[state.group],disabled=state.chart==='cloud'||state.chart==='collocates';$('#term-controls').style.display=disabled?'none':'flex';if(disabled)return;
  $('#term-controls').innerHTML=group.terms.map(t=>`<label class="term-check"><input type="checkbox" value="${esc(t)}" ${selected.has(t)?'checked':''}><span class="term-dot" style="background:${group.colors[t]}"></span>${esc(t)}</label>`).join('');
  $$('#term-controls input').forEach(input=>input.addEventListener('change',()=>{if(input.checked)selected.add(input.value);else selected.delete(input.value);if(!selected.size){selected.add(input.value);input.checked=true}renderChartVisual()}));
}
function renderChart(){renderTermControls();renderChartVisual()}
function svgEl(tag,attrs={}){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
function renderChartVisual(){const area=$('#chart-area');area.innerHTML='';if(state.chart==='trend')renderTrend(area);else if(state.chart==='bubble')renderBubble(area);else if(state.chart==='cloud')renderCloud(area);else renderCollocates(area)}

function renderTrend(area){
  const speeches=state.data.speeches,terms=[...state.terms[state.group]],group=state.data.groups[state.group];const W=1040,H=430,m={l:66,r:28,t:30,b:58},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const vals=terms.flatMap(t=>speeches.map(s=>s.metrics[state.group][t].relative)),max=Math.max(1,...vals)*1.12,x=i=>m.l+i*iw/(speeches.length-1),y=v=>m.t+ih-v/max*ih;
  const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,class:'chart-svg',role:'img','aria-label':'關鍵詞相對頻率趨勢圖'});
  for(let i=0;i<=4;i++){const yy=m.t+ih*i/4;svg.append(svgEl('line',{x1:m.l,x2:W-m.r,y1:yy,y2:yy,class:'grid-line'}));const tx=svgEl('text',{x:m.l-10,y:yy+5,'text-anchor':'end',fill:'#5e6b7c','font-size':'12'});tx.textContent=fmt(max*(1-i/4),1);svg.append(tx)}
  speeches.forEach((s,i)=>{const tx=svgEl('text',{x:x(i),y:H-22,'text-anchor':'middle',fill:'#5e6b7c','font-size':'13'});tx.textContent=s.year;svg.append(tx)});
  terms.forEach(t=>{const points=speeches.map((s,i)=>[x(i),y(s.metrics[state.group][t].relative)]);svg.append(svgEl('path',{d:points.map((p,i)=>`${i?'L':'M'}${p[0]},${p[1]}`).join(' '),class:'line-path',stroke:group.colors[t]}));points.forEach((p,i)=>{const c=svgEl('circle',{cx:p[0],cy:p[1],r:5,fill:group.colors[t],class:'point'}),title=svgEl('title');title.textContent=`${speeches[i].year} ${t}：${fmt(speeches[i].metrics[state.group][t].relative,2)}／萬詞（${speeches[i].metrics[state.group][t].count} 次）`;c.append(title);svg.append(c)})});
  const yl=svgEl('text',{x:16,y:20,fill:'#5e6b7c','font-size':'12'});yl.textContent='每萬詞相對頻率';svg.append(yl);area.append(svg);
  $('#chart-note').textContent=state.group==='china'?'「中國」在1996年最高；「兩岸」於2004–2012較密集，之後下降。':'「產業」在2020年明顯上升；2024年把產業、國家與供應鏈韌性放在同一框架中。';
}
function renderBubble(area){
  const speeches=state.data.speeches,terms=[...state.terms[state.group]],group=state.data.groups[state.group],bins=18;
  const bubbles=speeches.map((s,si)=>terms.flatMap((t,ti)=>{const counts=Array(bins).fill(0);s.metrics[state.group][t].positions.forEach(pos=>counts[Math.min(bins-1,Math.floor(pos*bins))]++);return counts.map((count,bin)=>({si,ti,t,bin,count})).filter(d=>d.count)})).flat();
  const maxCount=Math.max(1,...bubbles.map(d=>d.count)),W=1040,rowH=58,H=112+speeches.length*rowH,m={l:150,r:34,t:86},iw=W-m.l-m.r,svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,class:'chart-svg',role:'img','aria-label':'氣泡大小代表區段出現次數，位置代表詞語在演說中的位置'}),radius=n=>4+14*Math.sqrt(n/maxCount);
  const legend=svgEl('text',{x:m.l,y:24,fill:'#34465c','font-size':'13','font-weight':'700'});legend.textContent='氣泡大小＝該區段出現次數';svg.append(legend);
  [...new Set([1,Math.max(1,Math.ceil(maxCount/2)),maxCount])].forEach((n,i)=>{const cx=m.l+28+i*92,r=radius(n),c=svgEl('circle',{cx,cy:57,r,fill:'#1477d2',opacity:.28,stroke:'#0754a1','stroke-width':'1.5'}),tx=svgEl('text',{x:cx+r+7,y:61,fill:'#5e6b7c','font-size':'12'});tx.textContent=`${n} 次`;svg.append(c,tx)});
  speeches.forEach((s,i)=>{const yy=m.t+i*rowH;svg.append(svgEl('line',{x1:m.l,x2:W-m.r,y1:yy,y2:yy,class:'axis-line'}));const label=svgEl('text',{x:m.l-15,y:yy+5,'text-anchor':'end',class:'bubble-label'});label.textContent=`${s.year} ${s.president}`;svg.append(label)});
  bubbles.forEach(d=>{const s=speeches[d.si],cx=m.l+(d.bin+.5)*iw/bins,cy=m.t+d.si*rowH+(d.ti-(terms.length-1)/2)*5,c=svgEl('circle',{cx,cy,r:radius(d.count),fill:group.colors[d.t],opacity:.67,stroke:group.colors[d.t],'stroke-width':'1.4'}),title=svgEl('title');title.textContent=`${s.year}｜${d.t}｜全文 ${Math.round(d.bin/bins*100)}–${Math.round((d.bin+1)/bins*100)}%｜${d.count} 次`;c.append(title);svg.append(c)});
  [['開頭',m.l],['中段',m.l+iw/2],['結尾',m.l+iw]].forEach(([t,xx])=>{const label=svgEl('text',{x:xx,y:H-10,'text-anchor':xx===m.l?'start':xx===m.l+iw?'end':'middle',fill:'#5e6b7c','font-size':'12'});label.textContent=t;svg.append(label)});area.append(svg);$('#chart-note').textContent=`全文分為 ${bins} 個等長區段；氣泡越大，代表該詞在該區段出現越多次。水平位置表示演說的前段、中段或後段。`;
}
function renderCloud(area){
  const group=state.data.groups[state.group],totals=state.data.totals[state.group],entries=group.terms.map(t=>[t,totals[t]]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),max=Math.max(...entries.map(x=>x[1])),stage=document.createElement('div');stage.className='cloud-stage';
  entries.forEach(([t,n])=>{const b=document.createElement('button');b.className='cloud-word';b.style.color=group.colors[t];b.style.fontSize=`${18+46*Math.sqrt(n/max)}px`;b.innerHTML=`${esc(t)}<small>${n} 次</small>`;b.addEventListener('click',()=>{state.highlight=t;$('#speech-highlight').value=t;document.querySelector('#speeches').scrollIntoView();renderSpeech()});stage.append(b)});area.append(stage);$('#chart-note').textContent='字體依真實出現次數縮放；點擊詞語可回到演說全文標示。零次詞不顯示。';
}
function renderCollocates(area){
  const rows=state.data.collocates[state.group],max=Math.max(...rows.map(r=>r.count)),box=document.createElement('div');box.className='collocate-list';box.innerHTML=rows.map(r=>`<div class="collocate-row"><div class="collocate-label">${esc(r.term)}</div><div class="bar-track"><div class="bar" style="width:${r.count/max*100}%"></div></div><strong>${r.count}</strong><div class="collocate-meta">查詢詞：${esc(r.query)}｜${esc(r.note)}</div></div>`).join('');area.append(box);$('#chart-note').textContent=state.group==='china'?'「兩岸」主要連到關係與和平；威脅判斷仍須回到 Context 原句。':'發展是長期底層語彙；供應鏈與安全詞次數不高，但集中在2020年後。';
}

function buildContextFilters(){const years=state.data.speeches.map(s=>s.year);$('#context-year').innerHTML='<option value="">全部年份</option>'+years.map(y=>`<option>${y}</option>`).join('');updateCategoryOptions()}
function updateCategoryOptions(){const cats=[...new Set(state.data.contexts.filter(r=>r.group===state.contextGroup).map(r=>r.category))].sort();$('#context-category').innerHTML='<option value="">全部編碼</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}
function contextMatches(r){const q=state.contextSearch.toLowerCase();return r.group===state.contextGroup&&(!state.contextYear||String(r.year)===state.contextYear)&&(!state.contextCategory||r.category===state.contextCategory)&&(!q||`${r.sentence} ${r.terms} ${r.category} ${r.secondary}`.toLowerCase().includes(q))}
function renderContexts(){
  const rows=state.data.contexts.filter(contextMatches),shown=rows.slice(0,state.contextLimit);$('#context-summary').innerHTML=`<span>目前顯示 <strong>${shown.length}</strong> 筆</span><span>符合條件共 <strong>${rows.length}</strong> 筆</span><span>欄位共 <strong>10</strong> 欄</span>`;
  $('#context-tbody').innerHTML=shown.length?shown.map(r=>`<tr><td class="id-cell">${esc(r.id)}</td><td>${r.year}</td><td>${esc(r.president)}</td><td><span class="term-chip">${esc(r.terms)}</span></td><td class="sentence-cell">${highlighted(r.sentence,state.contextSearch||r.terms.split('、')[0])}</td><td><span class="code-chip primary">${esc(r.category)}</span></td><td>${esc(r.secondary||'—')}</td><td>${esc(r.clues||'—')}</td><td><a class="source-cell" href="${esc(r.sourceUrl)}" target="_blank" rel="noopener" aria-label="開啟 ${esc(r.id)} 總統府官方原文">官方原文 ↗</a></td><td><a class="source-cell internal-source" href="#speeches" data-year="${r.year}" data-term="${esc(r.terms.split('、')[0])}">站內原文 ↓</a></td></tr>`).join(''):'<tr><td colspan="10" class="dataframe-empty">沒有符合條件的句子。</td></tr>';$('#load-more').hidden=shown.length>=rows.length;
}
function renderConclusions(){$('#period-grid').innerHTML=state.data.conclusions.map(c=>`<article class="period-card"><div class="period">${esc(c.period)}</div><h3>${esc(c.heading)}</h3><p>${esc(c.body)}</p></article>`).join('')}
function bindEvents(){
  $('#speech-years').addEventListener('click',e=>{const b=e.target.closest('button[data-index]');if(!b)return;state.speechIndex=Number(b.dataset.index);renderSpeech()});$('#speech-search').addEventListener('input',e=>{state.speechSearch=e.target.value.trim();renderSpeech()});$('#speech-highlight').addEventListener('change',e=>{state.highlight=e.target.value;state.speechSearch='';$('#speech-search').value='';renderSpeech()});
  $('#context-group').addEventListener('change',e=>{state.contextGroup=e.target.value;state.contextCategory='';state.contextLimit=20;updateCategoryOptions();renderContexts()});$('#context-year').addEventListener('change',e=>{state.contextYear=e.target.value;state.contextLimit=20;renderContexts()});$('#context-category').addEventListener('change',e=>{state.contextCategory=e.target.value;state.contextLimit=20;renderContexts()});$('#context-search').addEventListener('input',e=>{state.contextSearch=e.target.value.trim();state.contextLimit=20;renderContexts()});$('#load-more').addEventListener('click',()=>{state.contextLimit+=20;renderContexts()});$('#context-tbody').addEventListener('click',e=>{const a=e.target.closest('.internal-source');if(!a)return;const i=state.data.speeches.findIndex(s=>String(s.year)===a.dataset.year);if(i>=0)state.speechIndex=i;state.highlight=a.dataset.term;state.speechSearch='';$('#speech-search').value='';$('#speech-highlight').value=state.highlight;renderSpeech()});
}
init();
