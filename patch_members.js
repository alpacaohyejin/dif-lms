const fs = require('fs');
let code = fs.readFileSync('new_ui_logic_clean.js', 'utf8');

// 1. Patch add-member-btn to use canMng(u) instead of isAdmin(u)
code = code.replace(/document\.getElementById\('add-member-btn'\)\.style\.display=isAdmin\(u\)\?'inline-block':'none';/, 
                    "document.getElementById('add-member-btn').style.display=canMng(u)?'inline-block':'none';");

// 2. Patch admin-ranks in renderAdmin to include Edit button
code = code.replace(/<span class="rank \$\{rCls\(m\.rank\)\}">\$\{m\.rank\}<\/span>/, 
                    `<span class="rank \${rCls(m.rank)}">\${m.rank}</span><button class="btn btn-o btn-sm" onclick="openMemberModal('\${m.id}')" style="margin-left:8px;">편집</button>`);

// 3. Let's just remove the local openMemberModal and saveMember from new_ui_logic_clean.js
// so that the global ones in custom_overrides.js are used naturally!
code = code.replace(/function openMemberModal\(userId\)\{[\s\S]*?function saveMember\(userId\)\{[\s\S]*?\}\s*function renderNotiLog/g, "function renderNotiLog");

fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('Patched new_ui_logic_clean.js successfully');
