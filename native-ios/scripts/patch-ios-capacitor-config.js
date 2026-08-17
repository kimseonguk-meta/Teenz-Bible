const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'ios', 'App', 'App', 'capacitor.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const pluginClasses = Array.isArray(config.packageClassList) ? config.packageClassList : [];

config.packageClassList = pluginClasses
  .filter((pluginClass) => pluginClass !== 'FirebaseAuthenticationPlugin')
  .filter((pluginClass, index, list) => list.indexOf(pluginClass) === index);

if (!config.packageClassList.includes('TeenzFirebaseAuthenticationPlugin')) {
  config.packageClassList.unshift('TeenzFirebaseAuthenticationPlugin');
}

fs.writeFileSync(configPath, `${JSON.stringify(config, null, '\t')}\n`);
console.log('Patched iOS Capacitor plugin registration: TeenzFirebaseAuthenticationPlugin enabled.');
