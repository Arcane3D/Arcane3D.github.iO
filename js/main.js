(function(){
'use strict';
const D = window.PORTFOLIO; if(!D) return;
const P = D.profile, $ = s=>document.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => n>=1000 ? (n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,'')+'k' : String(n);
const titleCase = s => s.replace(/\s+/g,' ').trim();
const ARROW='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- top fields (used for subtitle and filters) ---------- */
const topFields = D.fields.slice(0,5).map(f=>f[0]);

/* ---------- hero ---------- */
$('#heroName').textContent = P.name;
$('#heroRole').textContent = P.occupation;
$('#heroSub').textContent = `Based in ${P.location}. ${P.projectCount} published projects across ${topFields.slice(0,4).join(', ')} and more.`;
const av=P.availability, availBits=[av.freelance&&'freelance',av.fullTime&&'full-time'].filter(Boolean);
$('#availability').textContent = availBits.length ? `Available for ${availBits.join(' & ')}` : 'Open to opportunities';
const stats=[[P.projectCount,'Projects'],[P.stats.views,'Project views'],[P.stats.appreciations,'Appreciations'],[P.stats.followers,'Followers']];
$('#heroStats').innerHTML = stats.map(([n,l])=>`<div class="stat"><b data-count="${n}">0</b><span>${l}</span></div>`).join('');

/* ---------- about ---------- */
const since = new Date(P.memberSince*1000).getFullYear();
const current = P.work[0];
$('#aboutMain').innerHTML = `
  <div class="about-banner"><img src="${P.banner}" alt="Profile banner from Behance" loading="lazy"></div>
  <div class="about-id"><img src="${P.avatar}" alt="${esc(P.name)}"><div><h3>${esc(P.name)}</h3><p>@${esc(P.username)} · ${esc(P.location)}</p></div></div>
  <p class="bio">${esc(P.occupation.charAt(0).toUpperCase()+P.occupation.slice(1))}${current?` — currently ${esc(current.position)} at ${esc(current.organization)}`:''}. My Behance portfolio spans ${esc(topFields.join(', '))}, built with tools like ${esc(D.tools.slice(0,5).map(t=>t[0]).join(', '))}.</p>
  <div class="facts">
    <div class="fact"><b>${P.projectCount}</b><span>Projects</span></div>
    <div class="fact"><b>${D.tools.length}</b><span>Tools used</span></div>
    <div class="fact"><b>${P.freelance.completedProjectCount}</b><span>Behance jobs done</span></div>
    <div class="fact"><b>${since}</b><span>On Behance since</span></div>
  </div>`;
$('#expList').innerHTML = P.work.map(w=>`<li><b>${esc(w.position)}</b><span>${esc(w.organization)} · ${esc(w.location)}</span></li>`).join('');
$('#availList').innerHTML = [av.freelance&&'Freelance projects',av.fullTime&&'Full-time roles',av.remote&&'Remote work',av.relocation&&'Open to relocation'].filter(Boolean).map(x=>`<li>${x}</li>`).join('');

/* ---------- work grid ---------- */
const FILTERS = ['All', ...D.fields.slice(0,9).map(f=>f[0])];
const fieldCount = Object.fromEntries(D.fields);
let filter='All', query='', shown=0;
const PAGE = matchMedia('(max-width:760px)').matches ? 10 : 15;
const grid=$('#grid'), more=$('#loadMore');
$('#projCount').textContent = D.projects.length;
$('#filters').innerHTML = FILTERS.map(f=>`<button class="chip${f==='All'?' active':''}" data-f="${esc(f)}" role="tab">${esc(f)}<small>${f==='All'?D.projects.length:fieldCount[f]}</small></button>`).join('');

const fine = matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches;
function list(){
  const q=query.trim().toLowerCase();
  return D.projects.filter(p=>(filter==='All'||p.fields.includes(filter)) &&
    (!q || [p.title,p.desc,...p.fields,...p.tools,...p.tags].join(' ').toLowerCase().includes(q)));
}
function card(p,i){
  const tools=p.tools.slice(0,3).map(t=>`<span class="tag">${esc(t)}</span>`).join('') + (p.tools.length>3?`<span class="tag">+${p.tools.length-3}</span>`:'');
  return `<a class="pcard glass" href="${esc(p.url)}" target="_blank" rel="noopener" style="animation-delay:${(i%PAGE)*45}ms">
    <div class="thumb"><img src="${esc(p.cover)}" alt="${esc(p.title)} — cover" loading="lazy" decoding="async" width="720" height="563" onload="this.classList.add('loaded')" onerror="this.onerror=null;this.src='${esc(p.coverRemote)}'"><span class="shine"></span>
      <div class="badge"><span>👁 ${fmt(p.views)}</span>${p.likes?`<span>♥ ${p.likes}</span>`:''}</div></div>
    <div class="body">
      ${p.fields.length?`<div class="fields">${esc(p.fields.slice(0,2).join(' · '))}</div>`:''}
      <h4>${esc(titleCase(p.title))}</h4>
      ${p.desc?`<p class="desc">${esc(p.desc)}</p>`:''}
      ${tools?`<div class="tools">${tools}</div>`:''}
      <div class="open"><span>View on Behance</span>${ARROW}</div>
    </div></a>`;
}
function render(reset){
  const items=list();
  if(reset){grid.innerHTML='';shown=0;}
  const next=items.slice(shown,shown+PAGE);
  grid.insertAdjacentHTML('beforeend',next.map((p,i)=>card(p,shown+i)).join(''));
  shown+=next.length;
  more.hidden = shown>=items.length;
  more.textContent = `Load more (${items.length-shown} left)`;
  $('#empty').hidden = items.length>0;
  bindTilt();
}
$('#filters').addEventListener('click',e=>{
  const b=e.target.closest('.chip'); if(!b) return;
  document.querySelectorAll('#filters .chip').forEach(c=>c.classList.toggle('active',c===b));
  filter=b.dataset.f; render(true);
});
let t; $('#search').addEventListener('input',e=>{clearTimeout(t);t=setTimeout(()=>{query=e.target.value;render(true)},160)});
more.addEventListener('click',()=>render(false));
render(true);

/* 3D tilt + glare on cards (pointer devices only) */
function bindTilt(){
  if(!fine) return;
  grid.querySelectorAll('.pcard:not([data-t])').forEach(el=>{
    el.dataset.t=1;
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      el.style.transform=`perspective(900px) rotateX(${(.5-y)*8}deg) rotateY(${(x-.5)*10}deg) translateY(-4px)`;
      el.style.setProperty('--mx',x*100+'%'); el.style.setProperty('--my',y*100+'%');
    });
    el.addEventListener('pointerleave',()=>{el.style.transform='';});
  });
}

