const fs = require('fs');
const path = require('path');
const glob = require('glob');

const featuresDir = path.join(__dirname, 'src', 'features');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Replace big wrapper class
  content = content.replace(/bg-white\/70 dark:bg-zinc-900\/70 backdrop-blur-xl border border-white\/80 dark:border-zinc-800\/50 rounded-\[1\.75rem\]/g, 'glass-panel');
  content = content.replace(/bg-white\/70 dark:bg-zinc-900\/70 backdrop-blur-xl rounded-\[1\.75rem\] border border-white\/80 dark:border-zinc-800\/50/g, 'glass-panel');
  content = content.replace(/bg-white\/70 dark:bg-zinc-900\/70 backdrop-blur-md border border-white\/80 dark:border-zinc-800\/50 rounded-2xl/g, 'glass-panel');
  content = content.replace(/bg-white\/70 dark:bg-zinc-900\/70 backdrop-blur-md/g, 'glass-panel');
  content = content.replace(/bg-white\/70 dark:bg-zinc-900\/70 backdrop-blur-xl border border-white\/80 dark:border-zinc-700\/50 rounded-2xl/g, 'glass-panel');
  content = content.replace(/bg-white\/70 dark:bg-zinc-900\/70 backdrop-blur-xl border border-white\/80 dark:border-zinc-800\/50 rounded-2xl/g, 'glass-panel');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(featuresDir);
