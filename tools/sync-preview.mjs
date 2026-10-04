import {readFileSync,writeFileSync,existsSync} from 'node:fs';
// star-letter dev serves the project root without Vite's TypeScript transforms.
// Keep the SDK in the host's direct game iframe, with assets based in dist/.
const html=readFileSync('dist/index.html','utf8');
if(!html.includes('type="module"')||html.includes('/src/'))throw Error('Expected a compiled Vite entry');
for(const match of html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)){
 if(!existsSync('dist/'+match[1]))throw Error('Missing compiled resource: '+match[1]);
}
writeFileSync('index.html',html.replace('<head>','<head><base href="./dist/">'));
console.log('Synced star-letter root preview to compiled dist entry.');
