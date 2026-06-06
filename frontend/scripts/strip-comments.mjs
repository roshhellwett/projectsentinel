
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import ts from 'typescript';

const ROOTS = process.argv.slice(2);
if (ROOTS.length === 0) ROOTS.push('.');
const TARGET_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'types-build']);

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

function collectCommentRanges(src, scriptKind) {
  const fileName =
    scriptKind === ts.ScriptKind.TSX ? 'x.tsx' :
    scriptKind === ts.ScriptKind.JS ? 'x.js' : 'x.ts';
  const sf = ts.createSourceFile(
    fileName,
    src,
    ts.ScriptTarget.Latest,
     true,
    scriptKind,
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

function stripComments(src, scriptKind) {
  const ranges = collectCommentRanges(src, scriptKind);
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

const scriptKindMap = {
  '.tsx': ts.ScriptKind.TSX,
  '.ts':  ts.ScriptKind.TS,
  '.js':  ts.ScriptKind.JS,
  '.mjs': ts.ScriptKind.JS,
};

const files = ROOTS.flatMap((r) => walk(r));
let changed = 0;
for (const f of files) {
  const ext = extname(f);
  const orig = readFileSync(f, 'utf8');
  let next = stripComments(orig, scriptKindMap[ext] || ts.ScriptKind.TS);
  next = collapseBlankLines(next).replace(/[ \t]+$/gm, '');
  if (!next.endsWith('\n')) next += '\n';
  if (next !== orig) {
    writeFileSync(f, next, 'utf8');
    changed++;
  }
}
console.log(`processed ${files.length} files, rewrote ${changed}`);
