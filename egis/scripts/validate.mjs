import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

function walk(dir, predicate, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target, predicate, found);
    else if (predicate(target)) found.push(target);
  }
  return found;
}

function validateHtml(file) {
  const source = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  const tags = source.matchAll(/<\/?([a-z][\w-]*)\b[^>]*>/gi);
  for (const match of tags) {
    const tag = match[1].toLowerCase();
    if (voidTags.has(tag) || match[0].endsWith('/>') || match[0].startsWith('<!')) continue;
    if (match[0].startsWith('</')) {
      const open = stack.pop();
      if (open !== tag) errors.push(`${path.relative(root, file)}: </${tag}> 앞의 열린 태그가 <${open ?? '없음'}>입니다.`);
    } else {
      stack.push(tag);
    }
  }
  if (stack.length) errors.push(`${path.relative(root, file)}: 닫히지 않은 태그 ${stack.join(', ')}`);

  if (/href=["']#["']/.test(source)) {
    errors.push(`${path.relative(root, file)}: 비어 있는 # 링크가 있습니다.`);
  }

  for (const match of source.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const id = match[0].match(/\bid=["']([^"']+)["']/i)?.[1];
    if (!id || !new RegExp(`<label\\b[^>]*\\bfor=["']${id}["']`, 'i').test(source)) {
      errors.push(`${path.relative(root, file)}: label 연결이 없는 ${match[1]} 요소가 있습니다 — ${id ?? 'id 없음'}`);
    }
  }
}

function validatePageReferences(file) {
  const source = fs.readFileSync(file, 'utf8');
  const attributes = source.matchAll(/(?:src|href|data-fragment)="([^"]+)"/g);
  for (const match of attributes) {
    const value = match[1];
    if (/^(?:https?:|#|mailto:|javascript:)/.test(value)) continue;
    const clean = value.split(/[?#]/)[0];
    const target = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target)) errors.push(`${path.relative(root, file)}: 참조 파일 없음 — ${value}`);
  }
}

function validateCssReferences(file) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g)) {
    const value = match[1].trim();
    if (/^(?:data:|https?:|#)/.test(value)) continue;
    const target = path.resolve(path.dirname(file), value.split(/[?#]/)[0]);
    if (!fs.existsSync(target)) errors.push(`${path.relative(root, file)}: CSS 참조 파일 없음 — ${value}`);
  }
}

for (const file of walk(root, (file) => file.endsWith('.html'))) validateHtml(file);
for (const file of [path.join(root, 'pages/main/index.html'), path.join(root, 'pages/map/index.html')]) validatePageReferences(file);
for (const file of walk(path.join(root, 'assets/css'), (file) => file.endsWith('.css'))) validateCssReferences(file);

const mapPage = fs.readFileSync(path.join(root, 'pages/map/index.html'), 'utf8');
const panelLayout = /fragments\/map-controls\.html"><\/div>\s*<\/div>\s*<div data-fragment="\.\/fragments\/selected-layer\.html"><\/div>\s*<div data-fragment="\.\/fragments\/background-map\.html"><\/div>/;
if (!panelLayout.test(mapPage)) {
  errors.push('pages/map/index.html: 레이어·배경지도 패널은 지도 캔버스 바깥의 stage 자식이어야 합니다.');
}

const mapCss = fs.readFileSync(path.join(root, 'assets/css/map.css'), 'utf8');
if (!mapCss.includes("@import url('./uikit/common/filter.css');")) {
  errors.push('assets/css/map.css: 통합검색 필터 공용 스타일 연결이 없습니다.');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('EGIS HTML structure and page references passed.');
