import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = new URL('../vaktinde/src/features/legal/documents.ts', root);
const { PRIVACY_POLICY, TERMS_OF_USE, LEGAL_LAST_UPDATED } = await import(source);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const base = 'https://alisahindev.github.io/vaktinde-legal/';
const store = 'https://apps.apple.com/app/id6777545130';

for (const [name, document] of Object.entries({ privacy: PRIVACY_POLICY, terms: TERMS_OF_USE })) {
  for (const locale of ['tr', 'en']) {
    const path = `${name}${locale === 'en' ? '-en' : ''}.html`;
    const html = read(path);
    const sections = [...html.matchAll(/<h2>(.*?)<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*)+)/g)].map((match) => ({
      heading: text(match[1]).replace(/^\d+\. /, ''),
      paragraphs: [...match[2].matchAll(/<p>([\s\S]*?)<\/p>/g)].map((paragraph) => text(paragraph[1])),
    }));
    assert.deepEqual(sections, document[locale], `${path}: source content differs`);
    const date = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      dateStyle: 'long', timeZone: 'UTC',
    }).format(new Date(`${LEGAL_LAST_UPDATED}T00:00:00Z`));
    assert.ok(html.includes(date), `${path}: wrong legal date`);
  }
}

const pages = readdirSync(root).filter((path) => path.endsWith('.html')).concat('tr/index.html', 'en/index.html');
for (const path of pages) {
  const html = read(path);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1, `${path}: expected one H1`);
  assert.ok(!html.includes('play.google.com'), `${path}: public Play link`);
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    assert.equal(script[1].trim(), 'type="application/ld+json"', `${path}: executable or external script`);
    JSON.parse(script[2]);
  }
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^[a-z]+:|^#/i.test(href)) continue;
    const target = new URL(href, new URL(path, root));
    if (target.pathname.endsWith('/')) target.pathname += 'index.html';
    assert.ok(statSync(target).isFile(), `${path}: broken local link ${href}`);
  }
}

for (const locale of ['tr', 'en']) {
  const html = read(`${locale}/index.html`);
  assert.ok(html.includes(`<link rel="canonical" href="${base}${locale}/">`));
  for (const [language, target] of [['tr', 'tr'], ['en', 'en'], ['x-default', 'en']]) {
    assert.ok(html.includes(`<link rel="alternate" hreflang="${language}" href="${base}${target}/">`));
  }
  assert.ok(html.includes('<meta name="apple-itunes-app" content="app-id=6777545130">'));
  assert.ok(!html.includes('noindex'));
  assert.ok(html.includes(`href="${store}"`));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@type'], 'MobileApplication');
  assert.equal(schema.url, `${base}${locale}/`);
  assert.equal(schema.downloadUrl, store);
  for (const field of ['aggregateRating', 'review', 'offers', 'price']) assert.ok(!(field in schema));
  assert.ok(html.includes(`content="${schema.description}"`));
  assert.ok(statSync(new URL(`assets/today-${locale}.webp`, root)).size <= 200_000);
  assert.ok(html.includes(locale === 'en' ? '../privacy-en.html' : '../privacy.html'));
  assert.ok(html.includes(locale === 'en' ? '../terms-en.html' : '../terms.html'));
  assert.ok(read('index.html').includes(`href="${locale}/"`));
  const deletion = read(`delete-account${locale === 'en' ? '-en' : ''}.html`);
  assert.ok(deletion.includes('mailto:alisahindev@gmail.com?subject='));
  assert.ok(!deletion.includes('→ Hesap →') && !deletion.includes('→ Account →'));
}

assert.deepEqual([...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]), [`${base}tr/`, `${base}en/`]);
assert.ok(read('robots.txt').includes(`Sitemap: ${base}sitemap.xml`));
console.log(`PASS: legal source parity, dates, SEO, assets and local links (${pages.length} pages; ${fileURLToPath(root)})`);
