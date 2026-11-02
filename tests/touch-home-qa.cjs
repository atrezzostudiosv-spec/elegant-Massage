'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:8765/';
const widths=[375,390,430,768,1024,1440];
const folder=path.join(process.cwd(),'qa-artifacts','touch-home');
fs.mkdirSync(folder,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const records=[];
 for(const width of widths){
  const isMobile=width<=860;
  const page=await browser.newPage({viewport:{width,height:width<500?844:900},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(400);
  console.log(`Inspecting ${width}px`);
  const info=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth>innerWidth,
   index:document.querySelector('meta[name="robots"]')?.content,
   header:getComputedStyle(document.querySelector('.glass-header')).backdropFilter,
   headerBackground:getComputedStyle(document.querySelector('.glass-header')).backgroundColor,
   h1:document.querySelectorAll('h1').length,
   sections:[...document.querySelectorAll('main > section')].map(e=>e.id),
   chapterCount:document.querySelectorAll('article.chapter').length,
   bookingLinks:[...document.querySelectorAll('a[href*="setmore.com"]')].map(a=>a.href),
   position:getComputedStyle(document.querySelector('.chapter')).position,
   jpgCount:document.querySelectorAll('.real-place__photo img').length
  }));
  assert.equal(info.overflow,false,`${width}px: horizontal overflow`);
  assert.match(info.index,/noindex/);
  assert.notEqual(info.header,'none',`${width}px: backdrop filter missing`);
  assert.equal(info.h1,1);
  assert.deepEqual(info.sections,['introduction','find-your-massage','time-and-price','the-real-elegant-massage','visit-us']);
  assert.equal(info.chapterCount,5);
  assert.equal(info.jpgCount,3);
  assert.ok(info.bookingLinks.length>=8);
  assert.ok(info.bookingLinks.every(v=>v==='https://elegantmassage.setmore.com/#services'));
  if(width<=700) assert.equal(info.position,'relative'); else assert.equal(info.position,'sticky');
  if(isMobile){
   await page.locator('#menu-toggle').click();
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('#main-nav').getAttribute('data-open'),'true');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
  }
  await page.screenshot({path:path.join(folder,`header-${width}.png`),animations:'disabled',timeout:15000});
  await page.locator('#chapter-selector').selectOption('four-hands');
  await page.waitForTimeout(1000);
  assert.equal(new URL(page.url()).hash,'#four-hands');
  assert.equal(await page.locator('.chapter').count(),5);
  const images=await page.evaluate(async()=>{
    const arr=[...document.querySelectorAll('.chapter__image img,.real-place__photo img')];
    return Promise.all(arr.map(i => new Promise(resolve => {
      let done=false;
      const finish=()=>{if(done)return;done=true;resolve({url:i.currentSrc,ok:i.naturalWidth>0});};
      i.addEventListener('load',finish,{once:true});
      i.addEventListener('error',finish,{once:true});
      i.loading='eager';
      if(i.complete)finish(); else setTimeout(finish,8000);
    })));
  });
  assert.ok(images.every(x=>x.ok),`${width}px image failed: ${JSON.stringify(images.filter(x=>!x.ok))}`);
  if (width === 390 || width === 1440) {
    for (const id of ['body-massage','couples-massage','time-and-price','the-real-elegant-massage','visit-us']) {
      await page.locator('#'+id).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
      await page.waitForTimeout(120);
      await page.screenshot({path:path.join(folder,`${id}-${width}.png`),animations:'disabled',timeout:15000});
    }
  }
  assert.deepEqual(errors,[],`${width}px JS errors`);
  records.push({width,...info,decodedImages:images.length,jsErrors:errors.length});
  await page.close();
 }
 const reducedPage=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await reducedPage.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(await reducedPage.locator('.chapter').first.evaluate(e=>getComputedStyle(e).position),'relative');
 assert.equal(await reducedPage.locator('#intro-film').evaluate(e=>e.paused),true);
 await reducedPage.close();
 await browser.close();
 fs.writeFileSync(path.join(folder,'results.json'),JSON.stringify({passed:true,records},null,2));
 console.log(`PASS: ${widths.length} viewports, menu, navigation, 8 images, native scroll & reduced motion`);
})().catch(e=>{console.error(e);process.exitCode=1});