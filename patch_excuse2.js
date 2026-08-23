const fs = require('fs');
let code = fs.readFileSync('new_ui_logic_clean.js', 'utf8');

code = code.replace(/processExcuse\(\$\{r\.id\},'approved'\)/g, "processExcuse('${r.id}','approved')");
code = code.replace(/processExcuse\(\$\{r\.id\},'rejected'\)/g, "processExcuse('${r.id}','rejected')");

fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('patched new_ui_logic_clean.js for processExcuse quotes');
