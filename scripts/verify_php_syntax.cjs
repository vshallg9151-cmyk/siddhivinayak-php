const fs = require('fs');
const path = require('path');
const engine = require('php-parser');

const parser = new engine({
  parser: {
    extractDoc: true,
    php7: true
  },
  ast: {
    withPositions: true
  }
});

const phpDirs = [
  path.join(__dirname, '..', 'api'),
  path.join(__dirname, '..', 'config')
];

function getPhpFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getPhpFiles(fullPath));
    } else if (file.endsWith('.php')) {
      results.push(fullPath);
    }
  });
  return results;
}

let totalFiles = 0;
let errors = 0;

phpDirs.forEach(dir => {
  const files = getPhpFiles(dir);
  files.forEach(filePath => {
    totalFiles++;
    const content = fs.readFileSync(filePath, 'utf8');
    try {
      parser.parseCode(content, path.basename(filePath));
      console.log(`[PASS] ${path.relative(path.join(__dirname, '..'), filePath)}`);
    } catch (e) {
      console.error(`[FAIL] ${path.relative(path.join(__dirname, '..'), filePath)}: ${e.message} at line ${e.lineNumber}`);
      errors++;
    }
  });
});

console.log(`\nPHP Syntax Check Completed: ${totalFiles - errors}/${totalFiles} passed. ${errors} error(s).`);
if (errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
