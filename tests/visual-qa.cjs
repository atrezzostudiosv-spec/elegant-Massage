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
   // Trigger actual IntersectionObserver reveals through normal scrolling before a full-page screenshot.
   const totalHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
   for(let y=0;y<totalHeight;y+=Math.max(300,Math.round(width*.55))){
     await page.evaluate(y=>window.scrollTo({top:y,behavior:"instant"}),y);
     await page.waitForTimeout(55);
   }
   await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
   await page.waitForTimeout(1000);
   const unrevealed=await page.locator('.reveal:not(.visible)').count();
   const hiddenLabels=await page.locator('.reveal:not(.visible)').evaluateAll(xs=>xs.map(el=>el.textContent.trim().slice(0,65)));
   assert(unrevealed<=1,width+': unrevealed text after natural scroll: '+unrevealed+' '+JSON.stringify(hiddenLabels));
   await page.screenshot({path:path.join(out,'home-'+width+'-full.png'),fullPage:true,animations:'disabled'});
   assert(errors.length===0,width+': JS errors '+errors.join(' | '));
   results.push({width,...summary,errors});
   await context.close();
  }
  const context=await browser.newContext({viewport:{width:1360,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  const reduced=await page.evaluate(()=>({videoHidden:document.querySelector('#hero-film').hidden,htmlWidth:document.documentElement.scrollWidth,winWidth:innerWidth,opacity:getComputedStyle(document.querySelector('.atrezzo-opening .reveal')).opacity}));
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
  // Phase 4: service-photo art direction—test four widths and both hero / detail.
  const photographicRoutes=[
    {route:'/massage-services/foot-reflexology/',name:'foot-reflexology',stem:'elegant-massage-foot-reflexology-editorial'},
    {route:'/massage-services/couples-massage/',name:'couples',stem:'elegant-massage-couples-batch02'},
    {route:'/massage-services/four-hands-massage/',name:'four-hands',stem:'elegant-massage-four-hands-batch02'},
    {route:'/massage-services/combination-massage/',name:'combination',stem:'elegant-massage-combination-batch02'}
  ];
  for(const width of widths){
    const photosCtx=await browser.newContext({viewport:{width,height:width===375?812:900},reducedMotion:'reduce'});
    const photosPage=await photosCtx.newPage();
    for(const record of photographicRoutes){
      const response=await photosPage.goto(BASE+record.route,{waitUntil:'networkidle'});
      assert(response?.status()===200,record.route+': photographic page HTTP error '+width);
      const observed=await photosPage.evaluate(async ({stem,mobile})=>{
        const hero=document.querySelector('.hero__background');
        const detail=document.querySelector('.scene--detail.scene--portrait');
        const cssValue=el=>getComputedStyle(el).backgroundImage;
        const heroCss=cssValue(hero),detailCss=cssValue(detail);
        async function decodeBackground(urlCss){
          const m=urlCss.match(/url\(["']?(.*?)["']?\)/);
          if(!m)return {ok:false,error:'background URL absent'};
          const url=m[1];
          const result=await new Promise(resolve=>{
            const img=new Image();img.onload=()=>resolve({ok:true,width:img.naturalWidth,height:img.naturalHeight,url});
            img.onerror=()=>resolve({ok:false,error:'image failed to decode',url});img.src=url;
          });
          return result;
        }
        return {heroCss,detailCss,hero:await decodeBackground(heroCss),
          detail:await decodeBackground(detailCss),
          bodyWidth:document.body.scrollWidth,viewportWidth:innerWidth,
          photoAlt:detail.getAttribute('aria-label'),book:document.querySelector('.header-cta')?.getAttribute('href')};
      },{stem:record.stem,mobile:width<=640});
      const heroExpected=record.stem+'-'+(width<=640?'mobile':'desktop')+'.webp';
      const detailExpected=record.stem+'-mobile.webp';
      assert(observed.heroCss.includes(heroExpected),record.route+': incorrect hero crop '+width+' '+observed.heroCss);
      assert(observed.detailCss.includes(detailExpected),record.route+': incorrect detail crop '+width);
      assert(observed.hero.ok&&observed.hero.width===(width<=640?900:1600),record.route+': hero failed to decode '+width+' '+JSON.stringify(observed.hero));
      assert(observed.detail.ok&&observed.detail.width===900,record.route+': detail failed to decode '+width);
      assert(observed.bodyWidth<=width+2,record.route+': overflow at '+width+' body='+observed.bodyWidth);
      assert(observed.book==='https://elegantmassage.setmore.com/',record.route+': changed booking target');
      assert(observed.photoAlt?.startsWith('Illustrative '),record.route+': missing stock illustration label');
      await photosPage.locator('.hero').screenshot({path:path.join(out,'phase04-'+record.name+'-'+width+'-hero.png'),animations:'disabled'});
      await photosPage.locator('.scene--detail.scene--portrait').first().screenshot({path:path.join(out,'phase04-'+record.name+'-'+width+'-detail.png'),animations:'disabled'});
      results.push({photoRoute:record.route,viewport:width,...observed});
    }
    await photosCtx.close();
  }

  // Editorial V3 regression: inspect every route at all required responsive widths.
  for(const width of widths){
    const ctx=await browser.newContext({viewport:{width,height:width===375?812:900},reducedMotion:'reduce'});
    const p=await ctx.newPage();
    for(const route of routes){
      const response=await p.goto(BASE+route,{waitUntil:'domcontentloaded'});
      const data=await p.evaluate(()=>({
        width:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth,
        h1:(()=>{const r=document.querySelector('h1')?.getBoundingClientRect();return r?{left:r.left,right:r.right}:null})(),
        editorialCss:[...document.styleSheets].some(x=>x.href?.includes('atrezzo-editorial-v3.css')),
        booking:document.querySelector('.header-cta')?.getAttribute('href'),
        sticky:(()=>{const e=document.querySelector('.em-mobile-booking');return e?{display:getComputedStyle(e).display,url:e.href}:null})()
      }));
      assert(response?.status()===200,route+': HTTP '+response?.status()+' @'+width);
      assert(data.editorialCss,route+': editorial CSS absent @'+width);
      assert(data.body<=width+2&&data.html<=width+2,route+': horizontal overflow @'+width+' '+data.body+'/'+data.html);
      assert(data.h1&&data.h1.left>=-5&&data.h1.right<=width+5,route+': H1 clipped @'+width);
      assert(data.booking==='https://elegantmassage.setmore.com/',route+': Setmore booking changed');
      if(width<=720)assert(data.sticky?.display!=='none'&&data.sticky?.url==='https://elegantmassage.setmore.com/',route+': mobile booking bar missing');
      if(['/', '/massage-services/body-massage/', '/gallery/', '/contact/'].includes(route)){
        await p.locator('.hero').screenshot({
          path:path.join(out,'editorial-v3-'+(route==='/'?'home':route.split('/').filter(Boolean).join('-'))+'-'+width+'.png'),
          animations:'disabled'
        });
      }
      results.push({editorialRoute:route,viewport:width,...data});
    }
    await ctx.close();
  }
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  const story=await page.evaluate(()=>({
    featured:document.querySelectorAll('.em-treatment-feature').length,
    secondary:document.querySelectorAll('.em-other-treatment').length,
    scenes:document.querySelectorAll('.em-ritual .sensory-panel').length,
    faq:document.querySelectorAll('.em-practical details').length,
    realPlace:!!document.querySelector('.em-place__photograph'),
    oldRows:document.querySelectorAll('.service-row').length
  }));
  assert(story.featured===3&&story.secondary===3&&story.scenes===3&&story.faq===3&&story.realPlace&&story.oldRows===0,
    'New editorial structure incomplete: '+JSON.stringify(story));
  for(const route of [
    '/massage-services/body-massage/','/massage-services/foot-reflexology/',
    '/massage-services/combination-massage/','/massage-services/chair-massage/',
    '/massage-services/couples-massage/','/massage-services/four-hands-massage/',
    '/massage-services/specialty-techniques/'
  ]){
    await page.goto(BASE+route,{waitUntil:'domcontentloaded'});
    const links=await page.locator('footer a[href]').evaluateAll(xs=>xs.filter(x=>x.getAttribute('href').startsWith('..')).map(x=>new URL(x.getAttribute('href'),location.href).pathname));
    assert(links.includes('/massage-services/')&&links.includes('/about/')&&links.includes('/contact/'),
      route+': incorrect relative footer links: '+JSON.stringify(links));
  }
  results.push({editorialStory:story});
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