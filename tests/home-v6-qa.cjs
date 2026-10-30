const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const BASE='http://127.0.0.1:8765',OUT='qa-v6',STORE='https://elegantmassage.setmore.com/#services';
fs.mkdirSync(OUT,{recursive:true});
const widths=[375,390,430,768,1024,1440],errors=[],report=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg)};
(async()=>{
const b=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try{
for(const width of widths){
 const height=width<=430?812:900,ctx=await b.newContext({viewport:{width,height},reducedMotion:'no-preference'});
 const p=await ctx.newPage(),pageErrors=[];
 p.on('pageerror',e=>pageErrors.push(e.message));
 const response=await p.goto(BASE+'/',{waitUntil:'domcontentloaded'});
 await p.locator('.v6-explorer.is-enhanced').waitFor({timeout:12000});
 const data=await p.evaluate(()=>{
  const css=x=>getComputedStyle(document.querySelector(x));
  const root=document.querySelector('#treatments-cinema');
  const bounds=document.querySelector('main h1').getBoundingClientRect();
  return {
   width:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth,
   h1:document.querySelectorAll('main h1').length,sections:document.querySelectorAll('main section').length,
   panels:document.querySelectorAll('[data-v6-panel]').length,tabs:document.querySelectorAll('[data-v6-choice]').length,
   visiblePanels:[...document.querySelectorAll('[data-v6-panel]')].filter(x=>!x.hidden).length,
   h1Visible:bounds.width>0&&bounds.left>=-4&&bounds.right<=innerWidth+4,
   robots:document.querySelector('meta[name=robots]')?.content,
   book:document.querySelector('.header-cta')?.getAttribute('href'),
   allBook:[...document.querySelectorAll('a[href*="setmore"]')].every(x=>x.href==='https://elegantmassage.setmore.com/#services'),
   photoFilter:css('.v6-panel__photo').filter,cinemaFilter:css('.em-cinema .em-treatment-feature__image').filter,
   localFilter:css('.v6-location__photos img').filter,immersive:root.classList.contains('is-immersive'),
   cinemaCost:root.offsetHeight/innerHeight,skip:!!document.querySelector('.v6-cinema-quick a[href="#current-services"]'),
   directRoutes:document.querySelectorAll('[data-v6-panel] a[href*="massage-services"]').length,
   originalPhotos:document.querySelectorAll('.v6-location__photos img[src*="flower-mound"]').length
  };
 });
 check(response.status()===200,width+' status failure');
 check(data.width===width&&data.body<=width+2&&data.html<=width+2,width+' horizontal overflow');
 check(data.h1===1&&data.sections===6,width+' architecture failure');
 check(data.tabs===6&&data.panels===6&&data.visiblePanels===1&&data.directRoutes===6,width+' six-service explorer failure');
 check(data.h1Visible&&data.robots?.includes('noindex')&&data.book===STORE&&data.allBook,width+' metadata/hero/booking failure');
 check(data.photoFilter==='none'&&data.cinemaFilter==='none'&&data.localFilter==='none',width+' image filter remains');
 check(data.skip&&data.originalPhotos===2,width+' cinema skip/original location photo missing');
 check(width>=1024?data.immersive:!data.immersive,width+' cinema breakpoint failure');
 if(width<=870){
  await p.locator('button.toggle').click();
  check(await p.locator('.navigation').isVisible(),width+' navigation not opened');
  await p.keyboard.press('Escape');
  check(!(await p.locator('.navigation').isVisible()),width+' navigation Escape failure');
 }
 const tabs=p.locator('[data-v6-choice]');
 await tabs.first().focus();await p.keyboard.press('ArrowDown');
 check(await tabs.nth(1).getAttribute('aria-selected')==='true',width+' tab keyboard failure');
 const foot=p.locator('#v6-panel-foot');
 check(await foot.isVisible()&&(await foot.locator('a[href^="tel:"]').count())===1,width+' foot availability/call failure');
 await p.locator('#v6-choice-four').click();
 check(await p.locator('#v6-choice-four').getAttribute('aria-selected')==='true',width+' active click failure');
 check(await p.locator('#v6-panel-body').isHidden(),width+' inactive panel remains visible');
 const photo=await p.locator('#v6-panel-four .v6-panel__photo').evaluate(x=>getComputedStyle(x).backgroundImage);
 check(photo.includes('four-hands-batch02-'+(width<=640?'mobile':'desktop')+'.webp'),width+' responsive photo mapping');
 await p.locator('#v6-choice-body').click();
 await p.locator('.v6-explorer').screenshot({path:path.join(OUT,'home-v6-'+width+'-explorer.png'),animations:'disabled'});
 await p.screenshot({path:path.join(OUT,'home-v6-'+width+'-full.png'),fullPage:true,animations:'disabled'});
 if(width>=1024){
  const start=await p.locator('#treatments-cinema').evaluate(root=>{const stage=root.querySelector('.em-cinema__stage');return {top:scrollY+root.getBoundingClientRect().top,travel:root.offsetHeight-stage.offsetHeight}});
  const samples=[];
  for(const f of [.16,.42,.79,.995]){
   await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start.top+start.travel*f);
   await p.waitForTimeout(160);
   const s=await p.evaluate(()=>{const scenes=[...document.querySelectorAll('.em-cinema__stage > .em-treatment-feature')];return {active:scenes.findIndex(x=>x.classList.contains('is-current')),zoom:parseFloat(scenes[2].style.getPropertyValue('--em-zoom'))}});
   samples.push(s);
   if(width===1440)await p.locator('.em-cinema__stage').screenshot({path:path.join(OUT,'cinema-v6-'+Math.round(f*100)+'.png'),animations:'disabled'});
  }
  check(samples[0].active===0&&samples[1].active===1&&samples[2].active===2,width+' cinema sequence broken');
  check(samples[3].zoom>samples[2].zoom+.05,width+' cinema final zoom broken');
  data.samples=samples;
 }
 await p.goto(BASE+'/',{waitUntil:'domcontentloaded'});
 await p.locator('a[href="#current-services"]').first().click();
 await p.waitForTimeout(300);
 const skipped=await p.evaluate(()=>({hash:location.hash,top:document.querySelector('#current-services').getBoundingClientRect().top}));
 check(skipped.hash==='#current-services'&&skipped.top<height,width+' cannot skip cinematic story');
 check(pageErrors.length===0,width+' JS error '+pageErrors.join('|'));
 report.push(data);await ctx.close();
}
const reduced=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const rp=await reduced.newPage();await rp.goto(BASE+'/',{waitUntil:'domcontentloaded'});
const rstate=await rp.evaluate(()=>({immersive:document.querySelector('.em-cinema').classList.contains('is-immersive'),video:document.querySelector('#hero-film').hidden}));
check(!rstate.immersive&&rstate.video,'reduced-motion fallback failed');await reduced.close();
const nojs=await b.newContext({viewport:{width:375,height:812},javaScriptEnabled:false});
const np=await nojs.newPage();await np.goto(BASE+'/',{waitUntil:'domcontentloaded'});
const nojsState=await np.evaluate(()=>({visible:[...document.querySelectorAll('[data-v6-panel]')].filter(x=>getComputedStyle(x).display!=='none').length,links:document.querySelectorAll('[data-v6-panel] a[href]').length}));
check(nojsState.visible===6&&nojsState.links===12,'no-JS explorer fallback broken');await nojs.close();
for(const route of ['/','/massage-services/','/massage-services/body-massage/','/massage-services/foot-reflexology/','/massage-services/combination-massage/','/massage-services/chair-massage/','/massage-services/couples-massage/','/massage-services/four-hands-massage/','/massage-services/specialty-techniques/','/massage-menu/','/about/','/gallery/','/contact/']){
 const ctx=await b.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
 const p=await ctx.newPage(),res=await p.goto(BASE+route,{waitUntil:'domcontentloaded'});
 const info=await p.evaluate(()=>({h1:document.querySelectorAll('main h1').length,robots:document.querySelector('meta[name=robots]')?.content,overflow:document.documentElement.scrollWidth>innerWidth+2,book:document.querySelector('.header-cta')?.href}));
 check(res?.status()===200&&info.h1===1&&info.robots?.includes('noindex')&&!info.overflow&&info.book?.startsWith('https://elegantmassage.setmore.com/'),'route regression '+route);
 await ctx.close();
}
report.push({reduced:rstate,nojs:nojsState,routes:13});
}finally{await b.close()}
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({passed:errors.length===0,errors,report},null,2));
console.log(JSON.stringify({passed:errors.length===0,errors,viewports:report.filter(x=>x.width).map(x=>({width:x.width,scrollCost:x.cinemaCost,sections:x.sections,panels:x.panels}))},null,2));
if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
