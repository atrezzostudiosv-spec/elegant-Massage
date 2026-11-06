/* Home cinematic closing scenes only. Does not touch Hero, Sticky Grid,
 * treatment chapters, their timelines or their scroll handlers. */
(() => {
  'use strict';
  function initClosingScenes(){
    const gsap=window.gsap;
    const Trigger=window.ScrollTrigger;
    if(!gsap||!Trigger || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    gsap.registerPlugin(Trigger);
    const shots=[
      {section:document.querySelector('.real-place--cinematic'),photo:document.querySelector('.real-place--cinematic .real-place__scene img'),zoom:1.07}
    ];
    const motions=[];
    for(const shot of shots){
      if(!shot.section || !shot.photo)continue;
      motions.push(gsap.fromTo(shot.photo,
        {scale:1.015},
        {scale:shot.zoom,ease:'none',scrollTrigger:{
          trigger:shot.section,start:'top bottom',end:'bottom top',
          scrub:.6,invalidateOnRefresh:true
        }}
      ));
    }
    // The new Menu chapter stays visually fixed while native scroll spends
    // its dedicated reading distance. Only the photo changes scale: the text
    // and CTA remain fully readable, with no wheel or touch interception.
    const menu=document.querySelector('.menu-pause');
    const menuPhoto=menu?.querySelector('.menu-pause__photo img');
    const immersiveMenu=matchMedia('(min-width:768px) and (min-height:681px)');
    if(menu&&menuPhoto&&immersiveMenu.matches){
      motions.push(gsap.fromTo(menuPhoto,{scale:1.015},{
        scale:1.092,ease:'none',
        scrollTrigger:{
          trigger:menu,start:'top top',end:'bottom bottom',
          scrub:.7,invalidateOnRefresh:true
        }
      }));
    }
    // Text remains in the DOM and visible even if animations never initialize.
    const reveals=[
      {root:'.menu-pause',selectors:'.menu-pause__eyebrow,.menu-pause h2,.menu-pause__copy,.menu-pause__footer'},
      {root:'.real-place--cinematic',selectors:'.real-place__inner > .eyebrow,.real-place h2,.real-place__description,.real-place__actions,.real-place__source'}
    ];
    for(const item of reveals){
      const root=document.querySelector(item.root);
      if(!root)continue;
      const nodes=[...root.querySelectorAll(item.selectors)];
      for(const [i,node] of nodes.entries()){
        motions.push(gsap.fromTo(node,
          {y:18,opacity:.70},
          {y:0,opacity:1,duration:.75,ease:'power2.out',delay:i*.07,
           scrollTrigger:{trigger:root,start:'top 73%',toggleActions:'play none none reverse'}}
        ));
      }
    }
    window.addEventListener('pagehide',()=>{
      for(const motion of motions){motion.scrollTrigger?.kill();motion.kill();}
    },{once:true});
  }
  if(document.readyState==='complete')initClosingScenes();
  else window.addEventListener('load',initClosingScenes,{once:true});
})();