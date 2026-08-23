const fs = require('fs');
let css = fs.readFileSync('css/style_new.css', 'utf8');

// Replace font
css = css.replace(/@import url\('[^']+'\);/, "@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');");
css = css.replace(/'Noto Sans KR'/g, "'Pretendard'");

// Replace border-radius variables to match old style
css = css.replace(/--r-sm:4px;--r-md:8px;--r-lg:12px;/, "--r-sm:6px;--r-md:12px;--r-lg:24px;");

// Replace shadows
css = css.replace(/box-shadow:0 1px 3px rgba\(0,0,0,0\.1\)/g, "box-shadow: 0 4px 8px rgba(0,0,0,0.1)");

fs.writeFileSync('css/style.css', css);
console.log('Successfully wrote css/style.css, length: ' + css.length);
