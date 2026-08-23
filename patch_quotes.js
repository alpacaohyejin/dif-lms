const fs = require('fs');
let code = fs.readFileSync('new_ui_logic_clean.js', 'utf8');

// The original line looks like: onclick="openMemberModal(${m.id})"
// We need it to be: onclick="openMemberModal('${m.id}')"
code = code.replace(/onclick="openMemberModal\(\$\{m\.id\}\)"/g, "onclick=\"openMemberModal('${m.id}')\"");
// Also check for viewMemberProfile just in case
code = code.replace(/onclick="viewMemberProfile\(\$\{m\.id\}\)"/g, "onclick=\"viewMemberProfile('${m.id}')\"");

fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('Patched new_ui_logic_clean.js quotes');
