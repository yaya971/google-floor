const { JSDOM } = require('jsdom');
const path = require('path');

const dom = JSDOM.fromFile(path.join(__dirname, 'index.html'), {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
  dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  
  const virtualConsole = dom.window._virtualConsole;
  dom.window.addEventListener('error', (event) => {
    console.log("Window error:", event.error ? event.error.message : event.message);
  });
  dom.window.addEventListener('unhandledrejection', (event) => {
    console.log("Window unhandledrejection:", event.reason);
  });
  
  setTimeout(() => {
    console.log("Done waiting, current loading text:", dom.window.document.getElementById('loading-text').textContent);
    process.exit(0);
  }, 3000);
});
