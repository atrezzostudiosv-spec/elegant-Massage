'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const url='http://127.0.0.1:8765/massage-services/body-massage/';
const widths=[375,390,768,870,871,1024,1440];
const output='qa-artifacts/body-cinematic-scroll';
fs.mkdirSync(output,{recursive:true});
async function place(page,selector){
  return await page.evaluate(sel=>{
    const el=document.querySelector(sel);
    const r=el.getBoundingClientRect();
    scrollTo({top:scrollY+r.top+(r.height-innerHeight)/2,behavior:'instant'});
  },selector);
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const report=[];
 try{
  for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const res=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(res.status(),200,'Body page loads at '+width);
   await page.waitForTimeout(220);
   const state=await page.evaluate(()=>({
     horizontal:document.documentElement.scrollWidth,
     title:document.querySelector('h1')?.textContent.replace(/\s+/g,' ').trim(),
     h1Count:document.querySelectorAll('h1').length,
     chapterCount:document.querySelectorAll('[data-em-journey-chapter]').length,
     backgrounds:document.querySelectorAll('[data-em-journey-photo]').length,
     introSideImage:!!document.querySelector('.em-body-intro img,.em-body-intro .scene'),
     css:[...document.styleSheets].some(x=>x.href?.includes('body-massage-cinematic-2026.css')),
     noindex:document.querySelector('meta[name=robots]')?.content,
     navCount:document.querySelectorAll('nav[aria-label="Primary navigation"] .treatments-menu__link').length,
     closeHeight:document.querySelector('.em-body-cta').getBoundingClientRect().height,
     dockCount:document.querySelectorAll('.em-mobile-booking').length
   }));
   assert(state.horizontal<=width+2,'No horizontal overflow at '+width+': '+state.horizontal);
   assert.equal(state.h1Count,1,'One H1');
   assert.equal(state.title,'Body Massage, Your Way.','Original semantic title');
   assert.equal(state.chapterCount,3,'Three photo scenes');
   assert.equal(state.backgrounds,3,'Three separate photographs');
   assert(!state.introSideImage,'No forbidden intro image/text split');
   assert(state.css,'Cinematic CSS loads');
   assert(state.noindex?.includes('noindex'),'Demo must remain noindex');
   assert.equal(state.navCount,5,'Approved five Treatments nav links');
   assert(state.dockCount===1,'No duplicate mobile dock');
   assert(await page.locator('.em-body-hero__image').isVisible(),'Full background hero');
   for(const img of await page.locator('.em-body img').all()){
     const src=await img.getAttribute('src');
     if(src){
      const dest=new URL(src,url).href;
      assert.equal((await page.request.get(dest)).status(),200,'Image must load: '+src);
     }
   }
   const session=page.locator('[data-em-detail="pressure"]');
   await session.click();
   const dialog=page.locator('#body-treatment-dialog');
   assert(await dialog.evaluate(x=>x.open),'Native modal opens');
   assert(await page.locator('#body-dialog-title').isVisible(),'Dialog title visible');
   assert((await dialog.textContent()).includes('Previously listed appointment lengths'),'Duration provenance clear');
   assert((await dialog.textContent()).includes('live booking schedule'),'No unverified current price');
   assert.equal(await dialog.locator('.em-body-modal__book').getAttribute('href'),
      'https://elegantmassage.setmore.com/#services','Booking URL unchanged');
   await page.keyboard.press('Escape');
   assert(!(await dialog.evaluate(x=>x.open)),'Modal closes on Escape');
   assert(await session.evaluate(el=>el===document.activeElement),'Modal focus restored to opener');
   await page.locator('[data-em-detail="oil"]').click();
   assert.equal((await page.locator('#body-dialog-title').innerText()).trim(),'Swedish & Warm Oil','Modal changes content');
   await page.locator('[data-em-close-dialog]').click();
   assert(!(await dialog.evaluate(x=>x.open)),'Close button works');
   if(width>870){
     for(let i=0;i<3;i++){
       await place(page,'[data-em-journey-chapter]:nth-child('+(i+1)+')');
       await page.waitForTimeout(150);
       const selected=await page.locator('[data-em-journey-photo].is-active').count();
       assert.equal(selected,1,'Exactly one photo active '+i);
       const photoIdx=await page.locator('[data-em-journey-photo]').evaluateAll(n=>n.findIndex(x=>x.classList.contains('is-active')));
       assert.equal(photoIdx,i,'Photo synchronized to chapter '+i+' width '+width);
     }
     await place(page,'[data-em-journey-chapter]:first-child');
     await page.waitForTimeout(150);
     assert.equal(await page.locator('[data-em-journey-photo]').evaluateAll(n=>n.findIndex(x=>x.classList.contains('is-active'))),0,'Reverse scroll resets image');
     const scale=await page.evaluate(async()=>{
       const cta=document.querySelector('[data-em-body-cta]');
       const top=cta.getBoundingClientRect().top+scrollY;
       scrollTo({top:top,behavior:'instant'});
       await new Promise(r=>setTimeout(r,130));
       const first=parseFloat(getComputedStyle(document.querySelector('.em-body-cta__photo')).getPropertyValue('--em-body-cta-zoom')||'1.025');
       scrollTo({top:top+innerHeight*.7,behavior:'instant'});
       await new Promise(r=>setTimeout(r,130));
       const last=parseFloat(getComputedStyle(document.querySelector('.em-body-cta__photo')).getPropertyValue('--em-body-cta-zoom')||'1.025');
       return {first,last};
     });
     assert(scale.last>scale.first+.03,'CTA zoom tracks scroll '+JSON.stringify(scale));
     await page.locator('.site-header .treatments-menu summary').hover();
     assert(await page.locator('.site-header .treatments-menu').evaluate(x=>x.open),'Header hover remains working at '+width);
     await page.locator('.site-header .treatments-menu__link').last().hover();
     assert(await page.locator('.site-header .treatments-menu').evaluate(x=>x.open),'Hover survives travel to submenu');
   }else{
     assert(await page.locator('.em-journey__chapter').first().isVisible(),'Mobile full bleed chapter accessible');
     const first=await page.locator('.em-journey__chapter').first().evaluate(x=>getComputedStyle(x,'::before').backgroundImage);
     assert(first.includes('webp'),'Mobile background photography present');
     const menu=page.locator('.site-header .toggle');
     await menu.click();
     await page.locator('.site-header .treatments-menu summary').click();
     assert(await page.locator('.site-header .treatments-menu').evaluate(x=>x.open),'Mobile treatment accordion opens');
     await page.keyboard.press('Escape');
     assert(!(await page.locator('.site-header .treatments-menu').evaluate(x=>x.open)),'Accordion closes on Escape');
   }
   if([375,768,1024,1440].includes(width)){
     await page.goto(url,{waitUntil:'domcontentloaded'});
     await page.screenshot({path:path.join(output,'body-massage-'+width+'.png'),fullPage:true,animations:'disabled'});
     if(width===1440) {
       await place(page,'[data-em-journey-chapter]:nth-child(2)');
       await page.waitForTimeout(1200);
       await page.screenshot({path:path.join(output,'body-massage-1440-scroll-middle.png'),animations:'disabled'});
       await page.locator('[data-em-detail="oil"]').click();
       await page.screenshot({path:path.join(output,'body-massage-1440-dialog.png'),animations:'disabled'});
     }
   }
   assert.deepEqual(errors,[],'No JS page errors '+width);
   report.push({width,status:'PASS'});
   await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await reduced.goto(url,{waitUntil:'domcontentloaded'});
  await reduced.evaluate(()=>scrollTo(0,document.querySelector('.em-body-cta').getBoundingClientRect().top+scrollY+450));
  await reduced.waitForTimeout(100);
  const t=await reduced.locator('.em-body-cta__photo').evaluate(x=>getComputedStyle(x).transform);
  assert(t==='none'||t.startsWith('matrix(1,'),'Reduced motion keeps CTA without zoom: '+t);
  await reduced.close();
  const withoutJS=await browser.newContext({viewport:{width:375,height:900},javaScriptEnabled:false});
  const noJS=await withoutJS.newPage();
  await noJS.goto(url,{waitUntil:'domcontentloaded'});
  assert(await noJS.locator('.em-body-hero h1').isVisible(),'NoJS hero text visible');
  assert(await noJS.locator('[data-em-detail="pressure"]').getAttribute('href')==='https://elegantmassage.setmore.com/#services','NoJS service links retain functional fallback');
  await withoutJS.close();
 }finally{await browser.close()}
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
 console.log('BODY CINEMATIC QA PASS: '+report.length+' widths, scroll scenes, reverse scroll, native modal, CTA zoom, reduced motion, noJS fallback, approved nav, noindex.');
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
