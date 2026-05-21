const fs = require('fs');
const files = ['index.html', 'package.json', 'vite.config.ts', 'src/components/layout/Navbar.tsx', 'src/components/layout/Sidebar.tsx', 'src/components/bins/BinDetailModal.tsx', 'functions/src/index.ts'];
for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/EcoSentinel/g, 'Sortify');
    content = content.replace(/ecosentinel/g, 'sortify');
    fs.writeFileSync(file, content);
  }
}
