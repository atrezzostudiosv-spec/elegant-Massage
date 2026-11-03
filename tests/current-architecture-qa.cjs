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
          headingRect:(()=>{let x=document.querySelector('h1')?.getBoundingClientRect();return x?{left:x.left,right:x.right}:null})(),
          themePresent:!!document.querySelector('link[href$="atrezzo-agate-palette.css"]'),
          themeBg:getComputedStyle(document.body).backgroundColor,
          themeOcean:getComputedStyle(document.documentElement).getPropertyValue('--agate-ocean').trim(),
          headerCTA:(()=>{const x=document.querySelector('.site-header .header-cta');return x?{background:getComputedStyle(x).backgroundColor,color:getComputedStyle(x).color}:null})(),
          footerBg:(()=>{const x=document.querySelector('.site-footer');return x?getComputedStyle(x).backgroundColor:null})(),
          heroOverlay:getComputedStyle(document.querySelector('.hero'),'::before').backgroundImage,
          navTopics:[...document.querySelectorAll('.navigation .dropdown a')].map(a=>a.textContent.trim()),
          serviceRows:document.querySelectorAll('.service-row').length,
          snap:getComputedStyle(document.documentElement).scrollSnapType,
          reducedHeroTransform:getComputedStyle(document.querySelector('.hero__background')).transform,
          stickySidebar:(()=>{const x=document.querySelector('.content-layout aside');return x?getComputedStyle(x).position:null})()
        }));
        assert.equal(response.status(),200,`${route}: HTTP ${response.status()}`);
        assert(result.themePresent,`${route}: missing new palette stylesheet`);
        assert.equal(result.themeBg,'rgb(255, 255, 255)',`${route}: internal paper must be white`);
        assert.equal(result.themeOcean,'#254460',`${route}: wrong primary palette`);
        assert.deepEqual(result.headerCTA,{background:'rgb(83, 203, 217)',color:'rgb(37, 68, 96)'},`${route}: Book Now aqua/ocean contrast`);
        assert.equal(result.footerBg,'rgb(37, 68, 96)',`${route}: footer must be ocean blue`);
        assert(result.heroOverlay.includes('rgba(0, 0, 0,') && !result.heroOverlay.includes('rgba(15, 38, 60'),
          `${route} @${width}: photograph must have neutral black gradient, not ocean-blue: ${result.heroOverlay}`);
        assert.deepEqual(result.navTopics,[
          'All Massage Services','Body Massage','Combo Specials (Foot & Back)',
          'Couples Massage','Chair & Thai Massage','Four Hands Massage'
        ],`${route}: navigation must promote only the 5 confirmed appointment types`);
        if(route==='/massage-services/')assert.equal(result.serviceRows,5,'Service index must show 5 confirmed modalities');
        assert.equal(result.snap,'none',`${route}: native scrolling; no scroll-snap trap`);
        assert.equal(result.reducedHeroTransform,'none',`${route}: no photo motion under reduced-motion setting`);
        if(result.stickySidebar){
          assert.equal(result.stickySidebar,width>=871?'sticky':'static',
            `${route} @${width}: guide must be sticky only with room to read`);
        }
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
    // Verify the editorial photographic scroll is actually responsive, while
    // native scrolling and the text layout remain independent of the animation.
    const visualRoutes=['/massage-services/','/massage-services/body-massage/','/massage-menu/','/contact/'];
    for(const width of [375,1440]){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
      for(const route of visualRoutes){
        await page.goto(origin+route,{waitUntil:'domcontentloaded'});
        await page.waitForTimeout(450);
        const initial=await page.evaluate(()=>{
          const photo=document.querySelector('.hero__background');
          return Number(photo.style.getPropertyValue('--at-subpage-hero-scale'))||0;
        });
        await page.evaluate(()=>{
          const hero=document.querySelector('main .hero');
          window.scrollTo({top:Math.floor(hero.offsetHeight*.58),behavior:'instant'});
        });
        await page.waitForTimeout(330);
        const motion=await page.evaluate(()=>{
          const el=document.querySelector('.hero__background');
          return {
            scale:Number(el.style.getPropertyValue('--at-subpage-hero-scale'))||0,
            scroll:window.scrollY,visibleText:!!document.querySelector('.hero h1'),
            sections:document.querySelectorAll('main > section').length
          };
        });
        assert(motion.scale>initial+.008,
          `${route} @${width}: scroll should gently zoom photo only ${initial} -> ${motion.scale}`);
        assert(motion.scroll>130,`${route} @${width}: native scroll must advance`);
        assert(motion.visibleText&&motion.sections>=3,`${route}: scroll story and content sections remain readable`);
        if(['/massage-services/','/massage-services/body-massage/','/contact/'].includes(route)){
          await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
          await page.waitForTimeout(220);
          await page.screenshot({path:path.join('qa-artifacts/current-architecture',
            `internal-hero-${width}-${route.split('/').filter(Boolean).join('-')}.png`),
            animations:'disabled'});
        }
      }
      await page.close();
    }
  } finally {await browser.close();}
  fs.writeFileSync('qa-artifacts/current-architecture/report.json',JSON.stringify(report,null,2));
  console.log(`Current architecture internal-route PASS: ${report.length} assertions sets, 4 widths, 12 retained routes.`);
})().catch(error => {console.error(error);process.exit(1)});