import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The goal is to replace the <main id="game-main">...</main> block
# and the <footer id="game-footer">...</footer> block
# with a new Mobile-style layout.

# Find <main id="game-main">...</main> block
main_match = re.search(r'(<main id="game-main">)(.*?)(</main>)', content, re.DOTALL)
if not main_match:
    print("Could not find <main>")
    exit(1)

# Extract panels
panel_left = re.search(r'<aside id="panel-left">.*?</aside>', main_match.group(2), re.DOTALL).group(0)
panel_center = re.search(r'<section id="panel-center">.*?</section>', main_match.group(2), re.DOTALL).group(0)
panel_right = re.search(r'<aside id="panel-right">.*?</aside>', main_match.group(2), re.DOTALL).group(0)

# We will keep the inner contents of tab-agents, tab-buildings etc. 
# and put them into mobile-modals.
def extract_tab(panel_html, tab_id):
    match = re.search(f'<div class="tab-content[^>]*id="{tab_id}"[^>]*>(.*?)</div>\\s*<!-- ──', panel_html, re.DOTALL)
    if not match:
        # try without <!-- ──
        match = re.search(f'<div class="tab-content[^>]*id="{tab_id}"[^>]*>(.*?)</div>\\s*(?:</section>|<div class="tab-content)', panel_html, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

def extract_div_by_class(html, class_name):
    match = re.search(fr'<div class="{class_name}[^>]*>(.*?)</div>\s*(<!--|<div|<button)', html, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

# Create new main block
new_main = """
    <!-- ── ZONE PRINCIPALE MOBILE ── -->
    <main id="game-main">
      
      <!-- Vue du "Floor" (Bureau) -->
      <section id="floor-view">
        <div id="floor-entities">
          <!-- Les employés apparaîtront ici -->
        </div>
        
        <div class="ceo-desk-container">
          <button class="btn-click ceo-desk" id="btn-main-click" aria-label="Cliquer pour générer des G-Coins">
            <span class="click-icon" style="font-size: 3rem;">🧑‍💻</span>
            <div class="ceo-desk-info">
              <span class="ceo-name">CEO Desk</span>
              <span class="click-power" id="click-power">+1</span>
            </div>
          </button>
          <div class="click-sparks" id="click-sparks"></div>
        </div>
      </section>

      <!-- HUD superposé au floor -->
      <div id="floor-hud">
        <div class="hud-top-left">
          <div class="player-level">Niv. <span id="player-level">1</span></div>
          <div class="xp-bar"><div class="xp-fill" id="xp-fill" style="width:0%"></div></div>
        </div>
        <div class="hud-top-right">
          <div class="morale-value">💚 <span id="morale-value">75%</span></div>
          <div class="weather-display" id="weather-display">
            <span id="weather-icon">☀️</span> <span id="weather-effect">×1.0</span>
          </div>
        </div>
      </div>

    </main>

    <!-- ── BOTTOM NAVIGATION (APP MOBILE) ── -->
    <nav id="mobile-bottom-nav">
      <button class="nav-tab active" data-target="modal-shop">
        <span class="nav-icon">🛒</span>
        <span class="nav-label">Boutique</span>
      </button>
      <button class="nav-tab" data-target="modal-lab">
        <span class="nav-icon">🧬</span>
        <span class="nav-label">Labo</span>
      </button>
      <button class="nav-tab" data-target="modal-social">
        <span class="nav-icon">🏆</span>
        <span class="nav-label">Social</span>
      </button>
      <button class="nav-tab" data-target="modal-settings">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">Options</span>
      </button>
    </nav>
"""

# Extract specific sections to place inside modals
agents_html = re.search(r'<div class="tab-content.*?id="tab-agents">.*?</div>\s*<!-- ── TAB: BÂTIMENTS', panel_center, re.DOTALL).group(0)
buildings_html = re.search(r'<div class="tab-content.*?id="tab-buildings">.*?</div>\s*<!-- ── TAB: UPGRADES', panel_center, re.DOTALL).group(0)
upgrades_html = re.search(r'<div class="tab-content.*?id="tab-upgrades">.*?</div>\s*<!-- ── TAB: R&D', panel_center, re.DOTALL).group(0)
research_html = re.search(r'<div class="tab-content.*?id="tab-research">.*?</div>\s*<!-- ── TAB: MARCHÉ', panel_center, re.DOTALL).group(0)
market_html = re.search(r'<div class="tab-content.*?id="tab-market">.*?</div>\s*<!-- ── TAB: QUÊTES', panel_center, re.DOTALL).group(0)
quests_html = re.search(r'<div class="tab-content.*?id="tab-quests">.*?</div>\s*<!-- ── TAB: PRESTIGE', panel_center, re.DOTALL).group(0)
prestige_html = re.search(r'<div class="tab-content.*?id="tab-prestige">.*?</section>', panel_center, re.DOTALL).group(0)

# Right panel extraction
event_log_html = re.search(r'<div class="event-log-panel">.*?</div>\s*<!-- Événements actifs', panel_right, re.DOTALL).group(0)
active_events_html = re.search(r'<div class="active-events-panel" id="active-events-panel">.*?</div>\s*<!-- Succès récents', panel_right, re.DOTALL).group(0)
leaderboard_html = re.search(r'<div class="leaderboard-panel">.*?</div>\s*<!-- Météo', panel_right, re.DOTALL).group(0)

# Left panel skills extraction
skills_html = re.search(r'<div class="skills-panel">.*?</div>\s*<!-- Mini-jeu intégré', panel_left, re.DOTALL).group(0)
minigame_html = re.search(r'<div class="minigame-panel" id="minigame-panel">.*?</div>\s*</aside>', panel_left, re.DOTALL).group(0)


# New modals for mobile layout
new_modals = f"""
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
          {agents_html.replace('tab-agents', 'old-tab-agents').replace('class="tab-content active"', 'class="inner-tab"')}
        </div>
        <div id="m-buildings" class="m-tab-content hidden">
          {buildings_html.replace('tab-buildings', 'old-tab-buildings').replace('class="tab-content hidden"', 'class="inner-tab"')}
        </div>
        <div id="m-market" class="m-tab-content hidden">
          {market_html.replace('tab-market', 'old-tab-market').replace('class="tab-content hidden"', 'class="inner-tab"')}
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
          {upgrades_html.replace('tab-upgrades', 'old-tab-upgrades').replace('class="tab-content hidden"', 'class="inner-tab"')}
        </div>
        <div id="m-research" class="m-tab-content hidden">
          {research_html.replace('tab-research', 'old-tab-research').replace('class="tab-content hidden"', 'class="inner-tab"')}
        </div>
        <div id="m-skills" class="m-tab-content hidden">
          {skills_html}
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
          {quests_html.replace('tab-quests', 'old-tab-quests').replace('class="tab-content hidden"', 'class="inner-tab"')}
        </div>
        <div id="m-leaderboard" class="m-tab-content hidden">
          {leaderboard_html}
        </div>
        <div id="m-events" class="m-tab-content hidden">
          {active_events_html}
          <hr>
          {event_log_html}
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
          {prestige_html.replace('tab-prestige', 'old-tab-prestige').replace('class="tab-content hidden"', 'class="inner-tab"')}
        </div>
        <div id="m-minigame" class="m-tab-content hidden">
          {minigame_html}
        </div>
      </div>
    </div>
  </div>
"""

# Replace the old main block and footer
footer_match = re.search(r'<footer id="game-footer">.*?</footer>', content, re.DOTALL)
if footer_match:
    content = content.replace(footer_match.group(0), "")

content = content.replace(main_match.group(0), new_main)

# Insert the new modals before the global modals
modals_marker = "<!-- ══════════════════════════════════════════\n       MODALES GLOBALES"
content = content.replace(modals_marker, new_modals + "\n\n  " + modals_marker)

# We need to fix the prestige section cleanup (it might have an extra </section>)
content = content.replace("</section>\n      </section>", "</section>")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html refactored!")
