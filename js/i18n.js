// i18n.js - Multi-language support

const I18N = {
  fr: {
    // HUD & Common
    'hud_gcoins': 'G-Coins',
    'hud_cps': 'G-Coins / seconde',
    'btn_prestige': '⭐ Prestige',
    'btn_leaderboard': '🏆 Classement',
    'btn_export': '💾 Export',
    'btn_import': '📂 Import',
    'btn_stats': '📊 Stats',
    'btn_reset': '🗑️ Reset',
    
    // Tabs
    'tab_agents': '👥 Agents',
    'tab_upgrades': '⚡ Upgrades',
    'tab_research': '🔬 R&D',
    'tab_achievements': '🏆 Succès',
    'tab_events': '📅 Marché',

    // Agent terms
    'agent_owned': 'Possédé',
    'agent_produces': 'Produit',
    'agent_cost': 'Coût',
    'btn_buy': 'Acheter',
    'btn_sell': 'Vendre',

    // Multiplayer / Setup
    'setup_title': '🌍 Création de Compte G-Corp',
    'setup_pseudo': 'Votre Pseudo',
    'setup_country': 'Pays / Équipe',
    'setup_lang': 'Langue',
    'setup_start': 'Se Connecter',

    // PvP / Leaderboard
    'lb_title': '🏆 Classement Mondial',
    'lb_rank': 'Rang',
    'lb_player': 'Joueur',
    'lb_score': 'Score',
    'lb_team': 'Équipe',
    'lb_action_defy': '⚔️ Défier',
    'lb_bot_suffix': ' (Bot)',
    
    // Messages
    'msg_golden_call': '📞 Appel Doré ! +',
    'msg_easter_egg': '🥚 Secret découvert ! +',
    'msg_audit_success': '✅ Audit validé ! +',
    'msg_audit_fail': '❌ Audit raté !',
    'msg_vip': '💎 Client VIP : Prod x2 (30s)',
    'msg_crash': '⚠️ Panne Serveur : Prod /2 (20s)',
    'msg_pvp_win': '🏆 Défi gagné contre',
    'msg_pvp_lose': '💀 Défi perdu contre',
  },
  en: {
    // HUD & Common
    'hud_gcoins': 'G-Coins',
    'hud_cps': 'G-Coins / second',
    'btn_prestige': '⭐ Prestige',
    'btn_leaderboard': '🏆 Leaderboard',
    'btn_export': '💾 Export',
    'btn_import': '📂 Import',
    'btn_stats': '📊 Stats',
    'btn_reset': '🗑️ Reset',
    
    // Tabs
    'tab_agents': '👥 Agents',
    'tab_upgrades': '⚡ Upgrades',
    'tab_research': '🔬 R&D',
    'tab_achievements': '🏆 Achievs',
    'tab_events': '📅 Market',

    // Agent terms
    'agent_owned': 'Owned',
    'agent_produces': 'Produces',
    'agent_cost': 'Cost',
    'btn_buy': 'Buy',
    'btn_sell': 'Sell',

    // Multiplayer / Setup
    'setup_title': '🌍 G-Corp Account Creation',
    'setup_pseudo': 'Your Nickname',
    'setup_country': 'Country / Team',
    'setup_lang': 'Language',
    'setup_start': 'Connect',

    // PvP / Leaderboard
    'lb_title': '🏆 Global Leaderboard',
    'lb_rank': 'Rank',
    'lb_player': 'Player',
    'lb_score': 'Score',
    'lb_team': 'Team',
    'lb_action_defy': '⚔️ Defy',
    'lb_bot_suffix': ' (Bot)',
    
    // Messages
    'msg_golden_call': '📞 Golden Call! +',
    'msg_easter_egg': '🥚 Secret found! +',
    'msg_audit_success': '✅ Audit passed! +',
    'msg_audit_fail': '❌ Audit failed!',
    'msg_vip': '💎 VIP Client: Prod x2 (30s)',
    'msg_crash': '⚠️ Server Crash: Prod /2 (20s)',
    'msg_pvp_win': '🏆 Defy won against',
    'msg_pvp_lose': '💀 Defy lost against',
  },
  es: {
    // HUD & Common
    'hud_gcoins': 'G-Coins',
    'hud_cps': 'G-Coins / segundo',
    'btn_prestige': '⭐ Prestigio',
    'btn_leaderboard': '🏆 Clasificación',
    'btn_export': '💾 Exportar',
    'btn_import': '📂 Importar',
    'btn_stats': '📊 Estadísticas',
    'btn_reset': '🗑️ Reiniciar',
    
    // Tabs
    'tab_agents': '👥 Agentes',
    'tab_upgrades': '⚡ Mejoras',
    'tab_research': '🔬 I+D',
    'tab_achievements': '🏆 Logros',
    'tab_events': '📅 Mercado',

    // Agent terms
    'agent_owned': 'Poseído',
    'agent_produces': 'Produce',
    'agent_cost': 'Costo',
    'btn_buy': 'Comprar',
    'btn_sell': 'Vender',

    // Multiplayer / Setup
    'setup_title': '🌍 Creación de Cuenta G-Corp',
    'setup_pseudo': 'Tu Apodo',
    'setup_country': 'País / Equipo',
    'setup_lang': 'Idioma',
    'setup_start': 'Conectar',

    // PvP / Leaderboard
    'lb_title': '🏆 Clasificación Global',
    'lb_rank': 'Rango',
    'lb_player': 'Jugador',
    'lb_score': 'Puntuación',
    'lb_team': 'Equipo',
    'lb_action_defy': '⚔️ Desafiar',
    'lb_bot_suffix': ' (Bot)',
    
    // Messages
    'msg_golden_call': '📞 Llamada Dorada! +',
    'msg_easter_egg': '🥚 Secreto encontrado! +',
    'msg_audit_success': '✅ Auditoría aprobada! +',
    'msg_audit_fail': '❌ Auditoría fallida!',
    'msg_vip': '💎 Cliente VIP: Prod x2 (30s)',
    'msg_crash': '⚠️ Caída de Servidor: Prod /2 (20s)',
    'msg_pvp_win': '🏆 Desafío ganado contra',
    'msg_pvp_lose': '💀 Desafío perdido contra',
  }
};

