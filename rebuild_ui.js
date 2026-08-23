const fs = require('fs');
let code = fs.readFileSync('new_ui_logic.js', 'utf8');

// 1. Remove GROUPS and STUDIES constants
code = code.replace(/const GROUPS=\[.*?\];/g, '');
code = code.replace(/const STUDIES=\[.*?\];/g, '');

// 2. Replace references
code = code.replace(/\bGROUPS\b/g, 'DB.groups');
code = code.replace(/\bSTUDIES\b/g, 'DB.studies');

// 3. change isAdmin(u) to canMng(u) for add-member-btn
code = code.replace(/document\.getElementById\('add-member-btn'\)\.style\.display=isAdmin\(u\)\?'inline-block':'none';/g,
                    "document.getElementById('add-member-btn').style.display=canMng(u)?'inline-block':'none';");

// 4. In renderAdmin, append renderAdminSettings()
code = code.replace(/<\/div>\`\)\.join\(''\);\s*\}/g,
                    "</div>`).join('');\n  if(typeof renderAdminSettings === 'function') renderAdminSettings();\n}");

// 5. In renderAdmin, add the "편집" button to admin-ranks
code = code.replace(/<span class="rank \$\{rCls\(m\.rank\)\}">\$\{m\.rank\}<\/span>/g,
                    `<span class="rank \${rCls(m.rank)}">\${m.rank}</span><button class="btn btn-o btn-sm" onclick="openMemberModal('\${m.id}')" style="margin-left:8px;">편집</button>`);

// 6. Fix quotes for openMemberModal and viewMemberProfile
code = code.replace(/onclick="openMemberModal\(\$\{m\.id\}\)"/g, "onclick=\"openMemberModal('${m.id}')\"");
code = code.replace(/onclick="viewMemberProfile\(\$\{m\.id\}\)"/g, "onclick=\"viewMemberProfile('${m.id}')\"");
code = code.replace(/onclick="approveMember\(\$\{m\.id\}\)"/g, "onclick=\"approveMember('${m.id}')\"");
code = code.replace(/onclick="rejectMember\(\$\{m\.id\}\)"/g, "onclick=\"rejectMember('${m.id}')\"");

// 7. Rename local openMemberModal and saveMember to old_openMemberModal and old_saveMember
// so they do not conflict with the global ones!
code = code.replace(/function openMemberModal\(/g, "function old_openMemberModal(");
code = code.replace(/function saveMember\(/g, "function old_saveMember(");

// 8. Fix excuse quotes
code = code.replace(/processExcuse\(\$\{r\.id\},'approved'\)/g, "processExcuse('${r.id}','approved')");
code = code.replace(/processExcuse\(\$\{r\.id\},'rejected'\)/g, "processExcuse('${r.id}','rejected')");


fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('Successfully rebuilt new_ui_logic_clean.js');
