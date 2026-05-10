#!/usr/bin/env python3
"""
Redesign the Gem Store UI to be simpler and cleaner for teenagers.

Current problems:
- 17 sections all stacked vertically = way too long
- Too much visual noise (gradients, animations, tags everywhere)
- No clear navigation between sections
- Overwhelming for teens

New design:
- Tabbed interface with 4 simple tabs: Featured, Themes, Power-ups, Earn
- Clean card-based layout within each tab
- Much less visual clutter
- Easy to navigate
"""

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'r') as f:
    content = f.read()

# Replace the entire openGemStore function (lines 9954 to the closing brace before claimGemBundle)
old_start = "function openGemStore() {"
old_end = "// === CLAIM GEM BUNDLE ==="

start_idx = content.find(old_start)
end_idx = content.find(old_end)

if start_idx == -1 or end_idx == -1:
    print(f"ERROR: Could not find markers. start={start_idx}, end={end_idx}")
    exit(1)

# New simplified Gem Store
new_gem_store = '''function openGemStore() {
  localStorage.setItem('gemStoreLastOpened', '89');
  var gsb = document.getElementById('gem-store-badge'); if(gsb) gsb.style.display='none';
  var gems = state.gems || 0;
  var unlockedThemes = state.unlockedThemes || ['default'];
  var activeTheme = state.activeTheme || 'default';
  var unlockedFrames = state.unlockedFrames || ['none'];
  var activeFrame = state.activeFrame || 'none';
  
  var themes = [
    {id:'default',name:'Default',cost:0,bg:'linear-gradient(135deg,#1a2848,#0e1830)',icon:'🌙'},
    {id:'ocean',name:'Ocean Wave',cost:20,bg:'linear-gradient(135deg,#0c3547,#1a6b7a)',icon:'🌊'},
    {id:'sunset',name:'Sunset Glow',cost:20,bg:'linear-gradient(135deg,#4a1942,#c84b31)',icon:'🌅'},
    {id:'forest',name:'Forest Green',cost:20,bg:'linear-gradient(135deg,#1a3c2a,#2d6a4f)',icon:'🌲'},
    {id:'galaxy',name:'Galaxy Purple',cost:50,bg:'linear-gradient(135deg,#1a1a4e,#4a1a6b)',icon:'🌌'},
    {id:'gold',name:'Royal Gold',cost:100,bg:'linear-gradient(135deg,#3d2e0a,#8b6914)',icon:'👑'}
  ];
  
  var frames = [
    {id:'none',name:'No Frame',cost:0,border:'none',icon:'⭕'},
    {id:'fire',name:'Fire Ring',cost:30,border:'3px solid #ef4444;box-shadow:0 0 12px rgba(239,68,68,0.5)',icon:'🔥'},
    {id:'ice',name:'Ice Crystal',cost:30,border:'3px solid #22d3ee;box-shadow:0 0 12px rgba(34,211,238,0.5)',icon:'❄️'},
    {id:'holy_light',name:'Holy Light',cost:60,border:'3px solid #fef08a;box-shadow:0 0 20px rgba(254,240,138,0.6)',icon:'✝️'},
    {id:'rainbow',name:'Rainbow',cost:50,border:'3px solid #a78bfa;box-shadow:0 0 12px rgba(167,139,250,0.5)',icon:'🌈'}
  ];
  
  var powerups = [
    {id:'streak_freeze',name:'Streak Freeze',desc:'Protect your streak for 1 day',cost:15,icon:'🧊',action:'buyStreakFreeze()'},
    {id:'quiz_hints',name:'Quiz Hints x3',desc:'Get 3 hints for quizzes',cost:10,icon:'💡',action:'buyQuizHints()'},
    {id:'ai_questions',name:'AI Questions +5',desc:'5 extra AI chat questions',cost:20,icon:'🤖',action:'buyAIQuestions()'},
    {id:'mission_reroll',name:'Mission Reroll',desc:'Get a new daily mission',cost:8,icon:'🎲',action:'buyMissionReroll()'}
  ];
  
  var bundles = [
    {id:'starter',name:'Starter Pack',gems:50,icon:'💎',taskReq:'Read 5 chapters',taskKey:'chapters_5'},
    {id:'explorer',name:'Explorer Pack',gems:120,icon:'🌟',taskReq:'Read 15 chapters',taskKey:'chapters_15'},
    {id:'champion',name:'Champion Pack',gems:250,icon:'🏆',taskReq:'Read 30 chapters',taskKey:'chapters_30'},
    {id:'legend',name:'Legend Pack',gems:500,icon:'👑',taskReq:'Complete 3 books',taskKey:'books_3'}
  ];
  
  var h = '<div class="store-overlay" onclick="if(event.target===this)this.remove()">';
  h += '<div class="store-card-v2">';
  
  // Header with gem balance
  h += '<div class="store-header-v2">';
  h += '<div class="store-title-v2">Gem Store</div>';
  h += '<div class="store-gems-v2">💎 ' + gems + '</div>';
  h += '</div>';
  
  // Tab navigation
  h += '<div class="store-tabs-v2">';
  h += '<button class="store-tab-v2 active" onclick="switchStoreTab(\'featured\')">Featured</button>';
  h += '<button class="store-tab-v2" onclick="switchStoreTab(\'themes\')">Themes</button>';
  h += '<button class="store-tab-v2" onclick="switchStoreTab(\'powerups\')">Power-ups</button>';
  h += '<button class="store-tab-v2" onclick="switchStoreTab(\'earn\')">Earn</button>';
  h += '</div>';
  
  // === FEATURED TAB ===
  h += '<div class="store-tab-content" id="store-tab-featured">';
  
  // Quick power-ups row
  h += '<div class="store-quick-row">';
  powerups.forEach(function(p) {
    var canBuy = gems >= p.cost;
    h += '<div class="store-quick-item' + (canBuy ? '' : ' locked') + '" onclick="' + (canBuy ? p.action + ';document.querySelector(\\\'.store-overlay\\\').remove();openGemStore()' : '') + '">';
    h += '<div class="store-quick-icon">' + p.icon + '</div>';
    h += '<div class="store-quick-name">' + p.name.split(' ')[0] + '</div>';
    h += '<div class="store-quick-cost">💎' + p.cost + '</div>';
    h += '</div>';
  });
  h += '</div>';
  
  // Popular themes preview
  h += '<div class="store-mini-section">';
  h += '<div class="store-mini-title">🎨 Popular Themes</div>';
  h += '<div class="store-theme-row">';
  themes.slice(1, 5).forEach(function(t) {
    var owned = unlockedThemes.includes(t.id);
    var isActive = activeTheme === t.id;
    h += '<div class="store-theme-chip' + (isActive ? ' active' : '') + (owned ? ' owned' : '') + '" onclick="' + (owned ? "state.activeTheme=\\'"+t.id+"\\';save();document.querySelector(\\'.store-overlay\\').remove();openGemStore()" : (gems >= t.cost ? "buyTheme(\\'"+t.id+"\\');document.querySelector(\\'.store-overlay\\').remove();openGemStore()" : "")) + '">';
    h += '<div class="store-theme-preview" style="background:' + t.bg + '">' + t.icon + '</div>';
    h += '<div class="store-theme-label">' + t.name.split(' ')[0] + '</div>';
    if (!owned) h += '<div class="store-theme-price">💎' + t.cost + '</div>';
    else if (isActive) h += '<div class="store-theme-price" style="color:#4ade80">✓</div>';
    h += '</div>';
  });
  h += '</div></div>';
  
  // Gem bundles preview
  h += '<div class="store-mini-section">';
  h += '<div class="store-mini-title">💰 Earn Gems</div>';
  var chaptersRead = state.chaptersRead || 0;
  var booksCompleted = Object.keys(state.completedBooks || {}).length;
  var claimedBundles = state.claimedBundles || [];
  bundles.forEach(function(b) {
    var claimed = claimedBundles.includes(b.id);
    var eligible = false;
    if(b.taskKey === 'chapters_5') eligible = chaptersRead >= 5;
    else if(b.taskKey === 'chapters_15') eligible = chaptersRead >= 15;
    else if(b.taskKey === 'chapters_30') eligible = chaptersRead >= 30;
    else if(b.taskKey === 'books_3') eligible = booksCompleted >= 3;
    h += '<div class="store-earn-item">';
    h += '<span class="store-earn-icon">' + b.icon + '</span>';
    h += '<span class="store-earn-name">' + b.name + '</span>';
    h += '<span class="store-earn-status">';
    if(claimed) h += '<span style="color:#4ade80">✅</span>';
    else if(eligible) h += '<button class="store-claim-btn" onclick="claimGemBundle(\\''+b.id+'\\','+b.gems+');document.querySelector(\\\'.store-overlay\\\').remove();openGemStore()">Claim!</button>';
    else h += '<span style="color:#64748b;font-size:11px">' + b.taskReq + '</span>';
    h += '</span></div>';
  });
  h += '</div>';
  h += '</div>';
  
  // === THEMES TAB ===
  h += '<div class="store-tab-content" id="store-tab-themes" style="display:none">';
  h += '<div class="store-mini-section">';
  h += '<div class="store-mini-title">🎨 Profile Themes</div>';
  themes.forEach(function(t) {
    var owned = unlockedThemes.includes(t.id);
    var isActive = activeTheme === t.id;
    var canBuy = gems >= t.cost;
    h += '<div class="store-list-item">';
    h += '<div class="store-list-left">';
    h += '<div class="store-list-preview" style="background:' + t.bg + '">' + t.icon + '</div>';
    h += '<div><div class="store-list-name">' + t.name + '</div>';
    h += '<div class="store-list-desc">' + (owned ? (isActive ? 'Active' : 'Owned') : '💎 ' + t.cost) + '</div></div>';
    h += '</div>';
    if(isActive) h += '<span class="store-badge-active">Active</span>';
    else if(owned) h += '<button class="store-action-btn" onclick="state.activeTheme=\\''+t.id+'\\';save();document.querySelector(\\'.store-overlay\\').remove();openGemStore()">Use</button>';
    else if(canBuy) h += '<button class="store-action-btn buy" onclick="buyTheme(\\''+t.id+'\\');document.querySelector(\\'.store-overlay\\').remove();openGemStore()">Buy 💎' + t.cost + '</button>';
    else h += '<span class="store-locked-label">💎' + t.cost + '</span>';
    h += '</div>';
  });
  h += '</div>';
  
  h += '<div class="store-mini-section">';
  h += '<div class="store-mini-title">🖼️ Avatar Frames</div>';
  frames.forEach(function(f) {
    var owned = unlockedFrames.includes(f.id);
    var isActive = activeFrame === f.id;
    var canBuy = gems >= f.cost;
    h += '<div class="store-list-item">';
    h += '<div class="store-list-left">';
    h += '<div class="store-list-preview" style="border:' + (f.border !== 'none' ? f.border.split(';')[0] : '2px dashed #475569') + ';background:rgba(20,35,60,0.8)">' + f.icon + '</div>';
    h += '<div><div class="store-list-name">' + f.name + '</div>';
    h += '<div class="store-list-desc">' + (owned ? (isActive ? 'Active' : 'Owned') : '💎 ' + f.cost) + '</div></div>';
    h += '</div>';
    if(isActive) h += '<span class="store-badge-active">Active</span>';
    else if(owned) h += '<button class="store-action-btn" onclick="state.activeFrame=\\''+f.id+'\\';save();document.querySelector(\\'.store-overlay\\').remove();openGemStore()">Use</button>';
    else if(canBuy && f.cost > 0) h += '<button class="store-action-btn buy" onclick="buyFrame(\\''+f.id+'\\','+f.cost+');document.querySelector(\\'.store-overlay\\').remove();openGemStore()">Buy 💎' + f.cost + '</button>';
    else if(f.cost > 0) h += '<span class="store-locked-label">💎' + f.cost + '</span>';
    h += '</div>';
  });
  h += '</div>';
  h += '</div>';
  
  // === POWER-UPS TAB ===
  h += '<div class="store-tab-content" id="store-tab-powerups" style="display:none">';
  h += '<div class="store-mini-section">';
  h += '<div class="store-mini-title">⚡ Power-ups</div>';
  powerups.forEach(function(p) {
    var canBuy = gems >= p.cost;
    h += '<div class="store-list-item">';
    h += '<div class="store-list-left">';
    h += '<div class="store-list-preview" style="background:rgba(139,92,246,0.15)">' + p.icon + '</div>';
    h += '<div><div class="store-list-name">' + p.name + '</div>';
    h += '<div class="store-list-desc">' + p.desc + '</div></div>';
    h += '</div>';
    if(canBuy) h += '<button class="store-action-btn buy" onclick="' + p.action + ';document.querySelector(\\'.store-overlay\\').remove();openGemStore()">💎' + p.cost + '</button>';
    else h += '<span class="store-locked-label">💎' + p.cost + '</span>';
    h += '</div>';
  });
  h += '</div>';
  
  // Inventory
  h += '<div class="store-mini-section">';
  h += '<div class="store-mini-title">🎒 My Inventory</div>';
  h += '<div class="store-inventory-row">';
  h += '<div class="store-inv-item"><span class="store-inv-count">' + (state.quizHints || 0) + '</span><span class="store-inv-label">💡 Hints</span></div>';
  h += '<div class="store-inv-item"><span class="store-inv-count">' + (state.aiQuestions || 5) + '</span><span class="store-inv-label">🤖 AI Q</span></div>';
  h += '<div class="store-inv-item"><span class="store-inv-count">' + (state.missionRerolls || 0) + '</span><span class="store-inv-label">🎲 Rerolls</span></div>';
  h += '</div></div>';
  h += '</div>';
  
  // === EARN TAB ===
  h += '<div class="store-tab-content" id="store-tab-earn" style="display:none">';
  h += '<div class="store-mini-section">';
  h += '<div class="store-mini-title">💰 Gem Bundles</div>';
  h += '<div class="store-list-desc" style="margin-bottom:8px;color:#94a3b8">Complete reading goals to earn gems!</div>';
  bundles.forEach(function(b) {
    var claimed = claimedBundles.includes(b.id);
    var eligible = false;
    if(b.taskKey === 'chapters_5') eligible = chaptersRead >= 5;
    else if(b.taskKey === 'chapters_15') eligible = chaptersRead >= 15;
    else if(b.taskKey === 'chapters_30') eligible = chaptersRead >= 30;
    else if(b.taskKey === 'books_3') eligible = booksCompleted >= 3;
    h += '<div class="store-list-item">';
    h += '<div class="store-list-left">';
    h += '<div class="store-list-preview" style="background:rgba(' + (claimed ? '74,222,128' : eligible ? '250,204,21' : '100,116,139') + ',0.15)">' + b.icon + '</div>';
    h += '<div><div class="store-list-name">' + b.name + '</div>';
    h += '<div class="store-list-desc">' + (claimed ? '✅ Claimed! +' + b.gems + ' gems' : b.taskReq + ' → 💎' + b.gems) + '</div></div>';
    h += '</div>';
    if(claimed) h += '<span class="store-badge-active" style="background:rgba(74,222,128,0.15);color:#4ade80">Done</span>';
    else if(eligible) h += '<button class="store-action-btn buy" style="background:linear-gradient(135deg,#f59e0b,#d97706)" onclick="claimGemBundle(\\''+b.id+'\\','+b.gems+');document.querySelector(\\'.store-overlay\\').remove();openGemStore()">Claim!</button>';
    else h += '<span class="store-locked-label" style="font-size:10px">' + b.taskReq + '</span>';
    h += '</div>';
  });
  h += '</div>';
  
  // How to earn gems info
  h += '<div class="store-mini-section">';
  h += '<div class="store-mini-title">📖 How to Earn</div>';
  h += '<div class="store-earn-info">';
  h += '<div>📖 Read a chapter = +3 gems</div>';
  h += '<div>✅ Complete a quiz = +5 gems</div>';
  h += '<div>🔥 Daily streak bonus = +2 gems</div>';
  h += '<div>🏆 Weekly challenge = +10-20 gems</div>';
  h += '</div></div>';
  h += '</div>';
  
  // Close button
  h += '<button class="store-close-v2" onclick="this.closest(\\'.store-overlay\\').remove()">Close</button>';
  h += '</div></div>';
  
  document.body.insertAdjacentHTML('beforeend', h);
}

function switchStoreTab(tabId) {
  var tabs = document.querySelectorAll('.store-tab-content');
  tabs.forEach(function(t) { t.style.display = 'none'; });
  document.getElementById('store-tab-' + tabId).style.display = 'block';
  var btns = document.querySelectorAll('.store-tab-v2');
  btns.forEach(function(b) { b.classList.remove('active'); });
  event.target.classList.add('active');
}
'''