const I18N_COUNTRIES = [
  { id: 'fr', name: 'France', emoji: '🇫🇷' },
  { id: 'us', name: 'USA', emoji: '🇺🇸' },
  { id: 'uk', name: 'UK', emoji: '🇬🇧' },
  { id: 'es', name: 'España', emoji: '🇪🇸' },
  { id: 'de', name: 'Deutschland', emoji: '🇩🇪' },
  { id: 'it', name: 'Italia', emoji: '🇮🇹' },
  { id: 'jp', name: 'Japan', emoji: '🇯🇵' },
  { id: 'br', name: 'Brasil', emoji: '🇧🇷' },
  { id: 'ca', name: 'Canada', emoji: '🇨🇦' }
];

let currentLang = 'fr'; // default

function setLang(langCode) {
  if (I18N[langCode]) {
    currentLang = langCode;
    if (G && G.state && G.state.players && G.state.players[G.state.currentPlayerIdx]) {
      G.state.players[G.state.currentPlayerIdx].lang = langCode;
    }
    updateUIWithLang();
  }
}

function t(key) {
  return I18N[currentLang][key] || key;
}

function updateUIWithLang() {
  // Update static DOM elements that have data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  // Specific dynamic UI updates
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof updateUpgradesUI === 'function') updateUpgradesUI();
  if (typeof updateAchievementsUI === 'function') updateAchievementsUI();
  if (typeof updateEventsUI === 'function') updateEventsUI();
  if (typeof updateLeaderboard === 'function') updateLeaderboard();
}

window.I18n = {
  I18N,
  I18N_COUNTRIES,
  setLang,
  t,
  updateUIWithLang
};
