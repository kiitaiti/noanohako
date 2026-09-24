import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const base = 'http://localhost:4321';
let fails = 0;
const check = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fails++; };

// 1) 初期HTMLに本文があるか（JSなし）
const ctxNoJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
const p0 = await ctxNoJs.newPage();
await p0.goto(base + '/');
check(await p0.locator('text=時給500円').count() > 0, 'JS無効でも工賃が本文で読める');
check(await p0.locator('h1').innerText() !== '', 'JS無効でもH1あり');
check(await p0.locator('.faq__item').count() > 0, 'JS無効でもFAQ(details)が存在');
check(await p0.locator('[data-reveal]').first().isVisible(), 'JS無効時に data-reveal 要素が表示されている');
await ctxNoJs.close();

// 2) フォームのバリデーション（送信先未設定のため送信は行わない）
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto(base + '/contact/');
await p.click('#submit-btn');
check((await p.locator('#name-err').innerText()).length > 0, '空送信でお名前エラー表示');
check((await p.locator('#role-err').innerText()).length > 0, '空送信でお立場エラー表示');
check((await p.locator('#privacy-err').innerText()).length > 0, '空送信で同意エラー表示');
check(await p.evaluate(() => document.activeElement?.id === 'name'), '最初のエラー項目にフォーカス移動');
await p.fill('#name', 'テスト');
check((await p.locator('#name-err').innerText()) === '', '入力でエラーが消える');
await p.fill('#email', 'invalid');
await p.click('#submit-btn');
check((await p.locator('#email-err').innerText()).includes('形式'), 'メール形式エラー');

// 3) モバイルメニュー
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const mp = await m.newPage();
await mp.goto(base + '/');
check(!(await mp.locator('#global-nav').isVisible()), 'SP: 初期状態でメニュー非表示');
await mp.click('.header__toggle');
check(await mp.locator('#global-nav').isVisible(), 'SP: トグルでメニュー表示');
check((await mp.locator('.header__toggle').getAttribute('aria-expanded')) === 'true', 'SP: aria-expanded=true');
check(!(await mp.locator('.cursor-box').isVisible()), 'SP: カーソル追従は非表示');
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
check(!overflow, 'SP: 横スクロールが発生しない');
await m.close();

// 4) カーソル追従（PC）
await p.goto(base + '/');
await p.mouse.move(400, 400);
await p.waitForTimeout(200);
check(await p.locator('.cursor-box').evaluate((el) => el.classList.contains('is-visible')), 'PC: マウス移動でカーソル表示');
const btn = p.locator('.hero__actions a').first();
const bb = await btn.boundingBox();
await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(200);
check(await p.locator('.cursor-box').evaluate((el) => el.classList.contains('is-link')), 'PC: リンク上で is-link');
check(await p.locator('.cursor-box').evaluate((el) => getComputedStyle(el).pointerEvents === 'none'), 'PC: pointer-events none');
check((await p.locator('.cursor-box').getAttribute('aria-hidden')) === 'true', 'PC: aria-hidden');
await p.goto(base + '/contact/');
await p.locator('#name').hover();
await p.waitForTimeout(200);
check(await p.locator('.cursor-box').evaluate((el) => el.classList.contains('is-input')), 'PC: 入力欄で装飾を抑制');

// 5) reduced motion
const rm = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
const rp = await rm.newPage();
await rp.goto(base + '/');
await rp.mouse.move(300, 300);
check(!(await rp.locator('.cursor-box').isVisible()), 'reduced-motion: カーソル追従なし');
await rm.close();

// 6) FAQ アコーディオン / キーボード
await p.goto(base + '/faq/');
const d = p.locator('.faq__item').nth(1);
await d.locator('summary').focus();
await p.keyboard.press('Enter');
await p.waitForTimeout(400);
check(await d.evaluate((el) => el.open), 'FAQ: キーボードで開く');

// 7) 404
const r = await p.goto(base + '/no-such-page/');
check(r.status() === 404, '存在しないURLは 404 を返す (preview)');

// 8) console errors
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
for (const u of ['/', '/service/', '/guide/', '/contact/']) await p.goto(base + u);
check(errs.length === 0, 'JSエラーなし ' + (errs.join('; ') || ''));

await browser.close();
console.log(fails ? `\n✗ ${fails} 件失敗` : '\n✓ 機能テスト合格');
process.exit(fails ? 1 : 0);
