import re

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'r') as f:
    content = f.read()

# Replace the showPurchaseEffect function with an enhanced version
old_func = '''function showPurchaseEffect() {
  var colors = ['#FFD700','#FF6B35','#4ECDC4','#FF4081','#7C4DFF','#00E5FF','#FFEB3B','#E040FB'];
  var container = document.createElement('div');
  container.className = 'purchase-celebrate';
  for(var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    p.className = 'purchase-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.width = (6 + Math.random() * 10) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
  document.body.appendChild(container);
  var sparkle = document.createElement('div');
  sparkle.className = 'purchase-sparkle';
  sparkle.textContent = '\\u2728';
  document.body.appendChild(sparkle);
  setTimeout(function() { container.remove(); sparkle.remove(); }, 2000);
}'''

new_func = '''function showPurchaseEffect() {
  // Confetti burst
  var colors = ['#FFD700','#FF6B35','#4ECDC4','#FF4081','#7C4DFF','#00E5FF','#FFEB3B','#E040FB'];
  var container = document.createElement('div');
  container.className = 'purchase-celebrate';
  for(var i = 0; i < 40; i++) {
    var p = document.createElement('div');
    p.className = 'purchase-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = Math.random() * 0.5 + 's';
    var size = (6 + Math.random() * 10);
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(p);
  }
  document.body.appendChild(container);
  
  // Big sparkle emoji
  var sparkle = document.createElement('div');
  sparkle.className = 'purchase-sparkle';
  sparkle.textContent = '\\u2728';
  document.body.appendChild(sparkle);
  
  // Gem flying animation - gems fly from center to top-right (gem counter)
  for(var g = 0; g < 6; g++) {
    var gem = document.createElement('div');
    gem.className = 'purchase-gem-fly';
    gem.textContent = '\\uD83D\\uDC8E';
    gem.style.animationDelay = (g * 0.1) + 's';
    gem.style.left = (45 + Math.random() * 10) + '%';
    document.body.appendChild(gem);
    (function(el){ setTimeout(function(){ el.remove(); }, 1500); })(gem);
  }
  
  // Success toast
  var toast = document.createElement('div');
  toast.className = 'purchase-success-toast';
  toast.innerHTML = '\\u2705 Purchase Complete!';
  document.body.appendChild(toast);
  
  // Haptic feedback if available
  if(navigator.vibrate) navigator.vibrate([50, 30, 100]);
  
  setTimeout(function() { container.remove(); sparkle.remove(); toast.remove(); }, 2500);
}'''

content = content.replace(old_func, new_func)

# Add new CSS for the enhanced effects
new_css = '''
.purchase-gem-fly {
  position: fixed;
  top: 50%;
  font-size: 24px;
  z-index: 10002;
  pointer-events: none;
  animation: gemFlyUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
@keyframes gemFlyUp {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(30vw, -45vh) scale(0.3); opacity: 0; }
}
.purchase-success-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(16, 185, 129, 0.95);
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
  z-index: 10003;
  pointer-events: none;
  animation: toastSlideUp 0.4s ease-out forwards, toastFadeOut 0.4s ease-in 1.8s forwards;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}
@keyframes toastSlideUp {
  0% { transform: translateX(-50%) translateY(20px); opacity: 0; }
  100% { transform: translateX(-50%) translateY(0); opacity: 1; }
}
@keyframes toastFadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
'''

# Insert the new CSS before the closing </style> of the main style block
# Find the first </style> tag
style_end = content.find('</style>')
if style_end > 0:
    content = content[:style_end] + new_css + content[style_end:]
    print("✓ Added new CSS for gem fly and toast animations")

with open('/home/ubuntu/teens-bible-app/firebase-deploy/app.html', 'w') as f:
    f.write(content)

print("✓ Enhanced purchase effect with gem flying + success toast + haptic feedback")
