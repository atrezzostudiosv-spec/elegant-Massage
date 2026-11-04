'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const widths=[375,390,430,768,1024,1440];
const routes=['/','/massage-services/','/massage-services/body-massage/','/contact/'];
const labels=['Treatments','Menu & Prices','About','Gallery','Contact'];
(async()=>{
  const browser=await chromium.launch({headless:true});
  const dir='qa-artifacts/unified-navigation';
  fs.mkdirSync(dir,{recursive:true});
  const report=[];
  try {
    for(const width of widths){
      const mobile=width<=870;
      const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      const page=await ctx.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      for(const route of routes){
        const response=await page.goto('http://127.0.0.1:8765'+route,{waitUntil:'domcontentloaded',timeout:30000});
        assert.equal(response.status(),200,route+' must load');
        await page.waitForTimeout(230);
        const selectors=route==='/'?
          {head:'.glass-header',book:'.glass-header__book',nav:'.main-nav',toggle:'.menu-toggle',logo:'.wordmark'}:
          {head:'.site-header',book:'.header-cta',nav:'.navigation',toggle:'.toggle',logo:'.brand'};
        const state=await page.evaluate(s=>{
          const el=id=>document.querySelector(id);
          const rect=id=>{const r=el(id).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
          const h=el(s.head),nav=el(s.nav),toggle=el(s.toggle),cta=el('.em-mobile-booking');
          const hcss=getComputedStyle(h),ncss=getComputedStyle(nav),bcss=getComputedStyle(el(s.book));
          const dcss=cta&&getComputedStyle(cta);
          return {
            scrollWidth:document.documentElement.scrollWidth,
            top:rect(s.head),logo:rect(s.logo),toggle:rect(s.toggle),
            bg:hcss.backgroundColor,blur:hcss.backdropFilter,
            panelVisible:ncss.display!=='none',
            nav:[...nav.querySelectorAll(':scope > a')].map(x=>x.textContent.trim()),
            headerBookVisible:bcss.display!=='none',
            toggleVisible:getComputedStyle(toggle).display!=='none',
            dockCount:document.querySelectorAll('.em-mobile-booking').length,
            dockVisible:dcss?.display!=='none',dock:cta?rect('.em-mobile-booking'):null,
            dockHref:cta?.getAttribute('href'),dockBlur:dcss?.backdropFilter,
            dockPadding:parseFloat(getComputedStyle(document.querySelector('footer')).paddingBottom),
            siteNoindex:el('meta[name="robots"]')?.content?.includes('noindex')
          };
        },selectors);
        assert.deepEqual(state.nav,labels,route+' same five labels');
        assert(state.top.left>=9&&state.top.right<=width-9&&state.top.top>=8&&state.top.top<=17,route+' floating glass frame');
        assert(state.blur.includes('blur('),route+' header optical blur');
        assert(state.scrollWidth<=width+2,route+' no horizontal overflow at '+width);
        assert(state.dockCount===1,route+' only one booking dock');
        assert(state.dockHref==='https://elegantmassage.setmore.com/#services',route+' verified booking destination');
        assert(state.siteNoindex,route+' demo noindex');
        if(mobile){
          assert(!state.headerBookVisible,route+' no mobile header booking');
          assert(state.toggleVisible&&!state.panelVisible,route+' collapsed mobile menu');
          assert(state.logo.right+5<=state.toggle.left,route+' no logo toggle overlap at '+width);
          assert(state.dockVisible&&state.dock&&state.dock.left>=10&&state.dock.right<=width-10,
            route+' inset mobile booking dock');
          assert(state.dock.bottom<=900-5&&state.dock.bottom>=850,route+' dock near bottom');
          assert(state.dockBlur.includes('blur('),route+' frosted dock');
          assert(state.dockPadding>=90,route+' footer reserves space');
          await page.locator(selectors.toggle).click();
          assert.equal(await page.locator(selectors.toggle).getAttribute('aria-expanded'),'true',route+' menu expands');
          assert(await page.locator(selectors.nav).isVisible(),route+' nav visible');
          const expanded=await page.evaluate(s=>{
            const nav=document.querySelector(s.nav),css=getComputedStyle(nav),r=nav.getBoundingClientRect();
            return {bg:css.backgroundColor,color:getComputedStyle(nav.querySelector('a')).color,
              blur:css.backdropFilter,rect:{left:r.left,right:r.right,bottom:r.bottom}};
          },selectors);
          assert(expanded.bg.startsWith('rgba(18, 37, 51,')||expanded.bg.startsWith('rgb(18, 37, 51'),
            route+' dropdown must be smoked glass: '+expanded.bg);
          assert.equal(expanded.color,'rgb(255, 255, 255)',route+' dropdown text white');
          assert(expanded.blur.includes('blur('),route+' dropdown blur');
          assert(expanded.rect.left>=9&&expanded.rect.right<=width-9&&expanded.rect.bottom<=900,route+' dropdown inside viewport');
          if((width===375||width===768)&&(route==='/'||route==='/massage-services/')){
            await page.screenshot({path:path.join(dir,String(width)+'-'+(route==='/'?'home':'services')+'-open.png'),animations:'disabled'});
          }
          await page.keyboard.press('Escape');
          assert.equal(await page.locator(selectors.toggle).getAttribute('aria-expanded'),'false',route+' Escape closes');
          assert(!(await page.locator(selectors.nav).isVisible()),route+' dropdown hides');
        }else{
          assert(state.headerBookVisible&&state.panelVisible,route+' desktop nav and book');
          assert(!state.toggleVisible&&!state.dockVisible,route+' desktop hides mobile UI');
        }
        if((width===375||width===1440)&&(route==='/'||route==='/massage-services/')){
          await page.screenshot({path:path.join(dir,String(width)+'-'+(route==='/'?'home':'services')+'-closed.png'),animations:'disabled'});
        }
        report.push({route,width,...state});
      }
      await ctx.close();
      assert.deepEqual(errors,[],'browser errors at '+width);
    }
  }finally{await browser.close();}
  fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));
  console.log('Unified smoked-glass navigation PASS: 6 widths and 4 pages, mobile menus, dock and reduced motion.');
})().catch(e=>{console.error(e);process.exit(1)});