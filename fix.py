import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find start and end indices
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "<!-- ════ MOBILE BOTTOM SHEETS (MODALS) ════ -->" in line:
        start_idx = i
    if "<!-- ══════════════════════════════════════════" in line and "MODALES GLOBALES" in lines[i+1]:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_modals = """
  <!-- ════ MOBILE BOTTOM SHEETS (MODALS) ════ -->
  
  <div id="modal-shop" class="mobile-modal hidden">
    <div class="mobile-modal-content">
      <div class="mobile-modal-header">
        <h2>🛒 Boutique</h2>
        <button class="btn-close-modal">✕</button>
      </div>
      <div class="mobile-modal-tabs">
        <button class="m-tab-btn active" data-mtab="m-agents">Agents</button>
        <button class="m-tab-btn" data-mtab="m-buildings">Bâtiments</button>
        <button class="m-tab-btn" data-mtab="m-market">Marché</button>
      </div>
      <div class="mobile-modal-body">
        <div id="m-agents" class="m-tab-content active">
          <div class="inner-tab" id="old-tab-agents">
            <div class="tab-header">
              <h2>Recrutement d'Agents</h2>
              <div class="tab-search"><input type="text" id="agent-search" placeholder="Rechercher un agent..." /></div>
            </div>
            <div class="agents-grid" id="agents-grid"></div>
          </div>
        </div>
        <div id="m-buildings" class="m-tab-content hidden">
          <div class="inner-tab" id="old-tab-buildings">
            <div class="tab-header"><h2>Bâtiments & Infrastructure</h2></div>
            <div class="buildings-list" id="buildings-list"></div>
          </div>
        </div>
        <div id="m-market" class="m-tab-content hidden">
          <div class="inner-tab" id="old-tab-market">
            <div class="tab-header">
              <h2>Marché des Ressources</h2>
              <div class="market-ticker" id="market-ticker"></div>
            </div>
            <div class="market-grid" id="market-grid"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="modal-lab" class="mobile-modal hidden">
    <div class="mobile-modal-content">
      <div class="mobile-modal-header">
        <h2>🧬 Laboratoire</h2>
        <button class="btn-close-modal">✕</button>
      </div>
      <div class="mobile-modal-tabs">
        <button class="m-tab-btn active" data-mtab="m-upgrades">Upgrades</button>
        <button class="m-tab-btn" data-mtab="m-research">Recherche</button>
        <button class="m-tab-btn" data-mtab="m-skills">Compétences</button>
      </div>
      <div class="mobile-modal-body">
        <div id="m-upgrades" class="m-tab-content active">
          <div class="inner-tab" id="old-tab-upgrades">
            <div class="tab-header">
              <h2>Améliorations</h2>
              <div class="upgrade-filters">
                <button class="filter-btn active" data-filter="all">Tout</button>
                <button class="filter-btn" data-filter="production">Production</button>
                <button class="filter-btn" data-filter="click">Clic</button>
                <button class="filter-btn" data-filter="agent">Agents</button>
                <button class="filter-btn" data-filter="special">Spécial</button>
              </div>
            </div>
            <div class="upgrades-grid" id="upgrades-grid"></div>
          </div>
        </div>
        <div id="m-research" class="m-tab-content hidden">
          <div class="inner-tab" id="old-tab-research">
            <div class="tab-header">
              <h2>Recherche & Développement</h2>
              <div class="research-progress-bar">
                <div class="research-fill" id="research-fill" style="width:0%"></div>
                <span id="research-label">Aucune recherche active</span>
              </div>
            </div>
            <div class="research-tree" id="research-tree"></div>
          </div>
        </div>
        <div id="m-skills" class="m-tab-content hidden">
          <div class="skills-panel">
            <div class="panel-title">⚡ Compétences</div>
            <div class="skills-grid" id="skills-grid"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="modal-social" class="mobile-modal hidden">
    <div class="mobile-modal-content">
      <div class="mobile-modal-header">
        <h2>🏆 Social & Quêtes</h2>
        <button class="btn-close-modal">✕</button>
      </div>
      <div class="mobile-modal-tabs">
        <button class="m-tab-btn active" data-mtab="m-quests">Quêtes</button>
        <button class="m-tab-btn" data-mtab="m-leaderboard">Classement</button>
        <button class="m-tab-btn" data-mtab="m-events">Événements</button>
      </div>
      <div class="mobile-modal-body">
        <div id="m-quests" class="m-tab-content active">
          <div class="inner-tab" id="old-tab-quests">
            <div class="tab-header">
              <h2>Quêtes & Contrats</h2>
              <div class="quest-tabs">
                <button class="qtab-btn active" data-qtab="daily">Quotidien</button>
                <button class="qtab-btn" data-qtab="main">Principal</button>
                <button class="qtab-btn" data-qtab="contracts">Contrats</button>
              </div>
            </div>
            <div class="quests-list" id="quests-list"></div>
          </div>
        </div>
        <div id="m-leaderboard" class="m-tab-content hidden">
          <div class="leaderboard-panel">
            <div class="panel-title">📊 Classement Local</div>
            <div class="leaderboard-list" id="leaderboard-list"></div>
          </div>
          <div class="mp-scores-panel hidden" id="mp-scores-panel">
            <div class="panel-title">👥 Scores Joueurs</div>
            <div class="mp-scores" id="mp-scores"></div>
            <button class="btn-sm" id="btn-switch-player">Changer de Joueur</button>
          </div>
        </div>
        <div id="m-events" class="m-tab-content hidden">
          <div class="active-events-panel" id="active-events-panel">
            <div class="panel-title">⚡ Événements Actifs</div>
            <div class="events-list" id="active-events-list"></div>
          </div>
          <hr>
          <div class="event-log-panel">
            <div class="panel-title">📡 Journal Live</div>
            <div class="event-log" id="event-log">
              <div class="log-entry log-info">🟢 Système initialisé...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="modal-settings" class="mobile-modal hidden">
    <div class="mobile-modal-content">
      <div class="mobile-modal-header">
        <h2>⚙️ Paramètres & Prestige</h2>
        <button class="btn-close-modal">✕</button>
      </div>
      <div class="mobile-modal-tabs">
        <button class="m-tab-btn active" data-mtab="m-options">Options</button>
        <button class="m-tab-btn" data-mtab="m-prestige">Prestige</button>
        <button class="m-tab-btn" data-mtab="m-minigame">Mini-jeu</button>
      </div>
      <div class="mobile-modal-body">
        <div id="m-options" class="m-tab-content active">
          <div class="footer-stats" style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
            <span>🕐 Session : <span id="session-time">00:00:00</span></span>
            <span>💾 Sauvegarde : <span id="last-save">Jamais</span></span>
            <span>📈 Multiplicateur : <span id="global-multiplier">×1.0</span></span>
            <span>🎯 Phase : <span id="game-phase">Débutant</span></span>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn-sm" id="btn-export-save">Exporter</button>
            <button class="btn-sm" id="btn-import-save">Importer</button>
            <button class="btn-sm danger" id="btn-reset">Reset</button>
          </div>
        </div>
        <div id="m-prestige" class="m-tab-content hidden">
          <div class="inner-tab" id="old-tab-prestige">
            <div class="tab-header"><h2>✨ Prestige & Réincarnation</h2></div>
            <div class="prestige-panel" id="prestige-panel">
              <div class="prestige-info">
                <div class="prestige-current">Prestige actuel : <span id="prestige-count">0</span></div>
                <div class="prestige-bonus">Bonus actuel : <span id="prestige-bonus">×1.0</span></div>
                <div class="prestige-next">Prochain bonus : <span id="prestige-next">×1.1</span></div>
              </div>
              <div class="prestige-unlock-list" id="prestige-unlocks"></div>
              <button class="btn-prestige" id="btn-prestige" disabled>
                ✨ Effectuer le Prestige
                <div class="prestige-requirement" id="prestige-req">Requis: 1M G-Coins</div>
              </button>
              <div class="prestige-warning">⚠️ Vous perdrez tous vos G-Coins et agents, mais garderez vos bonus permanents.</div>
            </div>
          </div>
        </div>
        <div id="m-minigame" class="m-tab-content hidden">
          <div class="minigame-panel" id="minigame-panel">
            <div class="panel-title">🎮 Mini-Jeu: Appels Rapides</div>
            <div class="minigame-area" id="minigame-area">
              <div class="minigame-score">Score: <span id="mg-score">0</span></div>
              <div class="minigame-field" id="minigame-field">
                <div class="mg-instructions">Cliquez sur les téléphones qui sonnent !</div>
              </div>
              <button class="btn-sm" id="btn-start-minigame">Démarrer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>\n\n"""

    new_content = "".join(lines[:start_idx]) + new_modals + "".join(lines[end_idx:])
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("index.html fixed!")
else:
    print("Could not find start or end markers")
