/* Quant Research — complete licensed textbook reader. No trading accounts or APIs. */
(() => {
"use strict";
const ROOT = new URL("./", location.href);
const $ = id => document.getElementById(id);
const params = {manifest:null, docs:[], current:null, search:null, resultPaths:[], selected:0, request:0, parser:null, mathReady:null, visited:new Set()};
const KINDS = {lesson:"正式课程",background:"背景知识",appendix:"附录",resource:"资源资料",overview:"导读",research:"研究校勘"};
const GROUPS = {"首页":"原书总目录","Part1-快速体验":"Part 1 · 快速体验","Part2-量化基础":"Part 2 · 量化基础","Part3-机器学习":"Part 3 · 机器学习","Part4-多智能体":"Part 4 · 多智能体","Part5-生产与实战":"Part 5 · 生产与实战","Resources & Links":"数据、工具与参考资源","研究者校勘":"研究增补 · 独立原创"};
const EXTRAS = [
  {path:"research/研究指南.md",title:"证据优先：量化研究的方法论",kind:"research",group:"研究者校勘"},
  {path:"research/回测与时间验证.md",title:"回测、标签与时间序列验证",kind:"research",group:"研究者校勘"},
  {path:"research/IC与信息比率.md",title:"IC、IR 与可实现收益",kind:"research",group:"研究者校勘"},
  {path:"research/风控与订单状态机.md",title:"风控熔断与订单一致性",kind:"research",group:"研究者校勘"},
  {path:"research/状态与拥挤.md",title:"市场状态、拥挤与压力",kind:"research",group:"研究者校勘"}
];
const NOTES = [
 {test:/第0?7课/,label:"标签与前瞻偏差",text:"未来收益可合法用作监督学习的训练标签；错误的是让标签在尚未实现时进入决策特征、训练信息集或模型选择。重叠标签需要与实际持有期一致的样本隔离。",link:"research/回测与时间验证.md"},
 {test:/第0?6课/,label:"数据可得时点",text:"回测必须使用决策时刻真实可见的数据版本。财报报告期、公告时刻和供应商入库时间不是同一个字段。",link:"research/回测与时间验证.md"},
 {test:/第12课|第13课/,label:"Regime 置信度校准",text:"固定波动率/ADX 阈值不能直接跨资产套用；示例中人工赋予的 0.8 并非经统计校准的 80% 正确率。",link:"research/状态与拥挤.md"},
 {test:/第15课|第21课/,label:"熔断不变量",text:"触发回撤熔断时，应拒绝风险增加动作，但不得无差别拒绝经过仓位验证的减仓和平仓。允许减仓也不等于已经完成强制减仓。",link:"research/风控与订单状态机.md"},
 {test:/第17课/,label:"IC 不是收益率",text:"IC×√252×波动率不能作为普遍的年化收益公式。可讨论 IR≈IC×√BR×TC 的适用假设，还需考虑组合约束、主动风险预算及成本。",link:"research/IC与信息比率.md"},
 {test:/第0?1课|第11课/,label:"模块化与多智能体",text:"数据、信号、风控、执行分模块是合理原则，但不必把每个模块都设计成自主 LLM Agent。高确定性风控与订单执行更适合可审计的状态机。",link:"research/风控与订单状态机.md"}
];
function pathFromHash(){let h=location.hash.replace(/^#\/?/,"");try{return decodeURIComponent(h)}catch{return ""}}
function route(path,replace=false){if(!params.docs.find(x=>x.path===path))return;const hash="#/"+encodeURI(path);if(replace)history.replaceState(null,"",hash);else history.pushState(null,"",hash);show(path)}
function safeText(s){return String(s??"").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function labelForDoc(d){return (d.title||"").replace(/^第\s*\d+\s*课[：:：]?\s*/,"").replace(/^AI量化交易从0到1$/,"总目录")}
function groupOf(d){return GROUPS[d.group]||d.group}
function docUrl(path){return new URL(encodeURI(path),ROOT)}
function isResearch(d){return d?.kind==="research"}
function docNotes(d){return isResearch(d)?[]:NOTES.filter(n=>n.test.test(d.path))}
function persist(){try{localStorage.setItem("quant-read-v2",JSON.stringify([...params.visited]))}catch{}}
function restore(){try{params.visited=new Set(JSON.parse(localStorage.getItem("quant-read-v2")||"[]"));if(localStorage.getItem("quant-night")==="1")document.body.classList.add("night")}catch{}}
function markRead(){if(!params.current||params.visited.has(params.current.path))return;params.visited.add(params.current.path);persist();document.querySelectorAll(".nav-doc.active").forEach(el=>el.classList.add("read"))}
function renderNav(){
 const nav=$("navigation");nav.replaceChildren();const groups=new Map();
 params.docs.forEach(d=>{if(!groups.has(d.group))groups.set(d.group,[]);groups.get(d.group).push(d)});
 for(const [name,docs] of groups){
  const box=document.createElement("details");box.className="nav-group";box.open=name==="Part1-快速体验"||name==="首页"||name==="研究者校勘";
  const sum=document.createElement("summary");sum.textContent=GROUPS[name]||name;box.append(sum);
  let prevKind="";
  for(const [i,d] of docs.entries()){
   if(d.kind!==prevKind){prevKind=d.kind;const label=document.createElement("div");label.className="nav-kind";label.textContent=KINDS[d.kind]||"其他";box.append(label)}
   const link=document.createElement("a");link.className="nav-doc";link.href="#/"+encodeURI(d.path);link.dataset.path=d.path;link.title=d.title;
   const num=document.createElement("span");num.className="num";num.textContent=d.kind==="lesson"?(d.title.match(/\d+/)?.[0]||String(i+1)).padStart(2,"0"):d.kind==="research"?"◆":"·";
   const title=document.createElement("span");title.textContent=labelForDoc(d);
   link.append(num,title);link.addEventListener("click",e=>{e.preventDefault();route(d.path);toggleNav(false)});
   box.append(link);
  }
  nav.append(box);
 }
}
function activateNav(path){
 document.querySelectorAll(".nav-doc").forEach(node=>{const on=node.dataset.path===path;node.classList.toggle("active",on);node.setAttribute("aria-current",on?"page":"false")});
 const link=[...document.querySelectorAll(".nav-doc")].find(n=>n.dataset.path===path);
 if(link){const section=link.closest(".nav-group");if(section)section.open=true;link.scrollIntoView({block:"nearest"})}
}
function toggleNav(force){const next=typeof force==="boolean"?force:!document.body.classList.contains("nav-open");document.body.classList.toggle("nav-open",next);$("menu-btn").setAttribute("aria-expanded",String(next));$("menu-btn").setAttribute("aria-label",next?"关闭课程目录":"展开课程目录")}
function updatePager(d){
 const pager=$("chapter-pager");pager.replaceChildren();const i=params.docs.findIndex(x=>x.path===d.path);
 for(const [candidate,direction] of [[params.docs[i-1],"previous"],[params.docs[i+1],"next"]]){
  const btn=document.createElement("button");btn.type="button";btn.className="pager"+(direction==="next"?" right":"");
  if(!candidate)btn.disabled=true;
  const title=document.createElement("b");title.textContent=candidate?labelForDoc(candidate):"—";
  const lbl=document.createElement("span");lbl.textContent=direction==="next"?"下一篇 →":"← 上一篇";
  btn.append(lbl,title);if(candidate)btn.onclick=()=>route(candidate.path);
  pager.append(btn);
 }
}
function showError(message,path){$("article").replaceChildren();const box=document.createElement("div");box.className="fail";const title=document.createElement("strong");title.textContent="章节载入失败";const desc=document.createElement("p");desc.textContent=message;const btn=document.createElement("button");btn.textContent="重试载入";btn.onclick=()=>show(path);box.append(title,desc,btn);$("article").append(box)}
async function fetchText(path){const resp=await fetch(docUrl(path),{cache:"default"});if(!resp.ok)throw Error("HTTP "+resp.status+" · "+path);return resp.text()}
function remoteScript(src,timeout=9000){return new Promise((resolve,reject)=>{const el=document.createElement("script");el.src=src;el.async=true;const wait=setTimeout(()=>{el.remove();reject(Error("加载超时"))},timeout);el.onload=()=>{clearTimeout(wait);resolve()};el.onerror=()=>{clearTimeout(wait);el.remove();reject(Error("第三方脚本暂不可用"))};document.head.append(el)})}
async function getRenderer(){
 if(params.parser)return params.parser;
 for(const src of ["https://cdn.jsdelivr.net/npm/markdown-it@14.2.0/dist/markdown-it.min.js","https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.2/markdown-it.min.js"]){
  try{await remoteScript(src);if(typeof window.markdownit==="function"){params.parser=window.markdownit({html:true,linkify:true,typographer:true,breaks:false});return params.parser}}catch{}
 }
 return null;
}
function initializeMath(){
 if(params.mathReady)return params.mathReady;
 window.MathJax={tex:{inlineMath:[["\\(","\\)"]],displayMath:[["$$","$$"],["\\[","\\]"]]},options:{skipHtmlTags:["script","noscript","style","textarea","pre","code"]}};
 params.mathReady=remoteScript("https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js",16000).then(async()=>{if(window.MathJax?.startup?.promise)await window.MathJax.startup.promise;return true}).catch(()=>false);
 return params.mathReady;
}
async function typeset(){const ready=await initializeMath();if(!ready||!window.MathJax?.typesetPromise)return;try{await window.MathJax.typesetPromise([$("article")])}catch{}}
function sanitizeHtml(input){
 const template=document.createElement("template");template.innerHTML=input;
 template.content.querySelectorAll("script,iframe,object,embed,base,form,meta,link,style").forEach(el=>el.remove());
 template.content.querySelectorAll("*").forEach(el=>{
  [...el.attributes].forEach(at=>{
   const n=at.name.toLowerCase(),v=at.value.trim();
   if(n.startsWith("on")||((n==="href"||n==="src")&&/^(?:javascript|data:text\/html|vbscript):/i.test(v)))el.removeAttribute(at.name);
  });
 });
 return template.content;
}
function rewriteLinks(doc){
 const base=docUrl(doc.path),rootPath=ROOT.pathname;
 $("article").querySelectorAll("img").forEach(img=>{
  try{const src=img.getAttribute("src");if(src&&!/^(?:data:|blob:)/.test(src))img.src=new URL(src,base).href;img.loading="lazy";img.decoding="async"}catch{}
 });
 $("article").querySelectorAll("a[href]").forEach(a=>{
  const href=a.getAttribute("href");if(!href)return;
  try{
   const url=new URL(href,base);
   if(url.origin===location.origin && url.pathname.startsWith(rootPath)){
    const target=decodeURIComponent(url.pathname.slice(rootPath.length));
    if(target===doc.path&&url.hash){a.href="#"+encodeURI(doc.path)+"~"+encodeURIComponent(url.hash.slice(1));a.addEventListener("click",e=>{e.preventDefault();const heading=document.getElementById(decodeURIComponent(url.hash.slice(1)));heading?.scrollIntoView({behavior:"smooth"})});return}
    if(target.endsWith(".md")&&params.docs.some(d=>d.path===target)){
     a.href="#/"+encodeURI(target);a.addEventListener("click",e=>{e.preventDefault();route(target)});return;
    }
   }
   if(/^https?:/.test(url.protocol)&&url.origin!==location.origin){a.target="_blank";a.rel="noopener noreferrer"}
  }catch{}
 });
 $("article").querySelectorAll("pre").forEach(pre=>{
   const c=pre.querySelector("code");if(!c)return;
   const btn=document.createElement("button");btn.className="copy-code";btn.textContent="复制代码";btn.setAttribute("aria-label","复制此代码块");
   btn.onclick=async()=>{try{await navigator.clipboard.writeText(c.textContent);btn.textContent="已复制";setTimeout(()=>btn.textContent="复制代码",1300)}catch{btn.textContent="复制失败"}};
   pre.append(btn);
 });
}
function slug(s){return s.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu,"").replace(/\s+/g,"-")}
function renderOutline(){
 const toc=$("page-toc");toc.replaceChildren();const hs=[...$("article").querySelectorAll("h2,h3")].slice(0,150);
 if(!hs.length){toc.textContent="本篇无二级标题。";toc.className="toc-empty";return}toc.className="";
 const used=new Map();
 hs.forEach(h=>{
  const raw=slug(h.textContent)||"section";const count=used.get(raw)||0;used.set(raw,count+1);h.id=count?raw+"-"+count:raw;
  const a=document.createElement("a");a.className="toc-link"+(h.tagName==="H3"?" sub":"");a.href="#"+h.id;a.textContent=h.textContent;
  a.onclick=e=>{e.preventDefault();h.scrollIntoView({behavior:"smooth",block:"start"})};
  toc.append(a);
 });
}
function notesFor(doc){
 const notes=docNotes(doc),wrap=$("chapter-notes");wrap.replaceChildren();
 if(!notes.length){wrap.textContent=isResearch(doc)?"本文为独立撰写的研究补充，可与原书章节对照阅读。":"本章暂无单独校勘提示。原文保留，研究结论仍需独立验证。";wrap.className="note-hint";return}
 wrap.className="";
 notes.forEach(note=>{
  const item=document.createElement("div");item.className="note-entry";
  const label=document.createElement("b");label.textContent=note.label;const p=document.createElement("p");p.textContent=note.text;
  const a=document.createElement("a");a.textContent="阅读完整解释 →";a.href="#/"+encodeURI(note.link);a.onclick=e=>{e.preventDefault();route(note.link)};
  item.append(label,p,a);wrap.append(item);
 });
}
function notesInline(doc){
 const existing=$("inline-notes");if(existing)existing.remove();const notes=docNotes(doc);if(!notes.length)return;
 const banner=document.createElement("details");banner.id="inline-notes";banner.className="inline-notes";
 const summary=document.createElement("summary");summary.textContent="研究者校勘 · 本章有 "+notes.length+" 项独立批注（原文未改）";banner.append(summary);
 for(const n of notes){const div=document.createElement("p");div.textContent=n.label+"｜"+n.text;banner.append(div);
 const a=document.createElement("a");a.textContent="完整说明 → ";a.href="#/"+encodeURI(n.link);a.onclick=e=>{e.preventDefault();route(n.link)};banner.append(a)}
 $("article").before(banner);
}
function getSourceStrip(doc){
 if(isResearch(doc))return '独立研究补充 · Quant Research · 持续校勘；原书内容归其原作者。<br>如需引用原书，请回到原作者的 <a href="https://waylandz.com/quant-book/" target="_blank" rel="noopener noreferrer">公开教材</a>。';
 return '原作者：<a href="https://waylandz.com/" target="_blank" rel="noopener noreferrer">Wayland Zhang</a> · 原著：<a href="https://waylandz.com/quant-book/" target="_blank" rel="noopener noreferrer">AI量化交易从0到1</a> · 原文授权：<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>。当前页面保留原文，校勘为独立观点。';
}
async function show(path){
 const doc=params.docs.find(d=>d.path===path);if(!doc)return;params.current=doc;const ticket=++params.request;
 $("article").textContent="正在加载完整章节…";$("article").className="markdown-body loading";$("page-toc").textContent="正在生成章节目录…";
 const former=$("inline-notes");if(former)former.remove();
 document.title=labelForDoc(doc)+" · Quant Research 量化研究";
 $("breadcrumb").textContent="完整教材 / "+groupOf(doc)+" / "+labelForDoc(doc);
 $("doc-meta").replaceChildren();
 const pill=document.createElement("span");pill.className="doc-pill";pill.textContent=isResearch(doc)?"独立研究补充":"原书完整内容";
 const cat=document.createElement("span");cat.textContent=KINDS[doc.kind]||"课程";
 const count=document.createElement("span");count.className="doc-author";count.textContent=isResearch(doc)?"Quant Research":"原作者 Wayland Zhang";
 $("doc-meta").append(pill,cat,count);
 $("source-strip").innerHTML=getSourceStrip(doc);
 notesFor(doc);activateNav(path);updatePager(doc);updateProgress();
 window.scrollTo({top:0,behavior:"instant"});
 try{
  const markdown=await fetchText(path);if(ticket!==params.request)return;
  const renderer=await getRenderer();if(ticket!==params.request)return;
  $("article").className="markdown-body";
  if(!renderer){
   const msg=document.createElement("p");msg.className="doc-intro";msg.textContent="排版组件加载失败，下面展示完整 Markdown 原稿（内容未丢失）。";
   const pre=document.createElement("pre");pre.textContent=markdown;$("article").replaceChildren(msg,pre);
  }else{
   const raw=renderer.render(markdown);
   $("article").replaceChildren(sanitizeHtml(raw));
   rewriteLinks(doc);renderOutline();
  }
  notesInline(doc);updateProgress();typeset();
 }catch(err){if(ticket===params.request)showError("未能获取 "+doc.path+"："+String(err.message||err)+"。请确认 GitHub Pages 部署完成。",path)}
}
function updateProgress(){
 const y=window.scrollY,range=document.documentElement.scrollHeight-window.innerHeight;
 const value=range>0?Math.max(0,Math.min(100,Math.round(y/range*100))):0;
 $("read-progress").style.width=value+"%";$("side-progress").style.width=value+"%";$("progress-label").textContent="本页阅读位置 "+value+"%";
 if(value>=86)markRead();
 const heading=[...$("article").querySelectorAll("h2,h3")].filter(h=>h.getBoundingClientRect().top<145).at(-1);
 if(heading){document.querySelectorAll(".toc-link").forEach(a=>a.classList.toggle("current",decodeURIComponent(a.getAttribute("href").slice(1))===heading.id))}
}
let scrollScheduled=false;window.addEventListener("scroll",()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(()=>{updateProgress();scrollScheduled=false})}},{passive:true});
function openSearch(){const dialog=$("search-dialog");if(!dialog.open)dialog.showModal();$("search-input").focus();runSearch()}
function closeSearch(){$("search-dialog").close()}
function resultList(items,q){
 params.resultPaths=items.map(x=>x.doc.path);params.selected=0;
 const div=$("search-results");div.replaceChildren();if(!items.length){const n=document.createElement("div");n.className="search-empty";n.textContent=q?"没有匹配的章节；可尝试更短的关键词。":"输入关键词，全文搜索 71 篇原文与研究批注。";div.append(n);return}
 items.slice(0,80).forEach((item,i)=>{
  const b=document.createElement("button");b.className="search-hit"+(i===0?" selected":"");b.type="button";b.setAttribute("role","option");b.dataset.i=i;
  const title=document.createElement("div");title.className="search-title";title.textContent=labelForDoc(item.doc);
  const cat=document.createElement("span");cat.className="search-category";cat.textContent=groupOf(item.doc);title.append(cat);
  const preview=document.createElement("div");preview.className="search-preview";preview.textContent=item.snippet||KINDS[item.doc.kind]||"原文";
  b.append(title,preview);b.onclick=()=>{route(item.doc.path);closeSearch()};
  div.append(b);
 });
}
async function getIndex(){if(params.search)return params.search;const resp=await fetch(docUrl("book/search-index.json"));if(!resp.ok)throw Error("尚未生成全文索引");params.search=await resp.json();return params.search}
let searchSeq=0;
async function runSearch(){
 const q=$("search-input").value.trim();const seq=++searchSeq;
 if(!q){resultList([],q);return}
 const terms=q.toLowerCase().split(/\s+/).filter(Boolean);
 const direct=params.docs.filter(d=>terms.every(w=>(d.title+" "+d.group).toLowerCase().includes(w))).map(doc=>({doc,score:100,snippet:"标题匹配"}));
 resultList(direct,q);
 try{
  const idx=await getIndex();if(seq!==searchSeq)return;
  const matches=idx.map(o=>{const doc=params.docs.find(d=>d.path===o.path);if(!doc)return null;const title=(doc.title||"").toLowerCase(),text=(o.text||"").toLowerCase();if(!terms.every(t=>title.includes(t)||text.includes(t)))return null;
   const pos=text.indexOf(terms[0]);const from=Math.max(0,pos-70);const snippet=pos<0?doc.title:o.text.slice(from,from+180).replace(/\s+/g," ");
   return {doc,score:terms.reduce((n,t)=>n+(title.includes(t)?25:1),0),snippet};}).filter(Boolean);
  for(const doc of EXTRAS)if(!matches.some(x=>x.doc.path===doc.path)&&terms.every(t=>doc.title.toLowerCase().includes(t)))matches.push({doc,score:80,snippet:"研究者独立增补"});
  matches.sort((a,b)=>b.score-a.score);resultList(matches,q);
 }catch{if(seq===searchSeq&&direct.length===0)resultList([],q)}
}
function setupEvents(){
 $("menu-btn").onclick=()=>toggleNav();$("nav-curtain").onclick=()=>toggleNav(false);
 $("theme-toggle").onclick=()=>{const night=document.body.classList.toggle("night");try{localStorage.setItem("quant-night",night?"1":"0")}catch{}};
 $("search-launch").onclick=openSearch;$("search-close").onclick=closeSearch;
 $("search-input").addEventListener("input",()=>{clearTimeout(window.__qTimer);window.__qTimer=setTimeout(runSearch,130)});
 $("search-input").addEventListener("keydown",e=>{
  const hits=[...$("search-results").querySelectorAll(".search-hit")];
  if(["ArrowDown","ArrowUp"].includes(e.key)){e.preventDefault();if(!hits.length)return;params.selected=(params.selected+(e.key==="ArrowDown"?1:-1)+hits.length)%hits.length;hits.forEach((h,i)=>h.classList.toggle("selected",i===params.selected));hits[params.selected].scrollIntoView({block:"nearest"})}
  if(e.key==="Enter"&&hits.length){e.preventDefault();hits[params.selected]?.click()}
 });
 document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch()}
  if(e.key==="/"&&!e.metaKey&&!e.ctrlKey&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)&&!$("search-dialog").open){e.preventDefault();openSearch()}
 });
 $("jump-notes").onclick=()=>{const current=$("inline-notes");if(current){current.open=true;current.scrollIntoView({behavior:"smooth",block:"start"})}else document.getElementById("inspector")?.scrollIntoView({behavior:"smooth"})};
 $("copy-link").onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$("copy-link").textContent="已复制";setTimeout(()=>$("copy-link").textContent="复制链接",1500)}catch{$("copy-link").textContent="复制失败"}};
 window.addEventListener("popstate",()=>{const path=pathFromHash();if(path&&params.current?.path!==path)show(path)});
 window.addEventListener("hashchange",()=>{const path=pathFromHash();if(path&&params.current?.path!==path)show(path)});
}
async function init(){
 restore();setupEvents();
 try{
  const resp=await fetch(docUrl("book/manifest.json"));if(!resp.ok)throw Error("书籍目录尚未生成");
  params.manifest=await resp.json();if(params.manifest.count!==71)throw Error("书籍章节数量不完整");
  params.docs=[...params.manifest.pages,...EXTRAS];
  $("nav-stats").innerHTML="<span><b>22</b>课程</span><span><b>30</b>专题</span><span><b>69</b>图示</span>";
  renderNav();
  const wanted=pathFromHash();const exists=params.docs.some(x=>x.path===wanted);
  route(exists?wanted:"book/cn/README.md",true);
 }catch(err){
  $("article").replaceChildren();const block=document.createElement("div");block.className="fail";
  const head=document.createElement("h1");head.textContent="完整教材暂未载入";
  const p=document.createElement("p");p.textContent="书籍文件或目录暂时不可用："+String(err.message||err)+"。可直接在 GitHub 查阅完整原稿。";
  const link=document.createElement("a");link.href="https://github.com/GodBlessRen/Quant-Research/tree/main/book/cn";link.textContent="查看 GitHub 完整教材 →";
  block.append(head,p,link);$("article").append(block);$("navigation").textContent="导航暂不可用，可在 GitHub 查看完整内容。";
 }
}
init();
})();