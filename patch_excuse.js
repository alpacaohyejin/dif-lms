const fs = require('fs');
let code = fs.readFileSync('new_ui_logic_clean.js', 'utf8');

const emptyBlock = `if(!pending.length){
    ep.innerHTML = \`<div class="card"><div class="c-hd"><div class="c-title">📋 사유 불참 신청 대기 (0건)</div></div>
      <div class="tm" style="text-align:center;padding:1rem;">대기 중인 사유 불참 신청이 없습니다.</div>
    </div>\`;
    return;
  }`;

code = code.replace(`if(!pending.length){ep.innerHTML='';return;}`, emptyBlock);

fs.writeFileSync('new_ui_logic_clean.js', code);
console.log('Modified new_ui_logic_clean.js');
