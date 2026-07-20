/**
 * ══════════════════════════════════════════════════════════════
 * multiplayer.js — Mode Multi-Joueur Local (2-4 joueurs)
 * ══════════════════════════════════════════════════════════════
 * Rôle : Gère le partage d'écran pour 2-4 joueurs sur la même
 * machine. Chaque joueur a son propre état de jeu.
 * Système de tour par tour et de classement en temps réel.
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Multiplayer = {

  /* ─────────────────────────────────────────────
     COULEURS DES JOUEURS
  ───────────────────────────────────────────── */
  PLAYER_COLORS: ['#3b82f6', '#22d3a0', '#fbbf24', '#ef4444'],
  PLAYER_NAMES_DEFAULT: ['Joueur 1', 'Joueur 2', 'Joueur 3', 'Joueur 4'],

  /* ─────────────────────────────────────────────
     ÉTAT MULTI-JOUEUR
  ───────────────────────────────────────────── */
  players: [],       // Tableau d'états de jeu pour chaque joueur
  currentPlayer: 0,
  playerCount: 0,
  gameActive: false,
  switchCooldown: false,

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    this._bindMenuUI();
    console.log('👥 Multiplayer module initialisé');
  },

  /* ─────────────────────────────────────────────
     CONFIGURATION MULTI-JOUEUR
  ───────────────────────────────────────────── */

  setupPlayers(count, names) {
    this.playerCount = count;
    this.players = [];
    this.currentPlayer = 0;

    for (let i = 0; i < count; i++) {
      // Crée un état de jeu complet pour chaque joueur
      this.players.push({
        name: names[i] || `Joueur ${i + 1}`,
        color: this.PLAYER_COLORS[i],
        avatar: ['🧑‍💻', '👔', '🤖', '👾'][i],
        country: window.I18n?.I18N_COUNTRIES[i % window.I18n.I18N_COUNTRIES.length]?.id || 'fr',
        lang: 'fr',
        state: this._createFreshPlayerState(names[i] || `Joueur ${i + 1}`),
      });
    }

    G.state.multiplayerMode = true;
    G.state.players = this.players.map(p => ({ name: p.name, color: p.color }));

    // Charge l'état du joueur 1
    this._loadPlayerState(0);

    // Affiche le panneau scores
    const panel = document.getElementById('mp-scores-panel');
    if (panel) panel.classList.remove('hidden');

    // Active l'indicateur
    this._updatePlayerIndicator();
    this.renderScores();

    G.showToast(`👥 Multi-joueur: ${count} joueurs !`, 'success', 4000);
    G.addLog(`👥 Mode multi-joueur démarré (${count} joueurs)`, 'success');
  },

  _createFreshPlayerState(name) {
    return {
      gcoins: 0,
      gcoinsTotal: 0,
      gcoinsAllTime: 0,
      data: 0,
      energy: G.CONFIG.MAX_ENERGY,
      reputation: 0,
      clickPower: 1,
      clickCount: 0,
      level: 1,
      xp: 0,
      xpToNext: 100,
      prestige: 0,
      prestigeMultiplier: 1.0,
      agents: {},
      buildings: {},
      upgrades: {},
      research: {},
      achievements: {},
      quests: {},
      dailyQuests: [],
      morale: 75,
      weather: 'sunny',
      weatherTimer: 180,
      productionMultiplier: 1.0,
      clickMultiplier: 1.0,
      dataMultiplier: 1.0,
      activeSkills: {},
      totalAgentsHired: 0,
      totalUpgradesBought: 0,
      totalResearchCompleted: 0,
      totalEventsTriggered: 0,
      minigameScore: 0,
      minigameBestScore: 0,
      phase: 'beginner',
      settings: { ...G.state.settings, playerName: name },
      lastTick: Date.now(),
      sessionStart: Date.now(),
      totalPlayTime: 0,
      activeEvents: [],
      researchQueue: null,
      researchProgress: 0,
      critChance: 0.05,
      critMultiplier: 5,
      autoClickRate: 0,
      marketPrices: {},
    };
  },

  /* ─────────────────────────────────────────────
     SAUVEGARDE / CHARGEMENT D'ÉTAT JOUEUR
  ───────────────────────────────────────────── */

  _saveCurrentPlayerState() {
    if (!this.gameActive || !this.players[this.currentPlayer]) return;
    this.players[this.currentPlayer].state = { ...G.state };
  },

  _loadPlayerState(playerIndex) {
    if (!this.players[playerIndex]) return;
    const playerData = this.players[playerIndex];

    // Sauvegarde l'état actuel
    if (this.gameActive) {
      this._saveCurrentPlayerState();
    }

    // Charge l'état du nouveau joueur
    Object.assign(G.state, playerData.state);
    G.state.settings.playerName = playerData.name;
    G.state.settings.avatar = playerData.avatar;

    this.currentPlayer = playerIndex;
    G.state.currentPlayer = playerIndex;

    G.recalcRates();
    G.recalcClickPower();

    // Mise à jour UI
    this._updatePlayerIndicator();
    if (typeof Player !== 'undefined') Player.renderPlayerCard();
    if (typeof Entities !== 'undefined') {
      Entities.renderAgents();
      Entities.renderBuildings();
    }
    if (typeof Renderer !== 'undefined') Renderer.forceUpdate();

    G.showToast(`👤 ${playerData.name} joue maintenant !`, 'info', 2000);
  },

  /* ─────────────────────────────────────────────
     CHANGEMENT DE JOUEUR
  ───────────────────────────────────────────── */

  switchToNextPlayer() {
    if (!this.gameActive || this.playerCount < 2) return;
    if (this.switchCooldown) return;

    this.switchCooldown = true;
    setTimeout(() => { this.switchCooldown = false; }, 1000);

    const nextPlayer = (this.currentPlayer + 1) % this.playerCount;
    this._loadPlayerState(nextPlayer);
    this.renderScores();
  },

  switchToPlayer(index) {
    if (index < 0 || index >= this.playerCount) return;
    this._loadPlayerState(index);
    this.renderScores();
  },

  /* ─────────────────────────────────────────────
     SYNC SCORE (appelé depuis G.tick)
  ───────────────────────────────────────────── */

  syncScore() {
    if (!this.gameActive) return;
    // Mise à jour du score du joueur actuel dans le tableau
    if (this.players[this.currentPlayer]) {
      this.players[this.currentPlayer].score = G.state.gcoinsTotal;
    }
  },

  /* ─────────────────────────────────────────────
     RENDU SCORES
  ───────────────────────────────────────────── */

  renderScores() {
    const container = document.getElementById('mp-scores');
    if (!container) return;

    container.innerHTML = '';
    const sorted = [...this.players]
      .map((p, i) => ({ ...p, index: i, score: (i === this.currentPlayer ? G.state.gcoinsTotal : p.state?.gcoinsTotal || 0) }))
      .sort((a, b) => b.score - a.score);

    for (const player of sorted) {
      const row = document.createElement('div');
      row.className = `mp-score-row ${player.index === this.currentPlayer ? 'active-player' : ''}`;
      row.style.cursor = 'pointer';
      row.onclick = () => this.switchToPlayer(player.index);

      row.innerHTML = `
        <div class="mp-player-color" style="background:${player.color}"></div>
        <span class="mp-player-name">${player.name}</span>
        <span class="mp-player-score">${G.formatCoins(player.score)}</span>
        ${player.index === this.currentPlayer ? '<span style="font-size:10px;color:var(--accent-blue)">▶ Actif</span>' : ''}
      `;

      container.appendChild(row);
    }
  },

  /* ─────────────────────────────────────────────
     INDICATEUR JOUEUR (HEADER)
  ───────────────────────────────────────────── */

  _updatePlayerIndicator() {
    const el = document.getElementById('player-indicator');
    if (!el) return;

    const player = this.players[this.currentPlayer];
    if (player) {
      el.textContent = `P${this.currentPlayer + 1}`;
      el.style.background = player.color;
    } else {
      el.textContent = 'P1';
      el.style.background = 'var(--accent-blue)';
    }
  },

  /* ─────────────────────────────────────────────
     BIND UI — MENU
  ───────────────────────────────────────────── */

  _bindMenuUI() {
    // Bouton multijoueur (menu principal)
    const btnMP = document.getElementById('btn-multiplayer');
    if (btnMP) {
      btnMP.addEventListener('click', () => {
        const modal = document.getElementById('modal-players');
        if (modal) modal.classList.remove('hidden');
      });
    }

    // Bouton annuler
    const btnCancel = document.getElementById('btn-cancel-multiplayer');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        const modal = document.getElementById('modal-players');
        if (modal) modal.classList.add('hidden');
      });
    }

    // Boutons nombre de joueurs
    document.querySelectorAll('.btn-player-count').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-player-count').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const count = parseInt(btn.dataset.count);
        this._renderNameFields(count);

        const namesSection = document.getElementById('player-names-section');
        if (namesSection) namesSection.classList.remove('hidden');
      });
    });

    // Bouton démarrer multijoueur
    const btnStart = document.getElementById('btn-start-multiplayer');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const activeCountBtn = document.querySelector('.btn-player-count.active');
        if (!activeCountBtn) {
          G.showToast('Choisissez le nombre de joueurs !', 'warning');
          return;
        }

        const count = parseInt(activeCountBtn.dataset.count);
        const names = [];
        for (let i = 0; i < count; i++) {
          const input = document.getElementById(`player-name-${i}`);
          const cInput = document.getElementById(`player-country-${i}`);
          const lInput = document.getElementById(`player-lang-${i}`);
          names.push({
            name: input?.value.trim() || `Joueur ${i + 1}`,
            country: cInput?.value || 'fr',
            lang: lInput?.value || 'fr'
          });
        }

        const modal = document.getElementById('modal-players');
        if (modal) modal.classList.add('hidden');

        this.gameActive = true;
        this.setupPlayers(count, names.map(n => n.name));
        for (let i = 0; i < count; i++) {
          this.players[i].country = names[i].country;
          this.players[i].lang = names[i].lang;
        }
        
        if (window.I18n) window.I18n.setLang(this.players[0].lang);
        G.startNewGame(this.players[0].name, '🧑‍💻', this.players[0].country, this.players[0].lang);
      });
    }

    // Bouton changer joueur (panel droit)
    const btnSwitch = document.getElementById('btn-switch-player');
    if (btnSwitch) {
      btnSwitch.addEventListener('click', () => this.switchToNextPlayer());
    }
  },

  _renderNameFields(count) {
    const section = document.getElementById('player-names-section');
    if (!section) return;

    let html = '';
    for (let i = 0; i < count; i++) {
        let countryOptions = '';
        if (window.I18n) {
          window.I18n.I18N_COUNTRIES.forEach(c => {
             countryOptions += `<option value="${c.id}">${c.emoji} ${c.name}</option>`;
          });
        }
        html += `
          <div class="player-name-row" style="flex-wrap: wrap; margin-bottom: 10px;">
            <div class="player-color-dot" style="background:${this.PLAYER_COLORS[i]}"></div>
            <input
              type="text"
              id="player-name-${i}"
              class="player-name-input-field"
              placeholder="${this.PLAYER_NAMES_DEFAULT[i]}"
              maxlength="15"
              value="${this.PLAYER_NAMES_DEFAULT[i]}"
              style="flex:1"
            />
            <select id="player-country-${i}" class="player-name-input-field" style="width:100px; margin-left: 5px; padding: 5px;">
              ${countryOptions}
            </select>
            <select id="player-lang-${i}" class="player-name-input-field" style="width:90px; margin-left: 5px; padding: 5px;">
              <option value="fr">🇫🇷 FR</option>
              <option value="en">🇬🇧 EN</option>
              <option value="es">🇪🇸 ES</option>
            </select>
          </div>
        `;
    }
    section.innerHTML = html;
  },

  /* ─────────────────────────────────────────────
     COMPÉTITION — CLASSEMENT MULTI-JOUEUR
  ───────────────────────────────────────────── */

  getLeaderboard() {
    if (!this.gameActive) return [];
    return this.players
      .map((p, i) => ({
        rank: i + 1,
        name: p.name,
        color: p.color,
        score: i === this.currentPlayer ? G.state.gcoinsTotal : (p.state?.gcoinsTotal || 0),
        prestige: i === this.currentPlayer ? G.state.prestige : (p.state?.prestige || 0),
      }))
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  },
};

window.Multiplayer = Multiplayer;
