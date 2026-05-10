import re

with open('/home/ubuntu/teens-bible-app/firebase-deploy/social.js', 'r') as f:
    content = f.read()

# 1. Replace the scope tabs section in showLeaderboard to add a class dropdown
old_scope_tabs = """<div style="display:flex;gap:6px;margin-bottom:10px;" id="lb-scope-tabs">
        <button onclick="switchLbScope('myclass')" id="lb-scope-myclass" style="flex:1;padding:8px;border-radius:8px;border:none;background:#4ECDC4;color:#fff;font-size:12px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
          ${'\\ud83c\\udfeb My Class'} (${groupCode})
        </button>
        <button onclick="switchLbScope('all')" id="lb-scope-all" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:12px;cursor:pointer;font-family:'Comic Neue',sans-serif;">
          ${'\\ud83c\\udf0d All Classes'}
        </button>
      </div>"""

# Try a more flexible match
if old_scope_tabs not in content:
    # Find it with regex
    pattern = r'<div style="display:flex;gap:6px;margin-bottom:10px;" id="lb-scope-tabs">.*?</div>\s*</div>'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        old_scope_tabs = match.group(0)
        print(f"Found scope tabs via regex at position {match.start()}")
    else:
        # Try simpler search
        idx = content.find('id="lb-scope-tabs"')
        if idx != -1:
            # Find the enclosing div
            start = content.rfind('<div', 0, idx)
            # Find closing - count divs
            depth = 0
            i = start
            while i < len(content):
                if content[i:i+4] == '<div':
                    depth += 1
                elif content[i:i+6] == '</div>':
                    depth -= 1
                    if depth == 0:
                        old_scope_tabs = content[start:i+6]
                        print(f"Found scope tabs by div counting: {len(old_scope_tabs)} chars")
                        break
                i += 1

new_scope_tabs = old_scope_tabs + """
      <div id="lb-class-filter" style="display:none;margin-bottom:10px;">
        <div style="display:flex;flex-wrap:wrap;gap:4px;" id="lb-class-chips"></div>
      </div>"""

content = content.replace(old_scope_tabs, new_scope_tabs)
print("Step 1: Added class filter chip container")

# 2. Add class filter functions before the switchLbTab function
class_filter_code = """
let currentLbClassFilter = 'all';
let availableClasses = [];

function loadClassChips() {
  if (!fbDb) return;
  const chipsEl = document.getElementById('lb-class-chips');
  if (!chipsEl) return;
  
  fbDb.ref('groups').once('value').then(function(snapshot) {
    const allGroups = snapshot.val();
    if (!allGroups) return;
    availableClasses = Object.keys(allGroups).sort();
    renderClassChips(chipsEl);
  });
}

function renderClassChips(chipsEl) {
  let html = '<button onclick="filterByClass(\\u0027all\\u0027)" style="padding:5px 12px;border-radius:16px;border:none;font-size:11px;font-weight:bold;cursor:pointer;font-family:Comic Neue,sans-serif;' +
    (currentLbClassFilter === 'all' ? 'background:#FF6B6B;color:#fff;' : 'background:rgba(255,255,255,0.08);color:#6880a8;') +
    '">All</button>';
  
  availableClasses.forEach(function(cls) {
    const isActive = currentLbClassFilter === cls;
    html += '<button onclick="filterByClass(\\u0027'+cls+'\\u0027)" style="padding:5px 12px;border-radius:16px;border:none;font-size:11px;font-weight:bold;cursor:pointer;font-family:Comic Neue,sans-serif;' +
      (isActive ? 'background:#FF6B6B;color:#fff;' : 'background:rgba(255,255,255,0.08);color:#6880a8;') +
      '">' + cls + '</button>';
  });
  
  chipsEl.innerHTML = html;
}

function filterByClass(classCode) {
  currentLbClassFilter = classCode;
  const chipsEl = document.getElementById('lb-class-chips');
  if (chipsEl) renderClassChips(chipsEl);
  loadLeaderboard(currentLbTab);
}

"""

# Insert before switchLbTab
insert_point = content.find('function switchLbTab(tab)')
if insert_point != -1:
    content = content[:insert_point] + class_filter_code + content[insert_point:]
    print("Step 2: Added class filter functions")
else:
    print("ERROR: Could not find switchLbTab function")

