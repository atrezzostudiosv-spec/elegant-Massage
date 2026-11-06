'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const origin='http://127.0.0.1:8765/';
const widths=[375,768,1024,1440];
const dest=path.join('qa-artifacts','home-menu-refinement');
fs.mkdirSync(dest,{recursive:true});

const sleep=t=>new Promise(r=>setTimeout(r,t));
async function at(page,y){
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);
  await sleep(750);
}
async function computed(page){
  return page.evaluate(()=>{
    const q=s=>document.querySelector(s);
    const style=s=>getComputedStyle(q(s));
    const radius=s=>parseFloat(style(s).borderTopLeftRadius);
    const height=s=>q(s).getBoundingClientRect().height;
    const menu=q('.menu-pause'), rect=menu?.getBoundingClientRect();
    return {
      vw:innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      menuSource:q('.menu-pause__photo img')?.getAttribute('src'),
      menuImageLoaded:!!q('.menu-pause__photo img')?.naturalWidth,
      menuStagePosition:style('.menu-pause__stage').position,
      menuHeight:rect?.height,
      menuTop:scrollY+(rect?.top||0),
      subtitleDisplay:style('.at-grid__description').display,
      heroCTA:{radius:radius('.intro__actions .button--garnet'),height:height('.intro__actions .button--garnet')},
      heroSecondary:{borderBottom:style('.intro__actions .button--outline-light').borderBottomWidth,borderLeft:style('.intro__actions .button--outline-light').borderLeftWidth},
      menuCTA:{radius:radius('.menu-pause__cta'),height:height('.menu-pause__cta')},
      navHidden:q('.glass-header').classList.contains('em-home-header-hidden'),
      noindex:q('meta[name="robots"]')?.content.includes('noindex'),
      docSections:[...document.querySelectorAll('main > section')].map(x=>x.id)
    };
  });
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const results=[];
  try {
    for(const width of widths){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      const resp=await page.goto(origin,{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(resp.status(),200);
      await sleep(1500);
      const c=await computed(page);
      assert(c.noindex,'Home remains noindex');
      assert(c.scrollWidth<=width+2,'Horizontal overflow '+width+' '+c.scrollWidth);
      assert(c.docSections.includes('introduction')&&c.docSections.includes('atrezzo-original-grid')&&c.docSections.includes('find-your-massage'),'Original Home journey preserved');
      assert(c.docSections.includes('massage-menu-preview'),'Menu stage retained');
      // A clean, illustrative spa still-life replaces the opaque background
      // under the first SVG mask; keep the SVG stage and its reveal unchanged.
      const bridge=await page.evaluate(()=>{
        const stage=document.querySelector('.at-mask-stage');
        const css=getComputedStyle(stage);
        const chapters=document.querySelectorAll('#cinema-track .chapter');
        return {backgroundImage:css.backgroundImage,backgroundColor:css.backgroundColor,
          stagePresent:!!stage,chapters:chapters.length,
          imageUrl:'./assets/images/elegant-massage-spa-stilllife-blossoms-stones-candle.webp'};
      });
      assert(bridge.stagePresent&&bridge.chapters===5,'Original 5-chapter stage preserved');
      assert(bridge.backgroundImage.includes('elegant-massage-spa-stilllife-blossoms-stones-candle.webp'),
             'Transition must show still-life photo rather than flat colour at '+width);
      const loaded=await page.evaluate(async()=>{
        const im=new Image();
        im.src='./assets/images/elegant-massage-spa-stilllife-blossoms-stones-candle.webp';
        try{await im.decode();return {ok:im.naturalWidth>0,width:im.naturalWidth,height:im.naturalHeight}}catch(e){return {ok:false,width:0,height:0}}
      });
      assert(loaded.ok,'The spa still-life asset must decode at '+width);
      assert(loaded.width>=600&&loaded.height>=650,
             'The background needs a genuine responsive-quality source at '+width+': '+JSON.stringify(loaded));

      const editorial=await page.evaluate(()=>{
        const opening=document.querySelector('.treatments__opening');
        const stage=document.querySelector('.at-mask-stage');
        const title=opening.querySelector('h2');
        const jump=opening.querySelector('.chapter-jump');
        const st=getComputedStyle(stage),op=getComputedStyle(opening);
        const rr=opening.getBoundingClientRect(),hr=title.getBoundingClientRect(),jr=jump.getBoundingClientRect();
        return {openingWidth:rr.width,openingLeft:rr.left,headingLeft:hr.left,
          headingRight:hr.right,jumpLeft:jr.left,openingBackground:op.backgroundImage,
          openingSize:op.backgroundSize,maskBackground:st.backgroundImage,
          maskSize:st.backgroundSize,headingAlign:getComputedStyle(title).textAlign};
      });
      const imageFile='elegant-massage-spa-stilllife-blossoms-stones-candle.webp';
      assert(editorial.openingWidth>=width-2&&Math.abs(editorial.openingLeft)<2,
        'The floral introduction must span the complete viewport '+width+': '+JSON.stringify(editorial));
      assert(editorial.openingBackground.includes(imageFile),
        'The title and selector must sit over the same full-bleed photograph at '+width);
      assert(editorial.openingSize.split(',').every(x=>x.trim()==='cover'),
        'Every introductory background layer must cover without a vertical image seam at '+width);
      // The final background layer is a solid ivory fallback (computed size
      // "auto"); the third layer is the actual WebP and must use cover.
      assert(editorial.maskSize.split(',')[2]?.trim()==='cover',
        'The masked-chapter WebP must cover the full width at '+width+': '+editorial.maskSize);
      assert(editorial.headingLeft>=-2&&editorial.headingRight<=width+2,
        'Title must not clip at '+width);
      assert(Math.abs(editorial.jumpLeft-editorial.headingLeft)<4,
        'Selector and title must align at the left reading edge at '+width);
      assert(editorial.headingAlign==='left',
        'Title must read as left-led editorial copy, not centered at '+width);


      // Capture the exact frame that formerly showed a solid blue rectangle.
      // The first mask starts closed; the photographic canvas must be visible.
      const trackY=await page.evaluate(()=>{
        const r=document.querySelector('#cinema-track').getBoundingClientRect();
        return window.scrollY+r.top;
      });
      await page.evaluate(y=>window.scrollTo({top:y+3,behavior:'instant'}),trackY);
      await sleep(800);
      if(width===375||width===768||width===1440)
        await page.locator('.at-mask-stage').screenshot({
          path:path.join(dest,'transition-'+width+'.png'),
          animations:'disabled',timeout:30000
        });
      // Reset to the document start before testing downward menu hide.
      // The screenshot scrolls deep into the page, so without this reset
      // the next scroll to 680px would actually be an UPWARD movement.
      await at(page,0);


      assert.equal(c.menuSource,'./assets/images/martes/body-editorial.webp','Menu must use new approved uploaded photo');
      assert(c.heroCTA.radius>=c.heroCTA.height*.45,'Home hero CTA must be a pill');
      assert(c.menuCTA.radius>=c.menuCTA.height*.45,'Home menu CTA must be a pill');
      assert.equal(c.heroSecondary.borderLeft,'0px','Second Hero action must not be outlined as a box');
      assert(parseFloat(c.heroSecondary.borderBottom)>=1,'Second Hero action must be underlined text');
      if(width<=700)assert.equal(c.subtitleDisplay,'none','Hide grid caption only on mobile');
      else assert.notEqual(c.subtitleDisplay,'none','Preserve grid caption on desktop/tablet');
      if(width>=768)assert.equal(c.menuStagePosition,'sticky','Menu photo needs a sticky reading hold');
      else assert.equal(c.menuStagePosition,'relative','Mobile should use natural reading flow');

      // Functional auto-hide and reveal from the actual scroll direction.
      await at(page,680);
      const hiddenDown=await page.locator('.glass-header').evaluate(el=>el.classList.contains('em-home-header-hidden'));
      assert(hiddenDown,'Header must hide when scrolling down at '+width);
      await at(page,450);
      const shownUp=await page.locator('.glass-header').evaluate(el=>!el.classList.contains('em-home-header-hidden'));
      assert(shownUp,'Header must reveal on upward scroll at '+width);
      await at(page,0);
      assert(await page.locator('.glass-header').evaluate(el=>!el.classList.contains('em-home-header-hidden')),'Header visible at top');

      // Confirm image and layout at the reading hold after actual scroll.
      await at(page,c.menuTop+Math.min(120,Math.max(10,c.menuHeight-900)));
      await page.waitForFunction(()=>{const im=document.querySelector('.menu-pause__photo img');return !!im&&im.complete&&im.naturalWidth>0;},null,{timeout:12000});
      const sc=await page.evaluate(()=>{
        const photo=document.querySelector('.menu-pause__photo img');
        const css=getComputedStyle(photo).transform;
        const title=document.querySelector('#menu-pause-heading')?.getBoundingClientRect();
        return {css,title:{left:title.left,right:title.right,top:title.top,bottom:title.bottom},viewport:innerWidth};
      });
      assert(sc.title.right<=width+3&&sc.title.left>=-3,'Menu heading clipped '+width+' '+JSON.stringify(sc.title));
      if(width>=768){
        const sample=async offset=>{
          await at(page,c.menuTop+offset);
          await sleep(350);
          const s=await page.locator('.menu-pause__photo img').evaluate(el=>getComputedStyle(el).transform);
          return s.startsWith('matrix(')?Number(s.slice(7).split(',')[0]):1;
        };
        const early=await sample(35);
        const late=await sample(Math.min(c.menuHeight-900-30,570));
        assert(late>=early+.020,'Menu photo needs meaningful progress-linked zoom '+width+': '+early+' '+late);
        results.push({width,early,late,header:{hiddenDown,shownUp},menuSource:c.menuSource});
      }else results.push({width,header:{hiddenDown,shownUp},menuSource:c.menuSource});
      await page.locator('.menu-pause__stage').screenshot({path:path.join(dest,'menu-'+width+'.png'),timeout:30000,animations:'disabled'});
      assert.equal(errors.length,0,'JS errors '+width+': '+errors.join('|'));
      await page.close();
    }
    const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    await reduced.goto(origin,{waitUntil:'domcontentloaded'});
    await sleep(300);
    const reducedState=await reduced.evaluate(()=>({
      menuPosition:getComputedStyle(document.querySelector('.menu-pause__stage')).position,
      photoTransform:getComputedStyle(document.querySelector('.menu-pause__photo img')).transform
    }));
    assert.notEqual(reducedState.menuPosition,'sticky','No sticky scroll hold under reduced-motion');
    assert.equal(reducedState.photoTransform,'none','No zoom under reduced-motion');
    await reduced.close();
    fs.writeFileSync(path.join(dest,'results.json'),JSON.stringify({results,reduced:reducedState},null,2));
    console.log('HOME MENU/HEADER QA PASS '+JSON.stringify({results,reduced:reducedState}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
