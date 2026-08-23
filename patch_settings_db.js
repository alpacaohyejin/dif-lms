const fs = require('fs');
let code = fs.readFileSync('new_ui_logic_clean.js', 'utf8');

// Replace the definitions
code = code.replace(/let GROUPS=\[(.*?)\];/, "DB.groups=['$1'.replace(/','/g, \"','\")];".replace(/'/g, "")); 
// The regex above might be tricky, let's just do direct replace
code = code.replace("let GROUPS=['메인 프로젝트 - 1조','메인 프로젝트 - 2조','메인 프로젝트 - 3조','메인 프로젝트 - 4조','메인 프로젝트 - 5조'];", "");
code = code.replace("let STUDIES=['포토샵 스터디','일러스트 스터디'];", "");
code = code.replace("window.GROUPS = GROUPS; window.STUDIES = STUDIES; ", "");

// Initialize them in DB definition
code = code.replace("const DB={", "const DB={ groups:['메인 프로젝트 - 1조','메인 프로젝트 - 2조','메인 프로젝트 - 3조','메인 프로젝트 - 4조','메인 프로젝트 - 5조'], studies:['포토샵 스터디','일러스트 스터디'],");

// Replace all usages
code = code.replace(/\bGROUPS\b/g, "DB.groups");
code = code.replace(/\bSTUDIES\b/g, "DB.studies");

fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('patched GROUPS/STUDIES to DB.groups/DB.studies');
