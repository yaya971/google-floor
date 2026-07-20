/**
 * ══════════════════════════════════════════════════════════════
 * global.js — Chef d'Orchestre du Jeu
 * ══════════════════════════════════════════════════════════════
 * Rôle : Contient l'état global du jeu (G.state), les constantes,
 * la boucle de jeu principale (game loop), les utilitaires partagés
 * et l'initialisation dans l'ordre correct.
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────
   NAMESPACE GLOBAL G
───────────────────────────────────────────── */
const G = {

  /* ── VERSION ── */
  VERSION: '1.0.0',

  /* ── CONSTANTES DE CONFIGURATION ── */
  CONFIG: {
    TICK_RATE: 50,          // ms entre chaque tick (20 tps)
    SAVE_INTERVAL: 30000,   // sauvegarde auto toutes les 30s
    MAX_LOG_ENTRIES: 50,    // entrées max dans le journal
    MAX_PLAYERS: 4,         // joueurs max en multijoueur
    PRESTIGE_BASE: 1e6,     // G-Coins requis pour 1er prestige
    CRIT_CHANCE: 0.05,      // 5% chance de coup critique
    CRIT_MULTIPLIER: 5,     // multiplicateur critique
    FLOAT_NUM_CHANCE: 1,    // 100% affichage nombres flottants
    MAX_AGENTS_PER_TYPE: 9999,
    ENERGY_REGEN_RATE: 1,   // énergie/seconde régénérée
    MAX_ENERGY: 100,
    MORALE_DECAY: 0.01,     // décroissance morale / seconde
    WEATHER_DURATION: 180,  // secondes par météo
    DEFAULT_SETTINGS: {
      musicVolume: 0.3,
      sfxVolume: 0.5,
      musicEnabled: true,
      particlesEnabled: true,
      animationsEnabled: true,
      floatingNumbersEnabled: true,
      playerName: 'CEO',
      avatar: '🧑‍💻',
      notifications: true,
    },
  },

  /* ── ÉTAT DU JEU ── */
  state: {
    // Ressources
    gcoins:       0,
    gcoinsTotal:  0,        // cumulé depuis début (jamais reset)
    gcoinsAllTime: 0,       // cumulé tous prestiges
    data:         0,
    energy:       100,
    reputation:   0,

    // Clic
    clickPower:   1,
    clickCount:   0,
    autoClickRate: 0,       // G-Coins/seconde générés automatiquement
    critChance:   0.05,
    critMultiplier: 5,

    // Progression
    level:        1,
    xp:           0,
    xpToNext:     100,
    prestige:     0,
    prestigeMultiplier: 1.0,

    // Agents & Bâtiments
    agents: {},             // { agentId: { count, level } }
    buildings: {},          // { buildingId: { count, level } }

    // Recherche
    research: {},           // { techId: status ('unlocked'|'in-progress'|'completed') }
    researchQueue: null,    // techId en cours
    researchProgress: 0,    // 0..1

    // Améliorations
    upgrades: {},           // { upgradeId: true }

    // Succès
    achievements: {},       // { achId: { unlocked, date } }

    // Quêtes
    quests: {},             // { questId: { progress, completed } }
    dailyQuests: [],        // Quêtes quotidiennes actives

    // Événements
    activeEvents: [],       // Événements en cours avec timer
    weatherEffect: null,    // Météo actuelle

    // Marché
    marketPrices: {},       // { resourceId: price }

    // Moral & météo
    morale: 75,
    weather: 'sunny',
    weatherTimer: 180,

    // Temps
    sessionStart: Date.now(),
    totalPlayTime: 0,       // ms de temps de jeu cumulé
    lastTick: Date.now(),
    lastSave: null,

    // Multiplicateurs globaux
    productionMultiplier: 1.0,
    clickMultiplier: 1.0,
    dataMultiplier: 1.0,

    // Stats
    totalAgentsHired: 0,
    totalUpgradesBought: 0,
    totalResearchCompleted: 0,
    totalEventsTriggered: 0,

    // Compétences actives
    activeSkills: {},       // { skillId: { active, cooldownLeft } }

    // Mini-jeu
    minigameScore: 0,
    minigameBestScore: 0,
    minigameActive: false,

    // Phase du jeu
    phase: 'beginner',      // beginner | intermediate | advanced | expert | singularity

    // Multi-joueur
    multiplayerMode: false,
    currentPlayer: 0,
    players: [],            // tableau d'états joueur

    // Paramètres
    settings: {
      musicVolume: 0.3,
      sfxVolume: 0.5,
      musicEnabled: true,
      particlesEnabled: true,
      animationsEnabled: true,
      floatingNumbersEnabled: true,
      playerName: 'CEO',
      avatar: '🧑‍💻',
      country: 'fr',
      lang: 'fr',
      notifications: true,
    },

    // Mode achat (x1/x10/x100)
    buyQty: 1,

    // Timestamp dernière sauvegarde
    lastSaved: null,
  },

  /* ── BOUCLE DE JEU ── */
  loop: {
    intervalId: null,
    lastTime: 0,
    delta: 0,
    running: false,
    totalTicks: 0,
  },

  /* ── CACHE DES TAUX ── */
  rates: {
    gcoinsPerSecond: 0,
    dataPerSecond: 0,
    energyDelta: 0,
  },

  /* ── RÉFÉRENCES DOM (cachées pour perf) ── */
  dom: {},

  /* ── FLAGS ── */
  flags: {
    initialized: false,
    gameStarted: false,
    loading: false,
    saveInProgress: false,
  },
};

