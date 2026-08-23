const fs = require('fs');
let code = fs.readFileSync('new_ui_logic_clean.js', 'utf8');

// Patch renderAdmin to include renderAdminSettings()
code = code.replace(/document\.getElementById\('admin-ns'\)\.innerHTML=.*?join\(''\);/s, `$&
  if(typeof renderAdminSettings === 'function') renderAdminSettings();
`);

fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('patched renderAdmin in new_ui_logic_clean.js');
