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
          footerBg:(()=>{const x=document.querySelector('.em-footer');return x?getComputedStyle(x).backgroundColor:null})(),
          footerLinks:[...document.querySelectorAll('.em-footer__nav a')].map(a=>new URL(a.href).pathname),
          contactStorefront:!!document.querySelector('.contact-hero__photo img'),
          contactForm:document.querySelector('form.contact-inquiry__form')?.getAttribute('action'),
          heroOverlay:(()=>{const shade=document.querySelector('.em-body-hero__shade'),hero=document.querySelector('.hero');return shade?getComputedStyle(shade).backgroundImage:hero?getComputedStyle(hero,'::before').backgroundImage:''})(),
          navTopics:[...document.querySelector('.navigation').children].map(x=>x.matches('details')?x.querySelector('summary').textContent.trim():x.textContent.trim()),
          serviceRows:document.querySelectorAll('.service-row').length,
          snap:getComputedStyle(document.documentElement).scrollSnapType,
          reducedHeroTransform:(()=>{const el=document.querySelector('.hero__background, .em-body-hero__image');return el?getComputedStyle(el).transform:null})(),
          bodyCinematic:!!document.querySelector('.em-body-hero, .em-journey'),
          stickySidebar:(()=>{const x=document.querySelector('.content-layout aside');return x?getComputedStyle(x).position:null})(),
          mobileHeader:(()=>{
            const bounds=sel=>{const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};};
            return {
              brand:bounds('.site-header .brand'),
              book:bounds('.site-header .header-cta'),
              toggle:bounds('.site-header .toggle')
            };
          })()
        }));
        assert.equal(response.status(),200,`${route}: HTTP ${response.status()}`);
        assert(result.themePresent,`${route}: missing new palette stylesheet`);
        assert.equal(result.themeBg,'rgb(255, 255, 255)',`${route}: internal paper must be white`);
        assert.equal(result.themeOcean,'#254460',`${route}: wrong primary palette`);
        assert.deepEqual(result.headerCTA,{background:'rgb(83, 203, 217)',color:'rgb(37, 68, 96)'},`${route}: Book Now aqua/ocean contrast`);
        assert.equal(result.footerBg,'rgb(37, 68, 96)',`${route}: footer must be ocean blue`);
        assert.deepEqual(result.footerLinks,['/massage-services/','/massage-menu/','/about/','/gallery/','/contact/'],`${route}: shared footer links`);
        if(route!='/contact/')assert(result.heroOverlay.includes('rgba(0, 0, 0,') && !result.heroOverlay.includes('rgba(15, 38, 60'),
          `${route} @${width}: photograph must have neutral black gradient, not ocean-blue: ${result.heroOverlay}`);
        if(route==='/contact/'){
          assert(result.contactStorefront,`${route}: original storefront photograph`);
          assert.equal(result.contactForm,'https://formsubmit.co/atrezzostudiosv@gmail.com',`${route}: preview form destination`);
        }
        assert.deepEqual(result.navTopics,[
          'Treatments','Menu & Prices','About','Gallery','Contact'
        ],`${route}: navigation must mirror Home's five primary links`);
        if(route==='/massage-services/')assert.equal(result.serviceRows,5,'Service index must show 5 confirmed modalities');
        assert.equal(result.snap,'none',`${route}: native scrolling; no scroll-snap trap`);
        if(route==='/massage-services/body-massage/')assert(result.bodyCinematic,`${route}: cinematic scene structure must be present`);
        if(route!='/contact/')assert.equal(result.reducedHeroTransform,'none',`${route}: no photo motion under reduced-motion setting`);
        if(width<=430){
          const {brand,toggle}=result.mobileHeader;
          assert(brand&&toggle,`${route}: missing mobile navigation controls`);
          assert(brand.left>=0&&toggle.right<=width-6,`${route}: clipped mobile menu toggle ${JSON.stringify(result.mobileHeader)}`);
          assert(brand.right+3<=toggle.left,
            `${route}: internal mobile logo and toggle overlap ${JSON.stringify(result.mobileHeader)}`);
        }
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
    // Mobile navigation remains keyboard accessible after icon-only toggle.
    for(const width of [375,390,430,768]){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      await page.goto(origin+'/massage-services/',{waitUntil:'domcontentloaded'});
      const toggle=page.locator('.site-header .toggle');
      const header=await page.evaluate(()=>{
        const r=sel=>{const el=document.querySelector(sel).getBoundingClientRect();return {left:el.left,right:el.right,width:el.width};};
        return {brand:r('.site-header .brand'),book:r('.site-header .header-cta'),toggle:r('.site-header .toggle')};
      });
      assert(header.toggle.right<=width-6&&header.brand.right+3<=header.toggle.left,
        width+': header controls clipped/overlapping: '+JSON.stringify(header));
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'),'true','Menu button opens navigation');
      assert(await page.locator('.navigation').isVisible(),'Dropdown navigation visible');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'),'false','Escape closes mobile navigation');
      await page.close();
    }
    // Verify the editorial photographic scroll is actually responsive, while
    // native scrolling and the text layout remain independent of the animation.
    const visualRoutes=['/massage-services/','/massage-services/body-massage/','/massage-menu/','/contact/'];
    for(const width of [375,1440]){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
      for(const route of visualRoutes){
        await page.goto(origin+route,{waitUntil:'domcontentloaded'});
        await page.waitForTimeout(450);
        if(route==='/massage-services/body-massage/'){
          // Body Massage is an expressly approved, independent full-bleed
          // photographic narrative. It does not retain the old .hero node.
          assert.equal(await page.locator('[data-em-journey-chapter]').count(),3,
            'Body cinematic route must contain three full-screen scenes');
          const motion=await page.evaluate(()=>{
            const chapter=document.querySelectorAll('[data-em-journey-chapter]')[1];
            const r=chapter.getBoundingClientRect();
            scrollTo({top:scrollY+r.top+(r.height-innerHeight)/2,behavior:'instant'});
            return {scroll:scrollY,sections:document.querySelectorAll('main > section').length,
              text:!!document.querySelector('.em-body-hero h1')};
          });
          await page.waitForTimeout(370);
          assert(motion.scroll>130&&motion.text&&motion.sections>=4,
            `${route} @${width}: native narrative scroll, hero text and sections preserved`);
          if(width>=871){
            const active=await page.locator('[data-em-journey-photo]').evaluateAll(nodes=>
              nodes.findIndex(el=>el.classList.contains('is-active')));
            assert.equal(active,1,`${route} @${width}: second chapter must activate its full-screen photo`);
          }else{
            const bg=await page.locator('[data-em-journey-chapter]').nth(1).evaluate(el=>
              getComputedStyle(el,'::before').backgroundImage);
            assert(bg.includes('.webp'),`${route} @${width}: mobile chapter should use full background photography`);
          }
        }else if(route==='/contact/'){
          const contact=await page.evaluate(()=>({
            sections:document.querySelectorAll('main > section').length,
            storefront:!!document.querySelector('.contact-hero__photo img'),
            form:!!document.querySelector('form.contact-inquiry__form')
          }));
          assert(contact.sections>=4&&contact.storefront&&contact.form,
            `${route} @${width}: contact story and form remain available`);
        }else{
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
        }
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
