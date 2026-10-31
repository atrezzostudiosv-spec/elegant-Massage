/* ATREZZO — Elegant Massage Home V6.1
   One accessible editorial explorer: tabs on desktop, inline accordion on mobile.
   No change to the validated Body / Foot / Combination scroll controller.
   Without JS all service panels and booking links stay in the source. */
(() => {
  'use strict';
  const doc=document, root=doc.querySelector('[data-v6-explorer]');
  if(!root)return;
  const selector=root.querySelector('[data-v6-selector]');
  const desktopHost=root.querySelector('.v6-explorer__panels');
  const tabs=[...root.querySelectorAll('[data-v6-choice]')];
  const panels=[...root.querySelectorAll('[data-v6-panel]')];
  if(tabs.length!==6||panels.length!==6)return;
  const mobile=matchMedia('(max-width:640px)');
  const motion=matchMedia('(prefers-reduced-motion:reduce)');
  let selected=0;
  function layout(){
    const small=mobile.matches;
    if(small){
      selector.removeAttribute('role');
      tabs.forEach((tab,i)=>{
        tab.after(panels[i]);
        tab.setAttribute('role','button');
        tab.setAttribute('aria-expanded',String(i===selected));
        tab.removeAttribute('aria-selected');
        tab.setAttribute('tabindex','0');
        panels[i].setAttribute('role','region');
      });
    }else{
      panels.forEach(panel=>desktopHost.append(panel));
      selector.setAttribute('role','tablist');
      selector.setAttribute('aria-label','Massage treatments');
      tabs.forEach((tab,i)=>{
        tab.setAttribute('role','tab');
        tab.setAttribute('tabindex',i===selected?'0':'-1');
        tab.setAttribute('aria-selected',String(i===selected));
        tab.removeAttribute('aria-expanded');
        panels[i].setAttribute('role','tabpanel');
      });
    }
    activate(selected);
  }
  function activate(i,{focus=false,scroll=false}={}){
    if(i<0||i>=tabs.length)return;
    selected=i;
    const small=mobile.matches;
    tabs.forEach((tab,index)=>{
      const current=index===i;
      tab.classList.toggle('is-active',current);
      if(small){
        tab.setAttribute('aria-expanded',String(current));
        tab.removeAttribute('aria-selected');
        tab.setAttribute('tabindex','0');
      }else{
        tab.setAttribute('aria-selected',String(current));
        tab.setAttribute('tabindex',current?'0':'-1');
      }
      if(current&&focus)tab.focus({preventScroll:true});
    });
    panels.forEach((panel,index)=>{
      const current=index===i;
      panel.hidden=!current;
      panel.classList.toggle('is-active',current);
      panel.setAttribute('aria-labelledby',tabs[index].id);
      panel.setAttribute('aria-hidden',String(!current));
      // A collapsed panel cannot receive keyboard focus.
      panel.inert=!current;
    });
    if(small&&scroll){
      requestAnimationFrame(()=>tabs[i].scrollIntoView({
        behavior:motion.matches?'instant':'smooth',
        block:'nearest'
      }));
    }
  }
  tabs.forEach((tab,i)=>{
    tab.setAttribute('aria-controls',panels[i].id);
    tab.addEventListener('click',event=>{
      event.preventDefault();
      activate(i,{scroll:true});
    });
    tab.addEventListener('keydown',event=>{
      if(mobile.matches && (event.key===' '||event.key==='Enter')){
        event.preventDefault();activate(i,{focus:true,scroll:true});return;
      }
      let next=i;
      if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(i+1)%tabs.length;
      else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();activate(next,{focus:true});
    });
  });
  root.classList.add('is-enhanced');
  layout();
  mobile.addEventListener?.('change',layout);

  // On handheld screens the real treatment hero replaces the floral video.
  // Let the existing desktop video controller retain its original behavior.
  const film=doc.querySelector('#hero-film');
  const pauseMobileFilm=()=>{
    if(mobile.matches && film){film.pause();film.hidden=true;}
  };
  pauseMobileFilm();
  mobile.addEventListener?.('change',pauseMobileFilm);

  // One conversion affordance at a time: hide the fixed mobile booking bar
  // while the visible Hero or final booking section already offers the CTA.
  const booking=doc.querySelector('.em-mobile-booking');
  const hero=doc.querySelector('.hero--home');
  const final=doc.querySelector('.v6-final');
  if(booking){
    booking.innerHTML='Book an Appointment <svg class="v6-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 19 19 5M7 5h12v12"/></svg>';
    let heroVisible=true,finalVisible=false;
    const update=()=>doc.body.classList.toggle('v6-show-mobile-booking',
      !heroVisible&&!finalVisible&&mobile.matches);
    if('IntersectionObserver' in window&&hero&&final){
      new IntersectionObserver(entries=>{
        heroVisible=entries[0].isIntersecting;update();
      },{threshold:0}).observe(hero);
      new IntersectionObserver(entries=>{
        finalVisible=entries[0].isIntersecting;update();
      },{threshold:0}).observe(final);
    }else{
      // No observer: do not add a redundant fixed conversion surface.
      doc.body.classList.remove('v6-show-mobile-booking');
    }
    mobile.addEventListener?.('change',update);
  }
})();
