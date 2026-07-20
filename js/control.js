/**
 * ══════════════════════════════════════════════════════════════
 * control.js — Gestion des Inputs (Clavier / Souris / Touch)
 * ══════════════════════════════════════════════════════════════
 * Rôle : Gère tous les événements d'entrée utilisateur :
 * - Clic principal sur le bouton G (avec animations)
 * - Raccourcis clavier (1-8 pour compétences, S=save, etc.)
 * - Support tactile (mobile / tablette)
 * - Auto-clicker visuel (curseur fantôme)
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Control = {

  /* ─────────────────────────────────────────────
     ÉTAT
  ───────────────────────────────────────────── */
  isMouseDown: false,
  clickHoldTimer: null,
  lastClickPos: { x: 0, y: 0 },
  keymap: {},

  /* ─────────────────────────────────────────────
     RACCOURCIS CLAVIER
  ───────────────────────────────────────────── */
  SHORTCUTS: {
    'KeyS':    () => { Save.save(); G.showToast('💾 Sauvegardé !', 'info'); },
    'Space':   () => Control.performClick(),
    'Enter':   () => Control.performClick(),
    'KeyP':    () => { if (G.canPrestige()) document.getElementById('btn-prestige')?.click(); },
    'Digit1':  () => Player.useSkill('turboClick'),
    'Digit2':  () => Player.useSkill('dataRush'),
    'Digit3':  () => Player.useSkill('productionBoost'),
    'Digit4':  () => Player.useSkill('moraleBoost'),
    'Digit5':  () => Player.useSkill('coinMagnet'),
    'Digit6':  () => Player.useSkill('criticalStrike'),
    'Digit7':  () => Player.useSkill('timeWarp'),
    'Digit8':  () => Player.useSkill('quantumEntanglement'),
    'Tab':     () => Control._cycleTabs(),
    'KeyM':    () => { G.state.settings.musicEnabled = !G.state.settings.musicEnabled; Assets.toggleMusic(G.state.settings.musicEnabled); G.showToast(G.state.settings.musicEnabled ? '🎵 Musique ON' : '🔇 Musique OFF', 'info'); },
    'Escape':  () => Control._closeAllModals(),
    'KeyN':    () => Multiplayer.switchToNextPlayer(),
  },

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    this._bindClickButton();
    this._bindKeyboard();
    this._bindTabs();
    this._bindModals();
    this._bindSettingsPanel();
    this._bindMiniGame();
    this._bindStats();
    this._bindContextMenu();
    this._bindSearch();
    this._bindBuyMode();
    this._bindBuildingCanvas();

    console.log('🎮 Control module initialisé');
  },

  _bindBuildingCanvas() {
    const canvas = document.getElementById('building-canvas');
    if (!canvas) return;
    canvas.addEventListener('click', (e) => {
      if (typeof Renderer !== 'undefined' && Renderer.goldenCall) {
        const rect = canvas.getBoundingClientRect();
        // Adjust for canvas pixel ratio/size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const dx = x - Renderer.goldenCall.x;
        const dy = y - Renderer.goldenCall.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) {
          // Clicked!
          Renderer.goldenCall = null;
          const bonus = G.rates.gcoinsPerSecond * 120; // 2 minutes of prod
          G.addCoins(Math.max(100, bonus));
          G.showToast(`✨ Golden Call ! +${G.formatCoins(bonus)}`, 'special', 4000);
          if (typeof Assets !== 'undefined') Assets.playSound('achievement');
          G.addLog(`✨ Golden Call: +${G.formatCoins(bonus)}`, 'special');
        }
      }
    });
  },

  /* ─────────────────────────────────────────────
     BOUTON G (CLIC PRINCIPAL)
  ───────────────────────────────────────────── */
  _bindClickButton() {
    const btn = document.getElementById('btn-main-click');
    if (!btn) return;

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      // On release capture so it doesn't get stuck if dragged outside
      btn.releasePointerCapture(e.pointerId);
      
      this.performClick(e.clientX, e.clientY);
      
      this.isMouseDown = true;
      clearInterval(this.clickHoldTimer);
      this.clickHoldTimer = setInterval(() => {
        if (this.isMouseDown) this.performClick();
      }, 100);
    });

    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this.isMouseDown = false;
      clearInterval(this.clickHoldTimer);
    });

    btn.addEventListener('pointercancel', (e) => {
      this.isMouseDown = false;
      clearInterval(this.clickHoldTimer);
    });

    btn.addEventListener('pointerleave', (e) => {
      this.isMouseDown = false;
      clearInterval(this.clickHoldTimer);
    });
    
    // Prevent default context menu (like long press on mobile)
    btn.addEventListener('contextmenu', e => e.preventDefault());
  },

  clickTimestamps: [],

  /* ─────────────────────────────────────────────
     LOGIQUE DU CLIC PRINCIPAL
  ───────────────────────────────────────────── */
  performClick(x, y) {
    if (!x || !y) {
      const btn = document.getElementById('btn-main-click');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    this.lastClickPos = { x, y };
    G.processClick(x, y);

    // Animation du bouton
    const btn = document.getElementById('btn-main-click');
    if (btn) {
      btn.classList.remove('click-pop');
      void btn.offsetWidth;
      btn.classList.add('click-pop');
    }
    
    // Easter Egg (30 clicks in 2 seconds)
    const now = Date.now();
    this.clickTimestamps.push(now);
    this.clickTimestamps = this.clickTimestamps.filter(t => now - t < 2000);
    if (this.clickTimestamps.length >= 30) {
      this.clickTimestamps = []; // Reset
      if (typeof Events !== 'undefined') Events.triggerEasterEgg();
    }
  },

  /* ─────────────────────────────────────────────
     CLAVIER
  ───────────────────────────────────────────── */
  _bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Ignore si focus dans un champ de texte
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const handler = this.SHORTCUTS[e.code];
      if (handler) {
        e.preventDefault();
        handler();
      }
    });

    // Hint clavier
    const hintEl = document.getElementById('keyboard-hint');
    if (hintEl) {
      hintEl.textContent = 'Espace/Entrée = Clic | 1-8 = Compétences | S = Sauvegarder | M = Musique';
    }
  },

  _cycleTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    let current = -1;
    tabs.forEach((t, i) => { if (t.classList.contains('active')) current = i; });
    const next = (current + 1) % tabs.length;
    tabs[next]?.click();
  },

  /* ─────────────────────────────────────────────
     ONGLETS PRINCIPAUX (MOBILE APP TABS)
  ───────────────────────────────────────────── */
  _bindTabs() {
    // 1. Navigation du bas -> Ouvrir une modale
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        // Enlever active
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Cacher toutes les modales
        document.querySelectorAll('.mobile-modal').forEach(m => m.classList.add('hidden'));
        
        // Ouvrir la cible
        const targetId = btn.dataset.target;
        const modal = document.getElementById(targetId);
        if (modal) modal.classList.remove('hidden');

        Assets.playSound('click');
      });
    });

    // 2. Boutons fermeture modales mobile
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.mobile-modal').classList.add('hidden');
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active')); // deselection nav
        Assets.playSound('cancel');
      });
    });

    // 3. Onglets à l'intérieur des modales
    document.querySelectorAll('.m-tab-btn[data-mtab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.mtab;
        const modal = btn.closest('.mobile-modal-content');
        
        // Tabs state
        modal.querySelectorAll('.m-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Content state
        modal.querySelectorAll('.m-tab-content').forEach(c => c.classList.add('hidden'));
        const panel = modal.querySelector(`#${tabId}`);
        if (panel) panel.classList.remove('hidden');

        // Rendu contextuel
        switch (tabId) {
          case 'm-agents':    if (typeof Entities !== 'undefined') Entities.renderAgents(); break;
          case 'm-buildings': if (typeof Entities !== 'undefined') Entities.renderBuildings(); break;
          case 'm-upgrades':  if (typeof Upgrades !== 'undefined') Upgrades.renderUpgrades(); break;
          case 'm-research':  if (typeof Upgrades !== 'undefined') Upgrades.renderResearch(); break;
          case 'm-market':    if (typeof Events !== 'undefined') Events.renderMarket(); break;
          case 'm-quests':    if (typeof Events !== 'undefined') Events.renderQuests(); break;
          case 'm-events':    if (typeof Events !== 'undefined') Events.renderActiveEvents(); break;
          case 'm-skills':    if (typeof Player !== 'undefined') Player.renderSkills(); break;
          case 'm-prestige':  if (typeof Player !== 'undefined') Player.renderPrestige(); break;
        }

        Assets.playSound('click');
      });
    });
  },

  /* ─────────────────────────────────────────────
     MODALS
  ───────────────────────────────────────────── */
  _bindModals() {
    // Fermer en cliquant sur le fond
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
      });
    });

    // Boutons de fermeture génériques
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.closeModal);
        if (modal) modal.classList.add('hidden');
      });
    });

    // Boutons d'ouverture de modals
    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.openModal);
        if (modal) modal.classList.remove('hidden');
      });
    });

    // Modal succès
    const btnAchievements = document.getElementById('btn-achievements-modal');
    if (btnAchievements) {
      btnAchievements.addEventListener('click', () => {
        const modal = document.getElementById('modal-achievements');
        if (modal) {
          modal.classList.remove('hidden');
          if (typeof Achievements !== 'undefined') Achievements.renderAllAchievements();
        }
      });
    }

    // Fermer modal offline
    const btnCloseOffline = document.getElementById('btn-close-offline');
    if (btnCloseOffline) {
      btnCloseOffline.addEventListener('click', () => {
        document.getElementById('modal-offline')?.classList.add('hidden');
      });
    }

    // Bouton jouer (menu principal)
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        const nameInput = document.getElementById('player-name-input');
        const countryInput = document.getElementById('player-country-input');
        const langInput = document.getElementById('player-lang-input');
        
        const name = nameInput?.value.trim() || 'CEO';
        const country = countryInput?.value || 'fr';
        const lang = langInput?.value || 'fr';
        
        if (window.I18n) window.I18n.setLang(lang);
        
        document.getElementById('modal-new-game')?.classList.add('hidden');

        G.startNewGame(name, '🧑‍💻', country, lang);
        if (typeof Entities !== 'undefined') Entities.init();
        if (typeof Upgrades !== 'undefined') Upgrades.init();
        if (typeof Events !== 'undefined') Events.init();
        if (typeof Achievements !== 'undefined') Achievements.init();
        if (typeof Player !== 'undefined') Player.init();
        if (typeof Leaderboard !== 'undefined') Leaderboard.startLiveUpdate();
      });
    }

    // Fermer modals via Escape
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') this._closeAllModals();
    });
  },

  _closeAllModals() {
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
  },

  /* ─────────────────────────────────────────────
     PANNEAU PARAMÈTRES
  ───────────────────────────────────────────── */
  _bindSettingsPanel() {
    // Volume musique
    const musicVol = document.getElementById('music-volume');
    if (musicVol) {
      musicVol.value = G.state.settings.musicVolume * 100;
      musicVol.addEventListener('input', () => {
        const vol = musicVol.value / 100;
        Assets.setMusicVolume(vol);
      });
    }

    // Volume SFX
    const sfxVol = document.getElementById('sfx-volume');
    if (sfxVol) {
      sfxVol.value = G.state.settings.sfxVolume * 100;
      sfxVol.addEventListener('input', () => {
        const vol = sfxVol.value / 100;
        Assets.setSFXVolume(vol);
      });
    }

    // Toggle musique
    const toggleMusic = document.getElementById('toggle-music');
    if (toggleMusic) {
      toggleMusic.checked = G.state.settings.musicEnabled;
      toggleMusic.addEventListener('change', () => Assets.toggleMusic(toggleMusic.checked));
    }

    // Skins
    document.querySelectorAll('[data-skin]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-skin]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (typeof Assets !== 'undefined') Assets.applySkin(btn.dataset.skin);
      });
    });

    // Notifications
    const toggleNotif = document.getElementById('toggle-notifications');
    if (toggleNotif) {
      toggleNotif.checked = G.state.settings.notifications !== false;
      toggleNotif.addEventListener('change', () => {
        G.state.settings.notifications = toggleNotif.checked;
      });
    }

    // Changer le nom
    const btnChangeName = document.getElementById('btn-change-name');
    if (btnChangeName) {
      btnChangeName.addEventListener('click', () => {
        const input = document.getElementById('setting-player-name');
        if (input?.value.trim()) {
          G.state.settings.playerName = input.value.trim();
          if (typeof Player !== 'undefined') Player.renderPlayerCard();
          G.showToast(`👤 Nom changé: ${G.state.settings.playerName}`, 'success');
        }
      });
    }
  },

  /* ─────────────────────────────────────────────
     MINI-JEU INTÉGRÉ
  ───────────────────────────────────────────── */
  _bindMiniGame() {
    const miniGameArea = document.getElementById('minigame-area');
    if (!miniGameArea) return;

    let score = 0;
    let gameActive = false;
    let spawnTimer = null;
    let gameTimer = null;

    const btnStart = document.getElementById('btn-minigame-start');
    const scoreEl  = document.getElementById('minigame-score');
    const timerEl  = document.getElementById('minigame-timer');

    const startMiniGame = () => {
      score = 0;
      gameActive = true;
      let timeLeft = 30;
      if (btnStart) { btnStart.textContent = 'En cours...'; btnStart.disabled = true; }

      // Spawn de "bugs" à cliquer
      spawnTimer = setInterval(() => {
        if (!gameActive) { clearInterval(spawnTimer); return; }
        this._spawnMiniGameBug(miniGameArea, () => {
          score++;
          if (scoreEl) scoreEl.textContent = score;
          Assets.playSound('click');
        });
      }, 800);

      gameTimer = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.textContent = timeLeft + 's';
        if (timeLeft <= 0) {
          clearInterval(spawnTimer);
          clearInterval(gameTimer);
          gameActive = false;

          G.state.minigameScore = score;
          if (score > G.state.minigameBestScore) G.state.minigameBestScore = score;

          const reward = score * 100 * G.state.level;
          G.addCoins(reward);
          G.addXP(score * 10);
          G.showToast(`🎮 Mini-jeu terminé ! Score: ${score} | +${G.formatCoins(reward)}`, 'special', 5000);

          if (btnStart) { btnStart.textContent = 'Rejouer'; btnStart.disabled = false; }
          if (timerEl) timerEl.textContent = '30s';

          if (typeof Achievements !== 'undefined') {
            Achievements.check('minigame', score);
          }
        }
      }, 1000);
    };

    if (btnStart) btnStart.addEventListener('click', startMiniGame);
  },

  _spawnMiniGameBug(container, onClickCallback) {
    const bug = document.createElement('div');
    const size = G.randInt(24, 48);
    const x = G.randInt(5, 90);
    const y = G.randInt(10, 85);
    const bugs = ['🐛', '🪲', '🦟', '🕷️', '🐞', '🦠'];

    bug.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      font-size: ${size}px;
      cursor: pointer;
      user-select: none;
      animation: bugPop 0.2s ease, bugFade 3s ease forwards;
      z-index: 5;
      transition: transform 0.1s ease;
    `;
    bug.textContent = bugs[G.randInt(0, bugs.length - 1)];
    bug.title = 'Clic pour éliminer !';

    bug.addEventListener('click', () => {
      bug.style.transform = 'scale(2)';
      bug.style.opacity = '0';
      setTimeout(() => bug.remove(), 200);
      onClickCallback();
    });

    container.appendChild(bug);
    setTimeout(() => { if (bug.parentNode) bug.remove(); }, 3000);
  },

  /* ─────────────────────────────────────────────
     STATISTIQUES
  ───────────────────────────────────────────── */
  _bindStats() {
    // Le rendu est déclenché lors de l'ouverture de l'onglet
  },

  _renderStats() {
    const container = document.getElementById('tab-stats');
    if (!container) return;

    const statsEl = document.getElementById('stats-content');
    if (!statsEl) return;

    const totalAgents = Object.values(G.state.agents).reduce((s, a) => s + a.count, 0);
    const totalBuildings = Object.values(G.state.buildings).reduce((s, b) => s + b.count, 0);
    const achCount = Object.values(G.state.achievements).filter(a => a.unlocked).length;

    statsEl.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${G.formatCoins(G.state.gcoinsAllTime)}</div>
          <div class="stat-label">G-Coins cumulés</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.formatNum(G.state.clickCount)}</div>
          <div class="stat-label">Clics effectués</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.formatCoins(G.rates.gcoinsPerSecond)}/s</div>
          <div class="stat-label">Production actuelle</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.formatNum(totalAgents)}</div>
          <div class="stat-label">Agents actifs</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.formatNum(totalBuildings)}</div>
          <div class="stat-label">Bâtiments construits</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.state.totalAgentsHired}</div>
          <div class="stat-label">Total agents recrutés</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.state.totalUpgradesBought}</div>
          <div class="stat-label">Upgrades achetés</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.state.totalResearchCompleted}</div>
          <div class="stat-label">Recherches complètes</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${achCount} / ${Object.keys(Achievements.LIST).length}</div>
          <div class="stat-label">Succès débloqués</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.state.prestige}</div>
          <div class="stat-label">Prestiges</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.formatTime(G.state.totalPlayTime / 1000)}</div>
          <div class="stat-label">Temps de jeu</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.state.reputation.toFixed(0)}</div>
          <div class="stat-label">Réputation</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.formatNum(Math.ceil(G.state.clickPower * G.state.clickMultiplier))}</div>
          <div class="stat-label">Puissance de clic</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${(G.state.critChance * 100).toFixed(1)}%</div>
          <div class="stat-label">Chance critique</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.formatNum(G.state.data.toFixed(0))}</div>
          <div class="stat-label">Data stockée</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${G.state.totalEventsTriggered}</div>
          <div class="stat-label">Événements vécus</div>
        </div>
      </div>
    `;
  },

  /* ─────────────────────────────────────────────
     MENU CONTEXTUEL (clic droit)
  ───────────────────────────────────────────── */
  _bindContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      const isGameArea = e.target.closest('#game-screen');
      if (!isGameArea) return;

      e.preventDefault();
      this._showContextMenu(e.clientX, e.clientY);
    });

    document.addEventListener('click', () => {
      const menu = document.getElementById('context-menu');
      if (menu) menu.remove();
    });
  },

  _showContextMenu(x, y) {
    const existing = document.getElementById('context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 4px;
      z-index: 9999;
      min-width: 160px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;

    const items = [
      { label: '💾 Sauvegarder', action: () => Save.save() },
      { label: '📋 Exporter', action: () => Save.exportSave() },
      { label: '⚡ Turbo-Click', action: () => Player.useSkill('turboClick') },
      { label: '🧲 Magnétisme', action: () => Player.useSkill('coinMagnet') },
      { separator: true },
      { label: `🎵 ${G.state.settings.musicEnabled ? 'Désactiver' : 'Activer'} Musique`, action: () => Assets.toggleMusic(!G.state.settings.musicEnabled) },
    ];

    items.forEach(item => {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:var(--border-color);margin:4px 0';
        menu.appendChild(sep);
        return;
      }
      const btn = document.createElement('button');
      btn.style.cssText = `
        display:block;width:100%;padding:6px 10px;
        background:none;border:none;color:var(--text-primary);
        font-size:12px;text-align:left;cursor:pointer;border-radius:4px;
        font-family:var(--font-ui);
      `;
      btn.textContent = item.label;
      btn.onmouseover = () => btn.style.background = 'var(--bg-elevated)';
      btn.onmouseout  = () => btn.style.background = 'none';
      btn.onclick = () => { item.action(); menu.remove(); };
      menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    // Ajuste position si hors écran
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth)  menu.style.left = `${x - rect.width}px`;
    if (rect.bottom > window.innerHeight) menu.style.top = `${y - rect.height}px`;
  },

  /* ─────────────────────────────────────────────
     RECHERCHE D'AGENTS
  ───────────────────────────────────────────── */
  _bindSearch() {
    const searchInput = document.getElementById('agent-search');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (typeof Entities !== 'undefined') Entities.filterAgents(searchInput.value);
        }, 200);
      });
    }
  },

  /* ─────────────────────────────────────────────
     MODE D'ACHAT (x1 / x10 / x100 / Max)
  ───────────────────────────────────────────── */
  _bindBuyMode() {
    document.querySelectorAll('.buy-mode-btn[data-qty]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.buy-mode-btn[data-qty]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        G.state.buyQty = parseInt(btn.dataset.qty) || 1;
        G.showToast(`Mode achat: ×${G.state.buyQty}`, 'info', 1500);
      });
    });
  },
};

window.Control = Control;
