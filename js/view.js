/* Shop-first view switch: glass wave toggle, page wave sweep and card flips. #portfolio deep-links the portfolio view. */
(function(){
'use strict';
const root=document.documentElement, $=s=>document.querySelector(s);
const toggle=$('#viewToggle'), fx=$('#waveFx'), svg=fx.querySelector('svg'), label=$('#wfLabel');
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
const PORT=/^(portfolio|about|work|skills|services)$/, SHOPH=/^(shop|shopCats|shopSearch)$/;
let busy=false;

/* shop hero numbers come from the listing data */
const S=window.SHOP||[];
if(S.length){
  const cnt=st=>S.filter(p=>p.listings.some(l=>l.store===st)).length;
  const free=S.filter(p=>p.listings.some(l=>l.price==='Free')).length;
  const cats=new Set(S.map(p=>p.cat)).size;
  $('#shopStats').innerHTML=[[S.length,'Models'],[cnt('Cults3D'),'On Cults3D'],[cnt('Thangs'),'On Thangs'],[free,'Free models']]
    .map(([n,l])=>`<div class="stat"><b data-count="${n}">0</b><span>${l}</span></div>`).join('');
  $('#shopEyebrow').textContent=`${S.length} models · ${cats} categories`;
}

function sync(){
  const v=root.dataset.view;
  toggle.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===v)));
}
sync();

function visibleCards(){
  const vh=innerHeight;
  return [...document.querySelectorAll('.scard,.pcard,.service,.about-grid>.card,.skills-grid>.card,.hero-card,.hero-stats,.toolbar')]
    .filter(el=>{ if(!el.offsetParent && getComputedStyle(el).position!=='fixed') return false; const r=el.getBoundingClientRect(); return r.bottom>0&&r.top<vh&&r.width>0; })
    .slice(0,16);
}
function flip(els,dir,out){
  els.forEach((el,i)=>{
    const k=out?[{transform:'perspective(1000px) rotateY(0deg)',opacity:1},{transform:`perspective(1000px) rotateY(${-dir*80}deg) rotateX(6deg) scale(.94)`,opacity:.15}]
               :[{transform:`perspective(1000px) rotateY(${dir*80}deg) rotateX(-6deg) scale(.94)`,opacity:0},{transform:'perspective(1000px) rotateY(0deg)',opacity:1}];
    el.animate(k,{duration:out?260:560,delay:Math.min(i,10)*(out?18:40),easing:out?'cubic-bezier(.5,0,.75,0)':'cubic-bezier(.2,1.25,.35,1)',fill:out?'forwards':'none'});
  });
}
function apply(v,target){
  const tc=document.querySelector('meta[name=theme-color]'); if(tc) tc.content=v==='shop'?'#f5f6fa':'#070814';
  root.dataset.view=v; sync();
  document.querySelectorAll(`.v-${v} .reveal,.reveal.v-${v}`).forEach(el=>el.classList.add('in'));
  const t=target&&document.getElementById(target);
  scrollTo({top:t?t.getBoundingClientRect().top+scrollY-80:0,behavior:'instant'});
}
function setView(v,{push=true,target=null}={}){
  if(v===root.dataset.view){ if(target){const t=document.getElementById(target); t&&t.scrollIntoView({behavior:'smooth'});} return; }
  if(busy) return; busy=true;
  if(push){ history.pushState({view:v},'',v==='portfolio'?'#portfolio':location.pathname+location.search.replace(/([?&])view=portfolio&?/,'$1').replace(/[?&]$/,'')); }
  toggle.classList.remove('slosh'); void toggle.offsetWidth; toggle.classList.add('slosh');
  if(reduce.matches){
    fx.dataset.to=v; fx.classList.add('fade'); fx.getAnimations().forEach(a=>a.cancel());
    fx.animate([{opacity:0},{opacity:1}],{duration:160,fill:'forwards'});
    setTimeout(()=>{
      apply(v,target);
      fx.animate([{opacity:1},{opacity:0}],{duration:220,fill:'forwards'});
      setTimeout(()=>{fx.getAnimations().forEach(a=>a.cancel());fx.classList.remove('fade');busy=false;},240);
    },170);
    return;
  }
  const dir=v==='portfolio'?1:-1, D=900;
  const old=visibleCards(); flip(old,dir,true);
  fx.dataset.to=v; fx.style.visibility='visible';
  label.textContent=v==='portfolio'?'Portfolio':'Shop';
  const from=dir>0?'100vw':'-180vw', to=dir>0?'-180vw':'100vw';
  svg.animate([{transform:`translate3d(${from},0,0)`},{transform:`translate3d(${to},0,0)`}],{duration:D,easing:'cubic-bezier(.45,.05,.55,.95)'});
  label.animate([{opacity:0,transform:'scale(.92)'},{opacity:0,offset:.38},{opacity:1,transform:'scale(1)',offset:.5},{opacity:0,offset:.62},{opacity:0}],{duration:D});
  setTimeout(()=>{
    old.forEach(el=>el.getAnimations().forEach(a=>a.cancel()));
    apply(v,target);
    requestAnimationFrame(()=>flip(visibleCards(),dir,false));
  },D/2);
  setTimeout(()=>{fx.style.visibility='hidden';busy=false;},D+20);
}

toggle.addEventListener('click',e=>{const b=e.target.closest('button[data-view]'); if(b) setView(b.dataset.view);});
toggle.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'||e.key==='ArrowRight'){ const v=e.key==='ArrowRight'?'portfolio':'shop'; setView(v); toggle.querySelector(`[data-view="${v}"]`).focus(); }});

/* nav helpers in shop view */
document.querySelectorAll('#navLinks a[data-act]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault(); $('#nav').classList.remove('open');
  const tb=$('.shop-toolbar'); scrollTo({top:tb.getBoundingClientRect().top+scrollY-90,behavior:reduce.matches?'auto':'smooth'});
  if(a.dataset.act==='search') setTimeout(()=>$('#shopSearch').focus({preventScroll:true}),450);
  else { const c=$('#shopCats .chip.active'); c&&c.focus({preventScroll:true}); }
}));

/* links/hash/back-forward: portfolio section links switch to the portfolio view, #shop to the shop */
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]'); if(!a||a.dataset.act) return;
  const h=a.getAttribute('href').slice(1);
  const need=PORT.test(h)?'portfolio':SHOPH.test(h)?'shop':null;
  if(need&&need!==root.dataset.view){ e.preventDefault(); $('#nav').classList.remove('open'); setView(need,{target:h==='portfolio'?null:h}); }
});
function fromURL(){
  const h=location.hash.slice(1), q=new URLSearchParams(location.search).get('view');
  return (q==='portfolio'||PORT.test(h))?'portfolio':'shop';
}
addEventListener('popstate',()=>setView(fromURL(),{push:false}));
addEventListener('hashchange',()=>{ const h=location.hash.slice(1); if(PORT.test(h)||SHOPH.test(h)||!h) setView(fromURL(),{push:false}); });
})();
