'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = [
  'index.html',
  'about/index.html',
  'contact/index.html',
  'gallery/index.html',
  'massage-menu/index.html',
  'massage-services/index.html',
  'massage-services/body-massage/index.html',
  'massage-services/chair-massage/index.html',
  'massage-services/combination-massage/index.html',
  'massage-services/couples-massage/index.html',
  'massage-services/foot-reflexology/index.html',
  'massage-services/four-hands-massage/index.html',
  'massage-services/specialty-techniques/index.html'
];
const check = process.argv.includes('--check');
const footer = prefix => `<footer class="em-footer" aria-label="Site footer">
  <div class="em-footer__inner">
    <div class="em-footer__masthead">
      <a class="em-footer__brand" href="${prefix}">Elegant <em>Massage.</em><small>FLOWER MOUND · TEXAS</small></a>
      <a class="em-footer__book" href="https://elegantmassage.setmore.com/#services" target="_blank" rel="noopener noreferrer">Reserve your time <span aria-hidden="true">↗</span></a>
    </div>
    <div class="em-footer__body">
      <div class="em-footer__intro"><p>Massage appointments in Flower Mound, Texas. Explore the treatments and reserve through the existing online scheduling page.</p></div>
      <nav class="em-footer__nav" aria-label="Footer navigation">
        <span class="em-footer__label">EXPLORE</span>
        <a href="${prefix}massage-services/">Massage Services</a>
        <a href="${prefix}massage-menu/">Massage Menu</a>
        <a href="${prefix}about/">About</a>
        <a href="${prefix}gallery/">Gallery</a>
        <a href="${prefix}contact/">Contact</a>
      </nav>
      <div class="em-footer__contact">
        <span class="em-footer__label">VISIT &amp; CONNECT</span>
        <a href="tel:+12145132288">(214) 513-2288</a>
        <a href="mailto:Relax@Elegant-Massage.com">Relax@Elegant-Massage.com</a>
        <a href="https://www.google.com/maps/search/?api=1&amp;query=2911+Cross+Timbers+Rd+Suite+105+Flower+Mound+TX+75028" target="_blank" rel="noopener noreferrer">Get directions <span aria-hidden="true">↗</span></a>
        <p>2911 Cross Timbers Rd, Suite 105<br>Flower Mound, TX 75028</p>
      </div>
    </div>
    <div class="em-footer__bottom"><span>© 2026 Elegant Massage LLC</span><span>Design preview · not indexed · not approved for public launch</span></div>
  </div>
</footer>`;

let changed = 0;
for (const relative of pages) {
  const file = path.join(root, relative);
  const prefix = '../'.repeat(relative.split('/').length - 1) || './';
  const stylesheet = `<link rel="stylesheet" href="${prefix}assets/css/unified-footer.css">`;
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/);
  if (!match) throw new Error(`No footer in ${relative}`);
  let next = source.replace(match[0], footer(prefix));
  if (!next.includes(stylesheet)) next = next.replace('</head>', stylesheet + '</head>');
  if (check && next !== source) throw new Error(`Footer drift in ${relative}`);
  if (!check && next !== source) {
    fs.writeFileSync(file, next);
    changed++;
  }
}
console.log(check ? `Footer consistent on ${pages.length} pages.` : `Updated ${changed} of ${pages.length} pages.`);
