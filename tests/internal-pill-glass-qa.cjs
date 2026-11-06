'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base='http://127.0.0.1:8765';
const routes=[
'/about/','/contact/','/gallery/','/massage-menu/','/massage-services/',
'/massage-services/body-massage/','/massage-services/chair-massage/',
'/massage-services/combination-massage/','/massage-services/couples-massage/',
'/massage-services/foot-reflexology/','/massage-services/four-hands-massage/',
'/massage-services/specialty-techniques/'
];
function fail(desc,s){assert(s,desc)}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const dir='qa-artifacts/internal-pill-glass';
 fs.mkdirSync(dir,{recursive:true});
 let checked=0;
 try {
   for(const width of [375,768,1024,1440]){
     const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
     const page=await context.newPage();
     for(const route of routes){
       let errors=[];
       page.on('pageerror',e=>errors.push(e.message));
       const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});
       assert.equal(response.status(),200,route+' HTTP 200');
       const selectors=route.includes('body-massage')?'.em-body-hero .em-book:not(.em-book--ghost)':route==='/contact/'?'.contact-hero .contact-action--primary':'.hero .actions .button:not(.button--outline)';
       const styles=await page.evaluate(sel=>{
         const primary=document.querySelector(sel);
         const final=document.querySelector('.closing .button:not(.button--outline), .em-body-cta .em-book:not(.em-book--ghost), .em-contact-close .button:not(.button--outline)');
         const secondary=document.querySelector('.closing .actions .button--outline, .em-body-cta .em-book--ghost, .em-contact-close__link');
         const header=document.querySelector('.site-header .header-cta');
         const dock=document.querySelector('.em-mobile-booking');
         function visual(el){
           if(!el)return null;
           const s=getComputedStyle(el);
           const r=el.getBoundingClientRect();
           return {radius:parseFloat(s.borderTopLeftRadius),height:r.height,background:s.backgroundColor,
             blur:s.backdropFilter||s.webkitBackdropFilter,bottom:s.borderBottomWidth,borderStyle:s.borderBottomStyle,
             color:s.color,display:s.display,visible:r.width>0&&r.height>0};
         }
         return {primary:visual(primary),final:visual(final),secondary:visual(secondary),
           header:visual(header),dock:visual(dock),bodyWidth:document.body.scrollWidth,
           htmlWidth:document.documentElement.scrollWidth,innerWidth:innerWidth,
           noscript:document.querySelector('meta[name="robots"]')?.content};
       },selectors);
       fail(route+' must have first main CTA',styles.primary?.visible);
       fail(route+' main primary pill',styles.primary.radius>=styles.primary.height*.44);
       fail(route+' main primary background translucent',styles.primary.background.includes('rgba('));
       fail(route+' main primary blur',styles.primary.blur.includes('blur('));
       if(styles.final){
         fail(route+' final button pill',styles.final.radius>=styles.final.height*.44);
         fail(route+' final button translucent',styles.final.background.includes('rgba('));
       }
       if(styles.secondary){
         fail(route+' secondary text underlined',parseFloat(styles.secondary.bottom)>=1);
         fail(route+' secondary is unboxed',styles.secondary.radius<2);
       }
       if(width>=871){
         fail(route+' header CTA pill',styles.header?.visible&&styles.header.radius>=styles.header.height*.44);
       }else{
         fail(route+' mobile dock capsule',styles.dock?.visible&&styles.dock.radius>=styles.dock.height*.44);
       }
       fail(route+' no overflow at '+width,styles.bodyWidth<=width+2&&styles.htmlWidth<=width+2);
       fail(route+' noindex',styles.noscript?.includes('noindex'));
       assert.equal(errors.length,0,route+' page errors '+errors.join('|'));
       if((width===375||width===1440)&&['/massage-services/body-massage/','/massage-services/chair-massage/','/contact/'].includes(route)){
         await page.screenshot({path:path.join(dir,route.split('/').filter(Boolean).join('-')+'-'+width+'.png'),fullPage:true,animations:'disabled'});
       }
       page.removeAllListeners('pageerror');
       checked++;
     }
     await context.close();
   }
 } finally {await browser.close();}
 console.log('Glass pill CTA QA PASS: '+checked+' route/width combinations');
})().catch(e=>{console.error(e);process.exit(1)});
