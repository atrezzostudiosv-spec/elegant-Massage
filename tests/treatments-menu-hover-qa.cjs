'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const origin='http://127.0.0.1:8765';
const routes=['/','/massage-services/','/massage-menu/','/massage-services/body-massage/'];
const expected=[
  ['Body Massage','/massage-services/body-massage/'],
  ['Combo Specials — Foot & Back','/massage-services/combination-massage/'],
  ['Couples Massage','/massage-services/couples-massage/'],
  ['Chair & Thai Massage','/massage-services/chair-massage/'],
  ['Four Hands Massage','/massage-services/four-hands-massage/']
];
(async()=>{
  const browser=await chromium.launch({headless:true});
  const dir='qa-artifacts/treatments-navigation';
  fs.mkdirSync(dir,{recursive:true});
  const report=[];
  try{
    for(const width of [375,390,430,768,870,871,900,1024,1440]){
      const mobile=width<=870;
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      for(const route of routes){
        const response=await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:30000});
        assert.equal(response.status(),200,'Page must load: '+route);
        await page.waitForTimeout(150);
        const details=page.locator('nav[aria-label="Primary navigation"] .treatments-menu');
        const summary=details.locator('summary');
        const panel=details.locator('.treatments-menu__panel');
        const links=details.locator('.treatments-menu__link');
        assert.equal(await details.count(),1,route+' one Treatments disclosure');
        assert.equal(await links.count(),5,route+' five direct treatments');
        assert.equal(await details.evaluate(el=>el.open),false,route+' starts closed');
        const paths=await links.evaluateAll(nodes=>nodes.map(n=>({label:n.textContent.trim(),pathname:new URL(n.href).pathname})));
        assert.deepEqual(paths,expected.map(([label,pathname])=>({label,pathname})),route+' only verified treatment pages');
        if(mobile){
          const nav=page.locator('nav[aria-label="Primary navigation"]');
          const menu=page.locator(route==='/'?'.menu-toggle':'.site-header .toggle');
          await menu.click();
          assert(await nav.isVisible(),route+' main nav visible in mobile');
          assert(!(await panel.isVisible()),route+' treatment links not shown initially');
          await summary.click();
          assert.equal(await details.evaluate(el=>el.open),true,route+' tap expands nested treatments');
          assert(await links.first().isVisible(),route+' expanded treatment links readable');
          const css=await links.first().evaluate(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el.closest('.treatments-menu__inner')).backgroundColor}));
          assert.equal(css.color,'rgb(255, 255, 255)',route+' mobile submenu contrast');
          assert(css.bg.startsWith('rgba('),route+' nested panel translucent');
          if((width===375||width===768)&&(route==='/'||route==='/massage-services/')){
            await page.screenshot({path:path.join(dir,String(width)+'-'+(route==='/'?'home':'services')+'-expanded.png'),animations:'disabled'});
          }
          await summary.click();
          assert.equal(await details.evaluate(el=>el.open),false,route+' second tap collapses');
          await summary.click();
          await page.keyboard.press('Escape');
          assert.equal(await details.evaluate(el=>el.open),false,route+' Escape collapses nested menu');
          assert.equal(await menu.getAttribute('aria-expanded'),'false',route+' Escape also closes main menu');
        }else{
          const container=page.locator(route==='/'?'.glass-header':'.site-header');
          const bounds=await page.evaluate(s=>{
            const rect=x=>{const r=document.querySelector(x).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
            return {logo:rect(s+' .'+(s==='.glass-header'?'wordmark':'brand')),
                    book:rect(s+' .'+(s==='.glass-header'?'glass-header__book':'header-cta')),
                    nav:rect(s+' nav[aria-label="Primary navigation"]')};
          },route==='/'?'.glass-header':'.site-header');
          assert(bounds.logo.right<=bounds.nav.left+3&&bounds.nav.right<=bounds.book.left+3,
            route+' header alignment at '+width+': '+JSON.stringify(bounds));
          await summary.hover();
          await page.waitForTimeout(85);
          assert.equal(await details.evaluate(el=>el.open),true,route+' opens by hovering at '+width);
          assert(await panel.isVisible(),route+' hover panel visible');
          const target=await links.last().boundingBox();
          const trigger=await summary.boundingBox();
          assert(target&&trigger,'Hover targets must have actual bounds');
          // Real pointer trajectory: diagonal from the trigger across the
          // transparent dropdown gap to the last item. The menu must persist.
          await page.mouse.move(trigger.x+trigger.width*.5,trigger.y+trigger.height*.5);
          await page.mouse.move(target.x+target.width*.6,target.y+target.height*.5,{steps:24});
          await page.waitForTimeout(70);
          assert.equal(await details.evaluate(el=>el.open),true,route+' hover must survive diagonal travel');
          assert(await links.last().isVisible(),route+' fifth treatment must remain reachable');
          if((width===1024||width===1440)&&(route==='/'||route==='/massage-services/')){
            await page.screenshot({path:path.join(dir,String(width)+'-'+(route==='/'?'home':'services')+'-hover.png'),animations:'disabled'});
          }
          await page.mouse.move(9,Math.min(600,900-25),{steps:12});
          await page.waitForTimeout(300);
          assert.equal(await details.evaluate(el=>el.open),false,route+' closes after leaving entire menu');
          // Keyboard navigation opens the same menu and Escape can close it.
          await summary.focus();
          await page.keyboard.press('Enter');
          assert.equal(await details.evaluate(el=>el.open),true,route+' keyboard disclosure opens');
          await page.keyboard.press('Escape');
          assert.equal(await details.evaluate(el=>el.open),false,route+' Escape closes desktop dropdown');
        }
        report.push({width,route,mobile});
      }
      await page.close();
      assert.deepEqual(errors,[],'Browser errors at '+width);
    }
    const linkPage=await browser.newPage({viewport:{width:1440,height:900}});
    await linkPage.goto(origin+'/');
    await linkPage.locator('.treatments-menu summary').hover();
    for(const [label,pathname] of expected){
      const anchor=linkPage.locator('.treatments-menu__link',{hasText:label});
      const href=await anchor.getAttribute('href');
      assert.equal(new URL(href,origin+'/').pathname,pathname);
      const response=await linkPage.request.get(origin+pathname);
      assert.equal(response.status(),200,'Destination must load: '+pathname);
      const body=await response.text();
      assert(body.includes('<h1'),'Destination must have its own page H1: '+pathname);
    }
    await linkPage.close();
  }finally{await browser.close()}
  fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));
  console.log('Treatments dropdown PASS: 5 linked treatments, hover traversal, keyboard, mobile accordion, Escape, 9 widths and 4 routes.');
})().catch(err=>{console.error(err);process.exit(1)});
