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
   noindex:document.querySelector('meta[name="robots"]')?.content?.includes('noindex'),active:document.documentElement.classList.contains('at-original-active'),
   blindRects:document.querySelectorAll('.at-mask-layer mask g rect').length,
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
   assert(motion.gridHeight<=2.45&&motion.gridHeight>=2.1,'Grid must not trap users for > 2.5 screens: '+motion.gridHeight);
   assert(motion.chapterHeight<=4&&motion.chapterHeight>=3.4,'Treatment scroll must stay manageable: '+motion.chapterHeight);
   assert.equal(motion.firstBlinds,60,'First photographic chapter visible immediately, no black screen');
   assert.equal(motion.scrollBehavior,'auto','Native scroll should be immediate and controllable');
   assert.equal(motion.firstContentOpacity,'1','First treatment headline must be visible on entry');
   if(width===1440){
     const before=await page.evaluate(()=>scrollY);
     await page.mouse.wheel(0,540);await page.waitForTimeout(320);
     const moved=await page.evaluate(()=>scrollY-before);
     assert(moved>=250&&moved<=900,'One native wheel gesture must advance predictably: '+moved);
     await page.evaluate(()=>scrollTo(0,0));
   }
  }
  assert.equal(state.grid,12,'12 authentic Sticky Grid items');
  assert.equal(state.chapters,5,'Five massage chapters');
  assert.equal(state.masks,5,'Unique SVG masks');
  assert(state.scrollWidth<=state.innerWidth+1,`Horizontal overflow ${width}: ${state.scrollWidth}`);
  assert(state.booking,'Booking link destination must be Setmore');assert(state.noindex,'must stay noindex');
  if(width>=1024){assert.equal(state.active,true,'desktop must run original timelines');assert.equal(state.blindRects,300,'5*30 blinds * 2 rects');}
  else assert.equal(state.active,false,'mobile should use normal-flow fallback');
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
  if(width===1440){await page.locator('#chapter-selector').selectOption('chair-thai');await page.waitForTimeout(1200);const pos=await page.evaluate(()=>({scroll:scrollY,top:document.getElementById('cinema-track').offsetTop}));assert(pos.scroll>=pos.top-100,'selector should jump directly into cinema stage');}
  assert(!errors.length,`JS errors at ${width}: ${errors.join(' | ')}`);
  report.push({width,...state,errors});await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await reduced.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});await reduced.waitForTimeout(700);
 assert.equal(await reduced.evaluate(()=>document.documentElement.classList.contains('at-original-active')),false,'reduced motion must disable cinematic choreography');
 await reduced.close();await browser.close();
 fs.writeFileSync('qa-artifacts/codrops-motion/results.json',JSON.stringify(report,null,2));
 console.log('Original Codrops integration PASS: 6 sizes, real GSAP/SVG rects, menu, booking, reduced motion, noindex.');
})().catch(e=>{console.error(e);process.exit(1)});