'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const widths=[375,390,430,768,1024,1440];
(async()=>{
  const browser=await chromium.launch({headless:true});
  const dir='qa-artifacts/home-closings';
  fs.mkdirSync(dir,{recursive:true});
  const report=[];
  try{
    for(const width of widths){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      const r=await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForTimeout(2200);
      assert.equal(r.status(),200);
      const snap=await page.evaluate(()=>{
        const sel=s=>document.querySelector(s);
        const img=s=>{const x=sel(s);return x?{loaded:x.complete&&x.naturalWidth>0,src:x.getAttribute('src'),width:x.naturalWidth,height:x.naturalHeight}:null};
        const hero=sel('#introduction'),grid=sel('#atrezzo-original-grid'),services=sel('#find-your-massage');
        const menu=sel('.menu-pause'),real=sel('.real-place--cinematic'),visit=sel('.visit--mapped');
        const map=sel('.visit__map-frame iframe');
        return {
          viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
          topUnchanged:!!hero&&!!grid&&!!services,
          heroHeading:sel('#intro-title')?.textContent,
          gridCount:document.querySelectorAll('.at-grid__item').length,
          slideCount:document.querySelectorAll('#cinema-track .chapter').length,
          menu:!!menu,real:!!real,visit:!!visit,
          oldPrice:!!sel('.price-editorial'),menuH2:sel('#menu-pause-heading')?.textContent?.trim(),
          menuLink:sel('.menu-pause__cta')?.getAttribute('href'),
          menuImage:img('.menu-pause__photo img'),
          realImage:img('.real-place__scene img'),
          galleryLink:sel('.real-place__action[href="./gallery/"]')?.getAttribute('href'),
          aboutLink:sel('.real-place__action[href="./about/"]')?.getAttribute('href'),
          mapSrc:map?.getAttribute('src'),mapTitle:map?.getAttribute('title'),
          mapLoading:map?.getAttribute('loading'),
          mapHeight:sel('.visit__map-frame')?.getBoundingClientRect().height,
          booking:sel('.visit__book')?.href,
          address:sel('.visit--mapped address')?.textContent,
          noindex:sel('meta[name="robots"]')?.content?.includes('noindex'),
          newCSS:!!sel('link[href$="home-closings-2026.css"]'),
          newScript:!!sel('script[src$="home-closings-2026.js"]'),
          note:sel('.real-place__source')?.textContent,
          siteSections:[...document.querySelectorAll('main > section')].map(x=>x.id),
          usesOtherScene:[...document.querySelectorAll('.at-grid__image,.chapter__image img')].some(x=>x.getAttribute('src')===sel('.menu-pause__photo img')?.getAttribute('src'))
        };
      });
      assert(snap.topUnchanged&&snap.heroHeading.includes('Touch'),'Hero missing/changed');
      assert.equal(snap.gridCount,12,'Sticky Grid must remain 12 photos');
      assert.equal(snap.slideCount,5,'Five slides must remain');
      assert.equal(snap.oldPrice,false,'Old oversized price table removed');
      assert(snap.menu&&snap.real&&snap.visit,'All 3 approved Home sections must exist');
      assert(snap.menuH2.includes('Your time.')&&snap.menuH2.includes('Your choice.'),'Menu title');
      assert.equal(snap.menuLink,'./massage-menu/');
      assert(snap.menuImage.loaded&&snap.realImage.loaded,'Both existing photographic files must load');
      assert(!snap.usesOtherScene,'Menu photo must be unique versus Sticky Grid and slides');
      assert.equal(snap.galleryLink,'./gallery/');assert.equal(snap.aboutLink,'./about/');
      assert(snap.mapSrc?.startsWith('https://www.google.com/maps?'),'Real Google Maps embed URL');
      assert(snap.mapSrc.includes('output=embed'),'Real Google Maps embed mode');
      assert(snap.mapTitle.includes('Elegant Massage'),'Accessible map title');
      assert.equal(snap.mapLoading,'lazy','Lazy load third-party iframe');
      assert(snap.mapHeight>=300,'Map must be substantial and readable');
      assert(snap.booking.startsWith('https://elegantmassage.setmore.com/#services'),'Verified booking destination');
      assert(snap.address.includes('2911 Cross Timbers'),'Verified address preserved');
      assert(snap.newCSS&&snap.newScript,'Scoped styles and behavior must load');
      assert(snap.note.includes('date unverified'),'Historical photo qualification');
      assert(snap.noindex,'Demo noindex required');
      assert(snap.scrollWidth<=width+2,`Horizontal overflow at ${width}: ${snap.scrollWidth}`);
      for(const [id,name] of [['.menu-pause','menu'],['.real-place--cinematic','real'],['.visit--mapped','visit']]){
        await page.locator(id).scrollIntoViewIfNeeded();
        await page.waitForTimeout(850);
        const rect=await page.locator(id).evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height};});
        assert(rect.width<=width+2&&rect.height>300,`${width} ${name} invalid dimensions: ${JSON.stringify(rect)}`);
        if(width===375||width===390||width===768||width===1440)
          await page.locator(id).screenshot({path:path.join(dir,`${width}-${name}.png`),animations:'disabled',timeout:30000});
      }
      assert(!errors.length,`Browser errors at ${width}: ${errors.join(' | ')}`);
      report.push({width,...snap,errors});
      await page.close();
    }
    const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    await reduced.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
    const staticTransforms=await reduced.evaluate(()=>[
      getComputedStyle(document.querySelector('.menu-pause__photo img')).transform,
      getComputedStyle(document.querySelector('.real-place__scene img')).transform
    ]);
    assert(staticTransforms.every(t=>t==='none'),'Reduced motion must remove new zoom: '+JSON.stringify(staticTransforms));
    await reduced.close();
    fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify(report,null,2));
    console.log('Closing sections PASS: six widths, photo files, layout, menu CTA, historic location, real Google Maps, noindex and reduced motion.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
