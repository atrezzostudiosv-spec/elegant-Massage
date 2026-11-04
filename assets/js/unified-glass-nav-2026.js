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
    a.innerHTML='Book an Appointment <span aria-hidden="true">↗</span>';
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