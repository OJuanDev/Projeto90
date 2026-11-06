/* Projeto 90 | tema e navegação mobile — controlador independente */
(function(){
 'use strict';
 const themeKey='projeto90.theme';
 const root=document.documentElement;
 let stored;try{stored=localStorage.getItem(themeKey)}catch(_){stored=null}
 root.dataset.theme=stored==='light'||stored==='dark'?stored:'dark';
 const nav=document.getElementById('mobileNav');
 const meta=document.querySelector('meta[name="theme-color"]');
 function updateTheme(){
  const dark=root.dataset.theme==='dark';
  if(meta)meta.content=dark?'#111111':'#ffffff';
  const b=document.getElementById('themeToggle');if(b){b.textContent=dark?'☀':'☾';b.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro')}
 }
 window.toggleTheme=()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(themeKey,root.dataset.theme)}catch(_){}updateTheme()};
 updateTheme();
 let droplet,tracking=null,suppressClick=false;
 function ensure(){
  if(!droplet){droplet=document.createElement('div');droplet.className='liquid-droplet';droplet.setAttribute('aria-hidden','true');nav.prepend(droplet)}
  return droplet;
 }
 function buttons(){return Array.from(nav.querySelectorAll('button[data-page]:not([data-page="ajustes"])'))}
 function position(instant=false){
  if(!nav||!nav.offsetWidth)return;
  const dot=ensure();const selected=buttons().find(b=>b.classList.contains('active'))||buttons()[0];if(!selected)return;
  if(instant)dot.style.transition='none';
  dot.style.width=selected.offsetWidth+'px';dot.style.transform=`translate3d(${selected.offsetLeft-5}px,0,0)`;
  if(instant)requestAnimationFrame(()=>dot.style.removeProperty('transition'));
 }
 window.project90RefreshNav=()=>position(true);
 const observer=new MutationObserver(()=>requestAnimationFrame(()=>position(true)));
 observer.observe(nav,{childList:true});
 window.addEventListener('resize',()=>position(true));
 nav.addEventListener('pointerdown',e=>{
  const btn=e.target.closest('button[data-page]');if(!btn||e.button!==0)return;
  tracking={id:e.pointerId,x:e.clientX,y:e.clientY,active:false};
 });
 nav.addEventListener('pointermove',e=>{
  if(!tracking||e.pointerId!==tracking.id)return;
  const dx=e.clientX-tracking.x,dy=e.clientY-tracking.y;
  if(!tracking.active&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){tracking=null;return}
  if(!tracking.active&&Math.abs(dx)<11)return;
  tracking.active=true;nav.classList.add('dragging');
  const dot=ensure();const r=nav.getBoundingClientRect();const left=Math.max(0,Math.min(r.width-dot.offsetWidth-10,e.clientX-r.left-dot.offsetWidth/2));
  dot.style.transform=`translate3d(${left}px,0,0)`;
 });
 function finish(e){
  if(!tracking||tracking.id!==e.pointerId)return;
  const dragged=tracking.active;tracking=null;nav.classList.remove('dragging');
  if(dragged){
   suppressClick=true;setTimeout(()=>suppressClick=false,180);
   const candidates=buttons();const near=candidates.reduce((a,b)=>Math.abs(a.getBoundingClientRect().left+a.offsetWidth/2-e.clientX)<Math.abs(b.getBoundingClientRect().left+b.offsetWidth/2-e.clientX)?a:b,candidates[0]);
   if(near&&typeof window.showPage==='function')window.showPage(near.dataset.page);
  }
  position(false);
 }
 nav.addEventListener('pointerup',finish);
 nav.addEventListener('pointercancel',()=>{tracking=null;nav.classList.remove('dragging');position(true)});
 nav.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation()}},true);
 window.addEventListener('load',()=>position(true));
 requestAnimationFrame(()=>position(true));
})();
