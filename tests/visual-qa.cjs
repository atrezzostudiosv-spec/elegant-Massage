const { chromium } = require('playwright');
const fs=require('fs');
const path=require('path');
const BASE='http://127.0.0.1:8765';
const out=path.join(process.cwd(),'qa-artifacts');
fs.mkdirSync(out,{recursive:true});
const routes=['/','/massage-services/','/massage-services/body-massage/','/massage-services/foot-reflexology/','/massage-services/combination-massage/','/massage-services/chair-massage/','/massage-services/couples-massage/','/massage-services/four-hands-massage/','/massage-services/specialty-techniques/','/massage-menu/','/about/','/gallery/','/contact/'];
const widths=[375,768,1024,1440];
const failures=[],results=[];
const assert=(ok,msg)=>{if(!ok)failures.push(msg)};
const browserPromise=chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
(async()=>{
 const browser=await browserPromise;
 try{
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:width===375?812:900},deviceScaleFactor:1, reducedMotion:'no-preference'});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.locator('h1').waitFor();
   await page.waitForFunction(()=>{const v=document.querySelector('#hero-film');return !!v&&(v.readyState>=2||!!v.error)},{},{timeout:8000}).catch(()=>{}); await page.waitForTimeout(180);
   const summary=await page.evaluate(()=>({
    width:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth,
    h1:document.querySelector('h1')?.textContent?.trim(),
    titleVisible:(()=>{const b=document.querySelector('h1')?.getBoundingClientRect();return !!b&&b.width>0&&b.left>=-4&&b.right<=innerWidth+4})(),
    heroHeight:Math.round(document.querySelector('.hero')?.getBoundingClientRect().height||0),
    video: (()=>{const v=document.querySelector('#hero-film');return {src:v?.currentSrc,hidden:v?.hidden,readyState:v?.readyState,networkState:v?.networkState,error:v?.error?.message||null}})(),
    bookingHref:document.querySelector('.header-cta')?.getAttribute('href'),
    imageBackground:getComputedStyle(document.querySelector('.hero__background')).backgroundImage
   }));
   assert(response.status()===200,width+': home HTTP '+response.status());
   assert(summary.body<=width+2&&summary.html<=width+2,width+': horizontal overflow body='+summary.body+', html='+summary.html);
   assert(summary.titleVisible,width+': clipped H1');
   assert(summary.bookingHref==='https://elegantmassage.setmore.com/',width+': altered booking link');
   assert(!summary.video.hidden&&summary.video.readyState>=2&&!summary.video.error,width+': cinematic video not playing: '+JSON.stringify(summary.video));
   assert(summary.imageBackground.includes(width<=640?'elegant-massage-cinematic-hero-mobile-atrezzo.webp':'elegant-massage-cinematic-hero-atrezzo.webp'),width+': missing responsive Atrezzo hero poster');
   if(width<=768){
     const toggle=page.locator('button.toggle');await toggle.click();await page.waitForTimeout(150);
     assert(await page.locator('.navigation').isVisible(),width+': mobile navigation not visible after toggle');
     await page.locator('.navigation summary').click();
     assert(await page.locator('.dropdown a').first().isVisible(),width+': dropdown menu hidden');
     await page.keyboard.press('Escape');
     assert(!(await page.locator('.navigation').isVisible()),width+': Escape failed to close mobile navigation');
   }
   await page.screenshot({path:path.join(out,'home-'+width+'-hero.png'),animations:'disabled'});
   const section=page.locator('.sensory').first();await section.scrollIntoViewIfNeeded();await page.waitForTimeout(550);
   await page.screenshot({path:path.join(out,'home-'+width+'-sensory.png'),animations:'disabled'});
   await page.screenshot({path:path.join(out,'home-'+width+'-full.png'),fullPage:true,animations:'disabled'});
   assert(errors.length===0,width+': JS errors '+errors.join(' | '));
   results.push({width,...summary,errors});
   await context.close();
  }
  const context=await browser.newContext({viewport:{width:1360,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  const reduced=await page.evaluate(()=>({videoHidden:document.querySelector('#hero-film').hidden,htmlWidth:document.documentElement.scrollWidth,winWidth:innerWidth,opacity:getComputedStyle(document.querySelector('.intro .reveal')).opacity}));
  assert(reduced.videoHidden,'reduced motion should disable autoplay film');
  assert(reduced.opacity==='1','reduced motion should keep reveal content visible');
  results.push({reducedMotion:reduced});
  for(const route of routes){
    const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded'});
    const data=await page.evaluate(()=>({h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length,robots:document.querySelector('meta[name=robots]')?.content,desc:document.querySelector('meta[name=description]')?.content,book:[...document.querySelectorAll('a[href*=setmore]')].length}));
    assert(response?.status()===200,route+': HTTP not 200');
    assert(data.h1===1&&data.main===1,route+': missing H1 or main');
    assert(data.robots?.includes('noindex'),route+': indexable demo');
    assert(!!data.desc,route+': missing description');
    assert(data.book>0,route+': no Setmore CTA');
    results.push({route,status:response?.status(),...data});
  }
  await page.goto(BASE+'/contact/',{waitUntil:'domcontentloaded'});
  const form=page.locator('form.contact-form');
  assert(await form.count()===1,'contact form missing');
  assert(await form.getAttribute('action')==='https://formsubmit.co/atrezzostudiosv@gmail.com','contact test recipient changed');
  assert(!(await form.evaluate(el=>el.checkValidity())),'empty contact form should fail validation');
  await context.close();
 }finally{await browser.close()}
 fs.writeFileSync(path.join(out,'qa-report.json'),JSON.stringify({passed:failures.length===0,failures,results},null,2));
 console.log(JSON.stringify({passed:failures.length===0,failures,viewportSummaries:results.filter(x=>x.width)},null,2));
 if(failures.length)process.exitCode=1;
})().catch(err=>{console.error(err);process.exitCode=1});