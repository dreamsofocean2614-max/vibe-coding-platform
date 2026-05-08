import fs from 'fs';
import path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Replace the specific `min-h-screen bg...` classes with `min-h-screen` plain
  newContent = newContent
    .replace(/min-h-screen\s+bg-leaf-50\s+dark:bg-([a-zA-Z0-9\-\[\]\#]+)/g, 'min-h-screen bg-transparent')
    .replace(/min-h-screen\s+p-8\s+text-center\s+bg-leaf-50\s+dark:bg-leaf-950/g, 'min-h-screen p-8 text-center bg-transparent')
    .replace(/bg-leaf-50\s+dark:bg-([a-zA-Z0-9\-\[\]\#]+)/g, 'bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm')
    .replace(/bg-leaf-100\s+dark:bg-([a-zA-Z0-9\-\[\]\#]+)/g, 'bg-white/40 dark:bg-leaf-800/40')
    .replace(/bg-white\s+dark:bg-([a-zA-Z0-9\-\[\]\#]+)/g, 'bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md')
    .replace(/SeasonEffect/g, 'ThemeEffect');
    
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
});
