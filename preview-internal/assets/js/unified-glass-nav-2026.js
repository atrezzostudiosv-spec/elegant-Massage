/* ATREZZO / Unified mobile booking and menu accessibility.
   One bottom dock across the Home and 12 legacy internal routes. */
(()=>{'use strict';
  const d=document;
  const booking='https://elegantmassage.setmore.com/#services';
  const header=d.querySelector('.glass-header,.site-header');
  const mobile=d.querySelector('.em-mobile-booking');
  if(mobile){
    mobile.href=booking;
    mobile.setAttribute('aria-label','Book an appointment with Elegant Massage');
  }else{
    const a=d.createElement('a');
    a.className='em-mobile-booking';
    a.href=booking;
    a.target='_blank';a.rel='noopener noreferrer';
    a.setAttribute('aria-label','Book an appointment with Elegant Massage');
    a.innerHTML='Book an Appointment ';
    d.body.appendChild(a);
  }
  /* Internal pages use the original, verified menu script. This closes an
     expanded dropdown if the visitor taps outside the floating header. */
  if(header?.classList.contains('site-header')){
    const btn=header.querySelector('.toggle');
    const nav=header.querySelector('.navigation');
    d.addEventListener('pointerdown',e=>{
      if(!header.contains(e.target)&&header.classList.contains('menu-open')){
        header.classList.remove('menu-open');
        btn?.setAttribute('aria-expanded','false');
      }
    },{passive:true});
    btn?.addEventListener('click',()=>{
      btn.setAttribute('aria-label',
        btn.getAttribute('aria-expanded')==='true'?'Close navigation':'Open navigation');
    });
    d.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&nav?.contains(d.activeElement))btn?.focus();
    });
  }
})();
/* Native Treatments disclosure: pointer-hover on desktop, disclosure-tap on
   mobile, keyboard Enter/Space and Escape. No hover delay/closing gap. */
(()=>{
  'use strict';
  const d=document;
  const desktop=matchMedia('(min-width:871px)');
  const header=d.querySelector('.glass-header,.site-header');
  const details=d.querySelector('.treatments-menu');
  if(!details||!header)return;
  const summary=details.querySelector('summary');
  const primaryToggle=header.querySelector('.menu-toggle,.toggle');
  const mobileNav=header.querySelector('.main-nav,.navigation');
  const close=()=>{details.open=false};
  let hoverExitTimer=0;
  const cancelHoverExit=()=>{
    if(hoverExitTimer){clearTimeout(hoverExitTimer);hoverExitTimer=0;}
  };
  details.addEventListener('pointerenter',e=>{
    if(desktop.matches&&e.pointerType!=='touch'){
      cancelHoverExit();
      details.open=true;
    }
  });
  details.addEventListener('pointerleave',e=>{
    if(desktop.matches&&e.pointerType!=='touch'){
      // A short closing grace prevents diagonal mouse travel from crossing
      // a one-pixel hover gap and collapsing the flyout before the link.
      cancelHoverExit();
      hoverExitTimer=setTimeout(()=>{
        hoverExitTimer=0;
        if(!details.matches(':hover')&&!details.contains(d.activeElement))close();
      },200);
    }
  });
  /* Prevent a click from closing an already hover-open desktop disclosure. */
  summary.addEventListener('click',e=>{
    if(desktop.matches){
      e.preventDefault();
      details.open=true;
    }
  });
  details.addEventListener('focusout',()=>{
    if(desktop.matches){
      requestAnimationFrame(()=>{
        if(!details.contains(d.activeElement)&&!details.matches(':hover'))close();
      });
    }
  });
  d.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&details.open){
      close();
      if(details.contains(d.activeElement))summary.focus();
    }
  });
  d.addEventListener('pointerdown',e=>{
    if(!details.contains(e.target)&&details.open)close();
  },{passive:true});
  mobileNav?.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',close);
  });
  primaryToggle?.addEventListener('click',()=>{
    if(primaryToggle.getAttribute('aria-expanded')==='false')close();
  });
  desktop.addEventListener?.('change',close);
})();
