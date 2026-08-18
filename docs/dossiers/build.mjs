import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MARGIN = { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' };

const FOOTER = `
<div style="position:relative;width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;color:#7b8794;padding:0 15mm;">
  <div style="text-align:center;">Evenue — Bloc 4 · Maintien en condition opérationnelle</div>
  <div style="position:absolute;right:15mm;top:0;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>
</div>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });

async function render(htmlFile, outFile, withFooter) {
	const page = await browser.newPage();
	await page.goto(pathToFileURL(path.join(DIR, htmlFile)).href, { waitUntil: 'networkidle0' });
	await page.pdf({
		path: path.join(DIR, outFile),
		format: 'A4',
		printBackground: true,
		margin: MARGIN,
		displayHeaderFooter: withFooter,
		headerTemplate: '<div></div>',
		footerTemplate: withFooter ? FOOTER : '<div></div>'
	});
	await page.close();
	console.log(`✓ ${outFile}`);
}

await render('cover.html', 'cover.pdf', false);
await render('body.html', 'body.pdf', true);

await browser.close();
