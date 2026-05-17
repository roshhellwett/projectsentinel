// last edited 2026-05-17 by roshhellwett
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import ts from 'typescript';

const HEADER = '// last edited 2026-05-17 by roshhellwett';
const ROOTS = process.argv.slice(2);
if (ROOTS.length === 0) ROOTS.push('.');
const TARGET_EXTS = new Set(['.ts', '.tsx']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'scripts', 'types-build']);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      out.push(...walk(full));
    } else if (TARGET_EXTS.has(extname(name))) {
      out.push(full);
    }
  }
  return out;
}

function collectCommentRanges(src, isTsx) {
  const sf = ts.createSourceFile(
    isTsx ? 'x.tsx' : 'x.ts',
    src,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ true,
    isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const ranges = [];
  const seen = new Set();
  const addRanges = (rs) => {
    if (!rs) return;
    for (const r of rs) {
      const key = r.pos + ':' + r.end;
      if (seen.has(key)) continue;
      seen.add(key);
      ranges.push([r.pos, r.end]);
    }
  };
  function visit(node) {
    addRanges(ts.getLeadingCommentRanges(src, node.pos));
    addRanges(ts.getTrailingCommentRanges(src, node.end));
    if (
      node.kind === ts.SyntaxKind.JsxExpression &&
      !node.expression
    ) {
      ranges.push([node.pos, node.end]);
      seen.add(node.pos + ':' + node.end);
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  addRanges(ts.getLeadingCommentRanges(src, sf.endOfFileToken.pos));
  return ranges;
}

function stripComments(src, isTsx) {
  const ranges = collectCommentRanges(src, isTsx);
  if (ranges.length === 0) return src;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of ranges) {
    const top = merged[merged.length - 1];
    if (top && r[0] <= top[1]) {
      top[1] = Math.max(top[1], r[1]);
    } else {
      merged.push([r[0], r[1]]);
    }
  }
  let out = '';
  let last = 0;
  for (const [start, end] of merged) {
    out += src.slice(last, start);
    last = end;
  }
  out += src.slice(last);
  return out;
}

function collapseBlankLines(s) {
  return s.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}

function addHeader(src) {
  const lines = src.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  const directiveRe = /^\s*['"]use (client|server|strict)['"]\s*;?\s*$/;
  const inserts = [];
  while (i < lines.length && directiveRe.test(lines[i])) {
    inserts.push(lines[i]);
    i++;
  }
  while (i < lines.length && lines[i].trim() === '') i++;
  const body = lines.slice(i).join('\n').replace(/^\n+/, '');
  const head = inserts.length > 0 ? inserts.join('\n') + '\n\n' : '';
  return head + HEADER + '\n\n' + body;
}

const files = ROOTS.flatMap((r) => walk(r));
let changed = 0;
for (const f of files) {
  const orig = readFileSync(f, 'utf8');
  const isTsx = f.endsWith('.tsx');
  let next = stripComments(orig, isTsx);
  next = collapseBlankLines(next).replace(/[ \t]+$/gm, '');
  next = addHeader(next);
  if (!next.endsWith('\n')) next += '\n';
  if (next !== orig) {
    writeFileSync(f, next, 'utf8');
    changed++;
  }
}
console.log(`processed ${files.length} files, rewrote ${changed}`);
