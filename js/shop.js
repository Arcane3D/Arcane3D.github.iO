/* Shop: 3D printable assets from Cults3D + Thangs (data in shop-data.js) */
(function(){
'use strict';
const S = window.SHOP; if(!S || !S.length) return;
const $ = s=>document.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CART='<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLACEHOLDER='<div class="shop-ph" aria-hidden="true"><svg viewBox="0 0 64 64" width="56" height="56"><path d="M32 6l22 12v28L32 58 10 46V18z M10 18l22 12 22-12 M32 30v28" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span>Preview on store</span></div>';

const now = Date.now();
const onSale = l => l.sale && l.until && now < Date.parse(l.until);
const priceHTML = l => {
  if(onSale(l)) return `<span class="p-now">${esc(l.sale)}</span><s class="p-was">${esc(l.price)}</s>`;
  return `<span class="p-now${l.price==='Free'?' p-free':''}">${esc(l.price)}</span>`;
};

const stores = ['All','Cults3D','Thangs'];
const storeCount = st => st==='All'?S.length:S.filter(p=>p.listings.some(l=>l.store===st)).length;
const catCounts = {}; S.forEach(p=>catCounts[p.cat]=(catCounts[p.cat]||0)+1);
const cats = ['All',...Object.keys(catCounts).sort((a,b)=>catCounts[b]-catCounts[a])];

let store='All', cat='All', q='', shown=0;
const PAGE = matchMedia('(max-width:760px)').matches ? 8 : 12;
const grid=$('#shopGrid'), more=$('#shopMore');
$('#shopCount').textContent = S.length;
$('#shopStores').innerHTML = stores.map(s=>`<button class="chip${s==='All'?' active':''}" data-s="${s}" role="tab">${s==='All'?'All stores':s}<small>${storeCount(s)}</small></button>`).join('');
$('#shopCats').innerHTML = cats.map(c=>`<button class="chip${c==='All'?' active':''}" data-c="${esc(c)}" role="tab">${c==='All'?'All categories':esc(c)}<small>${c==='All'?S.length:catCounts[c]}</small></button>`).join('');

function list(){
  const t=q.trim().toLowerCase();
  return S.filter(p=>(store==='All'||p.listings.some(l=>l.store===store)) && (cat==='All'||p.cat===cat) &&
    (!t || [p.title,p.cat,p.desc,...p.tags].join(' ').toLowerCase().includes(t)));
}
function card(p,i){
  const L = store==='All' ? p.listings : p.listings.filter(l=>l.store===store);
  const main = L[0];
  const badges = p.listings.map(l=>`<span class="store-badge sb-${l.store.toLowerCase()}">${l.store}</span>`).join('');
  const sale = L.some(onSale) ? '<span class="sale-flag">Sale</span>' : '';
  const offers = L.map(l=>`<div class="offer">${L.length>1?`<small>${l.store}</small>`:''}<div class="p-row">${priceHTML(l)}</div>
      <a class="btn btn-sm buy" href="${esc(l.url)}" target="_blank" rel="noopener" aria-label="Buy ${esc(p.title)} on ${l.store}">${CART}<span>Buy</span></a></div>`).join('');
  const img = p.img
    ? `<img src="${esc(p.img)}" alt="${esc(p.title)} — white 3D print render" loading="lazy" decoding="async" width="600" height="600" onload="this.classList.add('loaded')">`
    : PLACEHOLDER;
  return `<article class="scard glass" style="animation-delay:${(i%PAGE)*40}ms">
    <div class="stage">${img}<span class="floor"></span><div class="badges">${badges}</div>${sale}</div>
    <div class="body">
      <span class="s-cat">${esc(p.cat)}</span>
      <h4 title="${esc(p.title)}">${esc(p.title)}</h4>
      <div class="s-foot">${offers}</div>
    </div></article>`;
}
function render(reset){
  const items=list();
  if(reset){grid.innerHTML='';shown=0;}
  const next=items.slice(shown,shown+PAGE);
  grid.insertAdjacentHTML('beforeend',next.map((p,i)=>card(p,shown+i)).join(''));
  shown+=next.length;
  more.hidden = shown>=items.length;
  more.textContent = `Load more (${items.length-shown} left)`;
  $('#shopEmpty').hidden = items.length>0;
}
$('#shopStores').addEventListener('click',e=>{const b=e.target.closest('.chip'); if(!b) return;
  $('#shopStores').querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c===b)); store=b.dataset.s; render(true);});
$('#shopCats').addEventListener('click',e=>{const b=e.target.closest('.chip'); if(!b) return;
  $('#shopCats').querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c===b)); cat=b.dataset.c; render(true);});
let t; $('#shopSearch').addEventListener('input',e=>{clearTimeout(t);t=setTimeout(()=>{q=e.target.value;render(true)},160)});
more.addEventListener('click',()=>render(false));
render(true);
})();
