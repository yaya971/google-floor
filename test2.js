const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const virtualConsole = new (require('jsdom').VirtualConsole)();
virtualConsole.on("error", () => { console.log("error", ...arguments); });
virtualConsole.on("warn", () => { console.log("warn", ...arguments); });
virtualConsole.on("info", () => { console.log("info", ...arguments); });
virtualConsole.on("dir", () => { console.log("dir", ...arguments); });

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

dom.window.addEventListener('error', (event) => {
  console.log("Window error:", event.error);
});
dom.window.addEventListener('unhandledrejection', (event) => {
  console.log("Window unhandledrejection:", event.reason);
});

setTimeout(() => {
  console.log("Done waiting");
  process.exit(0);
}, 2000);
