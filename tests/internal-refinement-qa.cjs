'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const origin = 'http://127.0.0.1:8765';
const routes = [
  '/about/','/contact/','/gallery/','/massage-menu/','/massage-services/',
  '/massage-services/body-massage/','/massage-services/chair-massage/',
  '/massage-services/combination-massage/','/massage-services/couples-massage/',
  '/massage-services/foot-reflexology/','/massage-services/four-hands-massage/',
  '/massage-services/specialty-techniques/'
];
const widths = [375,768,1024,1440];
(async () => {
  const browser=await chromium.launch({headless:true});
  const out='qa-artifacts/internal-refinement';
  fs.mkdirSync(out,{recursive:true});
  const results=[];
  try {
    for(const width of widths) {
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      const page=await context.newPage();
      for(const route of routes) {
        const pageErrors=[];
        page.on('pageerror',e=>pageErrors.push(e.message));
        const resp=await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:30000});
        assert.equal(resp.status(),200,route+': status not 200');
        await page.waitForTimeout(100);
        const info=await page.evaluate(()=>{
          const map=document.querySelector('.em-location');
          const footer=document.querySelector('.em-footer');
          const iframe=document.querySelector('.em-location iframe');
          const image=[...document.querySelectorAll('.em-editorial-section--calm img')];
          const h1=document.querySelector('h1');
          const he= h1?.getBoundingClientRect();
          const plain=document.querySelector('main')?.innerText || '';
          return {
            pageWidth:document.documentElement.scrollWidth,
            bodyWidth:document.body.scrollWidth,
            viewport:innerWidth,
            h1Count:document.querySelectorAll('h1').length,
            h1Left:he?.left,h1Right:he?.right,
            mapCount:document.querySelectorAll('.em-location').length,
            mapBeforeFooter:!!map&&!!footer&&!!(map.compareDocumentPosition(footer)&Node.DOCUMENT_POSITION_FOLLOWING),
            iframeSrc:iframe?.src,iframeLazy:iframe?.loading,
            mapHeight:iframe?.getBoundingClientRect().height,
            directions:document.querySelector('.em-location__directions')?.href,
            directBooking:[...document.querySelectorAll('a[href]')].some(a=>a.href.includes('elegantmassage.setmore.com')),
            robots:document.querySelector('meta[name="robots"]')?.content,
            canonical:document.querySelector('link[rel=canonical]')?.href,
            icon:document.querySelector('link[rel=icon]')?.getAttribute('href'),
            shareImage:document.querySelector('meta[property="og:image"]')?.content,
            schemaText:document.querySelector('script[type="application/ld+json"]')?.textContent,
            internalCSS:!!document.querySelector('link[href$="internal-refinement-2026.css"]'),
            photos:image.map(el=>({complete:el.complete,ok:el.naturalWidth>0,alt:el.alt})),
            redundantMosaics:document.querySelectorAll('.em-editorial-section .atc-mosaic-card').length,
            testForm:!!document.querySelector('form[action*="atrezzostudiosv"]')
          };
        });
        assert.equal(info.h1Count,1,route+': one H1');
        assert(info.h1Left>=-6&&info.h1Right<=width+6,route+': H1 cropped '+JSON.stringify(info));
        assert(info.pageWidth<=width+2&&info.bodyWidth<=width+2,route+': overflow '+JSON.stringify(info));
        assert.equal(info.mapCount,1,route+': exactly one location map');
        assert(info.mapBeforeFooter,route+': map must precede footer');
        assert(info.iframeSrc?.includes('maps.google.com/maps?')||info.iframeSrc?.includes('google.com/maps?'),route+': Google map source');
        assert.equal(info.iframeLazy,'lazy',route+': lazy map');
        assert(info.mapHeight>=200,route+': map too short');
        assert(info.directions?.includes('google.com/maps/search'),route+': directions fallback');
        assert(info.directBooking,route+': missing booking action');
        assert(info.robots?.includes('noindex'),route+': demo must be noindex');
        assert(info.canonical&&info.icon&&info.shareImage&&info.schemaText&&info.internalCSS,route+': missing SEO resources');
        const schema=JSON.parse(info.schemaText);
        assert(Array.isArray(schema['@graph'])&&schema['@graph'].length===3,route+': business/page/breadcrumb schema');
        assert(!info.testForm,route+': test form remains');
        assert(info.photos.every(x=>x.ok),route+': editorial photo failed to decode');
        assert.equal(pageErrors.length,0,route+': JS errors '+pageErrors.join('|'));
        if(['/massage-services/chair-massage/','/massage-services/combination-massage/','/massage-services/couples-massage/','/massage-services/four-hands-massage/','/massage-services/body-massage/'].includes(route))
          assert.equal(info.redundantMosaics,0,route+': repetitive mosaic still present');
        if((width===375||width===1440) && ['/contact/','/massage-services/body-massage/','/massage-services/chair-massage/','/massage-services/couples-massage/'].includes(route)){
          await page.screenshot({path:path.join(out,route.split('/').filter(Boolean).join('-')+'-'+width+'.png'),fullPage:true,animations:'disabled'});
        }
        results.push({route,width,info:{...info,schemaText:undefined},errors:pageErrors});
        page.removeAllListeners('pageerror');
      }
      await context.close();
    }
  } finally {await browser.close();}
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));
  console.log('Internal UX/SEO/map QA PASS '+results.length+' page-width checks');
})().catch(e=>{console.error(e);process.exit(1)});
