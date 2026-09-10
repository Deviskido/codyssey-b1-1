// Run with NODE_PATH pointing to your Playwright installation.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const repos=[{name:'interface-lab',description:'Thoughtful interfaces and small experiments.',html_url:'https://github.com/Deviskido/interface-lab',language:'JavaScript',stargazers_count:3},{name:'codyssey-b1-1',description:'A responsive portfolio built with web fundamentals.',html_url:'https://github.com/Deviskido/codyssey-b1-1',language:'HTML',stargazers_count:1},{name:'layout-studies',description:'Exploring flexible layouts for every screen.',html_url:'https://github.com/Deviskido/layout-studies',language:'CSS',stargazers_count:0}];
 let mode='success';
 await page.route('https://api.github.com/**',async route=>{
  if(mode==='network')return route.abort();
  if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,700));
  await route.fulfill({status:mode==='error'?403:200,contentType:'application/json',body:JSON.stringify(mode==='empty'?[]:mode==='error'?{message:'rate limited'}:repos)});
 });
 const go=async()=>{await page.goto('http://127.0.0.1:5500');await page.waitForFunction(()=>document.querySelector('#project-grid').getAttribute('aria-busy')==='false');};
 await go(); assert.equal(await page.locator('.project-card').count(),3);
 await page.getByRole('button',{name:'JavaScript',exact:true}).click(); assert.equal(await page.locator('.project-card').count(),1);
 await page.getByRole('button',{name:'All',exact:true}).click();
 for(const width of [375,767,768,1023,1024,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);assert.equal(await page.locator('.menu-toggle').isVisible(),width<768);}
 await page.setViewportSize({width:375,height:900});await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
 await page.locator('.menu-toggle').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
 await page.setViewportSize({width:1440,height:1000});
 for(const [y,scrolled,top] of [[59,false,false],[60,true,false],[299,true,false],[300,true,true]]){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(100);assert.equal(await page.locator('.site-header').evaluate(e=>e.classList.contains('scrolled')),scrolled);assert.equal(await page.locator('#back-to-top').isVisible(),top);}
 await page.locator('#back-to-top').click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>scrollY),0);
 await page.locator('.nav-links a[href="#about"]').click();await page.waitForTimeout(100);assert.equal(new URL(page.url()).hash,'#about');
 await page.locator('.theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.locator('.theme-toggle').click();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 await page.locator('#contact-form button').click();for(const id of ['name','email','message'])assert.equal(await page.locator('#'+id).getAttribute('aria-invalid'),'true');
 await page.locator('#name').fill('Tester');await page.locator('#email').fill('invalid');await page.locator('#message').fill('Hello');assert.equal(await page.locator('#email').getAttribute('aria-invalid'),'true');
 await page.locator('#email').fill('test@example.com');await page.locator('#contact-form button').click();assert.match(await page.locator('#form-status').textContent(),/Success/);
 for(const id of ['name','email','message']){const old=await page.locator('#'+id).inputValue();await page.locator('#'+id).fill('   ');await page.locator('#contact-form button').click();assert.equal(await page.locator('#'+id).getAttribute('aria-invalid'),'true');await page.locator('#'+id).fill(old);}
 for(const scenario of ['error','network','empty']){mode=scenario;await go();assert.equal(await page.locator('.project-card').count(),0);assert.match(await page.locator('#project-status').textContent(),scenario==='empty'?/표시할 프로젝트가 없습니다/:/프로젝트를 불러올 수 없습니다/);if(scenario!=='empty'){mode='success';await page.locator('#retry').click();await page.waitForSelector('.project-card');assert.equal(await page.locator('.project-card').count(),3);}}
 mode='slow';await page.goto('http://127.0.0.1:5500');assert.match(await page.locator('#project-status').textContent(),/로딩 중/);await page.waitForSelector('.project-card');mode='success';
 // API text must remain inert, including link and attribute payloads.
 repos.push({name:'<img src=x onerror=alert(1)>',description:'<script>alert(1)</script>',html_url:'javascript:alert(1)',language:'<img>',stargazers_count:0});await go();assert.equal(await page.locator('.project-card img,.project-card script').count(),0);assert.equal(await page.locator('.project-card').last().locator('h3 a').getAttribute('href'),'https://github.com/Deviskido');repos.pop();
 await page.evaluate(()=>localStorage.removeItem('portfolio-theme'));await page.emulateMedia({colorScheme:'dark'});await go();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 fs.mkdirSync('images/screenshots',{recursive:true});await go();await page.screenshot({path:'images/screenshots/desktop.png',fullPage:true});await page.locator('.theme-toggle').click();await page.screenshot({path:'images/screenshots/dark.png',fullPage:true});await page.locator('.theme-toggle').click();await page.setViewportSize({width:375,height:900});await page.screenshot({path:'images/screenshots/mobile.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'no-preference'});await go();await page.locator('#about').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#about').classList.contains('visible'));await page.waitForFunction(()=>document.querySelector('#typing').textContent==='thoughtful interfaces.');
 assert.deepEqual(errors,[]);console.log('PASS: responsive widths, navigation, scroll boundaries, theme persistence/system preference, form validation, API states/retry/filtering, safe rendering, reveal animations, typing, screenshots; no page errors.');console.log('Chrome: '+browser.version());await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
