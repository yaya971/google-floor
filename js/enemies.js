/**
 * ══════════════════════════════════════════════════════════════
 * enemies.js — Système d'Ennemis / Concurrents IA
 * ══════════════════════════════════════════════════════════════
 * Rôle : Simule des entreprises concurrentes qui tentent de vous
 * voler des clients et des ressources. Mini-défis combat.
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Enemies = {

  /* ─────────────────────────────────────────────
     CONCURRENTS
  ───────────────────────────────────────────── */
  COMPETITORS: [
    {
      id: 'amazon_cc',
      name: 'Amazon Call Center',
      icon: '📦',
      power: 100,
      growthRate: 1.05,
      reward: 5000,
      desc: 'Livre des appels à J+1',
    },
    {
      id: 'microsoft_help',
      name: 'Microsoft Help Desk',
      icon: '🪟',
      power: 500,
      growthRate: 1.08,
      reward: 25000,
      desc: 'Plante souvent mais renaît',
    },
    {
      id: 'apple_support',
      name: 'Apple Genius Bar',
      icon: '🍎',
      power: 2000,
      growthRate: 1.10,
      reward: 100000,
      desc: 'Premium. Cher. Arrogant.',
    },
    {
      id: 'openai_agents',
      name: 'OpenAI Agents',
      icon: '🤖',
      power: 10000,
      growthRate: 1.15,
      reward: 1000000,
      desc: 'IA pure. Redoutable.',
    },
    {
      id: 'skynet_cc',
      name: 'Skynet Corp',
      icon: '💀',
      power: 1000000,
      growthRate: 1.2,
      reward: 1e9,
      desc: 'Vise l\'hégémonie mondiale.',
    },
  ],

  /* ─────────────────────────────────────────────
     ÉTAT
  ───────────────────────────────────────────── */
  activeCompetitor: null,
  competitorHP: 0,
  competitorMaxHP: 0,
  _spawnTimer: 300,
  totalDefeated: 0,

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  init() {
    this._createUI();
    console.log('⚔️ Enemies module initialisé');
  },

  _createUI() {
    // Crée le panel concurrent dans le header ou le panneau droit
    // Il n'apparaît que quand un concurrent est actif
  },

  /* ─────────────────────────────────────────────
     TICK
  ───────────────────────────────────────────── */
  tick(delta) {
    this._spawnTimer -= delta;

    if (this._spawnTimer <= 0 && !this.activeCompetitor) {
      this._spawnTimer = G.rand(120, 300);
      if (G.chance(0.2)) this.spawnCompetitor();
    }

    // Si concurrent actif, il grignote des ressources
    if (this.activeCompetitor) {
      const drain = this.activeCompetitor.power * 0.001 * delta;
      G.state.gcoins = Math.max(0, G.state.gcoins - drain);
    }
  },

  /* ─────────────────────────────────────────────
     SPAWN D'UN CONCURRENT
  ───────────────────────────────────────────── */
  spawnCompetitor() {
    if (this.activeCompetitor) return;

    // Choisit un concurrent adapté à la progression
    const phase = G.state.phase;
    let eligible = this.COMPETITORS;

    if (phase === 'beginner')     eligible = this.COMPETITORS.slice(0, 1);
    else if (phase === 'intermediate') eligible = this.COMPETITORS.slice(0, 2);
    else if (phase === 'advanced')     eligible = this.COMPETITORS.slice(0, 3);
    else if (phase === 'expert')       eligible = this.COMPETITORS.slice(0, 4);
    else eligible = this.COMPETITORS;

    const comp = eligible[G.randInt(0, eligible.length - 1)];
    const scaledPower = comp.power * Math.pow(comp.growthRate, this.totalDefeated);

    this.activeCompetitor = { ...comp };
    this.competitorMaxHP = scaledPower;
    this.competitorHP = scaledPower;

    G.addLog(`⚔️ Concurrent apparu: ${comp.name} !`, 'warning');
    G.showToast(`⚔️ ${comp.name} attaque votre marché !`, 'warning', 5000);
    Assets.playSound('event');

    this._renderCompetitor();
  },

  /* ─────────────────────────────────────────────
     ATTAQUE DU CONCURRENT (depuis un clic)
  ───────────────────────────────────────────── */
  attackCompetitor() {
    if (!this.activeCompetitor) return;

    const dmg = G.state.clickPower * G.state.clickMultiplier * G.state.prestigeMultiplier;
    this.competitorHP -= dmg;

    G.showFloatNumber(-dmg, window.innerWidth / 2, window.innerHeight / 2, 'crit');

    if (this.competitorHP <= 0) {
      this.defeatCompetitor();
    } else {
      this._renderCompetitor();
    }
  },

  defeatCompetitor() {
    const reward = this.activeCompetitor.reward * (1 + this.totalDefeated * 0.1);
    G.addCoins(reward);
    G.state.reputation += 10;
    this.totalDefeated++;

    G.showToast(`🏆 ${this.activeCompetitor.name} vaincu ! +${G.formatCoins(reward)}`, 'success', 5000);
    G.addLog(`🏆 Concurrent vaincu: ${this.activeCompetitor.name} — +${G.formatCoins(reward)}`, 'success');
    Assets.playSound('achieve');
    G.addXP(reward * 0.01);

    this.activeCompetitor = null;
    this.competitorHP = 0;

    this._renderCompetitor();

    if (typeof Achievements !== 'undefined') {
      Achievements.check('enemies', this.totalDefeated);
    }
  },

  /* ─────────────────────────────────────────────
     RENDU CONCURRENT
  ───────────────────────────────────────────── */
  _renderCompetitor() {
    // Panel concurrent dans le panneau droit
    let panel = document.getElementById('competitor-panel');

    if (!this.activeCompetitor) {
      if (panel) panel.remove();
      return;
    }

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'competitor-panel';
      panel.style.cssText = `
        background: var(--bg-card);
        border: 1px solid var(--accent-red);
        border-radius: var(--radius-md);
        padding: 10px 12px;
        animation: slideInRight 0.3s ease;
      `;
      const rightPanel = document.getElementById('panel-right');
      if (rightPanel) rightPanel.prepend(panel);
    }

    const pct = (this.competitorHP / this.competitorMaxHP) * 100;
    panel.innerHTML = `
      <div style="font-size:11px;font-weight:600;color:var(--accent-red);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;font-family:var(--font-mono)">
        ⚔️ Attaque Concurrente
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:24px">${this.activeCompetitor.icon}</span>
        <div>
          <div style="font-size:12px;font-weight:700">${this.activeCompetitor.name}</div>
          <div style="font-size:10px;color:var(--text-muted)">${this.activeCompetitor.desc}</div>
        </div>
      </div>
      <div style="height:8px;background:var(--bg-elevated);border-radius:99px;overflow:hidden;margin-bottom:6px">
        <div style="height:100%;width:${pct.toFixed(0)}%;background:var(--accent-red);border-radius:99px;transition:width 0.3s ease"></div>
      </div>
      <div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:8px">
        ${G.formatNum(Math.max(0, this.competitorHP))} / ${G.formatNum(this.competitorMaxHP)} HP
      </div>
      <button onclick="Enemies.attackCompetitor()" style="
        width:100%;padding:8px;
        background:var(--accent-red);border:none;
        border-radius:var(--radius-sm);
        font-size:13px;font-weight:700;color:#fff;
        cursor:pointer;
        transition:all var(--transition);
      " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
        ⚔️ Attaquer (${G.formatNum(Math.ceil(G.state.clickPower))} dégâts)
      </button>
    `;
  },
};

window.Enemies = Enemies;
