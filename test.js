const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.addEventListener('error', (event) => {
  console.log("Window error:", event.error);
});

setTimeout(() => {
  console.log("Done waiting");
  process.exit(0);
}, 2000);
