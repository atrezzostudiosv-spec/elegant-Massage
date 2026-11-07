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
          visitImage:img('.visit__backdrop img'),
          heroSkip:!!sel('.intro__skip'),
          footerCTA:!!sel('.em-footer__book'),
          realSticky:getComputedStyle(sel('.real-place__stage')).position,
          visitSticky:getComputedStyle(sel('.visit__stage')).position,
          realHeight:real?.getBoundingClientRect().height,
          visitHeight:visit?.getBoundingClientRect().height,
          primaryRadius:sel('.real-place__action--primary')?.getBoundingClientRect().height ?
             parseFloat(getComputedStyle(sel('.real-place__action--primary')).borderTopLeftRadius):0,
          visitBookBackground:getComputedStyle(sel('.visit__book')).backgroundColor,
          visitBookRadius:getComputedStyle(sel('.visit__book')).borderTopLeftRadius,
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
      assert(snap.menuImage&&snap.realImage&&snap.visitImage,
        'Menu, real storefront and Visit Us need all three distinct photographic nodes');
      assert(snap.realImage.src.includes('elegant-massage-flower-mound-exterior-editorial-2026.webp'),
        'The actual user-supplied exterior WebP must be used');
      assert(snap.visitImage.src.includes('elegant-massage-visit-floral-wellness-background-2026.webp'),
        'The actual user-supplied floral WebP must be used');
      assert(!snap.heroSkip&&!snap.footerCTA,'The two requested obsolete buttons must be gone');
      assert(snap.primaryRadius>=23,'Real place primary CTA must be a smoked-glass pill');
      assert(snap.visitBookBackground==='rgba(0, 0, 0, 0)'&&snap.visitBookRadius==='0px',
        'Book Now in Visit Us must be an underlined text link, not another capsule');
      if(width>=768){
        assert(snap.realSticky==='sticky'&&snap.visitSticky==='sticky',
          'Desktop final two photographic scenes must hold in native-scroll sticky stages');
        assert(snap.realHeight>=900*1.7&&snap.visitHeight>=900*1.7,
          'The two chapters must provide real scroll distance for reading, not just an animated speed change');
      }
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
      assert(snap.note.includes('Exterior illustration supplied'),
        'User-supplied illustrative exterior must not be misrepresented as historic documentary evidence');
      assert(snap.noindex,'Demo noindex required');
      assert(snap.scrollWidth<=width+2,`Horizontal overflow at ${width}: ${snap.scrollWidth}`);
      for(const [id,name] of [['.menu-pause','menu'],['.real-place--cinematic','real'],['.visit--mapped','visit']]){
        await page.locator(id).scrollIntoViewIfNeeded();
        await page.waitForTimeout(850);
        if(name==='menu'||name==='real'||name==='visit'){
          const imgSel=name==='menu'?'.menu-pause__photo img':name==='real'?'.real-place__scene img':'.visit__backdrop img';
          await page.waitForFunction(sel=>{
            const im=document.querySelector(sel);
            return !!im&&im.complete&&im.naturalWidth>0;
          },imgSel,{timeout:10000});
        }
        const rect=await page.locator(id).evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height};});
        assert(rect.width<=width+2&&rect.height>300,`${width} ${name} invalid dimensions: ${JSON.stringify(rect)}`);
        if(width===375||width===390||width===768||width===1440){
          const capture=name==='real'?'.real-place__stage':name==='visit'?'.visit__stage':id;
          await page.locator(capture).screenshot({
            path:path.join(dir,`${width}-${name}.png`),animations:'disabled',timeout:30000
          });
        }
      }
      assert(!errors.length,`Browser errors at ${width}: ${errors.join(' | ')}`);
      report.push({width,...snap,errors});
      await page.close();
    }
    // Verify all three photographic chapters zoom with native scroll; final
    // exterior & map backgrounds must zoom during their sticky reading hold.
    const motionPage=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    await motionPage.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
    await motionPage.waitForTimeout(2100);
    for(const [section,image,sticky] of [
      ['.menu-pause','.menu-pause__photo img',false],
      ['.real-place--cinematic','.real-place__scene img',true],
      ['.visit--mapped','.visit__backdrop img',true]
    ]){
      const box=await motionPage.evaluate(selector=>{
        const el=document.querySelector(selector),r=el.getBoundingClientRect();
        return {top:scrollY+r.top,height:r.height};
      },section);
      const scale=async y=>{
        await motionPage.evaluate(pos=>window.scrollTo(0,pos),y);
        await motionPage.waitForTimeout(1050);
        return motionPage.evaluate(sel=>{
          const css=getComputedStyle(document.querySelector(sel)).transform;
          const value=css.startsWith('matrix(')?Number(css.slice(7).split(',')[0]):1;
          return {css,value};
        },image);
      };
      const early=await scale(sticky?box.top+45:box.top-900+45);
      const late=await scale(sticky?box.top+box.height-900-45:box.top+box.height-65);
      assert(late.value>=early.value+.018,
        section+' requires observable scroll-driven photo zoom: '+JSON.stringify({early,late}));
      console.log('CLOSING-ZOOM '+section+' '+JSON.stringify({early,late}));
    }
    await motionPage.close();
    const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    await reduced.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
    const staticTransforms=await reduced.evaluate(()=>[
      getComputedStyle(document.querySelector('.menu-pause__photo img')).transform,
      getComputedStyle(document.querySelector('.real-place__scene img')).transform,
      getComputedStyle(document.querySelector('.visit__backdrop img')).transform
    ]);
    assert(staticTransforms.every(t=>t==='none'),'Reduced motion must remove new zoom: '+JSON.stringify(staticTransforms));
    await reduced.close();
    fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify(report,null,2));
    console.log('Closing sections PASS: six widths, photo files, layout, menu CTA, historic location, real Google Maps, noindex and reduced motion.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