# 3. Modify switchLbScope to show/hide class filter
# Find the switchLbScope function and add class filter show/hide logic
old_myclass_block = """if (scope === 'myclass') {
      myBtn.style.background = '#4ECDC4';
      myBtn.style.color = '#fff';
      myBtn.style.border = 'none';
      allBtn.style.background = 'transparent';
      allBtn.style.color = '#6880a8';
      allBtn.style.border = '1px solid rgba(100,140,200,0.3)';
    } else {
      allBtn.style.background = '#4ECDC4';
      allBtn.style.color = '#fff';
      allBtn.style.border = 'none';
      myBtn.style.background = 'transparent';
      myBtn.style.color = '#6880a8';
      myBtn.style.border = '1px solid rgba(100,140,200,0.3)';
    }
  }
  loadLeaderboard(currentLbTab);
}"""

new_myclass_block = """if (scope === 'myclass') {
      myBtn.style.background = '#4ECDC4';
      myBtn.style.color = '#fff';
      myBtn.style.border = 'none';
      allBtn.style.background = 'transparent';
      allBtn.style.color = '#6880a8';
      allBtn.style.border = '1px solid rgba(100,140,200,0.3)';
    } else {
      allBtn.style.background = '#4ECDC4';
      allBtn.style.color = '#fff';
      allBtn.style.border = 'none';
      myBtn.style.background = 'transparent';
      myBtn.style.color = '#6880a8';
      myBtn.style.border = '1px solid rgba(100,140,200,0.3)';
    }
  }
  // Show/hide class filter chips
  const classFilter = document.getElementById('lb-class-filter');
  if (classFilter) {
    if (scope === 'all') {
      classFilter.style.display = 'block';
      currentLbClassFilter = 'all';
      loadClassChips();
    } else {
      classFilter.style.display = 'none';
      currentLbClassFilter = 'all';
    }
  }
  loadLeaderboard(currentLbTab);
}"""

content = content.replace(old_myclass_block, new_myclass_block)
print("Step 3: Modified switchLbScope to show/hide class filter")

# 4. Modify loadLeaderboard to filter by selected class
old_load_all = """if (currentLbScope === 'all') {
    // Load ALL groups
    fbDb.ref('groups').once('value').then(function(snapshot) {
      const allGroups = snapshot.val();
      if (!allGroups) {
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">' + 
          'No members yet.' + '</div>';
        return;
      }
      let members = [];
      Object.entries(allGroups).forEach(([gCode, gData]) => {
        if (gData && gData.members) {
          Object.entries(gData.members).forEach(([uid, d]) => {
            members.push({uid, groupCode: gCode, ...d});
          });
        }
      });
      renderLeaderboardList(members, sortBy, isKo, listEl, true);
    }).catch(function(err) {
      console.log('Leaderboard error:', err);
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading data</div>';
    });
    return;
  }"""

new_load_all = """if (currentLbScope === 'all') {
    // Check if filtering by specific class
    if (currentLbClassFilter && currentLbClassFilter !== 'all') {
      fbDb.ref('groups/' + currentLbClassFilter + '/members').once('value').then(function(snapshot) {
        const data = snapshot.val();
        if (!data) {
          listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">' + 
            'No members in ' + currentLbClassFilter + '</div>';
          return;
        }
        let members = Object.entries(data).map(([uid, d]) => ({uid, groupCode: currentLbClassFilter, ...d}));
        renderLeaderboardList(members, sortBy, isKo, listEl, true);
      }).catch(function(err) {
        console.log('Leaderboard error:', err);
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading data</div>';
      });
      return;
    }
    // Load ALL groups
    fbDb.ref('groups').once('value').then(function(snapshot) {
      const allGroups = snapshot.val();
      if (!allGroups) {
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">' + 
          'No members yet.' + '</div>';
        return;
      }
      let members = [];
      Object.entries(allGroups).forEach(([gCode, gData]) => {
        if (gData && gData.members) {
          Object.entries(gData.members).forEach(([uid, d]) => {
            members.push({uid, groupCode: gCode, ...d});
          });
        }
      });
      renderLeaderboardList(members, sortBy, isKo, listEl, true);
    }).catch(function(err) {
      console.log('Leaderboard error:', err);
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading data</div>';
    });
    return;
  }"""

content = content.replace(old_load_all, new_load_all)
print("Step 4: Modified loadLeaderboard to support class filtering")

with open('/home/ubuntu/teens-bible-app/firebase-deploy/social.js', 'w') as f:
    f.write(content)

print("\n Done! Class filter added to Leaderboard.")
