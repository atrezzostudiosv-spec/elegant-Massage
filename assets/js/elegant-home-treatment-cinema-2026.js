/* ATREZZO — Elegant Massage / responsive treatment cinema.
   Matches the approved Thaissage storytelling system:
   one full-screen sticky scene, native scroll, 68% hold + soft transition.
   Desktop/tablet: photographic crossfade. Mobile: slide enters from right.
   The original Elegant Massage photographs, copy and booking URLs are reused.
   No scroll interception, external dependency, emojis, or new claims. */
(()=>{
 'use strict';
 const section=document.getElementById('find-your-massage');
 const track=document.getElementById('cinema-track');
 const stage=document.getElementById('atrezzo-mask-stage');
 if(!section||!track||!stage)return;
 const chapters=[...stage.querySelectorAll(':scope > .chapter')];
 if(chapters.length!==5)return;
 const opening=stage.querySelector(':scope > .treatments__opening');
 const mobile=matchMedia('(max-width:870px)');
 const motion=matchMedia('(min-height:560px) and (prefers-reduced-motion:no-preference)');
 const grid=document.getElementById('atrezzo-original-grid');
 const clamp=n=>Math.max(0,Math.min(1,n));
 const ease=n=>{const v=clamp(n);return v*v*(3-2*v)};
 const labels=['Body Massage','Foot & Back','Couples Massage','Chair & Thai','Four Hands'];
 let chrome,buttons=[],active=-1,raf=0,enabled=false;
 if(opening){section.insertBefore(opening,track);}
 function createChrome(){
   if(chrome)return;
   chrome=document.createElement('div');
   chrome.className='em-treatment-chrome';
   chrome.setAttribute('aria-label','Treatment slide navigation');
   const top=document.createElement('div');
   top.className='em-treatment-chrome__top';
   const counter=document.createElement('span');
   counter.className='em-treatment-chrome__counter';
   counter.textContent='01 / 05';
   top.append(counter);
   const nav=document.createElement('nav');
   nav.className='em-treatment-chrome__nav';
   nav.setAttribute('aria-label','Choose a massage treatment');
   labels.forEach((name,i)=>{
     const button=document.createElement('button');
     button.type='button';
     button.className='em-treatment-chrome__button';
     button.textContent=name;
     button.setAttribute('aria-label','Show '+name);
     button.setAttribute('aria-current',i===0?'step':'false');
     button.addEventListener('click',()=>{
       const top=window.scrollY+track.getBoundingClientRect().top;
       const distance=Math.max(1,track.offsetHeight-stage.offsetHeight);
       const fraction=(i+.12)/chapters.length;
       window.scrollTo({top:top+distance*fraction,behavior:'instant'});
       schedule();
     });
     nav.append(button);buttons.push(button);
   });
   chrome.append(top,nav);stage.append(chrome);
 }
 function clear(){
   document.documentElement.classList.remove('em-cinema-ready');
   chapters.forEach(ch=>{
     ch.inert=false;
     ch.removeAttribute('aria-hidden');
     ch.style.removeProperty('opacity');
     ch.style.removeProperty('transform');
     ch.style.removeProperty('z-index');
     ch.style.removeProperty('--em-cinema-zoom');
     ch.style.removeProperty('pointer-events');
   });
   chrome?.remove();chrome=null;buttons=[];active=-1;
 }
 function paint(){
   raf=0;
   if(grid){
     grid.hidden=mobile.matches;
     grid.setAttribute('aria-hidden',String(mobile.matches));
   }
   const shouldRun=motion.matches;
   if(!shouldRun){if(enabled){enabled=false;clear();}return;}
   if(!enabled){enabled=true;createChrome();document.documentElement.classList.add('em-cinema-ready');}
   if(document.hidden)return;
   const distance=Math.max(1,track.offsetHeight-stage.offsetHeight);
   const progress=clamp(-track.getBoundingClientRect().top/distance);
   const position=Math.min(chapters.length-0.000001,progress*chapters.length);
   const index=Math.min(chapters.length-1,Math.floor(position));
   const local=clamp(position-index);
   // The first 68% of each scroll chapter is held completely still and legible.
   // The remaining 32% introduces the next photograph. The last slide holds
   // until its scroll track releases into the next Home section.
   const incoming=index===chapters.length-1?0:ease((local-.68)/.32);
   const selected=incoming>=.60?Math.min(index+1,chapters.length-1):index;
   if(selected!==active){
     active=selected;
     const counter=chrome?.querySelector('.em-treatment-chrome__counter');
     if(counter)counter.textContent=String(selected+1).padStart(2,'0')+' / 05';
     buttons.forEach((b,i)=>b.setAttribute('aria-current',i===selected?'step':'false'));
   }
   chapters.forEach((ch,i)=>{
     const current=i===index,arriving=i===index+1&&index<chapters.length-1;
     const visible=current||arriving;
     const op=current?(mobile.matches?1:1-incoming):arriving?incoming:0;
     ch.style.opacity=String(op);
     ch.style.zIndex=arriving?'2':current?'1':'0';
     // On phones the next slide moves horizontally, as in Thaissage.
     ch.style.transform=mobile.matches&&arriving
       ?'translate3d('+((1-incoming)*100).toFixed(3)+'%,0,0)'
       :'translate3d(0,0,0)';
     const zoom=1.025+.055*ease(current?local:0);
     ch.style.setProperty('--em-cinema-zoom',zoom.toFixed(4));
     const interactive=i===selected;
     ch.inert=!interactive;
     ch.setAttribute('aria-hidden',String(!interactive));
     ch.style.pointerEvents=interactive?'auto':'none';
   });
   buttons.forEach((b,i)=>b.style.setProperty('--em-progress',
     String(i<index?1:i===index?local:0)));
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(paint)}
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 addEventListener('pageshow',schedule);
 document.addEventListener('visibilitychange',schedule);
 mobile.addEventListener?.('change',schedule);
 motion.addEventListener?.('change',schedule);
 schedule();
})();
