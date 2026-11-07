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
    // ONE introductory copy block is now part of the same floral SVG-mask
    // stage, not a standalone section above it. While the scene is held, the
    // text naturally dissolves as the Body Massage blinds begin to open.
    // No modifications to Codrops/Hiroki's original five treatment timeline.
    const treatmentTrack=document.querySelector('#cinema-track');
    const stageIntro=treatmentTrack?.querySelector('.at-mask-stage > .treatments__opening');
    if(treatmentTrack&&stageIntro&&matchMedia('(min-height:650px)').matches){
      // First ~115svh is now a reading hold in the mask master timeline.
      // Give the original floral photograph a tiny scroll-linked zoom with
      // no scroll interception. The text remains fully readable most of
      // that distance, then dissolves as the first blind begins.
      const stage=treatmentTrack.querySelector('.at-mask-stage');
      if(stage){
        motions.push(gsap.fromTo(stage,
          {'--at-intro-scale':1},
          {'--at-intro-scale':1.065,ease:'none',scrollTrigger:{
            trigger:treatmentTrack,
            start:'top top',
            end:()=>`top top-=${Math.round(window.innerHeight*1.16)}`,
            scrub:.65,invalidateOnRefresh:true
          }}
        ));
      }
      motions.push(gsap.fromTo(stageIntro,
        {autoAlpha:1,y:0},
        {autoAlpha:0,y:-14,ease:'none',scrollTrigger:{
          trigger:treatmentTrack,
          start:()=>`top top-=${Math.round(window.innerHeight*.88)}`,
          end:()=>`top top-=${Math.round(window.innerHeight*1.20)}`,
          scrub:.48,invalidateOnRefresh:true,
          onUpdate:self=>{stageIntro.style.pointerEvents=self.progress>.70?'none':'auto';},
          onLeave:()=>{stageIntro.style.pointerEvents='none';},
          onEnterBack:()=>{stageIntro.style.pointerEvents='auto';}
        }}
      ));
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