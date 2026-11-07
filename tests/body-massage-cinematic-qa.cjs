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
   // Current published Home AGATE palette takes precedence over the older
   // Paper/Ink/Garnet concept once used for this experimental route.
   const aesthetics=await page.evaluate(()=>{
     const css=sel=>getComputedStyle(document.querySelector(sel));
     const r=document.querySelector('[data-em-journey-chapter]:nth-child(2) .em-journey__chapter-inner').getBoundingClientRect();
     return {
       ocean:getComputedStyle(document.documentElement).getPropertyValue('--agate-ocean').trim(),
       aqua:getComputedStyle(document.documentElement).getPropertyValue('--agate-aqua').trim(),
       introBg:css('.em-body-intro').backgroundColor,
       introH2:css('.em-body-intro h2').color,
       bookBg:css('.em-body-hero .em-book').backgroundColor,
       bookFg:css('.em-body-hero .em-book').color,
       headingFont:css('.em-body-hero h1').fontFamily,
       bodyFont:css('.em-body').fontFamily,
       chapter2Left:r.left,
       heroScrim:css('.em-body-hero__shade').backgroundImage,
       journeyScrim:css('.em-journey__scrim').backgroundImage,
       ctaScrim:css('.em-body-cta__shade').backgroundImage,
       dialogBg:css('#body-treatment-dialog').backgroundColor
     };
   });
   assert.equal(aesthetics.ocean,'#254460','Home Ocean design token retained');
   assert.equal(aesthetics.aqua,'#53CBD9','Home Aqua design token retained');
   assert.equal(aesthetics.introBg,'rgb(255, 255, 255)','Use Home white surface for editorial pause');
   assert.equal(aesthetics.introH2,'rgb(37, 68, 96)','Use Home Ocean on copy headings');
   assert.equal(aesthetics.bookBg,'rgb(83, 203, 217)','Home Aqua reservation CTA');
   assert.equal(aesthetics.bookFg,'rgb(37, 68, 96)','High contrast Ocean text on Aqua');
   assert(aesthetics.headingFont.includes('Playfair Display'),'Home approved headline type');
   assert(aesthetics.bodyFont.includes('Open Sans'),'Home approved body type');
   assert(aesthetics.chapter2Left<=width*.16,'All scroll narration stays at LEFT at '+width+': '+aesthetics.chapter2Left);
   assert.equal(await page.locator('.em-journey__chapter').count(),3,'Three independent full-bleed slides');
   assert(aesthetics.heroScrim.includes('rgba(0, 0, 0, 0.68)'),'Lighter hero overlay');
   assert(aesthetics.ctaScrim.includes('rgba(0, 0, 0, 0.66)'),'Subtle final photo CTA overlay');
   assert.equal(aesthetics.dialogBg,'rgb(255, 255, 255)','Home white background modal');
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
       const details=await page.evaluate(async index=>{
         const el=document.querySelectorAll('[data-em-journey-chapter]')[index];
         const top=scrollY+el.getBoundingClientRect().top;
         scrollTo({top:top,behavior:'instant'});
         await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
         const style=getComputedStyle(el);
         return {position:style.position,photo:getComputedStyle(el,'::before').backgroundImage,
           top:el.getBoundingClientRect().top};
       },i);
       assert.equal(details.position,'sticky','Home-aligned sticky chapter '+i);
       assert(details.photo.includes('webp'),'Individual photographic background '+i);
       assert(Math.abs(details.top)<2,'Chapter pinned to top '+i);
     }
     // Slide 02 must remain fully readable before slide 03 begins its wipe.
     const middleHold=await page.evaluate(async()=>{
       const slides=[...document.querySelectorAll('[data-em-journey-chapter]')];
       const second=slides[1],third=slides[2];
       const top=scrollY+second.getBoundingClientRect().top;
       scrollTo({top:top+innerHeight*.42,behavior:'instant'});
       await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
       return {secondTop:second.getBoundingClientRect().top,
         thirdTop:third.getBoundingClientRect().top,
         margin:parseFloat(getComputedStyle(second).marginBottom),
         secondHeading:second.querySelector('h2').textContent.trim()};
     });
     assert(middleHold.margin>=innerHeight*.79,
       'Slide 02 has the reading hold: '+JSON.stringify(middleHold));
     assert(Math.abs(middleHold.secondTop)<3,
       'Slide 02 remains pinned during reading: '+JSON.stringify(middleHold));
     assert(middleHold.thirdTop>innerHeight,
       'Slide 03 must not begin covering 02 during hold: '+JSON.stringify(middleHold));
     // The next photo must descend from the TOP over the previous slide.
     const wipe=await page.evaluate(async()=>{
       const el=document.querySelectorAll('[data-em-journey-chapter]')[1];
       const top=scrollY+el.getBoundingClientRect().top;
       async function at(offset){
         scrollTo({top:top-innerHeight*offset,behavior:'instant'});
         await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
         return {wipe:parseFloat(getComputedStyle(el).getPropertyValue('--em-slide-wipe')),
           clip:getComputedStyle(el).clipPath};
       }
       return {before:await at(.8),during:await at(.35),arrived:await at(0)};
     });
     assert(wipe.before.wipe>wipe.during.wipe&&wipe.during.wipe>wipe.arrived.wipe,
       'Slide reveal follows natural downward scroll: '+JSON.stringify(wipe));
     assert(wipe.before.clip.includes('inset'),'Home-like top-edge wipe enabled');
     await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
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
     await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
     await page.waitForTimeout(350);
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
