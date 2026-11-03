/* Original Codrops animation choreography adapted to Elegant Massage's existing
 * sections. Theo Plawinski: Sticky Grid Scroll (MIT) + Hiroki: SVG Mask
 * Transitions (MIT). GSAP and ScrollTrigger follow their bundled licenses.
 * Source methods, stagger, easing, lengths and SVG rect geometry retained.
 * No demo CSS reset or third-party demo photographs imported.
 */
(() => {
 'use strict';
 const qs=(s,r=document)=>r.querySelector(s);
 const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const root=document.documentElement;
 const nav=qs('#main-nav'),toggle=qs('#menu-toggle'),header=qs('#site-header');
 const intro=qs('#introduction'),introFilm=qs('#intro-film');
 const jump=qs('#chapter-selector');
 const grid=qs('.at-grid'),track=qs('#cinema-track');
 const gridMedia=matchMedia('(min-height:540px) and (prefers-reduced-motion:no-preference)');
 const maskMedia=matchMedia('(min-width:1024px) and (min-height:650px) and (prefers-reduced-motion:no-preference)');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const gridActive=()=>gridMedia.matches && !!window.gsap && !!window.ScrollTrigger;
 const maskActive=()=>gridActive() && maskMedia.matches;
 let gridTL=[],maskMaster=null,progressST=null,resizeTimer=null;
 const scenes=qsa('.chapter',track);
 const ensureVideo=()=>{
   if(!introFilm)return;
   const off=reduced.matches || (navigator.connection&&navigator.connection.saveData);
   if(off){introFilm.pause();introFilm.hidden=true;return;}
   introFilm.hidden=false;let p=introFilm.play();p?.catch?.(()=>{introFilm.hidden=true});
 };
 function closeMenu(){nav?.removeAttribute('data-open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open navigation');}
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';if(open)nav?.setAttribute('data-open','true');else nav?.removeAttribute('data-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();if(nav?.contains(document.activeElement))toggle?.focus();}});
 document.addEventListener('click',e=>{if(header&&!header.contains(e.target))closeMenu();});
 const desktopMenu=matchMedia('(min-width:861px)');desktopMenu.addEventListener?.('change',e=>{if(e.matches)closeMenu();});
 const updateHeader=()=>header?.classList.toggle('is-scrolled',window.scrollY>60);
 window.addEventListener('scroll',updateHeader,{passive:true});updateHeader();
 reduced.addEventListener?.('change',ensureVideo);document.addEventListener('visibilitychange',()=>{if(document.hidden)introFilm?.pause();else ensureVideo();});ensureVideo();
 const ns='http://www.w3.org/2000/svg';
 // From original StickyGridScroll (full sequence preserved):
 class StickyGridScroll {
   constructor(){this.contentVisible=false;this.getElements();this.initContent();this.groupItemsByColumn();this.addParallaxOnScroll();this.animateTitleOnScroll();this.animateGridOnScroll();}
   getElements(){
     this.block=grid;
     this.wrapper=qs('.at-grid__wrapper',grid);
     this.content=qs('.at-grid__content',grid);
     this.title=qs('.at-grid__title',grid);
     this.description=qs('.at-grid__description',grid);
     this.button=qs('.content__button',grid);
     this.grid=qs('.at-grid__images',grid);
     this.items=qsa('.at-grid__item',grid);
   }
   initContent(){
     if(this.description&&this.button)gsap.set([this.description,this.button],{opacity:0,pointerEvents:'none'});
     if(this.content&&this.title){
       const dy=(this.content.offsetHeight-this.title.offsetHeight)/2;
       this.titleOffsetY=dy/this.content.offsetHeight*100;
       gsap.set(this.title,{yPercent:this.titleOffsetY});
     }
   }
   groupItemsByColumn(){
     this.numColumns=3;
     this.columns=Array.from({length:this.numColumns},()=>[]);
     this.items.forEach((item,index)=>this.columns[index%this.numColumns].push(item));
   }
   addParallaxOnScroll(){
     if(!this.block||!this.wrapper)return;
     gridTL.push(gsap.from(this.wrapper,{yPercent:-100,ease:'none',scrollTrigger:{
       trigger:this.block,start:'top bottom',end:'top top',scrub:true
     }}));
   }
   animateTitleOnScroll(){
     if(!this.block||!this.title)return;
     gridTL.push(gsap.from(this.title,{opacity:0,duration:.7,ease:'power1.out',scrollTrigger:{
       trigger:this.block,start:'top 57%',toggleActions:'play none none reset'
     }}));
   }
   gridRevealTimeline(columns=this.columns){
     const timeline=gsap.timeline();
     const wh=innerHeight;
     const dy=wh-(wh-this.grid.offsetHeight)/2;
     columns.forEach((column,colIndex)=>{
       const fromTop=colIndex%2===0;
       timeline.from(column,{y:dy*(fromTop?-1:1),stagger:{each:.06,from:fromTop?'end':'start'},ease:'power1.inOut'},'grid-reveal');
     });
     return timeline;
   }
   gridZoomTimeline(columns=this.columns){
     const timeline=gsap.timeline({defaults:{duration:1,ease:'power3.inOut'}});
     timeline.to(this.grid,{scale:2.05});
     timeline.to(columns[0],{xPercent:-40},'<');
     timeline.to(columns[2],{xPercent:40},'<');
     timeline.to(columns[1],{yPercent:index=>(index<Math.floor(columns[1].length/2)?-1:1)*40,duration:.5,ease:'power1.inOut'},'-=.5');
     return timeline;
   }
   toggleContent(isVisible=true){
     if(!this.title||!this.description||!this.button)return;
     if(this.contentVisible===isVisible)return;
     this.contentVisible=isVisible;
     // The reference uses overwrite:true, which kills the title's opacity tween
     // on repeat. auto preserves the source geometry and corrects that one bug.
     gsap.timeline({defaults:{overwrite:'auto'}})
       .to(this.title,{yPercent:isVisible?0:this.titleOffsetY,duration:.7,ease:'power2.inOut'})
       .to([this.description,this.button],{
         opacity:isVisible?1:0,duration:.4,ease:`power1.${isVisible?'inOut':'out'}`,
         pointerEvents:isVisible?'all':'none'
       },isVisible?'-=90%':'<');
   }
   animateGridOnScroll(){
     const timeline=gsap.timeline({scrollTrigger:{
       trigger:this.block,start:'top 25%',end:'bottom bottom',scrub:true
     }});
     timeline.add(this.gridRevealTimeline())
       .add(this.gridZoomTimeline(),'-=.6')
       .addLabel('content-switch','-=0.32')
       .add(()=>this.toggleContent(timeline.scrollTrigger.direction===1),'content-switch');
     // Keep the callback at its source time; reconcile visibility against the
     // rendered playhead when a fast scroll skips callbacks in either direction.
     timeline.eventCallback('onUpdate',()=>this.toggleContent(timeline.time()>=timeline.labels['content-switch']));
     gridTL.push(timeline);
   }
 }
 // From original Hiroki horizontal blinds JS: same BLIND_COUNT=30,
 // rect attributes, stagger .02, easing power3.out, scrub 2.5.
 const BLIND_COUNT=30;let blindSets=[];
 function createBlinds(g,vbHeight){g.innerHTML='';const h=vbHeight/BLIND_COUNT,blinds=[];let currentY=0;for(let i=0;i<BLIND_COUNT;i++){const centerY=vbHeight-(currentY+h/2);const top=document.createElementNS(ns,'rect'),bottom=document.createElementNS(ns,'rect');for(const rect of [top,bottom]){rect.setAttribute('x',0);rect.setAttribute('width',100);rect.setAttribute('height',0);rect.setAttribute('fill','white');rect.setAttribute('shape-rendering','crispEdges');rect.setAttribute('y',centerY);g.appendChild(rect);}blinds.push({top,bottom,y:centerY,h:h/2});currentY+=h;}return blinds;}
 function openBlinds(blinds){return gsap.timeline().to(blinds.flatMap(b=>[b.top,b.bottom]),{attr:{y:i=>{const b=blinds[Math.floor(i/2)];return i%2===0?b.y-b.h:b.y;},height:i=>blinds[Math.floor(i/2)].h+.01},ease:'power3.out',stagger:{each:.02,from:'start'}});}
 function textIn(el){return gsap.to(el,{clipPath:'inset(0% 0% 0% 0%)',y:0,opacity:1,duration:1.5,ease:'expo.out'});}
 function textOut(el){return gsap.to(el,{clipPath:'inset(0% 0% 100% 0%)',y:-30,opacity:0,duration:1.2,ease:'power2.inOut'});}
 function buildMask(){
  const h=innerHeight,w=innerWidth,vbHeight=h/w*100;blindSets=[];
  scenes.forEach((ch,i)=>{let svg=qs('svg.at-mask-layer',ch);svg.setAttribute('viewBox',`0 0 100 ${vbHeight}`);const maskRect=qs('mask rect',svg);maskRect?.setAttribute('width',100);maskRect?.setAttribute('height',vbHeight);const im=qs('image',svg);im?.setAttribute('width',100);im?.setAttribute('height',vbHeight);blindSets.push(createBlinds(qs('mask g',svg),vbHeight));});
  if(maskMaster){maskMaster.scrollTrigger?.kill();maskMaster.kill();maskMaster=null;}
  const content=scenes.map(ch=>qs('.chapter__content',ch));
  gsap.set(content,{clipPath:'inset(100% 0 0 0)',y:40,opacity:0});
  gsap.set(content[0],{clipPath:'inset(0% 0 0 0)',y:0,opacity:1});
  // The first photograph and its text are present when the section enters.
  // Subsequent photographs retain the original 30 horizontal SVG blinds.
  blindSets[0].forEach(b=>{
    gsap.set(b.top,{attr:{y:b.y-b.h,height:b.h+.01}});
    gsap.set(b.bottom,{attr:{y:b.y,height:b.h+.01}});
  });
  // Five chapters: an initial reading hold, deliberate SVG transitions,
  // and a stable reading interval after each reveal. No wheel interception.
  maskMaster=gsap.timeline({scrollTrigger:{
    trigger:track,start:'top top',end:'bottom bottom',scrub:.85,
    anticipatePin:1,invalidateOnRefresh:true
  }});
  maskMaster.addLabel('chapter-0-ready',0);
  maskMaster.to({},{duration:2.25});
  blindSets.slice(1).forEach((blinds,k)=>{
    const i=k+1;
    maskMaster.addLabel(`chapter-${i}-transition`);
    const transition=gsap.timeline();
    transition.to(content[i-1],{
      clipPath:'inset(0% 0% 100% 0%)',y:-25,opacity:0,
      duration:.52,ease:'power2.inOut'
    },0);
    transition.add(openBlinds(blinds),.18);
    transition.to(content[i],{
      clipPath:'inset(0% 0% 0% 0%)',y:0,opacity:1,
      duration:.90,ease:'power2.out'
    },1.08);
    maskMaster.add(transition);
    maskMaster.addLabel(`chapter-${i}-ready`);
    maskMaster.to({},{duration:2.25});
  });
  if(progressST){progressST.kill();progressST=null;}
  // The chapter state must follow the *rendered* scrubbed timeline, not
  // the raw wheel position (the latter can run ahead during fast scroll jumps).
  maskMaster.eventCallback('onUpdate',()=>{
    const position=maskMaster.time();
    let current=0;
    for(let i=1;i<scenes.length;i++){
      if(position >= (maskMaster.labels[`chapter-${i}-ready`]??Infinity)-.05)current=i;
    }
    setActiveChapter(current);
  });
  progressST=ScrollTrigger.create({trigger:track,start:'top top',end:'bottom bottom',onUpdate:self=>{
    const fills=qsa('.at-mask-progress__fill',track);
    fills.forEach((fill,i)=>{fill.style.width=`${clamp((self.progress-i/fills.length)*fills.length)*100}%`;});
  }});
  setActiveChapter(0);
 }
 function setActiveChapter(i){scenes.forEach((ch,j)=>{const current=j===i;ch.inert=!current;ch.setAttribute('aria-hidden',String(!current));ch.style.pointerEvents=current?'auto':'none';const shade=qs('.chapter__shade',ch);if(shade)shade.style.opacity=current?'1':'0';});if(jump&&document.activeElement!==jump)jump.value=scenes[i]?.id||'';}
 function destroy(){
   maskMaster?.scrollTrigger?.kill();maskMaster?.kill();maskMaster=null;
   progressST?.kill();progressST=null;
   gridTL.forEach(t=>{t.scrollTrigger?.kill();t.kill();});gridTL=[];
   // Native wheel/trackpad movement: no Lenis instance or GSAP ticker proxy.
   gsap.killTweensOf(qsa('.at-grid__wrapper,.at-grid__title,.at-grid__description,.content__button,.at-grid__item,.at-grid__images,.chapter__content'));
   gsap.set(qsa('.at-grid__wrapper,.at-grid__title,.at-grid__description,.content__button,.at-grid__item,.at-grid__images,.chapter__content'),{clearProps:'all'});
   root.classList.remove('at-original-active','at-grid-active');scenes.forEach(ch=>{ch.inert=false;ch.removeAttribute('aria-hidden');ch.style.pointerEvents='';const shade=qs('.chapter__shade',ch);if(shade)shade.style.opacity='';});
 }
 function activate(){
   destroy();if(!gridActive())return;
   gsap.registerPlugin(ScrollTrigger);
   root.classList.add('at-grid-active');
   // Same GSAP grid on desktop, tablet and phone; no wheel/touch interception.
   new StickyGridScroll();
   // SVG blind chapters stay desktop-only; smaller screens keep readable normal flow.
   if(maskActive()){root.classList.add('at-original-active');buildMask();}
   requestAnimationFrame(()=>ScrollTrigger.refresh());
 }
 const originalJump=(index)=>{
   if(!maskActive()||!maskMaster?.scrollTrigger){scenes[index]?.scrollIntoView({behavior:'instant',block:'start'});return;}
   // Direct jump lands inside the stable, legible part of the chosen chapter.
   const label=index===0?0:(maskMaster.labels[`chapter-${index}-ready`]||0);
   const p=index===0?0:clamp((label+.30)/maskMaster.duration());
   const st=maskMaster.scrollTrigger;
   window.scrollTo({top:st.start+(st.end-st.start)*p,behavior:'instant'});
 };
 jump?.addEventListener('change',()=>{const i=scenes.findIndex(x=>x.id===jump.value);if(i>=0){originalJump(i);history.replaceState(null,'','#'+scenes[i].id);}});
 // For direct hash URLs and keyboard users, do not trap navigation in a sticky stage.
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);const i=scenes.findIndex(x=>x.id===id);if(i>=0){e.preventDefault();originalJump(i);history.replaceState(null,'','#'+id);}});
 gridMedia.addEventListener?.('change',activate);
 maskMedia.addEventListener?.('change',activate);
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{
   if(gridActive()){
     if(maskActive()&&maskMaster)buildMask();
     ScrollTrigger.refresh();
   }
 },220);},{passive:true});
 // The original 'preload all images' is adapted to finite browser preload; if a
 // request fails, animation still initializes and the fallback remains usable.
 const ready=qsa('.at-grid__image').map(im=>im.complete?Promise.resolve():new Promise(resolve=>{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true});}));
 Promise.all([document.fonts.ready,Promise.race([Promise.all(ready),new Promise(r=>setTimeout(r,1800))])]).then(activate);
 window.addEventListener('pageshow',()=>{if(gridActive()&&!gridTL.length)activate();});
 window.addEventListener('pagehide',destroy);
})();
