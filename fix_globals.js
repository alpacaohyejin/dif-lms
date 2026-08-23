const fs = require('fs');
const uiCode = fs.readFileSync('c:/Users/오예진/Desktop/AX교육/dif-web/new_ui_logic_clean.js', 'utf8');

let globals = [];
let match;

const funcRegex = /^function\s+([a-zA-Z0-9_]+)\s*\(/gm;
while ((match = funcRegex.exec(uiCode)) !== null) {
    globals.push(`window.${match[1]} = ${match[1]};`);
}

const constRegex = /^const\s+([a-zA-Z0-9_]+)\s*=/gm;
while ((match = constRegex.exec(uiCode)) !== null) {
    globals.push(`window.${match[1]} = ${match[1]};`);
}

const letRegex = /^let\s+([a-zA-Z0-9_]+)\s*=/gm;
while ((match = letRegex.exec(uiCode)) !== null) {
    globals.push(`window.${match[1]} = ${match[1]};`);
}

fs.writeFileSync('c:/Users/오예진/Desktop/AX교육/dif-web/make_globals_fixed.js', globals.join('\n'));
