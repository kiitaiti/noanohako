/**
 * ビルド後の検証スクリプト: node scripts/verify.mjs
 *  - 旧情報（WORK PLAN / PLAY PLAN / 9:45 / 13:00〜18:00 / 時給200円 等）の混入チェック
 *  - 内部リンク切れチェック（dist 内に対応ファイルがあるか）
 *  - 各ページの title / description / canonical / H1 の数 / JSON-LD の妥当性
 *  - Netlify Forms の属性、画像の alt / width / height / loading
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const BANNED = [
  'WORK PLAN', 'PLAY PLAN', 'WORKPLAN', 'PLAYPLAN', 'ワークプラン', 'プレイプラン',
  '遊ぶプラン', '働くプラン', '2つのプラン', '9:45', '13:00〜18:00', '13:00～18:00',
  '10:00〜12:00', '10:00～12:00', '時給200円', '火曜～土曜', '火曜〜土曜', '習熟度別', '到達目標',
  'eスポーツコース', 'インセンティブ', '翌月',
];
const REQUIRED_ON_HOME = ['10:00〜15:00', '12:00〜13:00', '時給500円', 'カフェ中心', 'クリエイティブ中心', '就労継続支援B型'];

const htmlFiles = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

let errors = 0;
const err = (m) => { errors++; console.error('  ✗', m); };
const ok = (m) => console.log('  ✓', m);

console.log(`\n対象: ${htmlFiles.length} ページ\n`);

for (const file of htmlFiles) {
  const rel = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
  console.log(rel);

  // 旧情報
  for (const b of BANNED) {
    if (text.includes(b)) err(`旧情報の混入: "${b}"`);
  }
  if (rel === '/') for (const r of REQUIRED_ON_HOME) if (!text.includes(r)) err(`トップに必須語句なし: "${r}"`);

  // メタ
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) err('title なし'); else if (title.length > 70) console.log('  △ title が長め:', title.length, '文字');
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!desc) err('meta description なし'); else if (desc.length > 160) console.log('  △ description が長め:', desc.length, '文字');
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!canonical) err('canonical なし');
  else if (rel !== '/404/' && !canonical.endsWith(rel) && !(rel === '/404.html')) console.log('  △ canonical:', canonical);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(`H1 が ${h1} 個`);
  if (!html.includes('property="og:image"')) err('og:image なし');

  // JSON-LD
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (lds.length === 0) err('JSON-LD なし');
  for (const m of lds) {
    try { JSON.parse(m[1]); } catch (e) { err('JSON-LD パース失敗: ' + e.message); }
  }

  // 画像
  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = img[0];
    if (!/\balt(=|\s|>)/.test(tag)) err('alt なし: ' + tag.slice(0, 80));
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) err('width/height なし: ' + tag.slice(0, 80));
  }

  // 内部リンク
  for (const a of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = a[1];
    if (href.startsWith('/_astro/') || href.startsWith('/favicon') || href.startsWith('/apple-touch') || href.startsWith('/site.webmanifest') || href.startsWith('/og-image')) {
      if (!existsSync(join(DIST, href))) err('静的ファイルなし: ' + href);
      continue;
    }
    const target = href.endsWith('/') ? join(DIST, href, 'index.html') : join(DIST, href);
    if (!existsSync(target) && !existsSync(target + '/index.html')) err('リンク切れ: ' + href);
  }

  // フォーム
  if (rel === '/contact/') {
    if (!/data-netlify="true"/.test(html)) err('Netlify Forms 属性なし');
    if (!/name="form-name" value="contact"/.test(html)) err('form-name hidden なし');
    if (!/netlify-honeypot/.test(html)) err('honeypot なし');
    for (const v of ['WORK', 'PLAY']) if (new RegExp(`value="[^"]*${v}`).test(html)) err('旧プランの選択肢: ' + v);
    ok('Netlify Forms 属性 OK');
  }
  // noindex
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] || '';
  if ((rel === '/contact/thanks/' || rel === '/404.html') && !robots.includes('noindex')) err('noindex なし');
  if (!(rel === '/contact/thanks/' || rel === '/404.html') && robots.includes('noindex')) err('意図しない noindex');
}

// sitemap / robots
const sm = existsSync(join(DIST, 'sitemap-index.xml')) && existsSync(join(DIST, 'sitemap-0.xml'));
if (!sm) err('sitemap なし'); else {
  const s = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
  if (s.includes('/contact/thanks/')) err('sitemap に thanks が含まれる');
  ok('sitemap OK (' + (s.match(/<loc>/g) || []).length + ' URL)');
}
if (!existsSync(join(DIST, 'robots.txt'))) err('robots.txt なし'); else ok('robots.txt OK');

console.log(errors ? `\n✗ ${errors} 件の問題` : '\n✓ すべての検証に合格');
process.exit(errors ? 1 : 0);
