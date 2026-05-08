import fs from 'fs';
import path from 'path';

const map: Record<string, string> = {
  '#0f1712': 'leaf-950',
  '#0f1014': 'leaf-950',
  '#0a0f0c': 'leaf-950',
  '#162019': 'leaf-900',
  '#1a231d': 'leaf-900',
  '#1d2b21': 'leaf-800',
  '#233529': 'leaf-700',
  '#2a3f31': 'leaf-600',
  '#3E5242': 'leaf-500',
  '#6e8573': 'leaf-400',
  '#A8D5BA': 'leaf-300',
  '#E9F0E9': 'leaf-200',
  '#4A7C59': 'leaf-600',
};

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  content = content.replace(/dark:(bg|text|border|fill|hover:bg|hover:text|hover:border|placeholder|divide|group-focus-within:text|group-focus-within:border|focus:ring|shadow)-\[([^\]]+)\]/gi, (match, prefix, hex) => {
    const key = hex.toLowerCase();
    const mapped = Object.keys(map).find(k => k.toLowerCase() === key);
    if (mapped) {
      changed = true;
      return `dark:${prefix}-${map[mapped]}`;
    }
    return match;
  });
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
