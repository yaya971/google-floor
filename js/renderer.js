/**
 * ══════════════════════════════════════════════════════════════
 * renderer.js — Moteur de Rendu Graphique
 * ══════════════════════════════════════════════════════════════
 * Rôle : Met à jour tous les éléments visuels du DOM
 * à chaque frame/tick. Gère les HUD, les compteurs, les
 * particules, les animations de l'immeuble et les graphiques.
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Renderer = {

  /* ─────────────────────────────────────────────
     FRAME COUNTER
  ───────────────────────────────────────────── */
  frame: 0,
  lastFPS: 0,
  fpsTimer: 0,
  fpsCount: 0,

  /* ─────────────────────────────────────────────
     CACHE DES ÉLÉMENTS DOM (perf)
  ───────────────────────────────────────────── */
  els: {},

  /* ─────────────────────────────────────────────
     GRAPHIQUE PRODUCTION (mini history)
  ───────────────────────────────────────────── */
  productionHistory: [],
  MAX_HISTORY: 30,
  
  goldenCall: null,

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    this._cacheElements();
    this._startRenderLoop();
    this._bindHoverTooltips();
    this.updateFloorVisuals(); // Init floor visuals
    console.log('🎨 Renderer module initialisé');
  },

  _cacheElements() {
    const ids = [
      'val-gcoins', 'coins-per-sec', 'val-data', 'val-energy',
      'energy-fill', 'morale-fill', 'morale-value', 'rep-fill',
      'rep-value', 'prestige-mult-display',
      'weather-icon', 'weather-name', 'weather-effect',
      'click-power',
      'xp-fill', 'player-level',
      'save-indicator',
      'player-avatar', 'player-name',
      'building-canvas',
      'production-chart',
      'rate-gcoins', 'rate-data', 'rate-energy',
    ];

    ids.forEach(id => {
      this.els[id] = document.getElementById(id);
    });
  },

  /* ─────────────────────────────────────────────
     BOUCLE DE RENDU (requestAnimationFrame)
  ───────────────────────────────────────────── */
  _rafId: null,
  _lastRenderTime: 0,
  RENDER_INTERVAL: 100, // ms entre les mises à jour DOM (10 fps pour l'UI)

  _startRenderLoop() {
    const loop = (timestamp) => {
      this._rafId = window.requestAnimationFrame(loop);

      const delta = timestamp - this._lastRenderTime;
      if (delta < this.RENDER_INTERVAL) return;

      this._lastRenderTime = timestamp;
      this.frame++;

      this.updateHUD();
      this.updateClickArea();
      this.updateResourceBars();
      this.updateWeatherDisplay();
      this.updateActiveSkillsBar();
      this.updatePhaseDisplay();

      // Rendu peu fréquent (tous les 5 frames ≈ 2s)
      if (this.frame % 5 === 0) {
        this.updateProductionChart();
        this.updateFloorVisuals();
        if (typeof Events !== 'undefined') {
          Events.autoProgress(this.RENDER_INTERVAL * 5 / 1000);
        }
      }

      // Rendu très peu fréquent (tous les 30 frames ≈ 10s)
      if (this.frame % 30 === 0) {
        if (typeof Leaderboard !== 'undefined') Leaderboard.renderMini();
        if (typeof Achievements !== 'undefined') Achievements.checkPeriodic();
      }
    };

    this._rafId = window.requestAnimationFrame(loop);
  },

  /* ─────────────────────────────────────────────
     MISE À JOUR FORCÉE
  ───────────────────────────────────────────── */
  forceUpdate() {
    this.updateHUD();
    this.updateResourceBars();
    this.updateClickArea();
    if (typeof Entities !== 'undefined') {
      Entities.renderAgents();
      Entities.renderBuildings();
    }
  },

  /* ─────────────────────────────────────────────
     HUD PRINCIPAL
  ───────────────────────────────────────────── */
  updateHUD() {
    const el = this.els;

    // G-Coins
    if (el['val-gcoins']) el['val-gcoins'].textContent = G.formatCoins(G.state.gcoins);
    if (el['rate-gcoins']) el['rate-gcoins'].textContent = '+' + G.formatCoins(G.rates.gcoinsPerSecond) + '/s';

    // Production par seconde
    const cps = G.rates.gcoinsPerSecond.toFixed(1);
    if (el['coins-per-sec']) el['coins-per-sec'].textContent = G.formatCoins(G.rates.gcoinsPerSecond) + '/s';

    // Data
    if (el['val-data']) el['val-data'].textContent = G.formatNum(G.state.data.toFixed(0));
    if (el['rate-data']) el['rate-data'].textContent = '+' + G.formatCoins(G.rates.dataPerSecond) + '/s';

    // Énergie
    if (el['val-energy']) el['val-energy'].textContent = `${G.state.energy.toFixed(0)}/${G.CONFIG.MAX_ENERGY}`;
    if (el['rate-energy']) el['rate-energy'].textContent = G.formatCoins(G.rates.energyPerSecond) + '/s';

    // Clic power
    const cp = G.state.clickPower * G.state.clickMultiplier * G.state.prestigeMultiplier;
    if (el['click-power']) el['click-power'].textContent = '+' + G.formatNum(Math.ceil(cp));

    // Niveau
    if (el['player-level']) el['player-level'].textContent = G.state.level;

    // Prestige multiplicateur
    if (el['prestige-mult-display']) el['prestige-mult-display'].textContent = `×${G.state.prestigeMultiplier.toFixed(1)}`;
  },

  /* ─────────────────────────────────────────────
     BARRES DE RESSOURCES
  ───────────────────────────────────────────── */
  updateResourceBars() {
    const el = this.els;

    // Barre d'énergie
    const energyPct = (G.state.energy / G.CONFIG.MAX_ENERGY) * 100;
    if (el['energy-fill']) el['energy-fill'].style.width = `${energyPct.toFixed(1)}%`;

    // Barre de moral
    if (el['morale-fill']) el['morale-fill'].style.width = `${G.state.morale.toFixed(1)}%`;
    if (el['morale-value']) el['morale-value'].textContent = G.state.morale.toFixed(0) + '%';

    // Couleur moral
    if (el['morale-fill']) {
      if (G.state.morale > 60) el['morale-fill'].style.background = 'var(--accent-green)';
      else if (G.state.morale > 30) el['morale-fill'].style.background = 'var(--accent-yellow)';
      else el['morale-fill'].style.background = 'var(--accent-red)';
    }

    // Barre réputation
    const repPct = Math.min(100, (G.state.reputation / 1000) * 100);
    if (el['rep-fill']) el['rep-fill'].style.width = `${repPct.toFixed(1)}%`;
    if (el['rep-value']) el['rep-value'].textContent = G.state.reputation.toFixed(0);

    // XP
    const xpPct = (G.state.xp / G.state.xpToNext) * 100;
    if (el['xp-fill']) el['xp-fill'].style.width = `${Math.min(100, xpPct).toFixed(1)}%`;
  },

  /* ─────────────────────────────────────────────
     ZONE DE CLIC — G BOUTON
  ───────────────────────────────────────────── */
  updateClickArea() {
    const btn = document.getElementById('btn-main-click');
    if (!btn) return;

    // Aura pulsante si prestige
    if (G.state.prestige > 0) {
      btn.style.boxShadow = `0 0 ${20 + G.state.prestige * 5}px rgba(59,130,246,0.4)`;
    }

    // Phase color
    const phaseColors = {
      beginner:     'var(--accent-blue)',
      intermediate: 'var(--accent-green)',
      advanced:     'var(--accent-yellow)',
      expert:       'var(--accent-red)',
      singularity:  'var(--accent-purple)',
    };
    btn.style.borderColor = phaseColors[G.state.phase] || 'var(--accent-blue)';
  },

  /* ─────────────────────────────────────────────
     MÉTÉO
  ───────────────────────────────────────────── */
  updateWeatherDisplay() {
    const WEATHERS = {
      sunny:      { icon: '☀️', label: 'Ensoleillé' },
      cloudy:     { icon: '☁️', label: 'Nuageux' },
      rainy:      { icon: '🌧️', label: 'Pluie' },
      storm:      { icon: '⛈️', label: 'Tempête' },
      heatwave:   { icon: '🌡️', label: 'Canicule' },
      snowday:    { icon: '❄️', label: 'Neige' },
      productive: { icon: '⚡', label: 'Productif' },
      hackathon:  { icon: '💻', label: 'Hackathon' },
      serverDown: { icon: '🔴', label: 'Panne' },
    };

    const w = WEATHERS[G.state.weather] || WEATHERS.sunny;
    const el = this.els;

    if (el['weather-icon']) el['weather-icon'].textContent = w.icon;
    if (el['weather-name']) el['weather-name'].textContent = w.label;
    if (el['weather-effect']) el['weather-effect'].textContent = `×${G.getWeatherMultiplier().toFixed(1)}`;
  },

  /* ─────────────────────────────────────────────
     COMPÉTENCES ACTIVES (barre contextuelle)
  ───────────────────────────────────────────── */
  updateActiveSkillsBar() {
    const bar = document.getElementById('active-skills-bar');
    if (!bar) return;

    const activeSkills = Object.entries(G.state.activeSkills)
      .filter(([, s]) => s.active || s.cooldownLeft > 0);

    if (!activeSkills.length) {
      bar.innerHTML = '';
      return;
    }

    bar.innerHTML = activeSkills.map(([id, s]) => {
      const def = typeof Player !== 'undefined' && Player.SKILLS[id];
      if (!def) return '';
      const onCooldown = s.cooldownLeft > 0 && !s.active;
      return `
        <div class="skill-indicator ${s.active ? 'active' : 'cooldown'}" title="${def.name}">
          ${def.icon}
          <span>${s.active ? s.timeLeft.toFixed(0) + 's' : s.cooldownLeft.toFixed(0) + 's'}</span>
        </div>
      `;
    }).join('');
  },

  /* ─────────────────────────────────────────────
     AFFICHAGE DE LA PHASE
  ───────────────────────────────────────────── */
  updatePhaseDisplay() {
    const phaseEl = document.getElementById('phase-display');
    if (!phaseEl) return;

    const PHASE_LABELS = {
      beginner:     '🌱 Débutant',
      intermediate: '📈 Intermédiaire',
      advanced:     '🚀 Avancé',
      expert:       '💎 Expert',
      transcendent: '🌌 Transcendant',
    };

    phaseEl.textContent = PHASE_LABELS[G.state.phase] || G.state.phase;
  },

  /* ─────────────────────────────────────────────
     GRAPHIQUE PRODUCTION (canvas)
  ───────────────────────────────────────────── */
  updateProductionChart() {
    this.productionHistory.push(G.rates.gcoinsPerSecond);
    if (this.productionHistory.length > this.MAX_HISTORY) {
      this.productionHistory.shift();
    }

    const canvas = this.els['production-chart'];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (this.productionHistory.length < 2) return;

    const max = Math.max(...this.productionHistory, 1);
    const min = Math.min(...this.productionHistory, 0);
    const range = max - min || 1;

    // Fond
    ctx.fillStyle = 'rgba(6, 11, 24, 0.6)';
    ctx.fillRect(0, 0, w, h);

    // Grille légère
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = (i / 3) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Courbe de production
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

    ctx.beginPath();
    ctx.moveTo(0, h);

    this.productionHistory.forEach((val, i) => {
      const x = (i / (this.MAX_HISTORY - 1)) * w;
      const y = h - ((val - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Ferme le path vers le bas pour le fill
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Ligne principale
    ctx.beginPath();
    this.productionHistory.forEach((val, i) => {
      const x = (i / (this.MAX_HISTORY - 1)) * w;
      const y = h - ((val - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Valeur actuelle
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(G.formatCoins(G.rates.gcoinsPerSecond) + '/s', w - 4, 12);
  },

  /* ─────────────────────────────────────────────
     FLOOR VISUALS (Mobile View)
  ───────────────────────────────────────────── */
  _lastEntityCount: 0,

  updateFloorVisuals() {
    const floor = document.getElementById('floor-entities');
    if (!floor) return;

    if (typeof G === 'undefined' || !G.state || !G.state.agents) return;

    // Calculate total entities
    let totalEntities = 0;
    const activeAgents = [];
    Object.entries(G.state.agents).forEach(([id, agent]) => {
      totalEntities += agent.count;
      const emoji = (typeof Entities !== 'undefined' && Entities.AGENTS[id]?.emoji) || '👨‍💻';
      for(let i=0; i<agent.count; i++) {
        activeAgents.push(emoji);
      }
    });

    if (this._lastEntityCount === totalEntities) return; // No change
    this._lastEntityCount = totalEntities;

    // Clear floor
    floor.innerHTML = '';

    // We will place them on a rough grid, keeping the center clear for the CEO desk
    // Let's create a grid. Floor width/height varies, but we can use % positioning.
    const maxCols = 8;
    const maxRows = 8;
    const centerCols = [3, 4]; // Avoid center for CEO
    const centerRows = [3, 4];

    let placed = 0;
    for (let r = 0; r < maxRows; r++) {
      for (let c = 0; c < maxCols; c++) {
        if (centerCols.includes(c) && centerRows.includes(r)) continue; // skip center
        if (placed >= activeAgents.length) break;

        const icon = activeAgents[placed];
        const desk = document.createElement('div');
        desk.className = 'employee-desk';
        desk.textContent = icon;
        
        // Slight randomness in position within the grid cell
        const xOffset = Math.random() * 10 - 5;
        const yOffset = Math.random() * 10 - 5;
        
        desk.style.left = `calc(${(c / maxCols) * 100}% + ${xOffset}px)`;
        desk.style.top = `calc(${(r / maxRows) * 100}% + ${yOffset}px)`;
        
        // Random animation delay so they don't all pop in at once
        desk.style.animationDelay = `${Math.random() * 0.5}s`;

        floor.appendChild(desk);
        placed++;
      }
      if (placed >= activeAgents.length) break;
    }
  },

  /* ─────────────────────────────────────────────
     TOOLTIPS AU SURVOL
  ───────────────────────────────────────────── */
  _bindHoverTooltips() {
    // Tooltip global via attribut data-tooltip
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-tooltip]');
      if (!el) return;

      this._showTooltip(el.dataset.tooltip, e.clientX, e.clientY);
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('[data-tooltip]')) {
        this._hideTooltip();
      }
    });
  },

  _tooltip: null,

  _showTooltip(text, x, y) {
    if (!this._tooltip) {
      this._tooltip = document.createElement('div');
      this._tooltip.id = 'hover-tooltip';
      this._tooltip.style.cssText = `
        position: fixed;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 11px;
        color: var(--text-secondary);
        pointer-events: none;
        z-index: 99999;
        max-width: 200px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        transition: opacity 0.15s ease;
      `;
      document.body.appendChild(this._tooltip);
    }

    this._tooltip.textContent = text;
    this._tooltip.style.opacity = '1';
    this._tooltip.style.left = `${Math.min(x + 12, window.innerWidth - 220)}px`;
    this._tooltip.style.top  = `${Math.min(y + 12, window.innerHeight - 60)}px`;
  },

  _hideTooltip() {
    if (this._tooltip) this._tooltip.style.opacity = '0';
  },
};

window.Renderer = Renderer;
