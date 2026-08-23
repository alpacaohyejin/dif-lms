const fs = require('fs');
const content = fs.readFileSync('C:/Users/오예진/Downloads/dif-management (7).html', 'utf8');
const styleMatch = content.replace(/<style>([\s\S]*?)<\/style>/, '<link rel="stylesheet" href="css/style.css">');
const scriptMatch = styleMatch.replace(/<script>([\s\S]*?)<\/script>/, '<script type="module" src="js/app.js"></script>');
fs.writeFileSync('c:/Users/오예진/Desktop/AX교육/dif-web/index.html', scriptMatch);
