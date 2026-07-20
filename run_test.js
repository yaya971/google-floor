const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

const scripts = [
  'js/i18n.js',
  'js/assets.js',
  'js/global.js',
  'js/entities.js',
  'js/upgrades.js',
  'js/events.js',
  'js/achievements.js',
  'js/player.js',
  'js/multiplayer.js',
  'js/leaderboard.js',
  'js/save.js',
  'js/renderer.js',
  'js/control.js'
];

let scriptContents = '';
for (const s of scripts) {
  scriptContents += fs.readFileSync(s, 'utf8') + '\n';
}

const scriptEl = dom.window.document.createElement("script");
scriptEl.textContent = scriptContents;
dom.window.document.body.appendChild(scriptEl);

dom.window.document.addEventListener("DOMContentLoaded", () => {
    try {
        console.log("DOMContentLoaded fired. Calling G.startNewGame...");
        // Usually index.html calls something or control.js handles it.
        // Let's manually trigger start if it's not started.
        if (dom.window.G && dom.window.G.startNewGame) {
            dom.window.G.startNewGame();
        }
        console.log("Game started successfully.");
    } catch(e) {
        console.error("Error during startup: ", e);
    }
});

// Since JSDOM is synchronous mostly with script execution, we can just wait a tick
setTimeout(() => {
    console.log("Checking errors after 1s...");
    if(dom.window.G) {
        console.log("G object exists. Level: " + dom.window.G.state.level);
    } else {
        console.log("G object not found");
    }
}, 1000);
