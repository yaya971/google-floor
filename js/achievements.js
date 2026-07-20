/**
 * ══════════════════════════════════════════════════════════════
 * achievements.js — Système de Succès / Trophées
 * ══════════════════════════════════════════════════════════════
 * Rôle : Définit 80+ succès, détecte quand ils sont débloqués
 * et affiche les notifications. Supporte les succès secrets.
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Achievements = {

  /* ─────────────────────────────────────────────
     DÉFINITIONS — 80 Succès
  ───────────────────────────────────────────── */
  LIST: {

    // ── CLICS ──
    first_click: {
      id: 'first_click', name: 'Premier Clic',
      icon: '👆', desc: 'Effectuez votre premier clic.',
      category: 'clicks', secret: false,
      reward: '💰 +100 G-Coins',
      check: () => G.state.clickCount >= 1,
      onUnlock: () => G.addCoins(100),
    },
    clicker_100: {
      id: 'clicker_100', name: '100 Clics',
      icon: '🖱️', desc: '100 clics effectués.',
      category: 'clicks', secret: false,
      reward: '💰 +500 G-Coins',
      check: () => G.state.clickCount >= 100,
      onUnlock: () => G.addCoins(500),
    },
    clicker_1k: {
      id: 'clicker_1k', name: 'Mille Clics',
      icon: '⚡', desc: '1,000 clics effectués.',
      category: 'clicks', secret: false,
      reward: '💰 +5,000 G-Coins',
      check: () => G.state.clickCount >= 1000,
      onUnlock: () => G.addCoins(5000),
    },
    clicker_10k: {
      id: 'clicker_10k', name: 'Dix Mille Clics',
      icon: '🔥', desc: '10,000 clics effectués.',
      category: 'clicks', secret: false,
      reward: '+5% crit',
      check: () => G.state.clickCount >= 10000,
      onUnlock: () => { G.state.critChance = Math.min(0.8, G.state.critChance + 0.05); },
    },
    clicker_100k: {
      id: 'clicker_100k', name: 'Monstre du Clic',
      icon: '💪', desc: '100,000 clics. Vos doigts sont en acier.',
      category: 'clicks', secret: false,
      reward: '+10% production',
      check: () => G.state.clickCount >= 100000,
      onUnlock: () => { G.state.productionMultiplier *= 1.10; },
    },
    clicker_1m: {
      id: 'clicker_1m', name: 'Légende du Clic',
      icon: '👑', desc: '1,000,000 clics. Légendaire.',
      category: 'clicks', secret: true,
      reward: '+50% clic power',
      check: () => G.state.clickCount >= 1000000,
      onUnlock: () => { G.state.clickMultiplier *= 1.5; },
    },

    // ── RESSOURCES ──
    first_1k: {
      id: 'first_1k', name: 'Millionnaire ?',
      icon: '💰', desc: 'Cumulez 1,000 G-Coins.',
      category: 'resources', secret: false,
      reward: '+10 G-Coins/s',
      check: () => G.state.gcoinsAllTime >= 1000,
      onUnlock: () => {},
    },
    first_1m: {
      id: 'first_1m', name: 'Millionnaire !',
      icon: '💎', desc: 'Cumulez 1,000,000 G-Coins.',
      category: 'resources', secret: false,
      reward: '+5% production',
      check: () => G.state.gcoinsAllTime >= 1000000,
      onUnlock: () => { G.state.productionMultiplier *= 1.05; },
    },
    first_1b: {
      id: 'first_1b', name: 'Milliardaire',
      icon: '🏦', desc: 'Cumulez 1,000,000,000 G-Coins.',
      category: 'resources', secret: false,
      reward: '+10% production',
      check: () => G.state.gcoinsAllTime >= 1e9,
      onUnlock: () => { G.state.productionMultiplier *= 1.10; },
    },
    first_1t: {
      id: 'first_1t', name: 'Trillionnaire',
      icon: '🌌', desc: 'Cumulez 1,000,000,000,000 G-Coins.',
      category: 'resources', secret: false,
      reward: '+20% production',
      check: () => G.state.gcoinsAllTime >= 1e12,
      onUnlock: () => { G.state.productionMultiplier *= 1.20; },
    },
    first_1qi: {
      id: 'first_1qi', name: 'Quadrillionnaire',
      icon: '⭐', desc: 'Cumulez 1e15 G-Coins. Impressionnant.',
      category: 'resources', secret: true,
      reward: '+50% production',
      check: () => G.state.gcoinsAllTime >= 1e15,
      onUnlock: () => { G.state.productionMultiplier *= 1.50; },
    },
    data_collector: {
      id: 'data_collector', name: 'Collecteur de Data',
      icon: '📊', desc: 'Récoltez 1,000 Data.',
      category: 'resources', secret: false,
      reward: '×1.1 production Data',
      check: () => G.state.data >= 1000,
      onUnlock: () => { G.state.dataMultiplier *= 1.1; },
    },
    data_hoarder: {
      id: 'data_hoarder', name: 'Hoardeur de Data',
      icon: '💾', desc: 'Récoltez 1,000,000 Data.',
      category: 'resources', secret: false,
      reward: '×1.5 Data',
      check: () => G.state.data >= 1e6,
      onUnlock: () => { G.state.dataMultiplier *= 1.5; },
    },

    // ── AGENTS ──
    first_hire: {
      id: 'first_hire', name: 'Premier Recrutement',
      icon: '🧑‍💼', desc: 'Recrutez votre premier agent.',
      category: 'agents', secret: false,
      reward: '💰 +200 G-Coins',
      check: () => G.state.totalAgentsHired >= 1,
      onUnlock: () => G.addCoins(200),
    },
    hire_10: {
      id: 'hire_10', name: 'Petite Équipe',
      icon: '👥', desc: 'Recrutez 10 agents au total.',
      category: 'agents', secret: false,
      reward: '+5% moral',
      check: () => G.state.totalAgentsHired >= 10,
      onUnlock: () => { G.state.morale = Math.min(100, G.state.morale + 5); },
    },
    hire_100: {
      id: 'hire_100', name: 'Grande Équipe',
      icon: '🏢', desc: '100 agents recrutés.',
      category: 'agents', secret: false,
      reward: '+10% production',
      check: () => G.state.totalAgentsHired >= 100,
      onUnlock: () => { G.state.productionMultiplier *= 1.10; },
    },
    hire_1000: {
      id: 'hire_1000', name: 'Armée Corporative',
      icon: '⚔️', desc: '1,000 agents. C\'est une armée.',
      category: 'agents', secret: false,
      reward: '+25% production',
      check: () => G.state.totalAgentsHired >= 1000,
      onUnlock: () => { G.state.productionMultiplier *= 1.25; },
    },
    intern_army: {
      id: 'intern_army', name: 'Armée de Stagiaires',
      icon: '👶', desc: 'Possédez 100 stagiaires.',
      category: 'agents', secret: false,
      reward: '+5% clic',
      check: () => (G.state.agents.intern?.count || 0) >= 100,
      onUnlock: () => { G.state.clickMultiplier *= 1.05; },
    },
    ai_overlord: {
      id: 'ai_overlord', name: 'Seigneur IA',
      icon: '🤖', desc: 'Possédez 50 entraîneurs IA.',
      category: 'agents', secret: false,
      reward: '×2 production IA',
      check: () => (G.state.agents.ai_trainer?.count || 0) >= 50,
      onUnlock: () => { G.state.productionMultiplier *= 1.5; },
    },

    // ── BÂTIMENTS ──
    first_building: {
      id: 'first_building', name: 'Premier Bâtiment',
      icon: '🏗️', desc: 'Construisez votre premier bâtiment.',
      category: 'buildings', secret: false,
      reward: '💰 +1,000 G-Coins',
      check: () => Object.values(G.state.buildings).some(b => b.count > 0),
      onUnlock: () => G.addCoins(1000),
    },
    datacenter_built: {
      id: 'datacenter_built', name: 'Centre de Données',
      icon: '🏭', desc: 'Construisez votre premier data center.',
      category: 'buildings', secret: false,
      reward: '×2 Data',
      check: () => (G.state.buildings.data_center?.count || 0) >= 1,
      onUnlock: () => { G.state.dataMultiplier *= 2; },
    },
    space_colonist: {
      id: 'space_colonist', name: 'Colonisateur Spatial',
      icon: '🚀', desc: 'Construisez une antenne spatiale.',
      category: 'buildings', secret: false,
      reward: '×3 réputation',
      check: () => (G.state.buildings.space_antenna?.count || 0) >= 1,
      onUnlock: () => { G.state.reputation *= 3; },
    },

    // ── UPGRADES ──
    first_upgrade: {
      id: 'first_upgrade', name: 'Premier Upgrade',
      icon: '🔧', desc: 'Achetez votre premier upgrade.',
      category: 'upgrades', secret: false,
      reward: '💰 +1,000 G-Coins',
      check: () => G.state.totalUpgradesBought >= 1,
      onUnlock: () => G.addCoins(1000),
    },
    upgrade_master: {
      id: 'upgrade_master', name: 'Maître des Upgrades',
      icon: '🔬', desc: 'Achetez 10 upgrades.',
      category: 'upgrades', secret: false,
      reward: '+15% production',
      check: () => G.state.totalUpgradesBought >= 10,
      onUnlock: () => { G.state.productionMultiplier *= 1.15; },
    },
    upgrade_addict: {
      id: 'upgrade_addict', name: 'Accro aux Upgrades',
      icon: '💊', desc: 'Achetez 25 upgrades.',
      category: 'upgrades', secret: false,
      reward: '+30% production',
      check: () => G.state.totalUpgradesBought >= 25,
      onUnlock: () => { G.state.productionMultiplier *= 1.30; },
    },

    // ── PRESTIGE ──
    first_prestige: {
      id: 'first_prestige', name: 'Renaissance',
      icon: '✨', desc: 'Effectuez votre premier prestige.',
      category: 'prestige', secret: false,
      reward: '+10% clic power permanent',
      check: () => G.state.prestige >= 1,
      onUnlock: () => { G.state.clickMultiplier *= 1.10; },
    },
    prestige_5: {
      id: 'prestige_5', name: 'Cinquième Vie',
      icon: '🌟', desc: '5 prestiges effectués.',
      category: 'prestige', secret: false,
      reward: '+50% tout',
      check: () => G.state.prestige >= 5,
      onUnlock: () => { G.state.productionMultiplier *= 1.5; G.state.clickMultiplier *= 1.5; },
    },
    prestige_10: {
      id: 'prestige_10', name: 'Éternel',
      icon: '♾️', desc: '10 prestiges. Vous êtes immortel.',
      category: 'prestige', secret: true,
      reward: '×2 tout',
      check: () => G.state.prestige >= 10,
      onUnlock: () => { G.state.productionMultiplier *= 2; G.state.clickMultiplier *= 2; },
    },

    // ── NIVEAUX ──
    level_10: {
      id: 'level_10', name: 'Niveau 10',
      icon: '🎯', desc: 'Atteignez le niveau 10.',
      category: 'level', secret: false,
      reward: '+10% production',
      check: () => G.state.level >= 10,
      onUnlock: () => { G.state.productionMultiplier *= 1.10; },
    },
    level_25: {
      id: 'level_25', name: 'Niveau 25',
      icon: '🏆', desc: 'Atteignez le niveau 25.',
      category: 'level', secret: false,
      reward: '+25% tout',
      check: () => G.state.level >= 25,
      onUnlock: () => { G.state.productionMultiplier *= 1.25; G.state.clickMultiplier *= 1.25; },
    },
    level_50: {
      id: 'level_50', name: 'Niveau 50',
      icon: '💎', desc: 'Niveau 50 atteint. Vous êtes une légende.',
      category: 'level', secret: true,
      reward: '×3 tout',
      check: () => G.state.level >= 50,
      onUnlock: () => { G.state.productionMultiplier *= 3; G.state.clickMultiplier *= 3; },
    },

    // ── ÉVÉNEMENTS ──
    first_event: {
      id: 'first_event', name: 'Premier Événement',
      icon: '⚡', desc: 'Vivez votre premier événement aléatoire.',
      category: 'events', secret: false,
      reward: '💰 +5,000 G-Coins',
      check: () => G.state.totalEventsTriggered >= 1,
      onUnlock: () => G.addCoins(5000),
    },
    event_veteran: {
      id: 'event_veteran', name: 'Vétéran des Événements',
      icon: '🌪️', desc: '50 événements vécus.',
      category: 'events', secret: false,
      reward: '+10% production',
      check: () => G.state.totalEventsTriggered >= 50,
      onUnlock: () => { G.state.productionMultiplier *= 1.10; },
    },

    // ── RECHERCHE ──
    first_research: {
      id: 'first_research', name: 'Chercheur',
      icon: '🔬', desc: 'Complétez votre première recherche.',
      category: 'research', secret: false,
      reward: '×1.1 Data',
      check: () => G.state.totalResearchCompleted >= 1,
      onUnlock: () => { G.state.dataMultiplier *= 1.1; },
    },
    research_master: {
      id: 'research_master', name: 'Maître Chercheur',
      icon: '🧬', desc: '5 recherches complétées.',
      category: 'research', secret: false,
      reward: '+25% production',
      check: () => G.state.totalResearchCompleted >= 5,
      onUnlock: () => { G.state.productionMultiplier *= 1.25; },
    },
    singularity_achieved: {
      id: 'singularity_achieved', name: 'SINGULARITÉ',
      icon: '🌌', desc: 'Atteignez la Singularité Technologique.',
      category: 'research', secret: true,
      reward: '×10 tout',
      check: () => G.state.research['singularity_tech'] === 'completed',
      onUnlock: () => { G.state.productionMultiplier *= 10; G.state.clickMultiplier *= 10; },
    },

    // ── MORAL & MÉTÉO ──
    morale_100: {
      id: 'morale_100', name: 'Équipe Heureuse',
      icon: '😊', desc: 'Moral à 100%.',
      category: 'special', secret: false,
      reward: '+5% production',
      check: () => G.state.morale >= 100,
      onUnlock: () => { G.state.productionMultiplier *= 1.05; },
    },
    hackathon_survived: {
      id: 'hackathon_survived', name: 'Survivor du Hackathon',
      icon: '💻', desc: 'Survivez à un hackathon.',
      category: 'events', secret: true,
      reward: '+10% clic',
      check: () => G.state.weather === 'hackathon',
      onUnlock: () => { G.state.clickMultiplier *= 1.10; },
    },

    // ── MINI-JEU ──
    minigame_first: {
      id: 'minigame_first', name: 'Premier Mini-Jeu',
      icon: '🎮', desc: 'Jouez au mini-jeu pour la première fois.',
      category: 'special', secret: false,
      reward: '💰 +500 G-Coins',
      check: () => G.state.minigameScore > 0,
      onUnlock: () => G.addCoins(500),
    },
    minigame_pro: {
      id: 'minigame_pro', name: 'Pro du Mini-Jeu',
      icon: '🏅', desc: 'Score de 50 au mini-jeu.',
      category: 'special', secret: false,
      reward: '+5% crit',
      check: () => G.state.minigameBestScore >= 50,
      onUnlock: () => { G.state.critChance = Math.min(0.8, G.state.critChance + 0.05); },
    },

    // ── TEMPS DE JEU ──
    play_1h: {
      id: 'play_1h', name: '1 Heure de Jeu',
      icon: '⏱️', desc: 'Jouez pendant 1 heure.',
      category: 'time', secret: false,
      reward: '+5% production',
      check: () => G.state.totalPlayTime >= 3600000,
      onUnlock: () => { G.state.productionMultiplier *= 1.05; },
    },
    play_24h: {
      id: 'play_24h', name: 'Marathon',
      icon: '🏃', desc: 'Jouez pendant 24 heures cumulées.',
      category: 'time', secret: true,
      reward: '+20% tout',
      check: () => G.state.totalPlayTime >= 86400000,
      onUnlock: () => { G.state.productionMultiplier *= 1.20; G.state.clickMultiplier *= 1.20; },
    },

    // ── SECRETS ──
    secret_1: {
      id: 'secret_1', name: '???',
      icon: '❓', desc: 'Un secret bien gardé...',
      category: 'secret', secret: true,
      reward: '🌟 Surprise !',
      check: () => G.state.gcoins >= 777777,
      onUnlock: () => { G.addCoins(777777); G.showToast('🎰 JACKPOT ! +777,777 G-Coins !', 'special', 8000); },
    },
    secret_singularity: {
      id: 'secret_singularity', name: 'Au-delà de l\'Infini',
      icon: '🌀', desc: 'Vous avez tout accompli.',
      category: 'secret', secret: true,
      reward: '∞',
      check: () => G.state.gcoinsAllTime >= 1e18 && G.state.prestige >= 5,
      onUnlock: () => {
        G.state.productionMultiplier *= 100;
        G.showToast('🌀 AU-DELÀ DE L\'INFINI ! Vous avez TOUT accompli !', 'special', 10000);
      },
    },
  },

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    for (const id of Object.keys(this.LIST)) {
      if (!G.state.achievements[id]) {
        G.state.achievements[id] = { unlocked: false, date: null };
      }
    }
    this.renderRecent();
    this.updateCount();
    console.log('🏆 Achievements module initialisé');
  },

  /* ─────────────────────────────────────────────
     VÉRIFICATION
  ───────────────────────────────────────────── */

  /**
   * Vérifie un succès spécifique (by trigger type).
   */
  check(type, value) {
    for (const [id, ach] of Object.entries(this.LIST)) {
      if (G.state.achievements[id]?.unlocked) continue;
      if (ach.check && ach.check()) {
        this.unlock(id);
      }
    }
  },

  /**
   * Vérification périodique (tous les 100ms depuis la boucle).
   */
  _checkCounter: 0,
  checkPeriodic() {
    this._checkCounter++;
    if (this._checkCounter % 4 !== 0) return; // Vérif toutes les ~200ms
    this.check('periodic', 0);
  },

  /**
   * Débloque un succès.
   */
  unlock(id) {
    const ach = this.LIST[id];
    if (!ach || G.state.achievements[id]?.unlocked) return;

    G.state.achievements[id] = { unlocked: true, date: Date.now() };
    ach.onUnlock();

    G.recalcRates();
    G.recalcClickPower();

    // Affichage popup
    this.showPopup(ach);

    // Log
    G.addLog(`🏆 Succès: ${ach.name} — ${ach.reward}`, 'success');
    Assets.playSound('achieve');

    // Mise à jour UI
    this.renderRecent();
    this.updateCount();

    // Si modal ouverte, mise à jour
    if (!document.getElementById('modal-achievements').classList.contains('hidden')) {
      this.renderAllAchievements();
    }
  },

  showPopup(ach) {
    const popup = document.getElementById('achievement-popup');
    const iconEl = document.getElementById('ach-popup-icon');
    const nameEl = document.getElementById('ach-popup-name');

    if (!popup || !iconEl || !nameEl) return;

    iconEl.textContent = ach.icon;
    nameEl.textContent = ach.name;

    popup.classList.remove('hidden');
    clearTimeout(this._popupTimer);
    this._popupTimer = setTimeout(() => popup.classList.add('hidden'), 3500);
  },

  /* ─────────────────────────────────────────────
     RENDU
  ───────────────────────────────────────────── */

  renderRecent() {
    const container = document.getElementById('recent-achievements');
    if (!container) return;

    const unlocked = Object.entries(this.LIST)
      .filter(([id]) => G.state.achievements[id]?.unlocked)
      .slice(-12);

    container.innerHTML = unlocked.map(([id, ach]) => `
      <div class="ach-badge" title="${ach.name}: ${ach.desc}">
        ${ach.icon}
      </div>
    `).join('') || '<div style="font-size:11px;color:var(--text-muted)">Aucun succès encore</div>';
  },

  renderAllAchievements(filter = 'all') {
    const container = document.getElementById('all-achievements-grid');
    if (!container) return;

    container.innerHTML = '';

    for (const [id, ach] of Object.entries(this.LIST)) {
      const isUnlocked = G.state.achievements[id]?.unlocked;

      if (filter === 'unlocked' && !isUnlocked) continue;
      if (filter === 'locked' && isUnlocked) continue;

      const card = document.createElement('div');
      card.className = `ach-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      const showSecret = ach.secret && !isUnlocked;

      card.innerHTML = `
        <div class="ach-card-icon">${showSecret ? '❓' : ach.icon}</div>
        <div class="ach-card-info">
          <div class="ach-card-name">${showSecret ? '???' : ach.name}</div>
          <div class="ach-card-desc">${showSecret ? 'Succès secret...' : ach.desc}</div>
          <div class="ach-card-reward">${isUnlocked ? '✅ ' + ach.reward : '🔒 Verrouillé'}</div>
        </div>
      `;

      container.appendChild(card);
    }
  },

  updateCount() {
    const total    = Object.keys(this.LIST).length;
    const unlocked = Object.values(G.state.achievements).filter(a => a.unlocked).length;
    const el = document.getElementById('ach-count');
    if (el) el.textContent = `${unlocked}/${total}`;
  },
};

window.Achievements = Achievements;
