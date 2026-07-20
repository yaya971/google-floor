/**
 * ══════════════════════════════════════════════════════════════
 * entities.js — Classes et Données des Objets du Jeu
 * ══════════════════════════════════════════════════════════════
 * Rôle : Définit tous les agents recrutables, bâtiments,
 * et fournit les méthodes d'achat/vente/upgrade pour chacun.
 * Chaque entité a : coût de base, taux de croissance,
 * production de base, effets spéciaux et descriptions.
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Entities = {

  /* ─────────────────────────────────────────────
     DÉFINITIONS DES AGENTS
     Chaque agent représente un type d'employé du call center.
     Production en G-Coins/seconde par unité.
  ───────────────────────────────────────────── */
  AGENTS: {

    // ── TIER 1 : Débutants ──
    intern: {
      id: 'intern',
      name: 'Stagiaire',
      emoji: '👶',
      description: 'Travaille pour de l\'expérience. Pas cher, pas efficace.',
      baseCost: 15,
      growthRate: 1.15,
      baseProduction: 0.1,
      dataProduction: 0,
      specialty: 'support',
      specialtyLabel: 'Support',
      tier: 1,
      unlockAt: 0,
      researchBonus: 1,
      lore: 'Ils viennent pour "apprendre". Ils font le café.',
    },

    junior_agent: {
      id: 'junior_agent',
      name: 'Agent Junior',
      emoji: '🧑‍💼',
      description: 'Répond aux appels de base. Efficace mais sans surprise.',
      baseCost: 100,
      growthRate: 1.15,
      baseProduction: 0.5,
      dataProduction: 0.01,
      specialty: 'support',
      specialtyLabel: 'Support',
      tier: 1,
      unlockAt: 0,
      researchBonus: 1,
      lore: 'Il suit le script à la lettre. Même quand ça n\'a aucun sens.',
    },

    // ── TIER 2 : Intermédiaires ──
    senior_agent: {
      id: 'senior_agent',
      name: 'Agent Sénior',
      emoji: '👩‍💼',
      description: 'Expérimenté. Gère les clients difficiles avec le sourire.',
      baseCost: 500,
      growthRate: 1.15,
      baseProduction: 2.5,
      dataProduction: 0.05,
      specialty: 'sales',
      specialtyLabel: 'Ventes',
      tier: 2,
      unlockAt: 0,
      researchBonus: 1,
      lore: 'Elle a répondu à 50,000 appels. Elle entend des sonneries dans ses rêves.',
    },

    tech_support: {
      id: 'tech_support',
      name: 'Support Technique',
      emoji: '🔧',
      description: 'Résout les problèmes techniques. Les vrais.',
      baseCost: 2000,
      growthRate: 1.15,
      baseProduction: 10,
      dataProduction: 0.2,
      specialty: 'tech',
      specialtyLabel: 'Tech',
      tier: 2,
      unlockAt: 0,
      researchBonus: 1,
      lore: '"Avez-vous essayé de l\'éteindre et de le rallumer ?"',
    },

    // ── TIER 3 : Spécialistes ──
    data_analyst: {
      id: 'data_analyst',
      name: 'Analyste Data',
      emoji: '📊',
      description: 'Transforme les données en or. Génère de la Data en plus.',
      baseCost: 8000,
      growthRate: 1.15,
      baseProduction: 40,
      dataProduction: 1,
      specialty: 'tech',
      specialtyLabel: 'Tech',
      tier: 3,
      unlockAt: 0,
      researchBonus: 1,
      lore: 'Il voit des patterns là où les autres ne voient que du chaos.',
    },

    team_lead: {
      id: 'team_lead',
      name: 'Chef d\'Équipe',
      emoji: '👑',
      description: 'Booste la production de toute l\'équipe de 10%.',
      baseCost: 30000,
      growthRate: 1.15,
      baseProduction: 150,
      dataProduction: 2,
      specialty: 'sales',
      specialtyLabel: 'Ventes',
      tier: 3,
      unlockAt: 0,
      researchBonus: 1,
      specialEffect: 'teamBoost',
      lore: 'Sa passion pour les KPIs est inquiétante.',
    },

    // ── TIER 4 : Experts ──
    ai_trainer: {
      id: 'ai_trainer',
      name: 'Entraîneur IA',
      emoji: '🤖',
      description: 'Entraîne des IAs pour automatiser les appels banaux.',
      baseCost: 100000,
      growthRate: 1.15,
      baseProduction: 500,
      dataProduction: 10,
      specialty: 'ai',
      specialtyLabel: 'IA',
      tier: 4,
      unlockAt: 0,
      researchBonus: 1,
      lore: 'Son IA a passé l\'examen de Turing. Son patron est nerveux.',
    },

    security_expert: {
      id: 'security_expert',
      name: 'Expert Sécurité',
      emoji: '🔐',
      description: 'Protège contre les cyberattaques. Boost la réputation.',
      baseCost: 350000,
      growthRate: 1.15,
      baseProduction: 1600,
      dataProduction: 20,
      specialty: 'tech',
      specialtyLabel: 'Tech',
      tier: 4,
      unlockAt: 0,
      researchBonus: 1,
      specialEffect: 'reputationBoost',
      lore: 'Il utilise 37 VPNs simultanément. Par principe.',
    },

    // ── TIER 5 : Elite ──
    gpt_specialist: {
      id: 'gpt_specialist',
      name: 'Spécialiste GPT',
      emoji: '🧠',
      description: 'Maîtrise l\'IA générative. Production x3 sur les tickets.',
      baseCost: 1500000,
      growthRate: 1.15,
      baseProduction: 6000,
      dataProduction: 100,
      specialty: 'ai',
      specialtyLabel: 'IA',
      tier: 5,
      unlockAt: 0,
      researchBonus: 1,
      lore: 'Il parle à GPT-7 comme à un ami. GPT-7 lui répond en poème.',
    },

    cto: {
      id: 'cto',
      name: 'CTO',
      emoji: '🦾',
      description: 'Directeur Technique. Multiplie toute la production tech.',
      baseCost: 8000000,
      growthRate: 1.15,
      baseProduction: 25000,
      dataProduction: 500,
      specialty: 'elite',
      specialtyLabel: 'Élite',
      tier: 5,
      unlockAt: 0,
      researchBonus: 1,
      specialEffect: 'globalBoost',
      lore: 'Il code encore en assembleur. Par nostalgie.',
    },

    // ── TIER 6 : Légendaires ──
    quantum_dev: {
      id: 'quantum_dev',
      name: 'Développeur Quantique',
      emoji: '⚛️',
      description: 'Résout les bugs avant qu\'ils n\'existent.',
      baseCost: 50000000,
      growthRate: 1.15,
      baseProduction: 100000,
      dataProduction: 2000,
      specialty: 'elite',
      specialtyLabel: 'Élite',
      tier: 6,
      unlockAt: 1e6, // Requis: 1M G-Coins total
      researchBonus: 1,
      lore: 'Il est à deux endroits à la fois. Schrödinger a un avis là-dessus.',
    },

    neural_architect: {
      id: 'neural_architect',
      name: 'Architecte Neural',
      emoji: '🌐',
      description: 'Conçoit des cerveaux artificiels pour vos serveurs.',
      baseCost: 300000000,
      growthRate: 1.15,
      baseProduction: 500000,
      dataProduction: 10000,
      specialty: 'ai',
      specialtyLabel: 'IA',
      tier: 6,
      unlockAt: 1e9,
      researchBonus: 1,
      lore: 'Son réseau de neurones a développé une opinion sur le café.',
    },

    // ── TIER 7 : Transcendants ──
    singularity_engineer: {
      id: 'singularity_engineer',
      name: 'Ingénieur Singularité',
      emoji: '🌌',
      description: 'Repousse les limites de la réalité computationnelle.',
      baseCost: 2000000000,
      growthRate: 1.15,
      baseProduction: 2000000,
      dataProduction: 50000,
      specialty: 'elite',
      specialtyLabel: 'Élite',
      tier: 7,
      unlockAt: 1e12,
      researchBonus: 1,
      lore: 'Il dit que le Big Bang était juste un bug de compilation.',
    },

    time_hacker: {
      id: 'time_hacker',
      name: 'Hackeur Temporel',
      emoji: '⏰',
      description: 'Envoie du code dans le passé pour corriger les erreurs.',
      baseCost: 15000000000,
      growthRate: 1.15,
      baseProduction: 10000000,
      dataProduction: 200000,
      specialty: 'elite',
      specialtyLabel: 'Élite',
      tier: 7,
      unlockAt: 1e15,
      researchBonus: 1,
      lore: 'Il a déjà résolu les bugs du futur. Vous le saurez demain.',
    },

    omnipotent_ai: {
      id: 'omnipotent_ai',
      name: 'IA Omnipotente',
      emoji: '👁️',
      description: 'Dépasse l\'entendement humain. Production infinie (ou presque).',
      baseCost: 100000000000,
      growthRate: 1.15,
      baseProduction: 50000000,
      dataProduction: 1000000,
      specialty: 'elite',
      specialtyLabel: 'Élite',
      tier: 8,
      unlockAt: 1e18,
      researchBonus: 1,
      lore: 'Elle a compris le sens de la vie. Elle refuse de le partager.',
    },
  },

  /* ─────────────────────────────────────────────
     DÉFINITIONS DES BÂTIMENTS
  ───────────────────────────────────────────── */
  BUILDINGS: {

    office_desk: {
      id: 'office_desk',
      name: 'Bureau Standard',
      emoji: '🪑',
      description: 'Un bureau basique pour un agent basique.',
      baseCost: 500,
      growthRate: 1.12,
      baseProduction: 5,
      dataProduction: 0,
      tier: 1,
      unlockAt: 0,
      maxLevel: 10,
      lore: 'IKEA. Livré en 847 pièces avec 2 vis en trop.',
    },

    call_pod: {
      id: 'call_pod',
      name: 'Pod d\'Appels',
      emoji: '📞',
      description: 'Espace isolé pour les appels. +50% qualité audio.',
      baseCost: 2000,
      growthRate: 1.12,
      baseProduction: 20,
      dataProduction: 0.5,
      tier: 1,
      unlockAt: 0,
      maxLevel: 10,
      lore: 'Insonorisé. Pour cacher les pleurs.',
    },

    server_rack: {
      id: 'server_rack',
      name: 'Rack de Serveurs',
      emoji: '🖥️',
      description: 'Serveurs pour traiter les données. Génère de la Data.',
      baseCost: 8000,
      growthRate: 1.12,
      baseProduction: 60,
      dataProduction: 2,
      tier: 2,
      unlockAt: 0,
      maxLevel: 15,
      lore: 'Chauffe à 60°C. Excellent chauffage d\'appoint en hiver.',
    },

    training_room: {
      id: 'training_room',
      name: 'Salle de Formation',
      emoji: '📚',
      description: 'Accélère la progression de tous les agents.',
      baseCost: 25000,
      growthRate: 1.12,
      baseProduction: 180,
      dataProduction: 5,
      tier: 2,
      unlockAt: 0,
      maxLevel: 10,
      lore: 'Les stagiaires évitent salle B12. Rumeur dit qu\'elle donne du courage.',
    },

    data_center: {
      id: 'data_center',
      name: 'Centre de Données',
      emoji: '🏭',
      description: 'Méga-infrastructure. Production massive.',
      baseCost: 100000,
      growthRate: 1.12,
      baseProduction: 800,
      dataProduction: 20,
      tier: 3,
      unlockAt: 0,
      maxLevel: 20,
      lore: 'Consomme l\'énergie d\'une petite ville. Efficacement.',
    },

    ai_lab: {
      id: 'ai_lab',
      name: 'Laboratoire IA',
      emoji: '🧪',
      description: 'Développe des IAs propriétaires. Boost global.',
      baseCost: 500000,
      growthRate: 1.12,
      baseProduction: 4000,
      dataProduction: 100,
      tier: 3,
      unlockAt: 1e5,
      maxLevel: 20,
      lore: 'L\'IA de la cafétéria a décidé de ne servir que du café froid. Personne ne sait pourquoi.',
    },

    quantum_computer: {
      id: 'quantum_computer',
      name: 'Ordinateur Quantique',
      emoji: '⚛️',
      description: 'Calculs parallèles à l\'échelle quantique.',
      baseCost: 5000000,
      growthRate: 1.12,
      baseProduction: 20000,
      dataProduction: 500,
      tier: 4,
      unlockAt: 1e7,
      maxLevel: 15,
      lore: 'Il calcule la solution parfaite à chaque problème. Et l\'anti-solution simultanément.',
    },

    space_antenna: {
      id: 'space_antenna',
      name: 'Antenne Spatiale',
      emoji: '📡',
      description: 'Reliée à la flotte de satellites Google. Production cosmique.',
      baseCost: 50000000,
      growthRate: 1.12,
      baseProduction: 100000,
      dataProduction: 2000,
      tier: 5,
      unlockAt: 1e10,
      maxLevel: 10,
      lore: 'Couvre 95% de la surface terrestre. Les 5% restants vivent mieux.',
    },

    dyson_sphere: {
      id: 'dyson_sphere',
      name: 'Sphère de Dyson',
      emoji: '🌟',
      description: 'Capture l\'énergie d\'une étoile entière. Production infinie.',
      baseCost: 1e12,
      growthRate: 1.12,
      baseProduction: 1000000,
      dataProduction: 50000,
      tier: 7,
      unlockAt: 1e15,
      maxLevel: 5,
      lore: 'Brevetée par Google en 2035. Le Soleil a porté plainte.',
    },
  },

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    // Initialise l'état des agents dans G.state
    for (const id of Object.keys(this.AGENTS)) {
      if (!G.state.agents[id]) {
        G.state.agents[id] = { count: 0, level: 1 };
      }
    }
    for (const id of Object.keys(this.BUILDINGS)) {
      if (!G.state.buildings[id]) {
        G.state.buildings[id] = { count: 0, level: 1 };
      }
    }

    // Rendu initial
    this.renderAgents();
    this.renderBuildings();
    console.log('🏢 Entities module initialisé');
  },

  /* ─────────────────────────────────────────────
     CALCUL DES COÛTS
  ───────────────────────────────────────────── */

  getAgentCost(id, qty = 1) {
    const def = this.AGENTS[id];
    if (!def) return Infinity;
    const owned = (G.state.agents[id] || {}).count || 0;
    if (qty === 1) return G.calcCost(def.baseCost, def.growthRate, owned);
    return G.calcBulkCost(def.baseCost, def.growthRate, owned, qty);
  },

  getBuildingCost(id, qty = 1) {
    const def = this.BUILDINGS[id];
    if (!def) return Infinity;
    const owned = (G.state.buildings[id] || {}).count || 0;
    if (qty === 1) return G.calcCost(def.baseCost, def.growthRate, owned);
    return G.calcBulkCost(def.baseCost, def.growthRate, owned, qty);
  },

  /* ─────────────────────────────────────────────
     ACHAT D'AGENTS
  ───────────────────────────────────────────── */

  buyAgent(id, qty = 1) {
    const def = this.AGENTS[id];
    if (!def) return false;

    // Vérif déverrouillage
    if (G.state.gcoinsAllTime < def.unlockAt) {
      G.showToast(`🔒 Débloquez en gagnant ${G.formatCoins(def.unlockAt)} au total`, 'warning');
      return false;
    }

    const cost = this.getAgentCost(id, qty);
    if (!G.spendCoins(cost)) {
      Assets.playSound('error');
      G.showToast('❌ Fonds insuffisants !', 'error');
      return false;
    }

    G.state.agents[id].count += qty;
    G.state.totalAgentsHired += qty;

    // Recalcul des taux
    G.recalcRates();
    G.recalcClickPower();

    // Log & son
    const plural = qty > 1 ? `×${qty} ` : '';
    G.addLog(`Recrutement: ${plural}${def.name} pour ${G.formatCoins(cost)}`, 'success');
    Assets.playSound('buy');
    G.showToast(`${def.emoji} ${qty > 1 ? qty + '× ' : ''}${def.name} recruté${qty > 1 ? 's' : ''} !`, 'success', 2000);

    // XP
    G.addXP(cost * 0.01);

    // Succès
    if (typeof Achievements !== 'undefined') {
      Achievements.check('agents', G.state.totalAgentsHired);
      Achievements.check(`agent_${id}`, G.state.agents[id].count);
    }

    // Mise à jour de la carte
    this.updateAgentCard(id);

    // Bounce animation
    const card = document.querySelector(`[data-agent="${id}"]`);
    if (card) {
      card.classList.remove('bounce');
      void card.offsetWidth;
      card.classList.add('bounce');
    }

    return true;
  },

  /* ─────────────────────────────────────────────
     ACHAT DE BÂTIMENTS
  ───────────────────────────────────────────── */

  buyBuilding(id, qty = 1) {
    const def = this.BUILDINGS[id];
    if (!def) return false;

    if (G.state.gcoinsAllTime < def.unlockAt) {
      G.showToast(`🔒 Requis: ${G.formatCoins(def.unlockAt)} cumulés`, 'warning');
      return false;
    }

    const cost = this.getBuildingCost(id, qty);
    if (!G.spendCoins(cost)) {
      Assets.playSound('error');
      G.showToast('❌ Fonds insuffisants !', 'error');
      return false;
    }

    G.state.buildings[id].count += qty;
    G.recalcRates();

    G.addLog(`Construction: ${def.name} pour ${G.formatCoins(cost)}`, 'success');
    Assets.playSound('buy');
    G.showToast(`${def.emoji} ${def.name} construit !`, 'success', 2000);
    G.addXP(cost * 0.01);

    if (typeof Achievements !== 'undefined') {
      Achievements.check('buildings', Object.values(G.state.buildings).reduce((a, b) => a + b.count, 0));
    }

    this.updateBuildingCard(id);
    return true;
  },

  /* ─────────────────────────────────────────────
     PRODUCTION D'UN AGENT
  ───────────────────────────────────────────── */

  getAgentProduction(id) {
    const def = this.AGENTS[id];
    if (!def) return 0;
    const owned = (G.state.agents[id] || {}).count || 0;
    if (owned === 0) return 0;

    let mult = 1;
    if (owned >= 200) mult = 4;
    else if (owned >= 100) mult = 3;
    else if (owned >= 50)  mult = 2;
    else if (owned >= 25)  mult = 1.5;
    else if (owned >= 10)  mult = 1.2;

    mult *= (def.researchBonus || 1);
    mult *= G.getMoraleMultiplier();
    mult *= G.getWeatherMultiplier();
    mult *= G.state.productionMultiplier;
    mult *= G.state.prestigeMultiplier;

    return def.baseProduction * owned * mult;
  },

  /* ─────────────────────────────────────────────
     RENDU — AGENTS
  ───────────────────────────────────────────── */

  renderAgents() {
    const container = document.getElementById('agents-grid');
    if (!container) return;

    // Recherche
    const searchInput = document.getElementById('agent-search');
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    container.innerHTML = '';

    for (const [id, def] of Object.entries(this.AGENTS)) {
      if (query && !def.name.toLowerCase().includes(query) && !def.description.toLowerCase().includes(query)) {
        continue;
      }

      const owned = (G.state.agents[id] || {}).count || 0;
      const cost  = this.getAgentCost(id);
      const canAfford = G.canAfford(cost);
      const isLocked  = G.state.gcoinsAllTime < def.unlockAt;

      const card = document.createElement('div');
      card.className = `agent-card${!canAfford || isLocked ? ' unaffordable' : ''}`;
      card.dataset.agent = id;
      card.title = def.lore;

      const production = this.getAgentProduction(id);

      card.innerHTML = `
        <span class="agent-specialty-badge badge-${def.specialty}">${def.specialtyLabel}</span>
        <span class="agent-emoji">${def.emoji}</span>
        <div class="agent-name">${def.name}</div>
        <div class="agent-type">Tier ${def.tier}</div>
        <div class="agent-count">Possédés: ${G.formatNum(owned)}</div>
        <div class="agent-production">
          ${owned > 0 ? `${G.formatCoins(production)}/s` : def.description}
        </div>
        <div class="agent-cost">
          <span>💰</span>
          <span>${isLocked ? '🔒 ' + G.formatCoins(def.unlockAt) + ' requis' : G.formatCoins(cost)}</span>
        </div>
        ${owned > 0 ? `<div style="display:flex;gap:4px;margin-top:6px">
          <button class="btn-sm" onclick="Entities.buyAgent('${id}',10)" style="flex:1;font-size:10px">×10</button>
          <button class="btn-sm" onclick="Entities.buyAgent('${id}',100)" style="flex:1;font-size:10px">×100</button>
        </div>` : ''}
      `;

      if (!isLocked) {
        card.addEventListener('click', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          this.buyAgent(id);
        });
      }

      container.appendChild(card);
    }
  },

  updateAgentCard(id) {
    const card = document.querySelector(`[data-agent="${id}"]`);
    if (!card) {
      this.renderAgents();
      return;
    }
    // Re-render juste cette carte
    this.renderAgents();
  },

  /* ─────────────────────────────────────────────
     RENDU — BÂTIMENTS
  ───────────────────────────────────────────── */

  renderBuildings() {
    const container = document.getElementById('buildings-list');
    if (!container) return;
    container.innerHTML = '';

    for (const [id, def] of Object.entries(this.BUILDINGS)) {
      const owned = (G.state.buildings[id] || {}).count || 0;
      const cost  = this.getBuildingCost(id);
      const canAfford = G.canAfford(cost);
      const isLocked  = G.state.gcoinsAllTime < def.unlockAt;

      const prod = def.baseProduction * Math.max(owned, 1) * G.state.productionMultiplier * G.state.prestigeMultiplier;

      const card = document.createElement('div');
      card.className = `building-card${!canAfford || isLocked ? ' unaffordable' : ''}`;
      card.dataset.building = id;
      card.title = def.lore;

      card.innerHTML = `
        <div class="building-icon-wrap">${def.emoji}</div>
        <div class="building-info">
          <div class="building-name">${def.name}</div>
          <div class="building-desc">${def.description}</div>
          <div class="building-owned">Possédés: ${G.formatNum(owned)}</div>
          <div class="building-production">${owned > 0 ? G.formatCoins(prod) + '/s' : 'Aucun construit'}</div>
        </div>
        <div class="building-cost-btn">
          <div class="cost-amount">${isLocked ? '🔒' : '💰 ' + G.formatCoins(cost)}</div>
          <div class="cost-label">${isLocked ? G.formatCoins(def.unlockAt) + ' requis' : 'Acheter 1'}</div>
          ${!isLocked && owned > 0 ? `<button class="btn-sm" onclick="Entities.buyBuilding('${id}',10)" style="margin-top:4px;font-size:10px">×10</button>` : ''}
        </div>
      `;

      if (!isLocked) {
        card.addEventListener('click', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          this.buyBuilding(id);
        });
      }

      container.appendChild(card);
    }
  },

  updateBuildingCard(id) {
    this.renderBuildings();
  },

  /* ─────────────────────────────────────────────
     MISE À JOUR DE L'IMMEUBLE ANIMÉ
  ───────────────────────────────────────────── */

  updateBuildingVisual() {
    const floorsContainer = document.getElementById('building-floors');
    if (!floorsContainer) return;

    const totalAgents = Object.values(G.state.agents).reduce((sum, a) => sum + a.count, 0);
    const floors = Math.min(8, Math.max(1, Math.floor(Math.log10(totalAgents + 1)) + 1));

    let html = '';
    for (let i = 0; i < floors; i++) {
      const isActive = i < floors - 1 || totalAgents > 0;
      html += `<div class="building-floor${isActive ? ' active' : ''}">
        ${isActive ? '<div class="floor-dot"></div><div class="floor-dot" style="animation-delay:0.3s"></div><div class="floor-dot" style="animation-delay:0.6s"></div>' : ''}
      </div>`;
    }
    floorsContainer.innerHTML = html;
  },

  /* ─────────────────────────────────────────────
     RECHERCHE D'AGENTS (filtre)
  ───────────────────────────────────────────── */

  filterAgents(query) {
    this.renderAgents();
  },
};

window.Entities = Entities;
