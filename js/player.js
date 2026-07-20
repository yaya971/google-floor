/**
 * ══════════════════════════════════════════════════════════════
 * player.js — Logique Joueur
 * ══════════════════════════════════════════════════════════════
 * Rôle : Gère le profil du joueur, les compétences actives,
 * le système de prestige, les niveaux, et la personnalisation.
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Player = {

  /* ─────────────────────────────────────────────
     COMPÉTENCES ACTIVES
     Chaque compétence a un coût en énergie, une durée d'effet,
     un temps de recharge et un effet spécial.
  ───────────────────────────────────────────── */
  SKILLS: {
    turboClick: {
      id: 'turboClick',
      name: 'Turbo-Click',
      icon: '⚡',
      description: 'Multiplie les clics par 10 pendant 10s.',
      energyCost: 20,
      duration: 10,
      cooldown: 60,
      unlockLevel: 1,
      effect: () => {
        G.state.clickMultiplier *= 10;
        setTimeout(() => { G.state.clickMultiplier /= 10; }, 10000);
      },
    },

    dataRush: {
      id: 'dataRush',
      name: 'Data Rush',
      icon: '📊',
      description: 'Double la production de Data pendant 15s.',
      energyCost: 15,
      duration: 15,
      cooldown: 90,
      unlockLevel: 3,
      effect: () => {
        G.state.dataMultiplier *= 2;
        setTimeout(() => { G.state.dataMultiplier /= 2; }, 15000);
      },
    },

    productionBoost: {
      id: 'productionBoost',
      name: 'Boost Production',
      icon: '🚀',
      description: 'Multiplie la production par 3 pendant 20s.',
      energyCost: 30,
      duration: 20,
      cooldown: 120,
      unlockLevel: 5,
      effect: () => {
        G.state.productionMultiplier *= 3;
        setTimeout(() => { G.state.productionMultiplier /= 3; }, 20000);
      },
    },

    moraleBoost: {
      id: 'moraleBoost',
      name: 'Boost Moral',
      icon: '💚',
      description: 'Remonte le moral à 100% instantanément.',
      energyCost: 25,
      duration: 0,
      cooldown: 180,
      unlockLevel: 7,
      effect: () => {
        G.state.morale = 100;
        G.showToast('💚 Moral remonté à 100% !', 'success');
      },
    },

    coinMagnet: {
      id: 'coinMagnet',
      name: 'Magnétisme',
      icon: '🧲',
      description: 'Génère 60 secondes de production instantanément.',
      energyCost: 40,
      duration: 0,
      cooldown: 300,
      unlockLevel: 10,
      effect: () => {
        const bonus = G.rates.gcoinsPerSecond * 60;
        G.addCoins(bonus);
        G.showFloatNumber(bonus, window.innerWidth / 2, window.innerHeight / 2, 'mega');
        G.addLog(`🧲 Magnétisme: +${G.formatCoins(bonus)} instantanément !`, 'special');
      },
    },

    criticalStrike: {
      id: 'criticalStrike',
      name: 'Frappe Critique',
      icon: '💥',
      description: 'Garantit les coups critiques pendant 30s (critChance = 100%).',
      energyCost: 35,
      duration: 30,
      cooldown: 150,
      unlockLevel: 15,
      effect: () => {
        const origCrit = G.state.critChance;
        G.state.critChance = 1;
        setTimeout(() => { G.state.critChance = origCrit; }, 30000);
      },
    },

    timeWarp: {
      id: 'timeWarp',
      name: 'Warp Temporel',
      icon: '⏰',
      description: 'Génère 10 minutes de production en 5 secondes.',
      energyCost: 50,
      duration: 0,
      cooldown: 600,
      unlockLevel: 25,
      effect: () => {
        const bonus = G.rates.gcoinsPerSecond * 600;
        G.addCoins(bonus);
        G.showToast(`⏰ Warp: +${G.formatCoins(bonus)} !`, 'special', 5000);
        G.addLog(`⏰ Warp Temporel: +${G.formatCoins(bonus)}`, 'special');
      },
    },

    quantumEntanglement: {
      id: 'quantumEntanglement',
      name: 'Intrication Quantique',
      icon: '⚛️',
      description: 'Duplique tous les agents pendant 15s.',
      energyCost: 60,
      duration: 15,
      cooldown: 900,
      unlockLevel: 40,
      effect: () => {
        G.state.productionMultiplier *= 2;
        setTimeout(() => { G.state.productionMultiplier /= 2; }, 15000);
        G.showToast('⚛️ Intrication active ! ×2 pendant 15s', 'special');
      },
    },
  },

  /* ─────────────────────────────────────────────
     PRESTIGE — AMÉLIORATIONS PERMANENTES
  ───────────────────────────────────────────── */
  PRESTIGE_UPGRADES: [
    {
      id: 'prestige_click_power',
      name: 'Pouvoir de Clic +',
      icon: '👆',
      desc: 'Chaque prestige donne +10 puissance de clic.',
      cost: 1,
      effect: (n) => n * 10,
    },
    {
      id: 'prestige_auto_prod',
      name: 'Production Auto +',
      icon: '⚙️',
      desc: '+5% de production auto par prestige.',
      cost: 2,
      effect: (n) => n * 0.05,
    },
    {
      id: 'prestige_energy_max',
      name: 'Énergie Maximale +',
      icon: '⚡',
      desc: '+25 énergie max par prestige.',
      cost: 3,
      effect: (n) => n * 25,
    },
    {
      id: 'prestige_crit_chance',
      name: 'Chance Critique +',
      icon: '💥',
      desc: '+2% chance critique par prestige.',
      cost: 5,
      effect: (n) => n * 0.02,
    },
    {
      id: 'prestige_data_boost',
      name: 'Data Amplifier',
      icon: '📊',
      desc: '+20% production Data par prestige.',
      cost: 8,
      effect: (n) => n * 0.2,
    },
  ],

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    // Initialise les compétences dans l'état
    for (const [id, skill] of Object.entries(this.SKILLS)) {
      if (!G.state.activeSkills[id]) {
        G.state.activeSkills[id] = {
          active: false,
          timeLeft: 0,
          cooldownLeft: 0,
          cooldown: skill.cooldown,
          duration: skill.duration,
        };
      }
    }

    this.renderSkills();
    this.renderPrestige();
    this.renderPlayerCard();

    // Listeners UI
    this._bindUI();

    console.log('👤 Player module initialisé');
  },

  /* ─────────────────────────────────────────────
     UTILISATION D'UNE COMPÉTENCE
  ───────────────────────────────────────────── */

  useSkill(id) {
    const skillDef = this.SKILLS[id];
    if (!skillDef) return false;

    // Vérif niveau requis
    if (G.state.level < skillDef.unlockLevel) {
      G.showToast(`🔒 Niveau ${skillDef.unlockLevel} requis !`, 'warning');
      return false;
    }

    const skillState = G.state.activeSkills[id];

    // Vérif cooldown
    if (skillState.cooldownLeft > 0) {
      G.showToast(`⏳ Recharge: ${Math.ceil(skillState.cooldownLeft)}s`, 'warning');
      return false;
    }

    // Vérif énergie
    if (G.state.energy < skillDef.energyCost) {
      G.showToast(`⚡ Énergie insuffisante (${G.state.energy.toFixed(0)}/${skillDef.energyCost})`, 'warning');
      return false;
    }

    // Déduire l'énergie
    G.state.energy -= skillDef.energyCost;

    // Appliquer l'effet
    skillDef.effect();

    // Activer si durée > 0
    if (skillDef.duration > 0) {
      skillState.active = true;
      skillState.timeLeft = skillDef.duration;
    }
    skillState.cooldownLeft = skillDef.cooldown;

    G.addLog(`⚡ Compétence: ${skillDef.name} activée !`, 'special');
    Assets.playSound('event');

    this.renderSkills();
    return true;
  },

  /* ─────────────────────────────────────────────
     RENDU — COMPÉTENCES
  ───────────────────────────────────────────── */

  renderSkills() {
    const container = document.getElementById('skills-grid');
    if (!container) return;

    container.innerHTML = '';
    for (const [id, skillDef] of Object.entries(this.SKILLS)) {
      if (G.state.level < skillDef.unlockLevel) continue;

      const skillState = G.state.activeSkills[id] || { active: false, cooldownLeft: 0, timeLeft: 0 };
      const onCooldown = skillState.cooldownLeft > 0;
      const isActive   = skillState.active;

      const btn = document.createElement('button');
      btn.className = `skill-btn ${isActive ? 'active-skill' : onCooldown ? 'on-cooldown' : 'available'}`;
      btn.onclick = () => this.useSkill(id);
      btn.title = `${skillDef.description}\nÉnergie: ${skillDef.energyCost} | Durée: ${skillDef.duration}s | Recharge: ${skillDef.cooldown}s`;

      let cooldownText = '';
      if (onCooldown) cooldownText = `${Math.ceil(skillState.cooldownLeft)}s`;
      else if (isActive) cooldownText = `${Math.ceil(skillState.timeLeft)}s`;

      btn.innerHTML = `
        <span class="skill-icon">${skillDef.icon}</span>
        <span class="skill-name">${skillDef.name}</span>
        ${cooldownText ? `<div style="font-size:9px;color:var(--accent-yellow);font-family:var(--font-mono)">${cooldownText}</div>` : ''}
        ${onCooldown ? `<div class="skill-cooldown" style="width:${((skillDef.cooldown - skillState.cooldownLeft)/skillDef.cooldown*100).toFixed(0)}%"></div>` : ''}
      `;

      container.appendChild(btn);
    }

    // Si aucune compétence visible
    if (!container.children.length) {
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;font-size:11px;color:var(--text-muted);padding:8px">
        Atteignez le niveau 1 pour débloquer les compétences
      </div>`;
    }
  },

  /* ─────────────────────────────────────────────
     RENDU — CARTE JOUEUR
  ───────────────────────────────────────────── */

  renderPlayerCard() {
    const nameEl = document.getElementById('player-name');
    const levelEl = document.getElementById('player-level');
    const xpFill = document.getElementById('xp-fill');
    const prestigeEl = document.getElementById('player-prestige');
    const avatarEl = document.getElementById('player-avatar');

    if (nameEl) nameEl.textContent = G.state.settings.playerName;
    if (levelEl) levelEl.textContent = G.state.level;
    if (xpFill) xpFill.style.width = `${(G.state.xp / G.state.xpToNext * 100).toFixed(1)}%`;
    if (prestigeEl) prestigeEl.textContent = `✨ Prestige: ${G.state.prestige}`;
    if (avatarEl) avatarEl.textContent = G.state.settings.avatar;
  },

  /* ─────────────────────────────────────────────
     RENDU — PANNEAU PRESTIGE
  ───────────────────────────────────────────── */

  renderPrestige() {
    const countEl  = document.getElementById('prestige-count');
    const bonusEl  = document.getElementById('prestige-bonus');
    const nextEl   = document.getElementById('prestige-next');
    const reqEl    = document.getElementById('prestige-req');
    const btnEl    = document.getElementById('btn-prestige');
    const listEl   = document.getElementById('prestige-unlocks');

    if (countEl) countEl.textContent = G.state.prestige;
    if (bonusEl) bonusEl.textContent = `×${G.state.prestigeMultiplier.toFixed(1)}`;
    if (nextEl)  nextEl.textContent  = `×${(1 + (G.state.prestige + 1) * 0.1).toFixed(1)}`;

    const nextPrestigeReq = G.CONFIG.PRESTIGE_BASE * Math.pow(10, G.state.prestige);
    if (reqEl) reqEl.textContent = `Requis: ${G.formatCoins(nextPrestigeReq)}`;

    if (btnEl) {
      const canPrestige = G.canPrestige();
      btnEl.disabled = !canPrestige;
      if (canPrestige) {
        btnEl.classList.add('pulse-anim');
      } else {
        btnEl.classList.remove('pulse-anim');
      }
    }

    // Liste des améliorations prestige
    if (listEl) {
      listEl.innerHTML = this.PRESTIGE_UPGRADES.map(upg => `
        <div class="prestige-unlock-item ${G.state.prestige >= upg.cost ? 'unlocked' : ''}">
          <span>${upg.icon}</span>
          <div class="prestige-unlock-label">
            <div style="font-weight:700;font-size:12px">${upg.name}</div>
            <div style="font-size:10px;color:var(--text-muted)">${upg.desc}</div>
          </div>
          <div class="prestige-unlock-cost">${G.state.prestige >= upg.cost ? '✅' : `P${upg.cost}`}</div>
        </div>
      `).join('');
    }
  },

  /* ─────────────────────────────────────────────
     BIND EVENTS UI
  ───────────────────────────────────────────── */

  _bindUI() {
    // Bouton de prestige
    const btnPrestige = document.getElementById('btn-prestige');
    if (btnPrestige) {
      btnPrestige.addEventListener('click', () => {
        if (!G.canPrestige()) return;
        if (confirm(`⚠️ Effectuer un Prestige ?\n\nVous perdrez tous vos G-Coins et agents.\nVous garderez vos succès et votre multiplicateur sera ×${(1 + (G.state.prestige + 1) * 0.1).toFixed(1)}.\n\nContinuer ?`)) {
          G.doPrestige();
          Assets.playSound('prestige');
          this.renderPrestige();
          this.renderPlayerCard();
        }
      });
    }

    // Indicateur joueur (header)
    const playerIndicator = document.getElementById('player-indicator');
    if (playerIndicator) {
      playerIndicator.textContent = `P${G.state.currentPlayer + 1}`;
    }
  },

  /* ─────────────────────────────────────────────
     MISE À JOUR PÉRIODIQUE (appelée par Renderer)
  ───────────────────────────────────────────── */

  update() {
    this.renderPlayerCard();
    this.renderPrestige();
    // Skills: mise à jour rapide des boutons sans re-render complet
    this._updateSkillButtons();
  },

  _updateSkillButtons() {
    for (const [id, skillDef] of Object.entries(this.SKILLS)) {
      const btn = document.querySelector(`.skill-btn[onclick*="${id}"]`);
      if (!btn) continue;

      const skillState = G.state.activeSkills[id] || {};
      const onCooldown = skillState.cooldownLeft > 0;
      const isActive   = skillState.active;

      btn.className = `skill-btn ${isActive ? 'active-skill' : onCooldown ? 'on-cooldown' : 'available'}`;

      // Mise à jour texte cooldown (évite re-render complet)
      const cdDiv = btn.querySelector('div');
      if (cdDiv) {
        if (onCooldown) cdDiv.textContent = `${Math.ceil(skillState.cooldownLeft)}s`;
        else if (isActive) cdDiv.textContent = `${Math.ceil(skillState.timeLeft)}s`;
        else cdDiv.textContent = '';
      }
    }
  },

  /* ─────────────────────────────────────────────
     PARAMÈTRES JOUEUR
  ───────────────────────────────────────────── */

  updateSettings(settings) {
    Object.assign(G.state.settings, settings);
    if (settings.playerName) {
      const nameEl = document.getElementById('player-name');
      if (nameEl) nameEl.textContent = settings.playerName;
    }
    if (settings.avatar) {
      const avatarEl = document.getElementById('player-avatar');
      if (avatarEl) avatarEl.textContent = settings.avatar;
    }
    if (settings.musicVolume !== undefined) Assets.setMusicVolume(settings.musicVolume);
    if (settings.sfxVolume !== undefined)   Assets.setSFXVolume(settings.sfxVolume);
    if (settings.musicEnabled !== undefined) Assets.toggleMusic(settings.musicEnabled);
  },
};

window.Player = Player;
