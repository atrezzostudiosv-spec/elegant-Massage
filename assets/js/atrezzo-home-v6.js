/* Elegant Massage / Home V6: progressive enhancement only.
   The source contains six readable and linked panels without JavaScript. */
(() => {
  'use strict';
  const root=document.querySelector('[data-v6-explorer]');
  if (!root) return;
  const tabs=Array.from(root.querySelectorAll('[data-v6-choice]'));
  const panels=Array.from(root.querySelectorAll('[data-v6-panel]'));
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(tabs.length!==6||panels.length!==6)return;
  const selector=root.querySelector('[data-v6-selector]');
  selector?.setAttribute('role','tablist');
  selector?.setAttribute('aria-label','Choose your massage');
  function activate(index,{focus=false,scroll=false}={}) {
    if(index<0||index>=tabs.length)return;
    tabs.forEach((tab,i)=>{
      const current=i===index;
      tab.classList.toggle('is-active',current);
      tab.setAttribute('role','tab');
      tab.setAttribute('aria-selected',String(current));
      tab.setAttribute('tabindex',current?'0':'-1');
      if(current&&focus)tab.focus({preventScroll:true});
    });
    panels.forEach((panel,i)=>{
      const current=i===index;
      panel.classList.toggle('is-active',current);
      panel.hidden=!current;
      panel.setAttribute('role','tabpanel');
      panel.setAttribute('aria-labelledby',tabs[i].id);
    });
    if(scroll&&window.matchMedia('(max-width:640px)').matches){
      const panel=panels[index];
      requestAnimationFrame(()=>panel.scrollIntoView({
        behavior:reduced.matches?'instant':'smooth',
        block:'start'
      }));
    }
  }
  tabs.forEach((tab,index)=>{
    tab.setAttribute('aria-controls',panels[index].id);
    tab.addEventListener('click',event=>{
      event.preventDefault();
      activate(index,{scroll:true});
    });
    tab.addEventListener('keydown',event=>{
      let next=index;
      if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();
      activate(next,{focus:true});
    });
  });
  root.classList.add('is-enhanced');
  activate(0);
  // Convert the existing mobile booking affordance to a genuine accessible SVG.
  const booking=document.querySelector('.em-mobile-booking');
  if(booking){
    const svg='<svg class="v6-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 19 19 5M7 5h12v12"/></svg>';
    booking.innerHTML='Book an Appointment '+svg;
  }
})();
