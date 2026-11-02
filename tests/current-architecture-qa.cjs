'use strict';
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const origin = 'http://127.0.0.1:8765';
const widths = [375,768,1024,1440];
const routes = [
'/massage-services/', '/massage-services/body-massage/',
'/massage-services/foot-reflexology/', '/massage-services/combination-massage/',
'/massage-services/chair-massage/', '/massage-services/couples-massage/',
'/massage-services/four-hands-massage/', '/massage-services/specialty-techniques/',
'/massage-menu/', '/about/', '/gallery/', '/contact/'
];
(async () => {
  fs.mkdirSync('qa-artifacts/current-architecture',{recursive:true});
  const browser = await chromium.launch({headless:true});
  const report = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      const page = await context.newPage();
      for (const route of routes) {
        const errors=[];
        page.on('pageerror', e => errors.push(e.message));
        const response=await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForTimeout(70);
        const result=await page.evaluate(() => ({
          body:document.body.scrollWidth,
          html:document.documentElement.scrollWidth,
          viewport:window.innerWidth,
          h1:document.querySelectorAll('h1').length,
          main:document.querySelectorAll('main').length,
          title:document.title,
          description:document.querySelector('meta[name="description"]')?.content,
          robots:document.querySelector('meta[name="robots"]')?.content,
          booking:[...document.querySelectorAll('a[href]')].filter(a=>a.href.includes('elegantmassage.setmore.com')).length,
          headingRect:(()=>{let x=document.querySelector('h1')?.getBoundingClientRect();return x?{left:x.left,right:x.right}:null})()
        }));
        assert.equal(response.status(),200,`${route}: HTTP ${response.status()}`);
        assert.equal(result.h1,1,`${route}: H1 count`);
        assert.equal(result.main,1,`${route}: main count`);
        assert(result.description,`${route}: missing description`);
        assert(result.robots?.includes('noindex'),`${route}: demo must stay noindex`);
        assert(result.booking>0,`${route}: missing booking link`);
        assert(result.body<=width+2 && result.html<=width+2,`${route} @${width}: horizontal overflow ${result.body}/${result.html}`);
        assert(result.headingRect && result.headingRect.left >= -5 && result.headingRect.right <= width+5,`${route} @${width}: clipped H1`);
        assert.equal(errors.length,0,`${route} @${width}: JS errors ${errors.join(' | ')}`);
        report.push({route,width,...result});
        page.removeAllListeners('pageerror');
      }
      if(width===375||width===1440){
        await page.goto(origin+'/contact/',{waitUntil:'domcontentloaded'});
        await page.screenshot({path:path.join('qa-artifacts/current-architecture',`contact-${width}.png`),fullPage:true,animations:'disabled'});
      }
      await context.close();
    }
  } finally {await browser.close();}
  fs.writeFileSync('qa-artifacts/current-architecture/report.json',JSON.stringify(report,null,2));
  console.log(`Current architecture internal-route PASS: ${report.length} assertions sets, 4 widths, 12 retained routes.`);
})().catch(error => {console.error(error);process.exit(1)});