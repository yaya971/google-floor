/**
 * ══════════════════════════════════════════════════════════════
 * upgrades.js — Système d'Améliorations Avancé
 * ══════════════════════════════════════════════════════════════
 * Rôle : Définit toutes les améliorations disponibles,
 * leur coût, leurs prérequis et leurs effets.
 * Gère aussi l'arbre de recherche (R&D).
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Upgrades = {

  /* ─────────────────────────────────────────────
     DÉFINITIONS DES UPGRADES
     Catégories: 'click', 'production', 'agent', 'building', 'special'
  ───────────────────────────────────────────── */
  LIST: {

    // ══════════ UPGRADES DE CLIC ══════════
    better_headset: {
      id: 'better_headset',
      name: 'Meilleur Casque',
      icon: '🎧',
      desc: '+1 puissance de clic. "Enfin du son de qualité."',
      cost: 50,
      category: 'click',
      requires: [],
      effect: () => { G.state.clickPower += 1; },
    },

    ergonomic_desk: {
      id: 'ergonomic_desk',
      name: 'Bureau Ergonomique',
      icon: '🪑',
      desc: '+3 puissance de clic. La posture, c\'est la vie.',
      cost: 250,
      category: 'click',
      requires: ['better_headset'],
      effect: () => { G.state.clickPower += 3; },
    },

    coffee_machine: {
      id: 'coffee_machine',
      name: 'Machine à Café',
      icon: '☕',
      desc: '+5 clic + 5% production. La vraie motivation.',
      cost: 800,
      category: 'click',
      requires: ['ergonomic_desk'],
      effect: () => {
        G.state.clickPower += 5;
        G.state.productionMultiplier *= 1.05;
      },
    },

    mechanical_keys: {
      id: 'mechanical_keys',
      name: 'Clavier Mécanique',
      icon: '⌨️',
      desc: '+10 clic + double la crit chance.',
      cost: 5000,
      category: 'click',
      requires: ['coffee_machine'],
      effect: () => {
        G.state.clickPower += 10;
        G.state.critChance = Math.min(0.5, G.state.critChance * 2);
      },
    },

    quantum_mouse: {
      id: 'quantum_mouse',
      name: 'Souris Quantique',
      icon: '🖱️',
      desc: '+50 clic. Clic et anti-clic simultanément.',
      cost: 50000,
      category: 'click',
      requires: ['mechanical_keys'],
      effect: () => { G.state.clickPower += 50; },
    },

    neural_link: {
      id: 'neural_link',
      name: 'Lien Neuronal',
      icon: '🧠',
      desc: '+200 clic. Pensez pour cliquer.',
      cost: 500000,
      category: 'click',
      requires: ['quantum_mouse'],
      effect: () => { G.state.clickPower += 200; },
    },

    mind_control: {
      id: 'mind_control',
      name: 'Contrôle Mental',
      icon: '👁️',
      desc: '+1000 clic. Les clients cliquent pour vous.',
      cost: 5000000,
      category: 'click',
      requires: ['neural_link'],
      effect: () => { G.state.clickPower += 1000; },
    },

    // ══════════ UPGRADES DE PRODUCTION ══════════
    double_shift: {
      id: 'double_shift',
      name: 'Double Shift',
      icon: '⏰',
      desc: '+10% production globale. Heures sup non payées.',
      cost: 200,
      category: 'production',
      requires: [],
      effect: () => { G.state.productionMultiplier *= 1.10; },
    },

    overtime_policy: {
      id: 'overtime_policy',
      name: 'Politique Heures Sup',
      icon: '📋',
      desc: '+15% production. Ils n\'ont pas le choix.',
      cost: 1000,
      category: 'production',
      requires: ['double_shift'],
      effect: () => { G.state.productionMultiplier *= 1.15; },
    },

    kpi_dashboard: {
      id: 'kpi_dashboard',
      name: 'Dashboard KPIs',
      icon: '📈',
      desc: '+20% prod. Ce qui se mesure s\'améliore.',
      cost: 5000,
      category: 'production',
      requires: ['overtime_policy'],
      effect: () => { G.state.productionMultiplier *= 1.20; },
    },

    agile_sprints: {
      id: 'agile_sprints',
      name: 'Sprints Agiles',
      icon: '🏃',
      desc: '+25% production. SCRUM master embauché.',
      cost: 20000,
      category: 'production',
      requires: ['kpi_dashboard'],
      effect: () => { G.state.productionMultiplier *= 1.25; },
    },

    lean_methodology: {
      id: 'lean_methodology',
      name: 'Méthode Lean',
      icon: '🎯',
      desc: '+30% prod. Élimination du gaspillage.',
      cost: 100000,
      category: 'production',
      requires: ['agile_sprints'],
      effect: () => { G.state.productionMultiplier *= 1.30; },
    },

    ai_automation: {
      id: 'ai_automation',
      name: 'Automatisation IA',
      icon: '🤖',
      desc: '+50% production. Les robots travaillent pour vous.',
      cost: 1000000,
      category: 'production',
      requires: ['lean_methodology'],
      effect: () => { G.state.productionMultiplier *= 1.50; },
    },

    quantum_compute: {
      id: 'quantum_compute',
      name: 'Calcul Quantique',
      icon: '⚛️',
      desc: '×2 production globale. Incroyable.',
      cost: 10000000,
      category: 'production',
      requires: ['ai_automation'],
      effect: () => { G.state.productionMultiplier *= 2.0; },
    },

    singularity_protocol: {
      id: 'singularity_protocol',
      name: 'Protocole Singularité',
      icon: '🌌',
      desc: '×5 production globale. La Singularité approche.',
      cost: 1000000000,
      category: 'production',
      requires: ['quantum_compute'],
      effect: () => { G.state.productionMultiplier *= 5.0; },
    },

    // ══════════ UPGRADES D'AGENTS ══════════
    agent_training_basic: {
      id: 'agent_training_basic',
      name: 'Formation Basique',
      icon: '📚',
      desc: '×1.2 production de tous les agents.',
      cost: 500,
      category: 'agent',
      requires: [],
      effect: () => { G.applyAgentMultiplier(1.2); },
    },

    agent_training_advanced: {
      id: 'agent_training_advanced',
      name: 'Formation Avancée',
      icon: '🎓',
      desc: '×1.5 production de tous les agents.',
      cost: 5000,
      category: 'agent',
      requires: ['agent_training_basic'],
      effect: () => { G.applyAgentMultiplier(1.5); },
    },

    wellness_program: {
      id: 'wellness_program',
      name: 'Programme Bien-être',
      icon: '💆',
      desc: '+20% moral permanent + ×1.2 agents.',
      cost: 25000,
      category: 'agent',
      requires: [],
      effect: () => {
        G.state.morale = Math.min(100, G.state.morale + 20);
        G.applyAgentMultiplier(1.2);
      },
    },

    mentorship_program: {
      id: 'mentorship_program',
      name: 'Programme Mentorat',
      icon: '🤝',
      desc: 'Les agents seniors boostent les juniors ×1.3.',
      cost: 75000,
      category: 'agent',
      requires: ['agent_training_advanced'],
      effect: () => { G.applyAgentMultiplier(1.3); },
    },

    employee_of_month: {
      id: 'employee_of_month',
      name: 'Employé du Mois',
      icon: '⭐',
      desc: '×1.5 production agents Tier 1-3.',
      cost: 250000,
      category: 'agent',
      requires: ['mentorship_program'],
      effect: () => { G.applyAgentMultiplier(1.5); },
    },

    hybrid_work: {
      id: 'hybrid_work',
      name: 'Travail Hybride',
      icon: '🏠',
      desc: '+25% prod + moral à 100%.',
      cost: 1000000,
      category: 'agent',
      requires: ['wellness_program'],
      effect: () => {
        G.state.productionMultiplier *= 1.25;
        G.state.morale = 100;
        G.state.moraleDecayMult *= 0.5;
      },
    },

    // ══════════ UPGRADES SPÉCIALES ══════════
    reputation_boost: {
      id: 'reputation_boost',
      name: 'Boost Réputation',
      icon: '⭐',
      desc: '+50 réputation instantanément.',
      cost: 1000,
      category: 'special',
      requires: [],
      effect: () => { G.state.reputation += 50; },
    },

    daily_jackpot: {
      id: 'daily_jackpot',
      name: 'Jackpot Quotidien',
      icon: '🎰',
      desc: 'Débloque les récompenses quotidiennes.',
      cost: 10000,
      category: 'special',
      requires: ['reputation_boost'],
      effect: () => {
        G.showToast('🎰 Jackpot quotidien débloqué !', 'special');
        if (typeof Events !== 'undefined') Events.triggerJackpot();
      },
    },

    market_access: {
      id: 'market_access',
      name: 'Accès Marché',
      icon: '📈',
      desc: 'Débloque le marché des ressources.',
      cost: 50000,
      category: 'special',
      requires: [],
      effect: () => { G.showToast('📈 Marché des ressources débloqué !', 'success'); },
    },

    global_expansion: {
      id: 'global_expansion',
      name: 'Expansion Mondiale',
      icon: '🌍',
      desc: 'Ouvre des bureaux sur tous les continents. ×2 production.',
      cost: 10000000,
      category: 'special',
      requires: ['market_access'],
      effect: () => { G.state.productionMultiplier *= 2; },
    },

    blockchain_security: {
      id: 'blockchain_security',
      name: 'Sécurité Blockchain',
      icon: '⛓️',
      desc: 'Protège contre les catastrophes. +0.5 réputation/s.',
      cost: 5000000,
      category: 'special',
      requires: [],
      effect: () => {
        G.showToast('⛓️ Blockchain activée !', 'special');
      },
    },

    ar_training: {
      id: 'ar_training',
      name: 'Formation AR',
      icon: '🥽',
      desc: 'Réalité Augmentée pour formation. ×2 agents.',
      cost: 25000000,
      category: 'special',
      requires: ['agent_training_advanced'],
      effect: () => { G.applyAgentMultiplier(2.0); },
    },

    // ══════════ UPGRADES DE DONNÉES ══════════
    data_pipeline: {
      id: 'data_pipeline',
      name: 'Pipeline Data',
      icon: '🔀',
      desc: '×2 production de Data.',
      cost: 3000,
      category: 'production',
      requires: [],
      effect: () => { G.state.dataMultiplier *= 2; },
    },

    ml_pipeline: {
      id: 'ml_pipeline',
      name: 'Pipeline ML',
      icon: '🧬',
      desc: 'Machine Learning: ×3 Data + +15% production.',
      cost: 50000,
      category: 'production',
      requires: ['data_pipeline'],
      effect: () => {
        G.state.dataMultiplier *= 3;
        G.state.productionMultiplier *= 1.15;
      },
    },

    big_data: {
      id: 'big_data',
      name: 'Big Data Analytics',
      icon: '💾',
      desc: '×5 Data + +20% production.',
      cost: 500000,
      category: 'production',
      requires: ['ml_pipeline'],
      effect: () => {
        G.state.dataMultiplier *= 5;
        G.state.productionMultiplier *= 1.20;
      },
    },
  },

  /* ─────────────────────────────────────────────
     ARBRE DE RECHERCHE (R&D)
  ───────────────────────────────────────────── */
  RESEARCH: {
    // Tier 1: Fondamentaux
    basic_automation: {
      id: 'basic_automation',
      name: 'Automatisation Basique',
      icon: '⚙️',
      desc: 'Automatise les tâches répétitives. +10% production.',
      dataCost: 50,
      duration: 30,
      tier: 1,
      requires: [],
      effect: () => { G.state.productionMultiplier *= 1.10; },
    },

    call_optimization: {
      id: 'call_optimization',
      name: 'Optimisation des Appels',
      icon: '📞',
      desc: 'Réduit les temps d\'attente. ×1.2 tous les agents.',
      dataCost: 100,
      duration: 60,
      tier: 1,
      requires: [],
      effect: () => { G.applyAgentMultiplier(1.2); },
    },

    speech_recognition: {
      id: 'speech_recognition',
      name: 'Reconnaissance Vocale',
      icon: '🎙️',
      desc: 'IA vocale. +15% production Support.',
      dataCost: 200,
      duration: 120,
      tier: 1,
      requires: ['basic_automation'],
      effect: () => { G.state.productionMultiplier *= 1.15; },
    },

    // Tier 2: Avancé
    predictive_analytics: {
      id: 'predictive_analytics',
      name: 'Analytics Prédictifs',
      icon: '🔮',
      desc: 'Anticipe les demandes. +25% production.',
      dataCost: 500,
      duration: 180,
      tier: 2,
      requires: ['speech_recognition', 'call_optimization'],
      effect: () => { G.state.productionMultiplier *= 1.25; },
    },

    sentiment_analysis: {
      id: 'sentiment_analysis',
      name: 'Analyse des Sentiments',
      icon: '😊',
      desc: 'Détecte l\'humeur client. +30% réputation/s.',
      dataCost: 800,
      duration: 240,
      tier: 2,
      requires: ['predictive_analytics'],
      effect: () => {
        G.state.productionMultiplier *= 1.15;
        G.state.reputation += 100;
      },
    },

    neural_networks: {
      id: 'neural_networks',
      name: 'Réseaux de Neurones',
      icon: '🧠',
      desc: 'IA avancée. ×1.5 production globale.',
      dataCost: 2000,
      duration: 600,
      tier: 2,
      requires: ['predictive_analytics'],
      effect: () => { G.state.productionMultiplier *= 1.5; },
    },

    // Tier 3: Expert
    quantum_computing: {
      id: 'quantum_computing',
      name: 'Informatique Quantique',
      icon: '⚛️',
      desc: 'Calculs quantiques. ×2 Data + ×2 production.',
      dataCost: 10000,
      duration: 1800,
      tier: 3,
      requires: ['neural_networks'],
      effect: () => {
        G.state.dataMultiplier *= 2;
        G.state.productionMultiplier *= 2;
      },
    },

    agi_prototype: {
      id: 'agi_prototype',
      name: 'Prototype AGI',
      icon: '🤖',
      desc: 'Intelligence Générale Artificielle. ×5 tout.',
      dataCost: 50000,
      duration: 3600,
      tier: 3,
      requires: ['quantum_computing', 'neural_networks'],
      effect: () => {
        G.state.productionMultiplier *= 5;
        G.state.dataMultiplier *= 5;
        G.showToast('🤖 AGI créée ! Production ×5 !', 'special', 8000);
      },
    },

    // Tier 4: Singularité
    singularity_tech: {
      id: 'singularity_tech',
      name: 'Technologie Singularité',
      icon: '🌌',
      desc: 'Transcendance technologique. ×10 tout.',
      dataCost: 500000,
      duration: 7200,
      tier: 4,
      requires: ['agi_prototype'],
      effect: () => {
        G.state.productionMultiplier *= 10;
        G.state.dataMultiplier *= 10;
        G.showToast('🌌 SINGULARITÉ ATTEINTE ! ×10 tout !', 'special', 10000);
      },
    },
  },

  currentFilter: 'all',

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    // Initialise l'état des upgrades
    for (const id of Object.keys(this.LIST)) {
      if (!G.state.upgrades[id]) G.state.upgrades[id] = false;
    }
    for (const id of Object.keys(this.RESEARCH)) {
      if (!G.state.research[id]) G.state.research[id] = 'locked';
    }

    // Déverrouille les recherches Tier 1
    for (const [id, tech] of Object.entries(this.RESEARCH)) {
      if (tech.tier === 1 && G.state.research[id] === 'locked') {
        G.state.research[id] = 'available';
      }
    }

    this.renderUpgrades();
    this.renderResearch();
    this._bindUI();

    console.log('🔬 Upgrades module initialisé');
  },

  /* ─────────────────────────────────────────────
     ACHAT D'UPGRADE
  ───────────────────────────────────────────── */

  buyUpgrade(id) {
    const upg = this.LIST[id];
    if (!upg) return false;

    // Déjà acheté?
    if (G.state.upgrades[id]) {
      G.showToast('ℹ️ Déjà possédé !', 'info');
      return false;
    }

    // Prérequis
    for (const req of upg.requires) {
      if (!G.state.upgrades[req]) {
        const reqUpg = this.LIST[req];
        G.showToast(`🔒 Requis: ${reqUpg ? reqUpg.name : req}`, 'warning');
        return false;
      }
    }

    // Coût
    if (!G.spendCoins(upg.cost)) {
      Assets.playSound('error');
      G.showToast(`❌ Fonds insuffisants ! (${G.formatCoins(upg.cost)})`, 'error');
      return false;
    }

    // Marquer comme acheté
    G.state.upgrades[id] = true;
    G.state.totalUpgradesBought++;

    // Appliquer l'effet
    upg.effect();

    // Recalcul
    G.recalcRates();
    G.recalcClickPower();

    G.addLog(`🔬 Upgrade: ${upg.name} acheté !`, 'success');
    Assets.playSound('upgrade');
    G.showToast(`${upg.icon} ${upg.name} activé !`, 'success');
    G.addXP(upg.cost * 0.02);

    if (typeof Achievements !== 'undefined') {
      Achievements.check('upgrades', G.state.totalUpgradesBought);
    }

    // Déverrouille les recherches dépendantes
    this._checkResearchUnlocks();
    this.renderUpgrades();

    return true;
  },

  /* ─────────────────────────────────────────────
     DÉMARRER UNE RECHERCHE
  ───────────────────────────────────────────── */

  startResearch(id) {
    const tech = this.RESEARCH[id];
    if (!tech) return false;

    if (G.state.researchQueue) {
      G.showToast('⚠️ Une recherche est déjà en cours !', 'warning');
      return false;
    }

    if (G.state.research[id] === 'completed') {
      G.showToast('ℹ️ Déjà recherché !', 'info');
      return false;
    }

    if (G.state.research[id] !== 'available') {
      G.showToast('🔒 Recherche verrouillée !', 'warning');
      return false;
    }

    // Vérif prérequis
    for (const req of tech.requires) {
      if (G.state.research[req] !== 'completed') {
        G.showToast(`🔒 Prérequis manquant: ${this.RESEARCH[req]?.name || req}`, 'warning');
        return false;
      }
    }

    if (!G.spendData(tech.dataCost)) {
      G.showToast(`❌ Data insuffisante ! (${G.formatNum(tech.dataCost)} requis)`, 'error');
      return false;
    }

    G.state.researchQueue = id;
    G.state.researchProgress = 0;
    G.state.research[id] = 'in-progress';

    G.addLog(`🧬 Recherche démarrée: ${tech.name}`, 'info');
    G.showToast(`🧬 Recherche: ${tech.name}`, 'info');

    this.renderResearch();
    return true;
  },

  /* ─────────────────────────────────────────────
     TICK DE RECHERCHE (appelé par G.tick)
  ───────────────────────────────────────────── */

  tick(delta) {
    if (!G.state.researchQueue) return;

    const id = G.state.researchQueue;
    const tech = this.RESEARCH[id];
    if (!tech) { G.state.researchQueue = null; return; }

    G.state.researchProgress += delta / tech.duration;

    if (G.state.researchProgress >= 1) {
      this.completeResearch(id);
    }

    // Mise à jour barre de progression
    const fill = document.getElementById('research-fill');
    const label = document.getElementById('research-label');
    if (fill) fill.style.width = `${(G.state.researchProgress * 100).toFixed(1)}%`;
    if (label) label.textContent = `${tech.name} — ${(G.state.researchProgress * 100).toFixed(0)}%`;
  },

  completeResearch(id) {
    const tech = this.RESEARCH[id];
    G.state.research[id] = 'completed';
    G.state.researchQueue = null;
    G.state.researchProgress = 0;
    G.state.totalResearchCompleted++;

    tech.effect();
    G.recalcRates();

    G.addLog(`✅ Recherche terminée: ${tech.name} !`, 'success');
    Assets.playSound('achieve');
    G.showToast(`✅ Recherche complète: ${tech.name} !`, 'success', 5000);
    G.addXP(tech.dataCost * 10);

    if (typeof Achievements !== 'undefined') {
      Achievements.check('research', G.state.totalResearchCompleted);
    }

    // Déverrouille les suivantes
    this._checkResearchUnlocks();
    this.renderResearch();

    // Reset barre
    const fill = document.getElementById('research-fill');
    const label = document.getElementById('research-label');
    if (fill) fill.style.width = '0%';
    if (label) label.textContent = 'Aucune recherche active';
  },

  _checkResearchUnlocks() {
    for (const [id, tech] of Object.entries(this.RESEARCH)) {
      if (G.state.research[id] !== 'locked') continue;
      const allDone = tech.requires.every(r => G.state.research[r] === 'completed');
      if (allDone) G.state.research[id] = 'available';
    }
  },

  /* ─────────────────────────────────────────────
     RENDU — UPGRADES
  ───────────────────────────────────────────── */

  renderUpgrades() {
    const container = document.getElementById('upgrades-grid');
    if (!container) return;

    container.innerHTML = '';

    for (const [id, upg] of Object.entries(this.LIST)) {
      if (this.currentFilter !== 'all' && upg.category !== this.currentFilter) continue;

      const purchased = G.state.upgrades[id];
      const canAfford = G.canAfford(upg.cost);
      const reqsMet = upg.requires.every(r => G.state.upgrades[r]);

      const card = document.createElement('div');
      card.className = `upgrade-card${purchased ? ' purchased' : (!canAfford || !reqsMet) ? ' unaffordable' : ''}`;

      card.innerHTML = `
        <div class="upgrade-icon">${upg.icon}</div>
        <div class="upgrade-name">${upg.name}</div>
        <div class="upgrade-desc">${upg.desc}</div>
        ${purchased
          ? '<div class="upgrade-purchased-badge">✅</div>'
          : `<div class="upgrade-cost">💰 ${G.formatCoins(upg.cost)}
               ${!reqsMet ? ' <span style="font-size:9px;color:var(--text-muted)">(requis: ' + upg.requires.map(r => this.LIST[r]?.name || r).join(', ') + ')</span>' : ''}
             </div>`
        }
      `;

      if (!purchased) {
        card.addEventListener('click', () => this.buyUpgrade(id));
      }

      container.appendChild(card);
    }
  },

  /* ─────────────────────────────────────────────
     RENDU — RECHERCHE
  ───────────────────────────────────────────── */

  renderResearch() {
    const container = document.getElementById('research-tree');
    if (!container) return;

    // Grouper par tier
    const tiers = {};
    for (const [id, tech] of Object.entries(this.RESEARCH)) {
      if (!tiers[tech.tier]) tiers[tech.tier] = [];
      tiers[tech.tier].push({ id, ...tech });
    }

    container.innerHTML = '';

    for (const [tier, techs] of Object.entries(tiers)) {
      const tierDiv = document.createElement('div');
      tierDiv.className = 'research-tier';

      const tierNames = { 1: 'Fondamentaux', 2: 'Avancé', 3: 'Expert', 4: 'Singularité' };
      tierDiv.innerHTML = `<div class="research-tier-label">Tier ${tier} — ${tierNames[tier] || ''}</div>`;

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'research-items';

      for (const tech of techs) {
        const status = G.state.research[tech.id] || 'locked';
        const card = document.createElement('div');
        card.className = `research-card ${status}`;
        const isInProgress = status === 'in-progress';
        const timeLeft = isInProgress
          ? `${Math.ceil(tech.duration * (1 - G.state.researchProgress))}s`
          : `${tech.duration}s`;

        card.innerHTML = `
          <div class="research-icon">${tech.icon}</div>
          <div class="research-name">${tech.name}</div>
          <div class="research-desc">${tech.desc}</div>
          <div class="research-cost">📊 ${G.formatNum(tech.dataCost)} Data</div>
          <div class="research-time">⏱️ ${timeLeft}</div>
          ${status === 'completed' ? '<div style="color:var(--accent-green);font-size:11px;margin-top:4px">✅ Complété</div>' : ''}
          ${status === 'locked' ? '<div style="color:var(--text-muted);font-size:10px;margin-top:4px">🔒 Verrou</div>' : ''}
        `;

        if (status === 'available') {
          card.style.cursor = 'pointer';
          card.addEventListener('click', () => this.startResearch(tech.id));
        }

        itemsDiv.appendChild(card);
      }

      tierDiv.appendChild(itemsDiv);
      container.appendChild(tierDiv);
    }
  },

  /* ─────────────────────────────────────────────
     BIND UI
  ───────────────────────────────────────────── */

  _bindUI() {
    // Filtres upgrades
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderUpgrades();
      });
    });
  },
};

/* Utilitaire global pour appliquer un multiplicateur aux agents */
G.applyAgentMultiplier = function(mult) {
  G.state.productionMultiplier *= mult;
  G.recalcRates();
};

window.Upgrades = Upgrades;
