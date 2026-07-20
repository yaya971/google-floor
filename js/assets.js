/**
 * ══════════════════════════════════════════════════════════════
 * assets.js — Chargement et Gestion des Ressources
 * ══════════════════════════════════════════════════════════════
 * Rôle : Gère le chargement des sons, musiques et images.
 * Fournit une API simple pour jouer des sons et de la musique.
 * Utilise l'API Web Audio pour les effets sonores générés
 * procéduralement (pas besoin de fichiers audio externes).
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const Assets = {

  /* ── Contexte Audio Web ── */
  audioCtx: null,
  musicGain: null,
  sfxGain: null,

  /* ── Sons générés procéduralement ── */
  sounds: {
    click:   { type: 'click' },
    crit:    { type: 'crit' },
    buy:     { type: 'buy' },
    upgrade: { type: 'upgrade' },
    prestige:{ type: 'prestige' },
    achieve: { type: 'achieve' },
    event:   { type: 'event' },
    error:   { type: 'error' },
    levelup: { type: 'levelup' },
    sell:    { type: 'sell' },
  },

  /* ── Musique generative ── */
  musicPlaying: false,
  musicNodes: [],
  musicSchedule: null,

  /* ── Notes de musique (gamme pentatonique) ── */
  NOTES: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00],

  /* ─────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────── */
  init() {
    // L'AudioContext ne peut être créé qu'après une interaction utilisateur
    document.addEventListener('click', () => this._initAudio(), { once: true });
    document.addEventListener('keydown', () => this._initAudio(), { once: true });
    console.log('🎵 Assets module initialisé');
  },

  _initAudio() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Master gain
      const master = this.audioCtx.createGain();
      master.gain.value = 1.0;
      master.connect(this.audioCtx.destination);

      // Music gain
      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.value = G.state.settings.musicVolume;
      this.musicGain.connect(master);

      // SFX gain
      this.sfxGain = this.audioCtx.createGain();
      this.sfxGain.gain.value = G.state.settings.sfxVolume;
      this.sfxGain.connect(master);

      // Démarrer la musique si activée
      if (G.state.settings.musicEnabled) {
        this.startMusic();
      }

      console.log('🔊 Audio context créé');
    } catch (e) {
      console.warn('Audio non supporté:', e);
    }
  },

  /* ─────────────────────────────────────────────
     SONS PROCÉDURAUX
  ───────────────────────────────────────────── */

  /**
   * Crée un oscillateur simple pour générer un son.
   * @param {number} freq   - Fréquence en Hz
   * @param {number} dur    - Durée en secondes
   * @param {string} type   - Type d'oscillateur ('sine'|'square'|'sawtooth'|'triangle')
   * @param {number} vol    - Volume (0..1)
   * @param {number} attack - Temps d'attaque en secondes
   * @param {number} decay  - Temps de décroissance en secondes
   */
  _playTone(freq, dur, type = 'sine', vol = 0.3, attack = 0.01, decay = 0.1) {
    if (!this.audioCtx || !this.sfxGain) return;
    try {
      const osc  = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now  = this.audioCtx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + dur + decay);
    } catch (e) { /* silencieux */ }
  },

  /**
   * Joue un son identifié par son nom.
   */
  playSound(name) {
    if (!G.state.settings.sfxVolume || !this.audioCtx) return;

    switch (name) {
      // Clic normal: court "tic" aigu
      case 'click':
        this._playTone(800, 0.05, 'sine', 0.15, 0.001, 0.02);
        break;

      // Coup critique: son montant dramatique
      case 'crit':
        this._playTone(440, 0.06, 'sine', 0.25, 0.001, 0.05);
        setTimeout(() => this._playTone(880, 0.15, 'sine', 0.3, 0.001, 0.1), 60);
        break;

      // Achat: accord positif
      case 'buy':
        this._playTone(523.25, 0.08, 'sine', 0.2, 0.001, 0.05);
        setTimeout(() => this._playTone(659.25, 0.12, 'sine', 0.2, 0.001, 0.08), 80);
        setTimeout(() => this._playTone(783.99, 0.2,  'sine', 0.25, 0.001, 0.15), 160);
        break;

      // Upgrade: accord plus élaboré
      case 'upgrade':
        this._playTone(261.63, 0.08, 'triangle', 0.2, 0.001, 0.05);
        setTimeout(() => this._playTone(392.00, 0.08, 'triangle', 0.2, 0.001, 0.05), 80);
        setTimeout(() => this._playTone(523.25, 0.08, 'triangle', 0.2, 0.001, 0.05), 160);
        setTimeout(() => this._playTone(783.99, 0.3,  'sine',     0.3, 0.001, 0.2),  240);
        break;

      // Prestige: fanfare épique
      case 'prestige':
        [0,100,200,300,400,500].forEach((delay, i) => {
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
          setTimeout(() => this._playTone(notes[i], 0.4 - i*0.05, 'sine', 0.3 - i*0.02, 0.005, 0.3), delay);
        });
        break;

      // Succès: courte mélodie joyeuse
      case 'achieve':
        [0, 120, 240].forEach((delay, i) => {
          const notes = [523.25, 659.25, 783.99];
          setTimeout(() => this._playTone(notes[i], 0.15, 'sine', 0.25, 0.001, 0.1), delay);
        });
        break;

      // Événement: son d'alerte
      case 'event':
        this._playTone(440, 0.1, 'square', 0.15, 0.001, 0.05);
        setTimeout(() => this._playTone(550, 0.15, 'square', 0.15, 0.001, 0.1), 100);
        break;

      // Erreur: son grave
      case 'error':
        this._playTone(200, 0.15, 'sawtooth', 0.2, 0.001, 0.1);
        setTimeout(() => this._playTone(150, 0.2, 'sawtooth', 0.15, 0.001, 0.15), 80);
        break;

      // Level up: mélodie ascendante
      case 'levelup':
        [0, 80, 160, 240, 320, 400].forEach((delay, i) => {
          setTimeout(() => this._playTone(
            261.63 * Math.pow(2, i/4),
            0.12, 'sine', 0.2, 0.001, 0.08
          ), delay);
        });
        break;

      // Vente: son descendant
      case 'sell':
        this._playTone(440, 0.08, 'sine', 0.2, 0.001, 0.05);
        setTimeout(() => this._playTone(330, 0.12, 'sine', 0.15, 0.001, 0.08), 80);
        break;

      default:
        this._playTone(440, 0.05, 'sine', 0.1, 0.001, 0.03);
    }
  },

  /* ─────────────────────────────────────────────
     MUSIQUE GÉNÉRATIVE (Ambient Corporate)
  ───────────────────────────────────────────── */

  startMusic() {
    if (this.musicPlaying || !this.audioCtx) return;
    this.musicPlaying = true;
    this._scheduleMusic();
    console.log('🎵 Musique démarrée');
  },

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicSchedule) {
      clearTimeout(this.musicSchedule);
      this.musicSchedule = null;
    }
    // Arrête toutes les notes actives
    this.musicNodes.forEach(n => {
      try { n.stop(); } catch(e) {}
    });
    this.musicNodes = [];
  },

  /**
   * Planifie les prochaines notes de la musique générative.
   * Style "ambient corporate lofi" avec basse, mélodie et accords.
   */
  _scheduleMusic() {
    if (!this.musicPlaying || !this.audioCtx) return;

    // Accord de base aléatoire
    const rootIdx = G.randInt(0, 4);
    const root = this.NOTES[rootIdx];

    // Durée d'un motif: 2-4 secondes
    const patternDur = G.rand(2, 4);

    // Basse: note fondamentale grave
    this._playMusicNote(root / 2, patternDur * 0.9, 'triangle', 0.12);

    // Mélodie: quelques notes aléatoires dans la gamme
    const melodyNotes = G.randInt(2, 5);
    for (let i = 0; i < melodyNotes; i++) {
      const delay = (i / melodyNotes) * patternDur * 0.8 * 1000;
      const note = this.NOTES[G.randInt(rootIdx, rootIdx + 4) % this.NOTES.length];
      setTimeout(() => {
        if (!this.musicPlaying) return;
        this._playMusicNote(note, G.rand(0.2, 0.5), 'sine', 0.06);
      }, delay);
    }

    // Accord de fond (pad)
    const padVol = 0.04;
    this._playMusicNote(root * 1.5, patternDur, 'sine', padVol);
    this._playMusicNote(root * 2,   patternDur, 'sine', padVol * 0.8);

    // Planifie le prochain motif
    this.musicSchedule = setTimeout(() => {
      this._scheduleMusic();
    }, patternDur * 1000);
  },

  _playMusicNote(freq, dur, type, vol) {
    if (!this.audioCtx || !this.musicGain) return;
    try {
      const osc  = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now  = this.audioCtx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      // Légère désaccordation pour effet "lofi"
      osc.detune.setValueAtTime(G.rand(-5, 5), now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * this.musicGain.gain.value, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      // Filtre passe-bas pour chaleur
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;

      osc.connect(filter);
      filter.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + dur + 0.1);
      this.musicNodes.push(osc);

      osc.onended = () => {
        const idx = this.musicNodes.indexOf(osc);
        if (idx !== -1) this.musicNodes.splice(idx, 1);
      };
    } catch(e) {}
  },

  /* ─────────────────────────────────────────────
     CONTRÔLES DU VOLUME
  ───────────────────────────────────────────── */

  setMusicVolume(vol) {
    G.state.settings.musicVolume = G.clamp(vol, 0, 1);
    if (this.musicGain) this.musicGain.gain.value = G.state.settings.musicVolume;
  },

  setSFXVolume(vol) {
    G.state.settings.sfxVolume = G.clamp(vol, 0, 1);
    if (this.sfxGain) this.sfxGain.gain.value = G.state.settings.sfxVolume;
  },

  toggleMusic(enabled) {
    G.state.settings.musicEnabled = enabled;
    if (enabled) this.startMusic();
    else this.stopMusic();
  },

  /* ─────────────────────────────────────────────
     IMAGES / ICÔNES (générées inline via Canvas)
  ───────────────────────────────────────────── */

  /**
   * Génère un favicon dynamique pour l'onglet du navigateur.
   */
  generateFavicon() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32; canvas.height = 32;
      const ctx = canvas.getContext('2d');

      // Fond
      ctx.fillStyle = '#060b18';
      ctx.fillRect(0, 0, 32, 32);

      // G coloré
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const gradient = ctx.createLinearGradient(8, 8, 24, 24);
      gradient.addColorStop(0, '#4285f4');
      gradient.addColorStop(0.33, '#34a853');
      gradient.addColorStop(0.66, '#fbbc05');
      gradient.addColorStop(1, '#ea4335');

      ctx.fillStyle = gradient;
      ctx.fillText('G', 16, 17);

      // Injecte dans le <head>
      let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = canvas.toDataURL('image/png');
      document.head.appendChild(link);
    } catch(e) {}
  },

  /* ─────────────────────────────────────────────
     SKINS & THÈMES
  ───────────────────────────────────────────── */

  SKINS: {
    default:  { name: 'Default Dark',   bg: '#060b18', accent: '#3b82f6' },
    matrix:   { name: 'Matrix Green',   bg: '#001100', accent: '#00ff41' },
    sunset:   { name: 'Sunset Corp',    bg: '#1a0a0a', accent: '#fb923c' },
    purple:   { name: 'Violet Dreams',  bg: '#0d0318', accent: '#a78bfa' },
    gold:     { name: 'Gold Standard',  bg: '#0f0a00', accent: '#fbbf24' },
  },

  currentSkin: 'default',

  applySkin(skinId) {
    const skin = this.SKINS[skinId];
    if (!skin) return;
    this.currentSkin = skinId;
    document.documentElement.style.setProperty('--bg-base', skin.bg);
    document.documentElement.style.setProperty('--accent-blue', skin.accent);
    G.showToast(`🎨 Skin "${skin.name}" appliqué !`, 'success');
  },
};

window.Assets = Assets;