/* ---------- skills ---------- */
$('#fieldChips').innerHTML = D.fields.map(([f,n])=>`<button class="tag" data-f="${esc(f)}">${esc(f)}<b>${n}</b></button>`).join('');
$('#fieldChips').addEventListener('click',e=>{
  const b=e.target.closest('[data-f]'); if(!b) return;
  const f=b.dataset.f; let chip=[...document.querySelectorAll('#filters .chip')].find(c=>c.dataset.f===f);
  if(!chip){ $('#filters').insertAdjacentHTML('beforeend',`<button class="chip" data-f="${esc(f)}">${esc(f)}<small>${fieldCount[f]}</small></button>`); chip=$('#filters').lastElementChild; }
  chip.click(); chip.scrollIntoView({block:'nearest',inline:'center'}); $('#work').scrollIntoView();
});
const maxT=D.tools[0][1];
$('#toolList').innerHTML = D.tools.map(([t,n])=>`<div class="tool"><span>${esc(t)}</span><small>${n} project${n>1?'s':''}</small><div class="bar"><i style="--w:${Math.max(6,n/maxT*100)}%"></i></div></div>`).join('');

/* ---------- services ---------- */
$('#serviceList').innerHTML = D.services.map((s,i)=>`<article class="glass card service reveal">
  <div class="ico">${String(i+1).padStart(2,'0')}</div><h4>${esc(s.title)}</h4>
  ${s.desc && s.desc.trim().toLowerCase()!==s.title.trim().toLowerCase()?`<p>${esc(s.desc.trim())}</p>`:''}
  <a href="${esc(s.url)}" target="_blank" rel="noopener">View service on Behance →</a></article>`).join('');

/* ---------- contact ---------- */
$('#contactBlurb').textContent = `I'm ${P.name}, a ${P.occupation} in ${P.location}. ${availBits.length?`Available for ${availBits.join(' and ')} work${av.remote?', remote-friendly':''}.`:''} Reach out on any of these channels.`;
const LI={Behance:['Bē','#1769ff'],LinkedIn:['in','#0a66c2'],Instagram:['IG','linear-gradient(135deg,#f58529,#dd2a7b,#8134af)'],Fiverr:['fi','#1dbf73']};
$('#contactLinks').innerHTML = P.links.map(l=>{const [ab,bg]=LI[l.label]||[l.label[0],'#555'];
  return `<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="li" style="background:${bg}">${ab}</span><div><b>${esc(l.label)}</b><span>${esc(l.url.replace(/^https?:\/\/(www\.)?/,''))}</span></div></a>`}).join('');
$('#year').textContent = new Date().getFullYear();

/* ---------- reveal + counters ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
  e.target.querySelectorAll('[data-count]').forEach(countUp); }),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
function countUp(el){
  const to=+el.dataset.count, t0=performance.now(), d=1400;
  const step=now=>{const k=Math.min(1,(now-t0)/d), v=Math.round(to*(1-Math.pow(1-k,3))); el.textContent=v.toLocaleString(); if(k<1) requestAnimationFrame(step)};
  requestAnimationFrame(step);
}

/* ---------- nav ---------- */
const nav=$('#nav');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>30),{passive:true});
$('#burger').addEventListener('click',()=>{const o=nav.classList.toggle('open');$('#burger').setAttribute('aria-expanded',o)});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const links=[...document.querySelectorAll('.nav-links a')];
const so=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)); }),{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('main section[id]').forEach(s=>so.observe(s));
})();