/* ─────────────────────────────────────────────
   UTILITAIRES NUMÉRIQUES
───────────────────────────────────────────── */

/**
 * Formate un grand nombre en notation abrégée lisible.
 * Ex: 1500 → "1.50K", 2_500_000 → "2.50M"
 */
G.formatNum = function(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  if (n < 0) return '-' + G.formatNum(-n);
  const abs = Math.abs(n);
  const suffixes = [
    { v: 1e63, s: 'Vigintillion' },
    { v: 1e60, s: 'Novemdecillion' },
    { v: 1e57, s: 'Octodecillion' },
    { v: 1e54, s: 'Septendecillion' },
    { v: 1e51, s: 'Sexdecillion' },
    { v: 1e48, s: 'Quindecillion' },
    { v: 1e45, s: 'Quattuordecillion' },
    { v: 1e42, s: 'Tredecillion' },
    { v: 1e39, s: 'Duodecillion' },
    { v: 1e36, s: 'Undecillion' },
    { v: 1e33, s: 'Decillion' },
    { v: 1e30, s: 'Nonillion' },
    { v: 1e27, s: 'Octillion' },
    { v: 1e24, s: 'Septillion' },
    { v: 1e21, s: 'Sextillion' },
    { v: 1e18, s: 'Qi' },
    { v: 1e15, s: 'Qa' },
    { v: 1e12, s: 'T' },
    { v: 1e9,  s: 'G' },
    { v: 1e6,  s: 'M' },
    { v: 1e3,  s: 'K' },
  ];
  for (const { v, s } of suffixes) {
    if (abs >= v) return (n / v).toFixed(2) + s;
  }
  return Math.floor(n).toString();
};

/**
 * Formate un nombre en G-Coins avec suffixe.
 */
G.formatCoins = function(n) {
  return G.formatNum(n) + ' G';
};

/**
 * Formate un temps en secondes → MM:SS ou HH:MM:SS.
 */
