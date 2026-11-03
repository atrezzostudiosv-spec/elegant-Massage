'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('fs');
const widths=[375,390,430,768,1024,1440];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const report=[];fs.mkdirSync('qa-artifacts/codrops-motion',{recursive:true});
 for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(2100);
  const state=await page.evaluate(()=>({
   innerWidth,scrollWidth:document.documentElement.scrollWidth,grid:document.querySelectorAll('.at-grid__item').length,
   chapters:document.querySelectorAll('.chapter').length,masks:document.querySelectorAll('svg.at-mask-layer mask').length,
   booking:[...document.querySelectorAll('a')].filter(a=>a.textContent.toLowerCase().includes('book')).every(a=>a.href.startsWith('https://elegantmassage.setmore.com/#services')),
   noindex:document.querySelector('meta[name="robots"]')?.content?.includes('noindex'),
   active:document.documentElement.classList.contains('at-original-active'),
   gridActive:document.documentElement.classList.contains('at-grid-active'),
   blindRects:document.querySelectorAll('.at-mask-layer mask g rect').length,
   bodyGradient:getComputedStyle(document.querySelector('.chapter--body .chapter__shade')).backgroundImage,
   chairGradient:getComputedStyle(document.querySelector('.chapter--chair .chapter__shade')).backgroundImage,
   heroGradient:getComputedStyle(document.querySelector('.intro__scrim')).backgroundImage,
   heroFont:getComputedStyle(document.querySelector('.intro h1')).fontFamily,
   copyFont:getComputedStyle(document.body).fontFamily,
   themePresent:!!document.querySelector('link[href$="atrezzo-agate-palette.css"]'),
   bodyColor:getComputedStyle(document.body).backgroundColor,
   headerBook:(()=>{let e=document.querySelector('.glass-header__book');return {background:getComputedStyle(e).backgroundColor,text:getComputedStyle(e).color};})(),
   realPlace:getComputedStyle(document.querySelector('.real-place')).backgroundColor,
   footerColor:getComputedStyle(document.querySelector('.footer')).backgroundColor,
  }));
  // Accessibility and scroll-control regression after the November 3 fix.
  assert.equal(await page.locator('.at-grid__button').count(),0,'Remove redundant Discover Your Massage grid CTA');
  assert.equal(await page.locator('script[src*="lenis.min.js"]').count(),0,'No Lenis scroll override');
  if(width>=1024){
   const motion=await page.evaluate(()=>({
    gridHeight:document.querySelector('.at-grid').getBoundingClientRect().height/innerHeight,
    chapterHeight:document.querySelector('#cinema-track').getBoundingClientRect().height/innerHeight,
    firstBlinds:[...document.querySelectorAll('#at-mask-0 g rect')].filter(x=>parseFloat(x.getAttribute('height'))>.001).length,
    scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior,
    firstContentOpacity:getComputedStyle(document.querySelector('.chapter--body .chapter__content')).opacity
   }));
   assert(motion.gridHeight<=2.86&&motion.gridHeight>=2.64,'Grid must fit source-style controlled 275svh travel: '+motion.gridHeight);
   assert(motion.chapterHeight>=7.10&&motion.chapterHeight<=7.36,'Five treatment reading intervals need approximately 725svh: '+motion.chapterHeight);
   assert.equal(motion.firstBlinds,60,'First photographic chapter visible immediately, no black screen');
   assert.equal(motion.scrollBehavior,'auto','Native scroll should be immediate and controllable');
   assert.equal(motion.firstContentOpacity,'1','First treatment headline must be visible on entry');
   if(width===1440){
     const before=await page.evaluate(()=>scrollY);
     await page.mouse.wheel(0,540);await page.waitForTimeout(320);
     const moved=await page.evaluate(start=>scrollY-start,before);
     assert(moved>=250&&moved<=900,'One native wheel gesture must advance predictably: '+moved);
     await page.evaluate(()=>scrollTo(0,0));
   }
  }
  assert(state.themePresent,width+': agate palette must load');
  assert.equal(state.bodyColor,'rgb(255, 255, 255)',width+': Home white paper');
  assert.deepEqual(state.headerBook,{background:'rgb(83, 203, 217)',text:'rgb(37, 68, 96)'},width+': aqua header CTA with ocean text');
  assert.equal(state.realPlace,'rgb(221, 235, 200)',width+': natural lime authentic location');
  assert.equal(state.footerColor,'rgb(37, 68, 96)',width+': ocean footer');
  assert.equal(state.grid,12,'12 authentic Sticky Grid items');
  assert.equal(state.chapters,5,'Five massage chapters');
  assert(state.heroFont.includes('Playfair Display'),width+': serif must match Thai typography spec');
  assert(state.copyFont.includes('Open Sans'),width+': body type must match Thai typography spec');
  assert(state.heroGradient.includes('rgba(0, 0, 0,') && !state.heroGradient.includes('rgba(10, 28, 45'),width+': black hero gradient, no blue tint');
  assert(state.bodyGradient.includes('rgba(0, 0, 0,') && !state.bodyGradient.includes('rgba(12, 34, 52'),width+': treatments must use neutral-black overlay');
  assert(state.chairGradient.includes('rgba(0, 0, 0,') && !state.chairGradient.includes('rgba(11, 31, 49'),width+': chair treatment must use neutral-black overlay');
  assert.equal(state.masks,5,'Unique SVG masks');
  assert(state.scrollWidth<=state.innerWidth+1,`Horizontal overflow ${width}: ${state.scrollWidth}`);
  assert(state.booking,'Booking link destination must be Setmore');assert(state.noindex,'must stay noindex');
  if(width>=1024){assert.equal(state.active,true,'desktop must run original timelines');assert.equal(state.blindRects,300,'5*30 blinds * 2 rects');}
  else {
   assert.equal(state.active,false,'mobile and tablet treatment chapters must use normal flow');
   assert.equal(state.gridActive,true,'tablet/phone should run real Sticky Grid timeline');
   const motion=await page.evaluate(()=>({
     gridHeight:document.querySelector('.at-grid').getBoundingClientRect().height/innerHeight,
     sticky:getComputedStyle(document.querySelector('.at-grid__wrapper')).position,
     visibleImages:[...document.querySelectorAll('.at-grid__item')].filter(el=>getComputedStyle(el).display!=='none').length,
     photoGridTransform:getComputedStyle(document.querySelector('.at-grid__images')).transform,
   }));
   assert(motion.gridHeight>=1.85&&motion.gridHeight<=(width>700?2.28:2.05),'Responsive grid must remain controlled: '+motion.gridHeight);
   assert.equal(motion.sticky,'sticky','responsive photographic gallery must be sticky');
   assert.equal(motion.visibleImages,12,'show all 12 photographic tiles on mobile and tablet');
   const mid=await page.evaluate(()=>{const g=document.querySelector('.at-grid');return scrollY+g.getBoundingClientRect().top+(g.offsetHeight-innerHeight)*.76});
   await page.evaluate(y=>scrollTo(0,y),mid);await page.waitForTimeout(700);
   const after=await page.evaluate(()=>getComputedStyle(document.querySelector('.at-grid__images')).transform);
   assert(after!=='none'&&!after.includes('matrix(1, 0, 0, 1, 0, 0)'),width+': expected grid motion while scrolling');
   const diagnostic=await page.evaluate(()=>{
      const gallery=document.querySelector('.at-grid__gallery');
      const grid=document.querySelector('.at-grid__images');
      const rectInfo=el=>{const r=el.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),height:Math.round(r.height)};};
      const photos=[...document.querySelectorAll('.at-grid__image')];
      return {
        scrollY, gallery:rectInfo(gallery), galleryStyle:{display:getComputedStyle(gallery).display,opacity:getComputedStyle(gallery).opacity,visibility:getComputedStyle(gallery).visibility},
        grid:rectInfo(grid),
        photos:photos.slice(0,6).map(el=>({complete:el.complete,naturalWidth:el.naturalWidth,rect:rectInfo(el),src:el.currentSrc.split('/').pop()})),
        visibleCount:photos.filter(el=>{const r=el.getBoundingClientRect();return el.naturalWidth>0 && r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}).length
      };
   });
   if(width<=768)console.log('MID-GRID-DIAG '+width+' '+JSON.stringify(diagnostic));
   assert(diagnostic.visibleCount>0,width+': photographs must be visibly loaded at mid-scroll');
   await page.screenshot({path:`qa-artifacts/codrops-motion/${width}-grid-mid.png`,animations:'disabled'});
   await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(380);
   const layer=await page.evaluate(()=>{
     const el=document.elementFromPoint(innerWidth/2,innerHeight*.55);
     return {inIntro:document.querySelector('.intro').contains(el),className:String(el?.className||'')};
   });
   assert(layer.inIntro,width+': returning to the top must show the intro, not Sticky Grid on top: '+JSON.stringify(layer));
  }
  // User-reported regression: the zoom should never throw every photograph offscreen.
  if([390,768,1440].includes(width)){
   const samples=[];
   for(const fraction of [.48,.76,.94]){
     const y=await page.evaluate(p=>{
       const g=document.querySelector('.at-grid');
       return scrollY+g.getBoundingClientRect().top+(g.offsetHeight-innerHeight)*p;
     },fraction);
     await page.evaluate(pos=>window.scrollTo(0,pos),y);
     await page.waitForTimeout(520);
     const sample=await page.evaluate(()=>{
       const visible=[...document.querySelectorAll('.at-grid__image')].filter(im=>{
         const r=im.getBoundingClientRect();
         return im.naturalWidth>0 && r.bottom>0 && r.top<innerHeight && r.left<innerWidth && r.right>0;
       }).length;
       return {visible,scrollY};
     });
     assert(sample.visible>0,`${width}px grid becomes blank at ${Math.round(fraction*100)}%: ${JSON.stringify(sample)}`);
     samples.push({fraction,...sample});
     if(fraction===.94)await page.screenshot({path:`qa-artifacts/codrops-motion/${width}-grid-final.png`,animations:'disabled'});
   }
   console.log('GRID-CONTINUITY '+width+' '+JSON.stringify(samples));
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.waitForTimeout(350);
  }
  await page.locator('#menu-toggle').isVisible().then(async visible=>{
   if(visible){await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');}
  });
  if(width===1440 || width===390){
   await page.screenshot({path:`qa-artifacts/codrops-motion/${width}-hero.png`});
   await page.locator('#atrezzo-original-grid').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
   await page.screenshot({path:`qa-artifacts/codrops-motion/${width}-sticky.png`});
   await page.locator('#cinema-track').scrollIntoViewIfNeeded();await page.waitForTimeout(700);
   await page.screenshot({path:`qa-artifacts/codrops-motion/${width}-mask.png`});
  }
  if(width===1440){
    // Reading states: every chapter must be reachable in order through native scroll.
    const stage=await page.locator('#cinema-track').evaluate(el=>({top:el.offsetTop,height:el.offsetHeight}));
    const observed=[];
    for(let k=0;k<=20;k++){
      const fraction=k/20;
      await page.evaluate(y=>window.scrollTo(0,y),stage.top+(stage.height-900)*fraction);
      await page.waitForTimeout(950);
      const current=await page.evaluate(()=>{
        const chapters=[...document.querySelectorAll('.chapter')];
        const active=chapters.find(ch=>ch.getAttribute('aria-hidden')==='false');
        const content=active?.querySelector('.chapter__content');
        return {id:active?.id,opacity:content?parseFloat(getComputedStyle(content).opacity):0};
      });
      observed.push({fraction,id:current.id,opacity:current.opacity});
    }
    const ids=[...new Set(observed.map(x=>x.id))];
    assert.deepEqual(ids,['body-massage','foot-combo','couples-massage','chair-thai','four-hands'],'Five chapter reveals must be ordered: '+JSON.stringify(ids));
    for(const id of ids){
      const stable=observed.filter(x=>x.id===id&&x.opacity>.90);
      assert(stable.length>=2,id+' needs two readable scroll samples; '+JSON.stringify(observed));
    }
    console.log('CHAPTER-READABILITY '+JSON.stringify(observed));
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(250);
  }
  if(width===1440){await page.locator('#chapter-selector').selectOption('chair-thai');await page.waitForTimeout(1200);const pos=await page.evaluate(()=>({scroll:scrollY,top:document.getElementById('cinema-track').offsetTop}));assert(pos.scroll>=pos.top-100,'selector should jump directly into cinema stage');}
  assert(!errors.length,`JS errors at ${width}: ${errors.join(' | ')}`);
  report.push({width,...state,errors});await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await reduced.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});await reduced.waitForTimeout(700);
 assert.equal(await reduced.evaluate(()=>document.documentElement.classList.contains('at-original-active')),false,'reduced motion must disable cinematic choreography');
 assert.equal(await reduced.evaluate(()=>document.documentElement.classList.contains('at-grid-active')),false,'reduced motion must disable Sticky Grid as well');
 await reduced.close();await browser.close();
 fs.writeFileSync('qa-artifacts/codrops-motion/results.json',JSON.stringify(report,null,2));
 console.log('Original Codrops integration PASS: 6 sizes, responsive GSAP photo grid, desktop SVG blinds, native scroll, menu, booking, reduced motion, noindex.');
})().catch(e=>{console.error(e);process.exit(1)});