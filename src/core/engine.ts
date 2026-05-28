import * as fs from 'fs';
import * as path from 'path';
import { PointHttpOptions } from '../types';
import { getHtmlTemplate } from './template';


function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (file.endsWith('.http')) {
      results.push(filePath);
    }
  });

  return results;
}

export function render(options: PointHttpOptions): string {
  const modulesDirOption = options.modulesDir || ['src'];
  const dirs = Array.isArray(modulesDirOption) ? modulesDirOption : [modulesDirOption];

  const files: Array<{ relativePath: string; content: string }> = [];

  dirs.forEach((dir) => {
    const absoluteDir = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);

    if (!fs.existsSync(absoluteDir)) {
      console.warn(`[PointHTTP] Directory does not exist: ${absoluteDir}`);
      return;
    }

    getFilesRecursively(absoluteDir).forEach((filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        files.push({ relativePath, content });
      } catch (err) {
        console.warn(`[PointHTTP] Failed to read file: ${filePath}`, err);
      }
    });
  });

  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  return getHtmlTemplate(options, files);
}