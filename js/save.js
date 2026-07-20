/**
 * ══════════════════════════════════════════════════════════════
 * save.js — Sauvegarde et Chargement du Jeu
 * ══════════════════════════════════════════════════════════════
 * Rôle : Gère la persistance du jeu via localStorage.
 * Supporte : sauvegarde auto, export/import JSON, reset total.
 * Calcule aussi les "offline earnings" (gains hors ligne).
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Save = {

  SAVE_KEY: 'gfc_save_v1',
  AUTOSAVE_INTERVAL: 30000, // 30 secondes
  _autosaveTimer: null,

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    // Tentative de chargement automatique
    const loaded = this.load();
    if (loaded) {
      this.computeOfflineEarnings();
    }

    this.startAutoSave();
    this._bindUI();

    console.log('💾 Save module initialisé');
  },

  /* ─────────────────────────────────────────────
     SAUVEGARDE
  ───────────────────────────────────────────── */
  save() {
    try {
      const saveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        state: {
          gcoins:              G.state.gcoins,
          gcoinsTotal:         G.state.gcoinsTotal,
          gcoinsAllTime:       G.state.gcoinsAllTime,
          data:                G.state.data,
          energy:              G.state.energy,
          reputation:          G.state.reputation,
          clickPower:          G.state.clickPower,
          clickCount:          G.state.clickCount,
          level:               G.state.level,
          xp:                  G.state.xp,
          xpToNext:            G.state.xpToNext,
          prestige:            G.state.prestige,
          prestigeMultiplier:  G.state.prestigeMultiplier,
          morale:              G.state.morale,
          weather:             G.state.weather,
          productionMultiplier: G.state.productionMultiplier,
          clickMultiplier:     G.state.clickMultiplier,
          dataMultiplier:      G.state.dataMultiplier,
          critChance:          G.state.critChance,
          critMultiplier:      G.state.critMultiplier,
          autoClickRate:       G.state.autoClickRate,
          totalAgentsHired:    G.state.totalAgentsHired,
          totalUpgradesBought: G.state.totalUpgradesBought,
          totalResearchCompleted: G.state.totalResearchCompleted,
          totalEventsTriggered: G.state.totalEventsTriggered,
          totalPlayTime:       G.state.totalPlayTime,
          minigameScore:       G.state.minigameScore,
          minigameBestScore:   G.state.minigameBestScore,
          phase:               G.state.phase,
          agents:              G.state.agents,
          buildings:           G.state.buildings,
          upgrades:            G.state.upgrades,
          research:            G.state.research,
          achievements:        G.state.achievements,
          activeSkills:        G.state.activeSkills,
          dailyQuests:         G.state.dailyQuests,
          marketPrices:        G.state.marketPrices,
          researchQueue:       G.state.researchQueue,
          researchProgress:    G.state.researchProgress,
          settings:            G.state.settings,
          lastSaved:           Date.now(),
        },
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));

      // Affiche l'indicateur de sauvegarde
      const indicator = document.getElementById('save-indicator');
      if (indicator) {
        indicator.classList.add('visible');
        setTimeout(() => indicator.classList.remove('visible'), 2000);
      }

      return true;
    } catch (e) {
      console.error('Erreur de sauvegarde:', e);
      G.showToast('❌ Échec de la sauvegarde !', 'error');
      return false;
    }
  },

  /* ─────────────────────────────────────────────
     CHARGEMENT
  ───────────────────────────────────────────── */
  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return false;

      const saveData = JSON.parse(raw);
      const savedState = saveData.state;

      // Migration / validation
      if (!savedState) return false;

      // Fusionne l'état sauvegardé avec l'état par défaut
      Object.assign(G.state, savedState);

      // Initialise les objets manquants
      if (!G.state.agents) G.state.agents = {};
      if (!G.state.buildings) G.state.buildings = {};
      if (!G.state.upgrades) G.state.upgrades = {};
      if (!G.state.research) G.state.research = {};
      if (!G.state.achievements) G.state.achievements = {};
      if (!G.state.activeSkills) G.state.activeSkills = {};
      if (!G.state.dailyQuests) G.state.dailyQuests = [];
      if (!G.state.marketPrices) G.state.marketPrices = {};
      if (!G.state.settings) G.state.settings = { ...G.CONFIG.DEFAULT_SETTINGS };

      // Réinitialise les états volatils
      G.state.activeEvents = [];
      G.state.phase = G.computePhase();

      G.recalcRates();
      G.recalcClickPower();

      console.log('✅ Sauvegarde chargée');
      return true;
    } catch (e) {
      console.error('Erreur de chargement:', e);
      return false;
    }
  },

  /* ─────────────────────────────────────────────
     GAINS HORS LIGNE
  ───────────────────────────────────────────── */
  computeOfflineEarnings() {
    const lastSaved = G.state.lastSaved;
    if (!lastSaved) return;

    const now = Date.now();
    const elapsed = (now - lastSaved) / 1000; // en secondes

    // Maximum 8 heures de gains hors ligne
    const cappedElapsed = Math.min(elapsed, 28800);

    if (cappedElapsed < 60) return; // < 1 min, on ignore

    const offlineRate = G.rates.gcoinsPerSecond * 0.5; // 50% de la prod normale
    const offlineGains = offlineRate * cappedElapsed;
    const offlineData  = G.rates.dataPerSecond * cappedElapsed * 0.3;

    if (offlineGains > 0) {
      G.addCoins(offlineGains);
      G.addData(offlineData);

      const hours   = Math.floor(cappedElapsed / 3600);
      const minutes = Math.floor((cappedElapsed % 3600) / 60);
      const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      G.showToast(
        `💤 Hors ligne: ${timeStr} — +${G.formatCoins(offlineGains)} G-Coins !`,
        'special', 8000
      );
      G.addLog(`💤 Gains hors ligne (${timeStr}): +${G.formatCoins(offlineGains)}`, 'success');

      // Modal d'offline earnings
      this._showOfflineModal(timeStr, offlineGains, offlineData);
    }
  },

  _showOfflineModal(timeStr, coins, data) {
    const modal = document.getElementById('modal-offline');
    if (!modal) return;

    const coinsEl = document.getElementById('offline-coins');
    const dataEl  = document.getElementById('offline-data');
    const timeEl  = document.getElementById('offline-time');

    if (coinsEl) coinsEl.textContent = G.formatCoins(coins);
    if (dataEl)  dataEl.textContent  = G.formatNum(Math.floor(data));
    if (timeEl)  timeEl.textContent  = timeStr;

    modal.classList.remove('hidden');

    const closeBtn = document.getElementById('btn-close-offline');
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add('hidden');
    }
  },

  /* ─────────────────────────────────────────────
     AUTO-SAVE
  ───────────────────────────────────────────── */
  startAutoSave() {
    this.stopAutoSave();
    this._autosaveTimer = setInterval(() => {
      this.save();
    }, this.AUTOSAVE_INTERVAL);

    // Sauvegarde avant fermeture
    window.addEventListener('beforeunload', () => this.save());
  },

  stopAutoSave() {
    if (this._autosaveTimer) {
      clearInterval(this._autosaveTimer);
      this._autosaveTimer = null;
    }
  },

  /* ─────────────────────────────────────────────
     EXPORT / IMPORT
  ───────────────────────────────────────────── */

  /**
   * Exporte la sauvegarde en Base64.
   */
  exportSave() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) {
        G.showToast('Aucune sauvegarde à exporter !', 'warning');
        return;
      }

      const encoded = btoa(unescape(encodeURIComponent(raw)));

      // Copie dans le presse-papier
      navigator.clipboard?.writeText(encoded).then(() => {
        G.showToast('📋 Sauvegarde copiée dans le presse-papier !', 'success', 4000);
      }).catch(() => {
        this._showExportModal(encoded);
      });

      G.addLog('📤 Sauvegarde exportée', 'info');
    } catch (e) {
      G.showToast('❌ Erreur d\'export !', 'error');
    }
  },

  _showExportModal(encoded) {
    const modal = document.getElementById('modal-save');
    const textarea = document.getElementById('save-textarea');
    if (modal && textarea) {
      textarea.value = encoded;
      modal.classList.remove('hidden');
    }
  },

  /**
   * Importe une sauvegarde depuis un code Base64.
   */
  importSave(encoded) {
    try {
      const decoded = decodeURIComponent(escape(atob(encoded.trim())));
      const saveData = JSON.parse(decoded);

      if (!saveData.state) throw new Error('Format invalide');

      localStorage.setItem(this.SAVE_KEY, decoded);
      G.showToast('✅ Sauvegarde importée ! Rechargement...', 'success', 3000);
      G.addLog('📥 Sauvegarde importée', 'success');

      setTimeout(() => location.reload(), 2000);
    } catch (e) {
      G.showToast('❌ Code de sauvegarde invalide !', 'error');
    }
  },

  /* ─────────────────────────────────────────────
     RESET TOTAL
  ───────────────────────────────────────────── */
  hardReset() {
    localStorage.removeItem(this.SAVE_KEY);
    G.showToast('🗑️ Données supprimées. Rechargement...', 'warning', 2000);
    setTimeout(() => location.reload(), 1500);
  },

  /* ─────────────────────────────────────────────
     BIND UI
  ───────────────────────────────────────────── */
  _bindUI() {
    // Bouton sauvegarder manuel
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        if (this.save()) {
          Assets.playSound('buy');
          G.showToast('💾 Jeu sauvegardé !', 'success', 2000);
          G.addLog('💾 Jeu sauvegardé manuellement', 'info');
        }
      });
    }

    // Bouton exporter
    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportSave());
    }

    // Bouton importer
    const btnImport = document.getElementById('btn-import');
    if (btnImport) {
      btnImport.addEventListener('click', () => {
        const modal = document.getElementById('modal-import');
        if (modal) modal.classList.remove('hidden');
      });
    }

    // Confirm import
    const btnConfirmImport = document.getElementById('btn-confirm-import');
    if (btnConfirmImport) {
      btnConfirmImport.addEventListener('click', () => {
        const textarea = document.getElementById('import-textarea');
        if (textarea?.value) this.importSave(textarea.value);
      });
    }

    // Bouton reset total
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('⚠️ RESET TOTAL ?\n\nTous vos progrès seront effacés définitivement.\nCette action est IRRÉVERSIBLE.\n\nContinuer ?')) {
          this.hardReset();
        }
      });
    }

    // Fermer modal save
    const closeModal = document.getElementById('close-modal-save');
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        document.getElementById('modal-save')?.classList.add('hidden');
      });
    }

    // Copier depuis modal
    const btnCopySave = document.getElementById('btn-copy-save');
    if (btnCopySave) {
      btnCopySave.addEventListener('click', () => {
        const textarea = document.getElementById('save-textarea');
        if (textarea) {
          textarea.select();
          document.execCommand('copy');
          G.showToast('📋 Copié !', 'success');
        }
      });
    }

    // Fermer modal import
    const closeImport = document.getElementById('close-modal-import');
    if (closeImport) {
      closeImport.addEventListener('click', () => {
        document.getElementById('modal-import')?.classList.add('hidden');
      });
    }
  },

  /* ─────────────────────────────────────────────
     INFOS DE SAUVEGARDE
  ───────────────────────────────────────────── */
  getSaveInfo() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const size = new Blob([raw]).size;
      return {
        timestamp: data.timestamp,
        version: data.version,
        size: (size / 1024).toFixed(1) + ' KB',
      };
    } catch (e) {
      return null;
    }
  },
};

window.Save = Save;
