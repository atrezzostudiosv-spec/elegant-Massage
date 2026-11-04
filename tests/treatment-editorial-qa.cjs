'use strict';
/* Focused treatment-page regression. Run from repository root with the local
   server on http://127.0.0.1:8765; no JS-driven artificial scroll. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const base='http://127.0.0.1:8765';
const pages=[
 ['body-massage','body','Body Massage, Your Way.'],
 ['combination-massage','combo','Foot & Back. One Combination Massage.'],
 ['couples-massage','couples','A Couples Massage to Share.'],
 ['chair-massage','chair','Chair Massage. Time to Unwind.'],
 ['four-hands-massage','four','Four Hands. One Massage Experience.']
];
const widths=[375,390,430,768,870,871,1024,1440];
const out='qa-artifacts/treatment-pages-2026';
fs.mkdirSync(out,{recursive:true});

(async()=>{
 const browser=await chromium.launch({headless:true});
 const report=[];
 try{
  for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   for(const [slug,key,title] of pages){
    const url='/massage-services/'+slug+'/';
    const r=await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(r.status(),200,'HTTP 200 '+url);
    await page.locator('.treatment-main .treatment-close').waitFor();
    const state=await page.evaluate(()=>{
     const rect=s=>{const r=document.querySelector(s)?.getBoundingClientRect();
       return r?{width:r.width,left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null};
     const css=s=>getComputedStyle(document.querySelector(s));
     return {
      width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      bodyClass:document.body.className,
      heading:document.querySelector('.treatment-main h1')?.textContent.replace(/\s+/g,' ').trim(),
      h1Count:document.querySelectorAll('h1').length,
      headings:document.querySelectorAll('.treatment-main h2').length,
      articles:document.querySelectorAll('.treatment-guide article').length,
      heroImage:css('.treatment-hero .hero__background').backgroundImage,
      detailImage:css('.treatment-intro .scene--portrait').backgroundImage,
      contentWidth:rect('.treatment-hero__discover'),
      introWidth:rect('.treatment-intro .container'),
      panelWidth:rect('.treatment-guide .container'),
      paper:css('.treatment-intro').backgroundColor,
      bodyFont:css('.treatment-main').fontFamily,
      headingFont:css('.treatment-main h1').fontFamily,
      mainStyle:[...document.styleSheets].some(s=>s.href?.includes('treatments-editorial-2026.css')),
      robots:document.querySelector('meta[name=robots]')?.content,
      book:[...document.querySelectorAll('.treatment-main .actions a')].filter(a=>a.textContent.toLowerCase().includes('book')||a.textContent.includes('Appointments')).map(a=>a.href),
      navCount:document.querySelectorAll('nav[aria-label="Primary navigation"] .treatments-menu__link').length
     };
    });
    assert(state.mainStyle,slug+' new stylesheet loads');
    assert(state.bodyClass.includes('treatment-detail'),slug+' editorial body class');
    assert.equal(state.heading,title,slug+' original facts/text preserved in H1');
    assert.equal(state.h1Count,1,slug+' exactly one H1');
    assert(state.headings>=3&&state.articles>=3,slug+' genuine explanatory material remains');
    assert(state.scrollWidth<=width+2,slug+' no horizontal document overflow at '+width+' '+state.scrollWidth);
    assert(state.heroImage.includes('.webp'),slug+' hero uses photo');
    assert(state.detailImage.includes('.webp'),slug+' editorial scene uses photo');
    assert(state.bodyFont.includes('DM Sans'),slug+' matches home body typography');
    assert(state.headingFont.includes('Instrument Serif'),slug+' matches home heading typography');
    assert(state.robots?.includes('noindex'),slug+' demo remains noindex');
    assert(state.book.length>=2&&state.book.every(x=>x.startsWith('https://elegantmassage.setmore.com/')),slug+' all booking CTAs remain Setmore');
    assert.equal(state.navCount,5,slug+' five treatments available in navigation');
    const allImages=[state.heroImage,state.detailImage].flatMap(x=>[...x.matchAll(/url\(["']?([^"')]+)/g)].map(m=>m[1]));
    for(const url of allImages){
     const absolute=new URL(url,base+'/massage-services/'+slug+'/').href;
     const response=await page.request.get(absolute);
     assert.equal(response.status(),200,slug+' photographic resource must load '+url);
     assert(Number(response.headers()['content-length']||1)>0,slug+' image nonempty '+url);
    }
    await page.locator('.treatment-hero__discover').click();
    await page.waitForTimeout(100);
    const target=await page.evaluate(()=>Math.abs(document.querySelector('#treatment-intro').getBoundingClientRect().top));
    assert(target<Math.max(300,innerHeight*.55),slug+' intro anchor is usable '+target);
    await page.evaluate(()=>scrollTo(0,0));
    if(width<=870){
      const menu=page.locator('.site-header .toggle');
      await menu.click();
      const details=page.locator('.site-header .treatments-menu');
      await details.locator('summary').click();
      assert(await details.evaluate(x=>x.open),slug+' nested mobile treatments open');
      await page.keyboard.press('Escape');
      assert(!(await details.evaluate(x=>x.open)),slug+' nested mobile closes on Escape');
    }else{
      const details=page.locator('.site-header .treatments-menu');
      await details.locator('summary').hover();
      assert(await details.evaluate(x=>x.open),slug+' desktop Treatments hover remains');
      const last=details.locator('.treatments-menu__link').last();
      await last.hover();
      assert(await details.evaluate(x=>x.open),slug+' hover continuation remains');
      await page.mouse.move(5,500);
    }
    if([375,768,1440].includes(width)){
      await page.screenshot({path:path.join(out,slug+'-'+width+'.png'),fullPage:true,animations:'disabled'});
    }
    report.push({slug,width,success:true,hero:state.heroImage,detail:state.detailImage});
   }
   assert.deepEqual(errors,[],'No uncaught page errors at '+width);
   await page.close();
  }
 }finally{await browser.close()}
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
 console.log('TREATMENT EDITORIAL PASS: '+report.length+' treatment/viewport checks, photo URLs, booking, five-link hover/menu, anchors, noindex and zero overflow.');
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
