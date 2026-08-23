const fs = require('fs');
let content = fs.readFileSync('firebase_init.js', 'utf8') + '\n\n' +
              fs.readFileSync('db_bridge.js', 'utf8') + '\n\n' +
              fs.readFileSync('new_ui_logic_clean.js', 'utf8') + '\n\n' +
              fs.readFileSync('make_globals_fixed.js', 'utf8') + '\n\n' +
              fs.readFileSync('custom_overrides.js', 'utf8');
fs.writeFileSync('js/app.js', content);
