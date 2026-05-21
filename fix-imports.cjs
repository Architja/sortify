const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk(path.join(__dirname, 'src'));
let totalFixed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import { Something } from '../types' with import type { Something } from '../types'
  const newContent = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]*types)['"]/g, (match, imports, modulePath) => {
    return 'import type { ' + imports + ' } from \'' + modulePath + '\'';
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed types import in', file);
    totalFixed++;
  }
});

// Also fix LoginPage react-form to react-hook-form
const loginPagePath = path.join(__dirname, 'src', 'pages', 'LoginPage.tsx');
if (fs.existsSync(loginPagePath)) {
  let loginContent = fs.readFileSync(loginPagePath, 'utf8');
  const fixedLoginContent = loginContent.replace(/from\s+['"]react-form['"]/g, "from 'react-hook-form'");
  if (loginContent !== fixedLoginContent) {
    fs.writeFileSync(loginPagePath, fixedLoginContent, 'utf8');
    console.log('Fixed react-hook-form import in LoginPage.tsx');
  }
}

const signupPagePath = path.join(__dirname, 'src', 'pages', 'SignupPage.tsx');
if (fs.existsSync(signupPagePath)) {
  let signupContent = fs.readFileSync(signupPagePath, 'utf8');
  const fixedSignupContent = signupContent.replace(/from\s+['"]\.\.\/\.\.\/services\/auth\.service['"]/g, "from '../services/auth.service'");
  if (signupContent !== fixedSignupContent) {
    fs.writeFileSync(signupPagePath, fixedSignupContent, 'utf8');
    console.log('Fixed auth service import in SignupPage.tsx');
  }
}

// Ensure the first line of LoginPage.tsx import has useForm as well, wait, LoginPage already has:
// import { useForm as useRHForm } from 'react-hook-form';
// Wait, the error said `Failed to resolve import "react-form" from "src/pages/LoginPage.tsx"`.
// I need to double check the actual line it was complaining about. In my view_file output it was `import { useForm as useRHForm } from 'react-hook-form';` which was already correct! It must have been fixed earlier by the other agent.

console.log(`Finished fixing ${totalFixed} files.`);
