const fs = require('fs');
let code = fs.readFileSync('new_ui_logic_clean.js', 'utf8');

// Replace delAsg parameter in renderAssignments
code = code.replace(/onclick="delAsg\(\$\{a\.id\}\)"/g, 'onclick="delAsg(\'${a.id}\')"');

// Rename the local delAsg to prevent conflict since I will override it globally
code = code.replace(/function delAsg\(/g, 'function localDelAsg(');

fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('Modified new_ui_logic_clean.js');
