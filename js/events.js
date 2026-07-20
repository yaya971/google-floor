/**
 * ══════════════════════════════════════════════════════════════
 * events.js — Événements Aléatoires, Météo, Quêtes et Marché
 * ══════════════════════════════════════════════════════════════
 * Rôle : Gère tous les systèmes dynamiques du jeu :
 * - Événements aléatoires (toutes les 30-120s)
 * - Système de météo avec effets sur la production
 * - Quêtes quotidiennes et contrats à durée limitée
 * - Marché des ressources avec fluctuations de prix
 * - Catastrophes, jackpots, événements saisonniers
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Events = {

  /* ─────────────────────────────────────────────
     MÉTÉOS DISPONIBLES
  ───────────────────────────────────────────── */
  WEATHERS: [
    { id: 'sunny',       name: 'Journée Ensoleillée',  icon: '☀️',  effect: 1.0,  desc: 'Production normale.' },
    { id: 'cloudy',      name: 'Temps Nuageux',         icon: '☁️',  effect: 0.9,  desc: '-10% production.' },
    { id: 'rainy',       name: 'Pluie',                 icon: '🌧️', effect: 0.8,  desc: '-20% production (moral réduit).' },
    { id: 'storm',       name: 'Tempête',               icon: '⛈️', effect: 0.5,  desc: '-50% production (danger!).' },
    { id: 'heatwave',    name: 'Canicule',              icon: '🌡️', effect: 1.3,  desc: '+30% prod mais moral baisse.' },
    { id: 'snowday',     name: 'Jour de Neige',         icon: '❄️',  effect: 0.7,  desc: '+30% moral, -30% prod.' },
    { id: 'productive',  name: 'Journée Productive',   icon: '⚡',  effect: 1.5,  desc: '+50% production.' },
    { id: 'hackathon',   name: 'HACKATHON',             icon: '💻',  effect: 2.0,  desc: '×2 production pendant 3 min!' },
    { id: 'serverDown',  name: 'Serveurs en Panne',     icon: '🔴',  effect: 0.3,  desc: '-70% production. Catastrophe!' },
  ],

  /* ─────────────────────────────────────────────
     ÉVÉNEMENTS ALÉATOIRES
  ───────────────────────────────────────────── */
  RANDOM_EVENTS: [
    {
      id: 'lucky_call',
      name: '📞 Appel de la Fortune',
      desc: 'Un client VIP génère un bonus massif !',
      icon: '📞',
      duration: 0,
      probability: 0.3,
      effect: () => {
        const bonus = G.rates.gcoinsPerSecond * 30;
        G.addCoins(Math.max(100, bonus));
        G.showToast(`📞 Appel VIP ! +${G.formatCoins(bonus)}`, 'success', 4000);
        G.addLog(`📞 Appel VIP: +${G.formatCoins(bonus)}`, 'success');
      },
    },
    {
      id: 'viral_post',
      name: '📣 Post Viral',
      desc: 'Un tweet vous rapporte de la réputation !',
      icon: '📣',
      duration: 60,
      probability: 0.2,
      multiplier: 1.5,
      effect: () => {
        G.state.reputation += 50;
        G.state.productionMultiplier *= 1.2;
        setTimeout(() => { G.state.productionMultiplier /= 1.2; }, 60000);
        G.showToast('📣 Post Viral ! +50 réputation, +20% prod pendant 60s', 'special');
      },
    },
    {
      id: 'angry_customer',
      name: '😡 Client Furieux',
      desc: 'Un client mécontent fait baisser la réputation.',
      icon: '😡',
      duration: 0,
      probability: 0.2,
      effect: () => {
        G.state.reputation = Math.max(0, G.state.reputation - 25);
        G.state.morale = Math.max(0, G.state.morale - 15);
        G.showToast('😡 Client furieux ! -25 réputation, -15% moral', 'error', 4000);
        G.addLog('😡 Client furieux: -25 réputation', 'error');
      },
    },
    {
      id: 'data_breach',
      name: '🔴 Fuite de Données',
      desc: 'Une fuite de données ! Perte de réputation massive.',
      icon: '🔴',
      duration: 120,
      probability: 0.1,
      effect: () => {
        G.state.reputation = Math.max(0, G.state.reputation - 100);
        G.state.productionMultiplier *= 0.7;
        setTimeout(() => { G.state.productionMultiplier /= 0.7; }, 120000);
        G.showToast('🔴 FUITE DE DONNÉES ! -100 réputation, -30% prod', 'error', 6000);
        // Remède: upgrade blockchain
        if (G.state.upgrades['blockchain_security']) {
          G.state.productionMultiplier *= (1/0.7);
          G.showToast('⛓️ Blockchain a évité la catastrophe !', 'special');
        }
      },
    },
    {
      id: 'google_bonus',
      name: '🎁 Bonus Google',
      desc: 'Google envoie des ressources gratuitement !',
      icon: '🎁',
      duration: 0,
      probability: 0.15,
      effect: () => {
        const bonus = G.rates.gcoinsPerSecond * 120;
        G.addCoins(Math.max(1000, bonus));
        G.addData(100);
        G.showToast(`🎁 Bonus Google ! +${G.formatCoins(bonus)} + 100 Data`, 'special', 5000);
      },
    },
    {
      id: 'competitor_attack',
      name: '⚔️ Attaque Concurrente',
      desc: 'Un concurrent tente de vous voler vos clients !',
      icon: '⚔️',
      duration: 60,
      probability: 0.12,
      effect: () => {
        G.state.productionMultiplier *= 0.8;
        setTimeout(() => { G.state.productionMultiplier /= 0.8; }, 60000);
        G.showToast('⚔️ Attaque concurrente ! -20% prod pendant 60s', 'warning', 5000);
        if (typeof Enemies !== 'undefined') Enemies.spawnCompetitor();
      },
    },
    {
      id: 'server_crash',
      name: '💥 Crash Serveur',
      desc: 'Tous les serveurs tombent ! Production réduite.',
      icon: '💥',
      duration: 45,
      probability: 0.08,
      effect: () => {
        G.state.productionMultiplier *= 0.5;
        setTimeout(() => { G.state.productionMultiplier /= 0.5; }, 45000);
        G.showToast('💥 Crash Serveur ! -50% prod pendant 45s', 'error', 6000);
      },
    },
    {
      id: 'audit_surprise',
      name: '🧐 Audit Surprise',
      desc: 'Un auditeur examine vos pratiques !',
      icon: '🧐',
      duration: 60,
      probability: 0.1,
      effect: () => {
        G.state.productionMultiplier *= 0.8;
        G.state.morale -= 20;
        setTimeout(() => { G.state.productionMultiplier /= 0.8; }, 60000);
        G.showToast('🧐 Audit Surprise ! -20% prod pendant 60s et -20 moral', 'warning', 5000);
      },
    },
    {
      id: 'innovation_day',
      name: '💡 Journée Innovation',
      desc: 'Journée dédiée à l\'innovation ! +100% tout.',
      icon: '💡',
      duration: 120,
      probability: 0.08,
      effect: () => {
        G.state.productionMultiplier *= 2;
        G.state.clickMultiplier *= 2;
        setTimeout(() => {
          G.state.productionMultiplier /= 2;
          G.state.clickMultiplier /= 2;
        }, 120000);
        G.showToast('💡 Journée Innovation ! ×2 tout pendant 2 min !', 'special', 6000);
      },
    },
    {
      id: 'agent_strike',
      name: '🪧 Grève !',
      desc: 'Vos agents font grève ! Moral effondré.',
      icon: '🪧',
      duration: 90,
      probability: 0.06,
      effect: () => {
        G.state.morale = Math.max(0, G.state.morale - 50);
        G.state.productionMultiplier *= 0.6;
        setTimeout(() => {
          G.state.productionMultiplier /= 0.6;
          G.state.morale = Math.min(100, G.state.morale + 30);
        }, 90000);
        G.showToast('🪧 GRÈVE ! Moral -50, Prod -40% pendant 90s', 'error', 6000);
      },
    },
    {
      id: 'investment_round',
      name: '💼 Tour d\'Investissement',
      desc: 'Des investisseurs vous donnent des fonds !',
      icon: '💼',
      duration: 0,
      probability: 0.05,
      effect: () => {
        const invest = G.rates.gcoinsPerSecond * 300;
        G.addCoins(Math.max(5000, invest));
        G.showToast(`💼 Investisseurs ! +${G.formatCoins(invest)}`, 'special', 6000);
        G.state.reputation += 20;
      },
    },
    {
      id: 'jackpot_call',
      name: '🎰 JACKPOT APPEL',
      desc: 'Un client légendaire ! Gain massif.',
      icon: '🎰',
      duration: 0,
      probability: 0.03,
      effect: () => {
        const jackpot = G.rates.gcoinsPerSecond * 3600;
        G.addCoins(Math.max(100000, jackpot));
        G.showFloatNumber(jackpot, window.innerWidth/2, window.innerHeight/2, 'mega');
        G.showToast(`🎰 JACKPOT ! +${G.formatCoins(jackpot)}`, 'special', 8000);
        G.addLog(`🎰 JACKPOT: +${G.formatCoins(jackpot)}`, 'special');
      },
    },
  ],

  /* ─────────────────────────────────────────────
     QUÊTES QUOTIDIENNES — Templates
  ───────────────────────────────────────────── */
  QUEST_TEMPLATES: [
    {
      id: 'q_click_100',
      name: 'Clicker du Jour',
      icon: '👆',
      desc: 'Effectuez 100 clics aujourd\'hui.',
      type: 'clicks',
      target: 100,
      reward: { coins: 5000 },
      duration: 86400,
    },
    {
      id: 'q_coins_1k',
      name: 'Objectif Journalier',
      icon: '💰',
      desc: 'Gagnez 1,000 G-Coins.',
      type: 'coins',
      target: 1000,
      reward: { coins: 10000, data: 50 },
      duration: 86400,
    },
    {
      id: 'q_hire_5',
      name: 'Recruter Recruter',
      icon: '🧑‍💼',
      desc: 'Recrutez 5 agents aujourd\'hui.',
      type: 'agents',
      target: 5,
      reward: { coins: 20000 },
      duration: 86400,
    },
    {
      id: 'q_research',
      name: 'Chercheur du Jour',
      icon: '🔬',
      desc: 'Démarrez une recherche R&D.',
      type: 'research',
      target: 1,
      reward: { data: 500, coins: 50000 },
      duration: 86400,
    },
    {
      id: 'q_upgrade_2',
      name: 'Améliorateur',
      icon: '🔧',
      desc: 'Achetez 2 upgrades.',
      type: 'upgrades',
      target: 2,
      reward: { coins: 30000 },
      duration: 86400,
    },
    {
      id: 'q_survive_event',
      name: 'Survivant',
      icon: '⚡',
      desc: 'Survivez à un événement aléatoire.',
      type: 'events',
      target: 1,
      reward: { coins: 25000, data: 200 },
      duration: 86400,
    },
  ],

  /* ─────────────────────────────────────────────
     MARCHÉ — Prix de base
  ───────────────────────────────────────────── */
  MARKET_RESOURCES: {
    gcoins: { name: 'G-Coins Pack', icon: '💰', basePrice: 1000, currentPrice: 1000 },
    data:   { name: 'Data Bundle',  icon: '📊', basePrice: 500,  currentPrice: 500  },
    energy: { name: 'Énergie Pack', icon: '⚡', basePrice: 200,  currentPrice: 200  },
    rep:    { name: 'Réputation',   icon: '⭐', basePrice: 5000, currentPrice: 5000 },
  },

  /* ─────────────────────────────────────────────
     ÉTAT INTERNE
  ───────────────────────────────────────────── */
  _nextEventTimer: 60,
  _marketUpdateTimer: 30,

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    this.generateDailyQuests();
    this.initMarket();
    this._bindUI();
    this.changeWeather();
    this.renderActiveEvents();
    this.renderQuests();
    this.renderMarket();
    console.log('⚡ Events module initialisé');
  },

  /* ─────────────────────────────────────────────
     MÉTÉO
  ───────────────────────────────────────────── */
  changeWeather() {
    const weather = this.WEATHERS[G.randInt(0, this.WEATHERS.length - 1)];
    G.state.weather = weather.id;
    G.state.weatherTimer = G.CONFIG.WEATHER_DURATION + G.rand(-30, 60);

    // Effets secondaires météo
    if (weather.id === 'heatwave') G.state.morale = Math.max(0, G.state.morale - 20);
    if (weather.id === 'snowday')  G.state.morale = Math.min(100, G.state.morale + 20);
    if (weather.id === 'hackathon') {
      if (typeof Achievements !== 'undefined') Achievements.check('weather', 'hackathon');
    }

    // Mise à jour UI
    const iconEl = document.getElementById('weather-icon');
    const nameEl = document.getElementById('weather-name');
    const effectEl = document.getElementById('weather-effect');

    if (iconEl) iconEl.textContent = weather.icon;
    if (nameEl) nameEl.textContent = weather.name;
    if (effectEl) effectEl.textContent = `Production ×${weather.effect.toFixed(1)}`;

    G.addLog(`🌦️ Météo: ${weather.name} — ${weather.desc}`, 'info');

    // Notification si météo extrême
    if (['hackathon', 'serverDown', 'storm', 'innovation_day'].includes(weather.id)) {
      this.showEventNotification(weather.name, weather.desc);
    }

    G.recalcRates();
  },

  showEventNotification(title, desc, effect = '') {
    const existing = document.querySelector('.event-notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'event-notification';
    notif.innerHTML = `
      <div class="event-notif-title">⚡ Événement</div>
      <div class="event-notif-name">${title}</div>
      ${desc ? `<div class="event-notif-effect">${desc}</div>` : ''}
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 5000);
  },

  /* ─────────────────────────────────────────────
     ÉVÉNEMENTS ALÉATOIRES
  ───────────────────────────────────────────── */

  /**
   * Appelé depuis la boucle principale avec le delta time.
   */
  tick(delta) {
    // Cette méthode n'est pas directement appelée (voir G.tick)
    // Les événements sont déclenchés par triggerRandomEvent
  },

  /**
   * Tente de déclencher un événement aléatoire.
   * Appelé périodiquement depuis G.tick via le timer.
   */
  tryTriggerEvent() {
    const candidates = this.RANDOM_EVENTS.filter(e => G.chance(e.probability));
    if (!candidates.length) return;

    const event = candidates[G.randInt(0, candidates.length - 1)];
    this.triggerEvent(event);
  },

  triggerEvent(eventDef) {
    G.state.totalEventsTriggered++;

    // Ajouter à la liste active si duration > 0
    if (eventDef.duration > 0) {
      G.state.activeEvents.push({
        id: eventDef.id,
        name: eventDef.name,
        icon: eventDef.icon,
        desc: eventDef.desc,
        timeLeft: eventDef.duration,
        totalDuration: eventDef.duration,
      });
      this.renderActiveEvents();
    }

    eventDef.effect();

    if (typeof Achievements !== 'undefined') {
      Achievements.check('events', G.state.totalEventsTriggered);
    }

    this.showEventNotification(eventDef.name, eventDef.desc);
    Assets.playSound('event');
    G.addLog(`⚡ Événement: ${eventDef.name}`, 'warning');
  },

  onEventExpire(event) {
    G.addLog(`✅ Événement terminé: ${event.name}`, 'info');
    this.renderActiveEvents();
  },

  /* ─────────────────────────────────────────────
     JACKPOT QUOTIDIEN
  ───────────────────────────────────────────── */

  triggerJackpot() {
    const rewards = [
      { amount: 1000, type: 'coins', msg: '💰 Jackpot : +1,000 G-Coins !' },
      { amount: 5000, type: 'coins', msg: '💰 Jackpot : +5,000 G-Coins !' },
      { amount: 100,  type: 'data',  msg: '📊 Jackpot : +100 Data !' },
      { amount: 50,   type: 'energy',msg: '⚡ Jackpot : +50 Énergie !' },
      { amount: 50000,type: 'coins', msg: '🎰 MÉGA Jackpot : +50,000 G-Coins !' },
    ];

    const reward = rewards[G.randInt(0, rewards.length - 1)];
    if (reward.type === 'coins') G.addCoins(reward.amount);
    if (reward.type === 'data')  G.addData(reward.amount);
    if (reward.type === 'energy') G.state.energy = Math.min(G.CONFIG.MAX_ENERGY, G.state.energy + reward.amount);

    G.showToast(reward.msg, 'special', 5000);
    G.addLog(reward.msg, 'special');
  },

  /* ─────────────────────────────────────────────
     QUÊTES QUOTIDIENNES
  ───────────────────────────────────────────── */

  generateDailyQuests() {
    // Génère 3 quêtes quotidiennes aléatoires
    const templates = [...this.QUEST_TEMPLATES];
    G.state.dailyQuests = [];

    for (let i = 0; i < 3 && templates.length; i++) {
      const idx = G.randInt(0, templates.length - 1);
      const template = templates.splice(idx, 1)[0];

      // Scale la difficulté selon le niveau
      const scaleFactor = Math.max(1, G.state.level / 5);
      const scaledTarget = Math.ceil(template.target * scaleFactor);
      const scaledReward = Object.fromEntries(
        Object.entries(template.reward).map(([k, v]) => [k, Math.ceil(v * scaleFactor)])
      );

      G.state.dailyQuests.push({
        ...template,
        target: scaledTarget,
        reward: scaledReward,
        progress: 0,
        completed: false,
        timeLeft: template.duration,
        startCoins: G.state.gcoinsTotal,
        startClicks: G.state.clickCount,
        startAgents: G.state.totalAgentsHired,
        startUpgrades: G.state.totalUpgradesBought,
        startResearch: G.state.totalResearchCompleted,
        startEvents: G.state.totalEventsTriggered,
      });
    }

    this.renderQuests();
  },

  autoProgress(delta) {
    let updated = false;
    for (const quest of G.state.dailyQuests) {
      if (quest.completed) continue;

      quest.timeLeft -= delta;

      let progress = 0;
      switch (quest.type) {
        case 'clicks':   progress = G.state.clickCount - quest.startClicks; break;
        case 'coins':    progress = G.state.gcoinsTotal - quest.startCoins; break;
        case 'agents':   progress = G.state.totalAgentsHired - quest.startAgents; break;
        case 'upgrades': progress = G.state.totalUpgradesBought - quest.startUpgrades; break;
        case 'research': progress = G.state.totalResearchCompleted - quest.startResearch; break;
        case 'events':   progress = G.state.totalEventsTriggered - quest.startEvents; break;
      }

      quest.progress = Math.min(quest.target, progress);

      if (quest.progress >= quest.target && !quest.completed) {
        quest.completed = true;
        this.completeQuest(quest);
        updated = true;
      }
    }

    if (updated) this.renderQuests();
  },

  completeQuest(quest) {
    // Distribue les récompenses
    if (quest.reward.coins)  G.addCoins(quest.reward.coins);
    if (quest.reward.data)   G.addData(quest.reward.data);
    if (quest.reward.energy) G.state.energy = Math.min(G.CONFIG.MAX_ENERGY, G.state.energy + quest.reward.energy);

    const rewardStr = Object.entries(quest.reward)
      .map(([k, v]) => `+${G.formatNum(v)} ${k}`)
      .join(', ');

    G.showToast(`✅ Quête complète: ${quest.name} ! ${rewardStr}`, 'success', 5000);
    G.addLog(`✅ Quête: ${quest.name} — Récompense: ${rewardStr}`, 'success');
    Assets.playSound('achieve');
    G.addXP(1000);
  },

  /* ─────────────────────────────────────────────
     MARCHÉ DES RESSOURCES
  ───────────────────────────────────────────── */

  initMarket() {
    for (const [id, resource] of Object.entries(this.MARKET_RESOURCES)) {
      G.state.marketPrices[id] = resource.basePrice;
    }
    this.renderMarket();
    this.renderMarketTicker();
  },

  updateMarketPrices() {
    for (const [id, resource] of Object.entries(this.MARKET_RESOURCES)) {
      // Fluctuation aléatoire -15% à +15%
      const change = G.rand(-0.15, 0.15);
      const newPrice = Math.max(
        resource.basePrice * 0.5,
        Math.min(resource.basePrice * 2, G.state.marketPrices[id] * (1 + change))
      );
      G.state.marketPrices[id] = Math.ceil(newPrice);
    }
    this.renderMarket();
    this.renderMarketTicker();
  },

  buyMarketResource(resourceId, qty = 1) {
    const resource = this.MARKET_RESOURCES[resourceId];
    if (!resource) return;

    const price = G.state.marketPrices[resourceId] * qty;
    if (!G.spendCoins(price)) {
      G.showToast('❌ Fonds insuffisants !', 'error');
      return;
    }

    switch (resourceId) {
      case 'data':   G.addData(100 * qty); G.showToast(`📊 +${100*qty} Data achetée`, 'success'); break;
      case 'energy': G.state.energy = Math.min(G.CONFIG.MAX_ENERGY, G.state.energy + 30 * qty);
                     G.showToast(`⚡ +${30*qty} Énergie achetée`, 'success'); break;
      case 'rep':    G.state.reputation += 10 * qty;
                     G.showToast(`⭐ +${10*qty} Réputation achetée`, 'success'); break;
      case 'gcoins': G.addCoins(resource.basePrice * 1.5 * qty);
                     G.showToast(`💰 Pack de G-Coins acheté !`, 'success'); break;
    }

    Assets.playSound('buy');
    this.renderMarket();
  },

  sellMarketResource(resourceId) {
    const resource = this.MARKET_RESOURCES[resourceId];
    if (!resource) return;

    const sellPrice = Math.ceil(G.state.marketPrices[resourceId] * 0.8);

    switch (resourceId) {
      case 'data':
        if (G.state.data < 100) { G.showToast('Pas assez de Data !', 'warning'); return; }
        G.state.data -= 100;
        G.addCoins(sellPrice);
        G.showToast(`📊 100 Data vendues pour ${G.formatCoins(sellPrice)}`, 'success');
        break;
      case 'energy':
        if (G.state.energy < 30) { G.showToast('Pas assez d\'Énergie !', 'warning'); return; }
        G.state.energy -= 30;
        G.addCoins(sellPrice * 0.5);
        break;
    }

    Assets.playSound('sell');
    this.renderMarket();
  },

  /* ─────────────────────────────────────────────
     RENDU — ÉVÉNEMENTS ACTIFS
  ───────────────────────────────────────────── */

  renderActiveEvents() {
    const container = document.getElementById('active-events-list');
    if (!container) return;

    if (!G.state.activeEvents.length) {
      container.innerHTML = `<div style="font-size:11px;color:var(--text-muted);text-align:center;padding:8px">
        Aucun événement actif
      </div>`;
      return;
    }

    container.innerHTML = '';
    for (const event of G.state.activeEvents) {
      const pct = (event.timeLeft / event.totalDuration) * 100;
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = `
        <div class="event-icon">${event.icon}</div>
        <div class="event-info">
          <div class="event-name">${event.name}</div>
          <div class="event-desc">${event.desc}</div>
          <div class="event-timer">⏱️ ${G.formatTime(event.timeLeft)}</div>
          <div class="event-timer-bar">
            <div class="event-timer-fill" style="width:${pct.toFixed(0)}%"></div>
          </div>
        </div>
      `;
      container.appendChild(item);
    }
  },

  /* ─────────────────────────────────────────────
     RENDU — QUÊTES
  ───────────────────────────────────────────── */

  renderQuests() {
    const container = document.getElementById('quests-list');
    if (!container) return;

    container.innerHTML = '';

    if (!G.state.dailyQuests.length) {
      container.innerHTML = `<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px">
        Aucune quête disponible
        <br><button class="btn-sm" onclick="Events.generateDailyQuests()" style="margin-top:8px">Générer des quêtes</button>
      </div>`;
      return;
    }

    for (const quest of G.state.dailyQuests) {
      const pct = Math.min(100, (quest.progress / quest.target) * 100);
      const rewardStr = Object.entries(quest.reward)
        .map(([k, v]) => `+${G.formatNum(v)} ${k}`)
        .join('<br>');

      const card = document.createElement('div');
      card.className = `quest-card${quest.completed ? ' completed' : ''}${quest.timeLeft <= 0 ? ' expired' : ''}`;

      card.innerHTML = `
        <div class="quest-icon">${quest.icon}</div>
        <div class="quest-info">
          <div class="quest-name">${quest.name}</div>
          <div class="quest-desc">${quest.desc}</div>
          <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width:${pct.toFixed(0)}%"></div>
          </div>
          <div class="quest-progress-text">${G.formatNum(quest.progress)} / ${G.formatNum(quest.target)}</div>
          ${!quest.completed && quest.timeLeft > 0 ? `<div class="quest-timer">⏰ ${G.formatTime(quest.timeLeft)}</div>` : ''}
          ${quest.completed ? '<div style="color:var(--accent-green);font-size:11px;margin-top:4px">✅ Complétée !</div>' : ''}
          ${quest.timeLeft <= 0 && !quest.completed ? '<div style="color:var(--accent-red);font-size:11px;margin-top:4px">❌ Expirée</div>' : ''}
        </div>
        <div class="quest-reward">
          <div class="quest-reward-amount">${quest.reward.coins ? G.formatCoins(quest.reward.coins) : ''}</div>
          <div style="font-size:9px;color:var(--text-muted)">${rewardStr}</div>
        </div>
      `;

      container.appendChild(card);
    }
  },

  /* ─────────────────────────────────────────────
     RENDU — MARCHÉ
  ───────────────────────────────────────────── */

  renderMarket() {
    const container = document.getElementById('market-grid');
    if (!container) return;

    container.innerHTML = '';

    for (const [id, resource] of Object.entries(this.MARKET_RESOURCES)) {
      const currentPrice = G.state.marketPrices[id] || resource.basePrice;
      const change = ((currentPrice - resource.basePrice) / resource.basePrice * 100).toFixed(1);
      const isUp = currentPrice >= resource.basePrice;

      const card = document.createElement('div');
      card.className = 'market-card';
      card.innerHTML = `
        <div class="market-resource">${resource.icon}</div>
        <div class="market-name">${resource.name}</div>
        <div class="market-price">${G.formatCoins(currentPrice)}</div>
        <div class="market-change ${isUp ? 'ticker-up' : 'ticker-down'}">
          ${isUp ? '▲' : '▼'} ${Math.abs(change)}%
        </div>
        <div class="market-actions">
          <button class="btn-buy" onclick="Events.buyMarketResource('${id}')">Acheter</button>
          <button class="btn-sell" onclick="Events.sellMarketResource('${id}')">Vendre</button>
        </div>
      `;
      container.appendChild(card);
    }
  },

  renderMarketTicker() {
    const ticker = document.getElementById('market-ticker');
    if (!ticker) return;

    const items = Object.entries(this.MARKET_RESOURCES).map(([id, resource]) => {
      const price = G.state.marketPrices[id] || resource.basePrice;
      const change = ((price - resource.basePrice) / resource.basePrice * 100).toFixed(1);
      const isUp = price >= resource.basePrice;
      return `<span class="ticker-item">
        ${resource.icon} ${resource.name}:
        <span class="${isUp ? 'ticker-up' : 'ticker-down'}">${G.formatCoins(price)} ${isUp ? '▲' : '▼'}${Math.abs(change)}%</span>
      </span>`;
    }).join('');

    ticker.innerHTML = `<div class="market-ticker-inner">${items}${items}</div>`;
  },

  /* ─────────────────────────────────────────────
     BIND UI
  ───────────────────────────────────────────── */

  _bindUI() {
    // Onglets des quêtes
    document.querySelectorAll('.qtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.qtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Timer pour événements aléatoires
    setInterval(() => {
      this._nextEventTimer -= 5;
      if (this._nextEventTimer <= 0) {
        this.tryTriggerEvent();
        this._nextEventTimer = G.randInt(30, 120);
      }
    }, 5000);

    // Timer pour mise à jour des prix
    setInterval(() => {
      this.updateMarketPrices();
    }, 30000);

      // Mise à jour live des événements actifs (barre de temps)
    setInterval(() => {
      this.renderActiveEvents();
    }, 2000);
  },

  triggerEasterEgg() {
    G.showToast('🚀 MODE OVERCLOCK ACTIVÉ ! 🚀', 'special', 10000);
    G.addLog('EASTER EGG: Mode Overclock activé. Production x10 pendant 10 secondes.', 'special');
    
    // Jouer un son spécial si Assets est là
    if (typeof Assets !== 'undefined') Assets.playSound('achievement');

    const prevMulti = G.state.productionMultiplier;
    G.state.productionMultiplier *= 10;
    
    // Animation visuelle intense
    document.body.style.animation = 'shake 0.5s infinite';
    document.body.style.filter = 'hue-rotate(90deg)';
    
    setTimeout(() => {
      G.state.productionMultiplier = prevMulti;
      document.body.style.animation = 'none';
      document.body.style.filter = 'none';
      G.showToast('Fin du Mode Overclock.', 'info');
    }, 10000);
  }
};

// Objet Research exposé (référencé dans upgrades.js)
const Research = {
  tick(delta) {
    if (typeof Upgrades !== 'undefined') Upgrades.tick(delta);
  },
};

window.Events = Events;
window.Research = Research;