G.formatTime = function(seconds) {
  seconds = Math.floor(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

/**
 * Clamp une valeur entre min et max.
 */
G.clamp = function(v, min, max) { return Math.min(max, Math.max(min, v)); };

/**
 * Génère un entier aléatoire entre min et max (inclus).
 */
G.randInt = function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

/**
 * Génère un flottant aléatoire entre min et max.
 */
G.rand = function(min, max) { return Math.random() * (max - min) + min; };

/**
 * Retourne true avec une probabilité p (0..1).
 */
G.chance = function(p) { return Math.random() < p; };

/**
 * Lerp linéaire.
 */
G.lerp = function(a, b, t) { return a + (b - a) * t; };

/**
 * Calcule le coût d'achat d'un agent/bâtiment en fonction de la quantité possédée.
 * Formule : baseCost * growthRate^owned
 */
G.calcCost = function(baseCost, growthRate, owned) {
  return Math.ceil(baseCost * Math.pow(growthRate, owned));
};

/**
 * Calcule le coût d'achat de N unités à partir de la quantité actuelle.
 * Somme géométrique : baseCost * growthRate^owned * (growthRate^n - 1) / (growthRate - 1)
 */
G.calcBulkCost = function(baseCost, growthRate, owned, n) {
  if (growthRate === 1) return baseCost * n;
  return Math.ceil(baseCost * Math.pow(growthRate, owned) * (Math.pow(growthRate, n) - 1) / (growthRate - 1));
};

/* ─────────────────────────────────────────────
   GESTION DES RESSOURCES
───────────────────────────────────────────── */

/**
 * Ajoute des G-Coins (toujours positif).
 * Retourne le montant réellement ajouté.
 */
G.addCoins = function(amount) {
  if (amount <= 0) return 0;
  G.state.gcoins += amount;
  G.state.gcoinsTotal += amount;
  G.state.gcoinsAllTime += amount;
  return amount;
};

/**
 * Dépense des G-Coins. Retourne true si possible.
 */
G.spendCoins = function(amount) {
  if (amount <= 0) return true;
  if (G.state.gcoins < amount) return false;
  G.state.gcoins -= amount;
  return true;
};

/**
 * Vérifie si le joueur peut se permettre un montant.
 */
G.canAfford = function(amount) {
  return G.state.gcoins >= amount;
};

/**
 * Ajoute de la Data.
 */
G.addData = function(amount) {
  if (amount <= 0) return;
  G.state.data += amount;
};

/**
 * Dépense de la Data. Retourne true si possible.
 */
G.spendData = function(amount) {
  if (G.state.data < amount) return false;
  G.state.data -= amount;
  return true;
};

/**
 * Ajoute de l'XP et gère le level-up.
 */
G.addXP = function(amount) {
  G.state.xp += amount;
  while (G.state.xp >= G.state.xpToNext) {
    G.state.xp -= G.state.xpToNext;
    G.state.level++;
    G.state.xpToNext = Math.ceil(100 * Math.pow(1.15, G.state.level - 1));
    G.onLevelUp(G.state.level);
  }
};

/**
 * Callback au level-up.
 */
G.onLevelUp = function(level) {
  G.showToast(`🎉 Niveau ${level} atteint !`, 'success');
  G.addLog(`Niveau ${level} atteint ! +${level * 10}% de production`, 'success');
  G.state.productionMultiplier += 0.01;
  if (typeof Achievements !== 'undefined') Achievements.check('level', level);
};

/* ─────────────────────────────────────────────
   CALCUL DES TAUX
───────────────────────────────────────────── */

/**
 * Recalcule toutes les productions par seconde.
 * Appelé après chaque achat ou changement d'état.
 */
G.recalcRates = function() {
  let gps = 0;  // G-Coins/sec
  let dps = 0;  // Data/sec

  const st = G.state;
  const pm = st.productionMultiplier * st.prestigeMultiplier;

  // Agents
  if (typeof Entities !== 'undefined') {
    for (const [id, agentDef] of Object.entries(Entities.AGENTS)) {
      const owned = (st.agents[id] || {}).count || 0;
      if (owned > 0) {
        const agentProd = agentDef.baseProduction * owned;
        let multiplier = 1;
        // Bonus de quantité (×1.2 à 10, ×1.5 à 50, etc.)
        if (owned >= 200) multiplier *= 4;
        else if (owned >= 100) multiplier *= 3;
        else if (owned >= 50)  multiplier *= 2;
        else if (owned >= 25)  multiplier *= 1.5;
        else if (owned >= 10)  multiplier *= 1.2;
        // Bonus de recherche
        multiplier *= (agentDef.researchBonus || 1);
        // Bonus de morale
        multiplier *= G.getMoraleMultiplier();
        // Bonus météo
        multiplier *= G.getWeatherMultiplier();

        gps += agentProd * multiplier;
        if (agentDef.dataProduction) {
          dps += agentDef.dataProduction * owned * multiplier;
        }
      }
    }
  }

  // Bâtiments
  if (typeof Entities !== 'undefined') {
    for (const [id, bldDef] of Object.entries(Entities.BUILDINGS)) {
      const owned = (st.buildings[id] || {}).count || 0;
      if (owned > 0) {
        gps += bldDef.baseProduction * owned * pm;
        if (bldDef.dataProduction) {
          dps += bldDef.dataProduction * owned;
        }
      }
    }
  }

  // Upgrades bonus
  gps *= pm;

  // Compétences actives
  if (st.activeSkills.turbo && st.activeSkills.turbo.active) gps *= 3;
  if (st.activeSkills.dataBoost && st.activeSkills.dataBoost.active) dps *= 2;

  G.rates.gcoinsPerSecond = gps;
  G.rates.dataPerSecond   = dps;

  // Met à jour le power de clic affiché
  st.autoClickRate = gps;
};

/**
 * Multiplicateur basé sur le moral (50→100 = ×0.8 à ×1.2).
 */
G.getMoraleMultiplier = function() {
  return 0.6 + (G.state.morale / 100) * 0.8;
};

/**
 * Multiplicateur basé sur la météo.
 */
G.getWeatherMultiplier = function() {
  const effects = {
    sunny:       1.0,
    cloudy:      0.9,
    rainy:       0.8,
    storm:       0.5,
    heatwave:    1.3,
    snowday:     0.7,
    productive:  1.5,
    hackathon:   2.0,
    serverDown:  0.3,
  };
  return effects[G.state.weather] || 1.0;
};

/* ─────────────────────────────────────────────
   BOUCLE DE JEU PRINCIPALE
───────────────────────────────────────────── */

/**
 * Un tick du jeu. Appelé toutes les TICK_RATE ms.
 */
G.tick = function() {
  const now = Date.now();
  const delta = (now - G.state.lastTick) / 1000; // en secondes
  G.state.lastTick = now;
  G.loop.delta = delta;
  G.loop.totalTicks++;

  // ── Production automatique ──
  const gps = G.rates.gcoinsPerSecond;
  if (gps > 0) {
    G.addCoins(gps * delta);
    G.addXP(gps * delta * 0.001);
  }

  // ── Data production ──
  const dps = G.rates.dataPerSecond;
  if (dps > 0) G.addData(dps * delta);

  // ── Énergie ──
  if (G.state.energy < G.CONFIG.MAX_ENERGY) {
    G.state.energy = Math.min(
      G.CONFIG.MAX_ENERGY,
      G.state.energy + G.CONFIG.ENERGY_REGEN_RATE * delta
    );
  }

  // ── Moral ──
  const moraleDecay = G.CONFIG.MORALE_DECAY;
  G.state.morale = G.clamp(G.state.morale - moraleDecay * delta, 0, 100);

  // ── Météo ──
  G.state.weatherTimer -= delta;
  if (G.state.weatherTimer <= 0) {
    if (typeof Events !== 'undefined') Events.changeWeather();
  }

  // ── Compétences actives (cooldowns) ──
  for (const [id, skill] of Object.entries(G.state.activeSkills)) {
    if (skill.active && skill.timeLeft > 0) {
      skill.timeLeft -= delta;
      if (skill.timeLeft <= 0) {
        skill.active = false;
        skill.cooldownLeft = skill.cooldown;
      }
    }
    if (!skill.active && skill.cooldownLeft > 0) {
      skill.cooldownLeft -= delta;
      if (skill.cooldownLeft <= 0) skill.cooldownLeft = 0;
    }
  }

  // ── Recherche en cours ──
  if (G.state.researchQueue && typeof Research !== 'undefined') {
    Research.tick(delta);
  }

  // ── Événements actifs (minuterie) ──
  for (let i = G.state.activeEvents.length - 1; i >= 0; i--) {
    G.state.activeEvents[i].timeLeft -= delta;
    if (G.state.activeEvents[i].timeLeft <= 0) {
      if (typeof Events !== 'undefined') Events.onEventExpire(G.state.activeEvents[i]);
      G.state.activeEvents.splice(i, 1);
    }
  }

  // ── Quêtes (progression auto) ──
  if (typeof Quests !== 'undefined') Quests.autoProgress(delta);

  // ── Ennemis / concurrents ──
  if (typeof Enemies !== 'undefined') Enemies.tick(delta);

  // ── Temps total de jeu ──
  G.state.totalPlayTime += delta * 1000;

  // ── Mise à jour de la phase ──
  G.updatePhase();

  // ── Render ──
  // Renderer.update is handled internally by renderer.js via requestAnimationFrame

  // ── Vérification succès ──
  if (typeof Achievements !== 'undefined') Achievements.checkPeriodic();

  // ── Multijoueur sync ──
  if (G.state.multiplayerMode && typeof Multiplayer !== 'undefined') {
    Multiplayer.syncScore();
  }
};

/**
 * Détermine la phase du jeu en fonction de la progression.
 */
G.updatePhase = function() {
  const total = G.state.gcoinsAllTime;
  let phase = 'beginner';
  if (total >= 1e15) phase = 'singularity';
  else if (total >= 1e12) phase = 'expert';
  else if (total >= 1e9)  phase = 'advanced';
  else if (total >= 1e6)  phase = 'intermediate';
  if (phase !== G.state.phase) {
    G.state.phase = phase;
    G.onPhaseChange(phase);
  }
};

/**
 * Callback lors d'un changement de phase.
 */
G.onPhaseChange = function(phase) {
  const phaseNames = {
    beginner:     'Débutant',
    intermediate: 'Intermédiaire',
    advanced:     'Avancé',
    expert:       'Expert',
    singularity:  '⚡ SINGULARITÉ',
  };
  G.showToast(`🚀 Phase débloquée: ${phaseNames[phase]} !`, 'special');
  G.addLog(`Nouvelle phase atteinte: ${phaseNames[phase]}`, 'special');
};

/* ─────────────────────────────────────────────
   DÉMARRAGE / ARRÊT DE LA BOUCLE
───────────────────────────────────────────── */

G.startLoop = function() {
  if (G.loop.running) return;
  G.loop.running = true;
  G.state.lastTick = Date.now();
  G.loop.intervalId = setInterval(G.tick, G.CONFIG.TICK_RATE);
  console.log('🟢 Game loop started');
};

G.stopLoop = function() {
  if (!G.loop.running) return;
  G.loop.running = false;
  clearInterval(G.loop.intervalId);
  console.log('🔴 Game loop stopped');
};

/* ─────────────────────────────────────────────
   JOURNAL (LOG)
───────────────────────────────────────────── */

G.addLog = function(message, type = 'info') {
  const el = document.getElementById('event-log');
  if (!el) return;
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  entry.textContent = `[${time}] ${message}`;
  el.insertBefore(entry, el.firstChild);
  // Limiter les entrées
  while (el.children.length > G.CONFIG.MAX_LOG_ENTRIES) {
    el.removeChild(el.lastChild);
  }
};

/* ─────────────────────────────────────────────
   TOASTS
───────────────────────────────────────────── */

G.showToast = function(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️', special: '✨' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fadeout');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

/* ─────────────────────────────────────────────
   NOMBRES FLOTTANTS
───────────────────────────────────────────── */

G.floatPool = [];
G.floatPoolIndex = 0;
G.FLOAT_POOL_SIZE = 50;

G.initFloatPool = function() {
  const container = document.getElementById('float-numbers');
  if (!container) return;
  for (let i = 0; i < G.FLOAT_POOL_SIZE; i++) {
    const el = document.createElement('div');
    el.className = 'float-num';
    container.appendChild(el);
    G.floatPool.push(el);
  }
};

G.showFloatNumber = function(amount, x, y, type = 'normal') {
  if (!G.state.settings.floatingNumbersEnabled) return;
  if (G.floatPool.length === 0) G.initFloatPool();
  if (G.floatPool.length === 0) return;

  const el = G.floatPool[G.floatPoolIndex];
  G.floatPoolIndex = (G.floatPoolIndex + 1) % G.FLOAT_POOL_SIZE;

  el.classList.remove('animate', 'crit', 'mega');
  void el.offsetWidth;
  
  if (type === 'crit') el.classList.add('crit');
  if (type === 'mega') el.classList.add('mega');
  
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  el.textContent = `+${G.formatNum(amount)}`;
  
  el.classList.add('animate');
};

/* ─────────────────────────────────────────────
   CLICK PRINCIPAL
───────────────────────────────────────────── */

G.handleClick = function(event) {
  const st = G.state;

  // Calcul du montant (avec crit)
  let isCrit = false;
  let isMega = false;
  let amount = st.clickPower * st.clickMultiplier * st.prestigeMultiplier;

  if (G.chance(st.critChance)) {
    amount *= st.critMultiplier;
    isCrit = true;
  }

  // Bonus de compétence turbo-click
  if (st.activeSkills.turboClick && st.activeSkills.turboClick.active) {
    amount *= 10;
    isMega = true;
  }

  amount = Math.ceil(amount);
  G.addCoins(amount);
  G.addXP(amount * 0.01);
  st.clickCount++;

  // Affichage nombre flottant
  if (event) {
    const rect = document.getElementById('btn-main-click').getBoundingClientRect();
    const x = rect.left + G.rand(-30, 30);
    const y = rect.top - 10;
    G.showFloatNumber(amount, x, y, isMega ? 'mega' : isCrit ? 'crit' : 'normal');
  }

  // Effets visuels gérés via G.showFloatNumber
  // ...

  // Sons
  if (typeof Assets !== 'undefined') {
    Assets.playSound(isCrit ? 'crit' : 'click');
  }

  // Succès
  if (typeof Achievements !== 'undefined') {
    Achievements.check('clicks', st.clickCount);
  }

  // Animation du bouton
  const btn = document.getElementById('btn-main-click');
  if (btn) {
    btn.classList.remove('clicked');
    void btn.offsetWidth; // reflow
    btn.classList.add('clicked');
  }
};

/* ─────────────────────────────────────────────
   PRESTIGE
───────────────────────────────────────────── */

G.canPrestige = function() {
  return G.state.gcoinsTotal >= G.CONFIG.PRESTIGE_BASE * Math.pow(10, G.state.prestige);
};

G.doPrestige = function() {
  if (!G.canPrestige()) return false;

  const newPrestige = G.state.prestige + 1;
  const newMultiplier = 1 + newPrestige * 0.1;

  // Sauvegarde des données permanentes
  const permanent = {
    prestige: newPrestige,
    prestigeMultiplier: newMultiplier,
    gcoinsAllTime: G.state.gcoinsAllTime,
    achievements: G.state.achievements,
    settings: G.state.settings,
    totalPlayTime: G.state.totalPlayTime,
    level: Math.max(1, Math.floor(G.state.level * 0.5)), // garde la moitié des niveaux
    minigameBestScore: G.state.minigameBestScore,
  };

  // Reset de l'état principal
  G.resetState();

  // Restauration des données permanentes
  Object.assign(G.state, permanent);
  G.state.clickPower = 1 + newPrestige * 2;

  // Recalcul
  G.recalcRates();

  G.showToast(`✨ Prestige ${newPrestige} ! Bonus: ×${newMultiplier.toFixed(1)}`, 'special', 5000);
  G.addLog(`✨ Prestige ${newPrestige} accompli ! Multiplicateur: ×${newMultiplier.toFixed(1)}`, 'special');

  if (typeof Achievements !== 'undefined') {
    Achievements.check('prestige', newPrestige);
  }

  if (typeof Save !== 'undefined') Save.save();

  return true;
};

/**
 * Réinitialise l'état du jeu (gardant les paramètres permanents).
 */
G.resetState = function() {
  G.state.gcoins = 0;
  G.state.gcoinsTotal = 0;
  G.state.data = 0;
  G.state.energy = G.CONFIG.MAX_ENERGY;
  G.state.reputation = 0;
  G.state.clickPower = 1;
  G.state.clickCount = 0;
  G.state.autoClickRate = 0;
  G.state.level = 1;
  G.state.xp = 0;
  G.state.xpToNext = 100;
  G.state.agents = {};
  G.state.buildings = {};
  G.state.upgrades = {};
  G.state.research = {};
  G.state.researchQueue = null;
  G.state.researchProgress = 0;
  G.state.activeEvents = [];
  G.state.quests = {};
  G.state.dailyQuests = [];
  G.state.morale = 75;
  G.state.weather = 'sunny';
  G.state.weatherTimer = G.CONFIG.WEATHER_DURATION;
  G.state.productionMultiplier = 1.0;
  G.state.clickMultiplier = 1.0;
  G.state.activeSkills = {};
  G.state.totalAgentsHired = 0;
  G.state.totalUpgradesBought = 0;
  G.state.totalResearchCompleted = 0;
  G.state.totalEventsTriggered = 0;
  G.state.phase = 'beginner';
};

/* ─────────────────────────────────────────────
   CALCUL CLICK POWER
───────────────────────────────────────────── */

G.recalcClickPower = function() {
  let power = 1;
  const st = G.state;

  // Upgrades de clic
  if (st.upgrades['better_headset'])  power += 1;
  if (st.upgrades['ergonomic_desk'])  power += 3;
  if (st.upgrades['coffee_machine'])  power += 5;
  if (st.upgrades['mechanical_keys']) power += 10;
  if (st.upgrades['quantum_mouse'])   power += 50;
  if (st.upgrades['neural_link'])     power += 200;
  if (st.upgrades['mind_control'])    power += 1000;

  // Bonus de niveau
  power += (st.level - 1) * 0.5;

  // Bonus agents (5% de la production auto/s)
  power += G.rates.gcoinsPerSecond * 0.05;

  // Prestige
  power *= st.prestigeMultiplier;

  // Multiplicateur de clic
  power *= st.clickMultiplier;

  st.clickPower = Math.max(1, Math.ceil(power));
};

/* ─────────────────────────────────────────────
   INITIALISATION GLOBALE
───────────────────────────────────────────── */

G.init = function() {
  console.log(`🎮 Google Floor Clicker v${G.VERSION} — Initialisation`);
  G.flags.initialized = true;

  // Cache les éléments DOM importants
  G.dom = {
    loadingScreen:  document.getElementById('loading-screen'),
    mainMenu:       document.getElementById('main-menu'),
    gameUI:         document.getElementById('game-ui'),
    loadingBar:     document.getElementById('loading-bar'),
    loadingText:    document.getElementById('loading-text'),
    btnMainClick:   document.getElementById('btn-main-click'),
    valGcoins:      document.getElementById('val-gcoins'),
    rateGcoins:     document.getElementById('rate-gcoins'),
    valData:        document.getElementById('val-data'),
    valEnergy:      document.getElementById('val-energy'),
    valRep:         document.getElementById('val-rep'),
    statPerClick:   document.getElementById('stat-per-click'),
    statPerSec:     document.getElementById('stat-per-sec'),
    statTotal:      document.getElementById('stat-total'),
    statClicks:     document.getElementById('stat-clicks'),
    xpFill:         document.getElementById('xp-fill'),
    playerLevel:    document.getElementById('player-level'),
    prestigeCount:  document.getElementById('prestige-count'),
    sessionTime:    document.getElementById('session-time'),
    lastSave:       document.getElementById('last-save'),
    globalMult:     document.getElementById('global-multiplier'),
    gamePhase:      document.getElementById('game-phase'),
    moraleBar:      document.getElementById('morale-bar'),
    moraleValue:    document.getElementById('morale-value'),
  };

  // Initialisation de tous les modules (ordre important)
  if (typeof Assets !== 'undefined') Assets.init();
  if (typeof Entities !== 'undefined') Entities.init();
  if (typeof Player !== 'undefined') Player.init();
  if (typeof Upgrades !== 'undefined') Upgrades.init();
  if (typeof Achievements !== 'undefined') Achievements.init();
  if (typeof Events !== 'undefined') Events.init();
  if (typeof Enemies !== 'undefined') Enemies.init();
  if (typeof Multiplayer !== 'undefined') Multiplayer.init();
  if (typeof Leaderboard !== 'undefined') Leaderboard.init();
  if (typeof Control !== 'undefined') Control.init();
  if (typeof Save !== 'undefined') Save.init();
  if (typeof Renderer !== 'undefined') Renderer.init();

  // Essai de chargement de la sauvegarde
  let hasSave = false;
  if (typeof Save !== 'undefined') {
    hasSave = Save.load();
  }

  // Active le bouton "Continuer" si sauvegarde existe
  if (hasSave) {
    const btnContinue = document.getElementById('btn-continue');
    if (btnContinue) btnContinue.disabled = false;
  }

  G.addLog('🟢 Google Floor Clicker démarré !', 'success');
};

/**
 * Démarre une nouvelle partie.
 */
G.startNewGame = function(playerName = 'CEO', avatar = '🧑‍💻', country = 'fr', lang = 'fr') {
  G.resetState();
  G.state.settings.playerName = playerName;
  G.state.settings.avatar = avatar;
  G.state.settings.country = country;
  G.state.settings.lang = lang;
  
  if (window.I18n) window.I18n.setLang(lang);
  
  G.state.sessionStart = Date.now();
  G.state.lastTick = Date.now();

  // Initialisation des quêtes journalières
  if (typeof Events !== 'undefined') Events.generateDailyQuests();

  // Initialisation du marché
  if (typeof Events !== 'undefined') Events.initMarket();

  // Recalcul initial
  G.recalcRates();
  G.recalcClickPower();

  // Affichage du jeu
  G.showGame();
  G.startLoop();

  // Sauvegarde automatique
  if (typeof Save !== 'undefined') Save.startAutoSave();

  G.flags.gameStarted = true;
  G.addLog(`Bienvenue ${playerName} ! Bonne chance, CEO !`, 'success');
  G.showToast(`🎮 Bonne chance, ${playerName} !`, 'success');
};

/**
 * Continue une partie sauvegardée.
 */
G.continueGame = function() {
  G.state.lastTick = Date.now();
  G.state.sessionStart = Date.now();
  G.recalcRates();
  G.recalcClickPower();
  G.showGame();
  G.startLoop();
  if (typeof Save !== 'undefined') Save.startAutoSave();
  G.flags.gameStarted = true;
  G.addLog('Partie chargée ! Bon retour.', 'success');
};

/* ─────────────────────────────────────────────
   NAVIGATION UI
───────────────────────────────────────────── */

G.showLoadingScreen = function() {
  const loading = G.dom.loadingScreen || document.getElementById('loading-screen');
  const menu = G.dom.mainMenu || document.getElementById('main-menu');
  const ui = G.dom.gameUI || document.getElementById('game-ui');
  if (loading) loading.classList.remove('hidden');
  if (menu) menu.classList.add('hidden');
  if (ui) ui.classList.add('hidden');
};

G.showMainMenu = function() {
  const loading = G.dom.loadingScreen || document.getElementById('loading-screen');
  const menu = G.dom.mainMenu || document.getElementById('main-menu');
  const ui = G.dom.gameUI || document.getElementById('game-ui');
  if (loading) loading.classList.add('hidden');
  if (menu) menu.classList.remove('hidden');
  if (ui) ui.classList.add('hidden');
};

G.showGame = function() {
  const loading = G.dom.loadingScreen || document.getElementById('loading-screen');
  const menu = G.dom.mainMenu || document.getElementById('main-menu');
  const ui = G.dom.gameUI || document.getElementById('game-ui');
  if (loading) loading.classList.add('hidden');
  if (menu) menu.classList.add('hidden');
  if (ui) ui.classList.remove('hidden');
};

G.returnToMenu = function() {
  G.stopLoop();
  if (typeof Save !== 'undefined') {
    Save.save();
    Save.stopAutoSave();
  }
  G.showMainMenu();
};

/* ─────────────────────────────────────────────
   POINT D'ENTRÉE — DOMContentLoaded
───────────────────────────────────────────── */

window.addEventListener('DOMContentLoaded', async () => {
  G.showLoadingScreen();

  // Simulation du chargement progressif
  const steps = [
    { text: 'Chargement des ressources...', pct: 10 },
    { text: 'Initialisation des entités...', pct: 25 },
    { text: 'Configuration du moteur de rendu...', pct: 40 },
    { text: 'Chargement des upgrades...', pct: 55 },
    { text: 'Activation des succès...', pct: 70 },
    { text: 'Connexion au serveur Google...', pct: 85 },
    { text: 'Prêt !', pct: 100 },
  ];

  const bar = document.getElementById('loading-bar');
  const txt = document.getElementById('loading-text');

  for (const step of steps) {
    if (bar) bar.style.width = step.pct + '%';
    if (txt) txt.textContent = step.text;
    await new Promise(r => setTimeout(r, 280 + Math.random() * 200));
  }

  // Initialisation principale
  G.init();

  // Affichage du menu
  await new Promise(r => setTimeout(r, 300));
  G.showMainMenu();

  // Favicon dynamique
  if (typeof Assets !== 'undefined') Assets.generateFavicon();
});

/* ─────────────────────────────────────────────
   MÉTHODES UTILITAIRES SUPPLÉMENTAIRES
───────────────────────────────────────────── */

/**
 * Ajoute de la Data au joueur.
 */
G.addData = function(amount) {
  G.state.data += amount * (G.state.dataMultiplier || 1);
};

/**
 * Dépense de la Data. Retourne false si insuffisant.
 */
G.spendData = function(amount) {
  if (G.state.data < amount) return false;
  G.state.data -= amount;
  return true;
};

/**
 * Formate un temps en secondes en chaîne lisible.
 */
G.formatTime = function(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '0s';
  seconds = Math.max(0, Math.floor(seconds));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ${seconds%60}s`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m`;
  return `${Math.floor(seconds/86400)}j ${Math.floor((seconds%86400)/3600)}h`;
};

/**
 * Calcule la phase de jeu selon les G-Coins cumulés.
 */
G.computePhase = function() {
  const all = G.state.gcoinsAllTime;
  if (all >= 1e18) return 'transcendent';
  if (all >= 1e12) return 'expert';
  if (all >= 1e9)  return 'advanced';
  if (all >= 1e6)  return 'intermediate';
  return 'beginner';
};

/* ─────────────────────────────────────────────
   EXPOSITION GLOBALE (pour debug console)
───────────────────────────────────────────── */
window.G = G;
