/**
 * ══════════════════════════════════════════════════════════════
 * leaderboard.js — Système de Classement Local & Global
 * ══════════════════════════════════════════════════════════════
 * Rôle : Stocke et affiche les meilleurs scores locaux,
 * gère le classement en temps réel pour le multi-joueur,
 * et simule un classement global avec des bots.
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Leaderboard = {

  /* ─────────────────────────────────────────────
     ÉTAT
  ───────────────────────────────────────────── */
  localScores: [],       // Sauvegardés dans localStorage
  MAX_ENTRIES: 50,

  /* ─────────────────────────────────────────────
     BOTS (classement global simulé)
  ───────────────────────────────────────────── */
  BOTS: [],
  FLAGS: { fr:'🇫🇷', us:'🇺🇸', es:'🇪🇸', de:'🇩🇪', jp:'🇯🇵', kr:'🇰🇷', cn:'🇨🇳', br:'🇧🇷', in:'🇮🇳', ru:'🇷🇺', it:'🇮🇹', gb:'🇬🇧', ca:'🇨🇦' },

  _generateBots() {
    const prefixes = ['Googol','Data','Click','CEO','Agent','Neural','Quantum','Code','Turbo','Byte','Silicon','Pixel','Novice','Alpha','Beta','Master','Elite','Pro','Epic'];
    const suffixes = ['Plex','Lord','Master','Legend','Farm','Ninja','Queen','Breaker','Clicker','Hunter','Sage','Pioneer','Bot','01','99','X','Z','One','Prime'];
    const avatars = ['🤖','👾','👆','👔','🏭','🧠','⚛️','💻','⚡','🦾','🐉','🧙','🔮','🎮','🗡️','👶','🖱️','😅','👑','🚀'];
    const countries = Object.keys(this.FLAGS);

    this.BOTS = [];
    for (let i = 0; i < 500; i++) {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      const s = suffixes[Math.floor(Math.random() * suffixes.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const isTop = i < 10;
      const isHighRank = i < 50;
      const isMidRank = i < 200 && !isTop && !isHighRank;

      // Scores linéaires réalistes (jouable par un humain)
      let baseScore;
      if (isTop) baseScore = 1e12 + Math.random() * 5e12; // 1-6 T (top bots)
      else if (isHighRank) baseScore = 1e10 + Math.random() * 9e11; // 10 G - 1 T
      else if (isMidRank) baseScore = 1e8 + Math.random() * 9e9; // 100 M - 10 G
      else baseScore = 1e4 + Math.random() * 1e8; // 10 K - 100 M

      this.BOTS.push({
        id: 'bot_' + i,
        name: p + '_' + s,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        score: baseScore,
        prestige: Math.min(20, Math.floor(Math.log10(baseScore) / 3)),
        country: country
      });
    }

    // Sort to have realistic starting positions
    this.BOTS.sort((a, b) => b.score - a.score);
  },

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    this._generateBots();
    this._loadFromStorage();
    this.renderMini();
    this._bindUI();
    console.log('📊 Leaderboard module initialisé');
  },

  /* ─────────────────────────────────────────────
     SOUMETTRE UN SCORE
  ───────────────────────────────────────────── */
  submitScore(name, score, prestige = 0) {
    const entry = {
      name,
      score,
      prestige,
      date: Date.now(),
      avatar: G.state.settings.avatar,
    };

    // Vérifie si une entrée avec ce nom existe
    const existing = this.localScores.findIndex(e => e.name === name);
    if (existing !== -1) {
      if (score > this.localScores[existing].score) {
        this.localScores[existing] = entry;
      }
    } else {
      this.localScores.push(entry);
    }

    // Trier par score
    this.localScores.sort((a, b) => b.score - a.score);

    // Limiter
    if (this.localScores.length > this.MAX_ENTRIES) {
      this.localScores = this.localScores.slice(0, this.MAX_ENTRIES);
    }

    this._saveToStorage();
    this.renderMini();
  },

  /* ─────────────────────────────────────────────
     CLASSEMENT GLOBAL (local + bots simulés)
  ───────────────────────────────────────────── */
  getGlobalLeaderboard() {
    const playerEntry = {
      name: G.state.settings.playerName,
      score: G.state.gcoinsAllTime,
      prestige: G.state.prestige,
      avatar: G.state.settings.avatar,
      country: G.state.settings.country,
      isPlayer: true,
    };

    // Bots avec légère fluctuation
    const botsWithNoise = this.BOTS.map(bot => ({
      ...bot,
      score: bot.score * G.rand(0.95, 1.05),
      isPlayer: false,
    }));

    // Joueurs multi locaux
    const mpPlayers = [];
    if (G.state.multiplayerMode && typeof Multiplayer !== 'undefined') {
      const lb = Multiplayer.getLeaderboard();
      lb.forEach(p => mpPlayers.push({
        name: p.name,
        score: p.score,
        prestige: p.prestige,
        avatar: '👥',
        isPlayer: true,
        isMPPlayer: true,
      }));
    }

    const combined = [...this.localScores, ...botsWithNoise, playerEntry, ...mpPlayers];

    // Déduplique par nom (garde le meilleur score)
    const deduped = {};
    for (const entry of combined) {
      const key = entry.name;
      if (!deduped[key] || entry.score > deduped[key].score) {
        deduped[key] = entry;
      }
    }

    return Object.values(deduped)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  },

  /* ─────────────────────────────────────────────
     RENDU MINI (panneau droit)
  ───────────────────────────────────────────── */
  renderMini() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    const lb = this.getGlobalLeaderboard().slice(0, 8);
    const playerName = G.state.settings.playerName;

    container.innerHTML = '';

    lb.forEach((entry, i) => {
      const isPlayer = entry.name === playerName || entry.isPlayer;
      const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const rankSymbol = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;
      const flag = this.FLAGS[entry.country] || '🏳️';

      const row = document.createElement('div');
      row.className = `lb-entry${isPlayer ? ' current-player' : ''}`;
      row.style.borderLeft = isPlayer ? `3px solid var(--accent-blue)` : '';

      row.innerHTML = `
        <span class="lb-rank ${rankClass}">${rankSymbol}</span>
        <span>${flag} ${entry.avatar || '👤'}</span>
        <span class="lb-name">${entry.name}</span>
        <span class="lb-score">${G.formatCoins(entry.score)}</span>
      `;

      container.appendChild(row);
    });
  },

  /* ─────────────────────────────────────────────
     RENDU COMPLET (dans la modal)
  ───────────────────────────────────────────── */
  renderFull(tab = 'alltime') {
    const container = document.getElementById('full-leaderboard');
    if (!container) return;

    let lb = this.getGlobalLeaderboard();

    if (tab === 'weekly') {
      const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
      lb = lb.filter(e => !e.date || e.date >= weekAgo);
    } else if (tab === 'daily') {
      const dayAgo = Date.now() - 24 * 3600 * 1000;
      lb = lb.filter(e => !e.date || e.date >= dayAgo);
    }

    const playerName = G.state.settings.playerName;
    container.innerHTML = '';

    lb.forEach((entry, i) => {
      const isPlayer = entry.name === playerName || entry.isPlayer;
      const rankSymbols = ['🥇', '🥈', '🥉'];
      const flag = this.FLAGS[entry.country] || '🏳️';

      const row = document.createElement('div');
      row.className = `lb-entry-full${isPlayer ? ' current-player' : ''}`;

      row.innerHTML = `
        <div class="lb-rank-full">${rankSymbols[i] || i+1}</div>
        <div class="lb-avatar">${flag} ${entry.avatar || '👤'}</div>
        <div class="lb-name-full">
          ${entry.name}
          ${isPlayer ? '<span style="font-size:10px;color:var(--accent-blue);font-family:var(--font-mono)"> ◀ VOUS</span>' : ''}
        </div>
        <div class="lb-score-full">${G.formatCoins(entry.score)}</div>
        ${entry.prestige > 0 ? `<div class="lb-prestige-badge">✨ P${entry.prestige}</div>` : ''}
        ${!isPlayer ? `<button class="btn-defy" data-target="${entry.id || entry.name}">⚔️ Défier</button>` : '<div></div>'}
      `;

      container.appendChild(row);
    });
    
    // Bind buttons
    container.querySelectorAll('.btn-defy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        this.startPvPRaid(targetId);
      });
    });
  },

  startPvPRaid(targetId) {
    const target = this.getGlobalLeaderboard().find(e => (e.id || e.name) === targetId);
    if (!target) return;
    
    if (G.state.gcoinsAllTime < target.score * 0.1) {
      G.showToast(`Score insuffisant pour défier ${target.name}.`, 'error');
      return;
    }
    
    G.showToast(`⚔️ Raid lancé contre ${target.name} ! Préparation...`, 'warning', 4000);
    // Simulate raid result after 4 seconds
    setTimeout(() => {
      const myPower = G.state.productionMultiplier * G.state.morale * G.rand(0.8, 1.2);
      const targetPower = (target.prestige + 1) * 100 * G.rand(0.8, 1.2);
      
      if (myPower > targetPower) {
        const loot = target.score * 0.05;
        G.addCoins(loot);
        G.state.reputation += 10;
        G.showToast(`✅ RAID RÉUSSI ! +${G.formatCoins(loot)} pillés à ${target.name} !`, 'success', 6000);
        G.addLog(`Raid réussi contre ${target.name}. Butin: ${G.formatCoins(loot)}`, 'success');
      } else {
        const loss = G.state.gcoins * 0.1;
        G.spendCoins(loss);
        G.state.reputation -= 10;
        G.showToast(`❌ RAID ÉCHOUÉ... Vos agents ont fui. -${G.formatCoins(loss)}`, 'error', 6000);
        G.addLog(`Raid échoué contre ${target.name}. Perte: ${G.formatCoins(loss)}`, 'error');
      }
    }, 4000);
  },

  /* ─────────────────────────────────────────────
     PERSISTANCE
  ───────────────────────────────────────────── */
  _saveToStorage() {
    try {
      localStorage.setItem('gfc_leaderboard', JSON.stringify(this.localScores));
    } catch (e) {}
  },

  _loadFromStorage() {
    try {
      const data = localStorage.getItem('gfc_leaderboard');
      if (data) this.localScores = JSON.parse(data);
    } catch (e) {
      this.localScores = [];
    }
  },

  /* ─────────────────────────────────────────────
     BIND UI
  ───────────────────────────────────────────── */
  _bindUI() {
    // Bouton tous les succès (ouvre la modal classement)
    const btnLB = document.getElementById('btn-leaderboard-menu');
    if (btnLB) {
      btnLB.addEventListener('click', () => {
        const modal = document.getElementById('modal-leaderboard');
        if (modal) {
          modal.classList.remove('hidden');
          this.renderFull();
        }
      });
    }

    const closeLB = document.getElementById('close-leaderboard');
    if (closeLB) {
      closeLB.addEventListener('click', () => {
        document.getElementById('modal-leaderboard')?.classList.add('hidden');
      });
    }

    // Onglets classement
    document.querySelectorAll('.lbtab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.lbtab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderFull(tab.dataset.lbtab);
      });
    });

    // Bouton classement (menu principal)
    const btnLBMenu = document.getElementById('btn-leaderboard-menu');
    if (btnLBMenu) {
      btnLBMenu.addEventListener('click', () => {
        const modal = document.getElementById('modal-leaderboard');
        if (modal) {
          modal.classList.remove('hidden');
          this.submitScore(G.state.settings.playerName, G.state.gcoinsAllTime, G.state.prestige);
          this.renderFull();
        }
      });
    }
  },

  /* ─────────────────────────────────────────────
     MET À JOUR LE CLASSEMENT EN TEMPS RÉEL
  ───────────────────────────────────────────── */
  _updateInterval: null,

  startLiveUpdate() {
    this._updateInterval = setInterval(() => {
      this.submitScore(G.state.settings.playerName, G.state.gcoinsAllTime, G.state.prestige);
      this.renderMini();
    }, 10000);
  },

  stopLiveUpdate() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  },
};

window.Leaderboard = Leaderboard;