# Replace the function
content = content[:start_idx] + new_gem_store + "\n" + content[end_idx:]

# Now add the new CSS styles - find where existing store CSS is
old_css_start = ".store-overlay {"
css_insert_point = content.find(old_css_start)

# Add new CSS before the old store-overlay CSS
new_css = """
/* === GEM STORE V2 CSS === */
.store-card-v2 { background:linear-gradient(160deg, #1a2a4a, #152040); border:1px solid rgba(65,110,160,0.3); border-radius:20px; padding:20px; max-width:380px; width:90%; max-height:82vh; overflow-y:auto; display:flex; flex-direction:column; }
.store-header-v2 { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.store-title-v2 { font-family:'Luckiest Guy',cursive; font-size:22px; color:#e2e8f0; }
.store-gems-v2 { font-family:'Bangers',cursive; font-size:18px; color:#a78bfa; background:rgba(139,92,246,0.1); padding:6px 14px; border-radius:20px; border:1px solid rgba(139,92,246,0.2); }
.store-tabs-v2 { display:flex; gap:4px; margin-bottom:16px; background:rgba(15,23,42,0.5); padding:4px; border-radius:12px; }
.store-tab-v2 { flex:1; padding:8px 4px; border:none; border-radius:8px; background:transparent; color:#64748b; font-family:'Comic Neue',cursive; font-weight:700; font-size:12px; cursor:pointer; transition:all 0.2s; }
.store-tab-v2.active { background:rgba(139,92,246,0.2); color:#c4b5fd; }
.store-tab-content { flex:1; overflow-y:auto; }
.store-mini-section { margin-bottom:16px; }
.store-mini-title { font-family:'Bangers',cursive; font-size:15px; color:#94a3b8; margin-bottom:8px; }
.store-quick-row { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:16px; }
.store-quick-item { text-align:center; padding:12px 4px; border-radius:12px; background:rgba(20,35,60,0.6); border:1px solid rgba(65,110,160,0.2); cursor:pointer; transition:all 0.2s; }
.store-quick-item:hover { border-color:rgba(139,92,246,0.4); transform:scale(1.03); }
.store-quick-item.locked { opacity:0.5; cursor:not-allowed; }
.store-quick-icon { font-size:24px; margin-bottom:4px; }
.store-quick-name { font-size:10px; color:#94a3b8; font-weight:600; }
.store-quick-cost { font-size:10px; color:#a78bfa; margin-top:2px; }
.store-theme-row { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.store-theme-chip { text-align:center; cursor:pointer; transition:all 0.2s; }
.store-theme-chip:hover { transform:scale(1.05); }
.store-theme-chip.active { }
.store-theme-preview { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0 auto 4px; border:2px solid transparent; }
.store-theme-chip.active .store-theme-preview { border-color:#4ade80; }
.store-theme-label { font-size:10px; color:#94a3b8; }
.store-theme-price { font-size:10px; color:#a78bfa; }
.store-list-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; margin-bottom:6px; border-radius:10px; background:rgba(20,35,60,0.4); border:1px solid rgba(65,110,160,0.15); }
.store-list-left { display:flex; align-items:center; gap:10px; }
.store-list-preview { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; }
.store-list-name { font-family:'Comic Neue',cursive; font-weight:700; color:#d8dce8; font-size:13px; }
.store-list-desc { font-size:11px; color:#64748b; }
.store-badge-active { font-size:11px; color:#4ade80; background:rgba(74,222,128,0.1); padding:4px 10px; border-radius:8px; }
.store-action-btn { padding:6px 12px; border-radius:8px; border:none; font-family:'Comic Neue',cursive; font-weight:700; font-size:12px; cursor:pointer; background:rgba(139,92,246,0.15); color:#c4b5fd; transition:all 0.2s; }
.store-action-btn.buy { background:linear-gradient(135deg,#8B5CF6,#A78BFA); color:#fff; }
.store-action-btn:hover { transform:scale(1.05); }
.store-locked-label { font-size:11px; color:#475569; }
.store-earn-item { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid rgba(65,110,160,0.1); }
.store-earn-item:last-child { border-bottom:none; }
.store-earn-icon { font-size:18px; }
.store-earn-name { flex:1; font-size:13px; color:#94a3b8; font-weight:600; }
.store-earn-status { }
.store-claim-btn { padding:4px 10px; border:none; border-radius:6px; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; font-size:11px; font-weight:700; cursor:pointer; }
.store-inventory-row { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.store-inv-item { text-align:center; padding:12px 8px; border-radius:10px; background:rgba(20,35,60,0.6); border:1px solid rgba(65,110,160,0.15); }
.store-inv-count { display:block; font-family:'Bangers',cursive; font-size:20px; color:#e2e8f0; }
.store-inv-label { font-size:10px; color:#64748b; }
.store-earn-info { font-size:12px; color:#94a3b8; line-height:2; padding:8px 12px; background:rgba(20,35,60,0.4); border-radius:10px; }
.store-close-v2 { display:block; width:100%; padding:12px; margin-top:12px; border-radius:12px; border:1px solid rgba(65,110,160,0.3); background:transparent; color:#64748b; font-family:'Comic Neue',cursive; font-size:14px; cursor:pointer; transition:all 0.2s; }
.store-close-v2:hover { background:rgba(65,110,160,0.1); color:#94a3b8; }

"""

content = content[:css_insert_point] + new_css + content[css_insert_point:]

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'w') as f:
    f.write(content)

print("✓ Gem Store redesigned successfully!")
print("  - Replaced 600-line function with clean tabbed UI")
print("  - Added new CSS for v2 store")
print("  - 4 tabs: Featured, Themes, Power-ups, Earn")
