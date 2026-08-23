const fs = require('fs');
let code = fs.readFileSync('new_ui_logic_clean.js', 'utf8');

code = code.replace(/const GROUPS=\[/g, 'let GROUPS=[');
code = code.replace(/const STUDIES=\[/g, 'let STUDIES=[');
// Export them to window so custom_overrides and db_bridge can access them
code = code.replace(/const LOG_CATS=\[/, 'window.GROUPS = GROUPS; window.STUDIES = STUDIES; const LOG_CATS=[');

fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('patched GROUPS and STUDIES to let');
