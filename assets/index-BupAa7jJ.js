const parts = [
  './chunks/b64-0.txt',
  './chunks/b64-1a.txt',
  './chunks/b64-1b.txt',
  './chunks/b64-1c.txt',
  './chunks/b64-1d.txt',
];
const texts = await Promise.all(parts.map((u) => fetch(u).then((r) => {
  if (!r.ok) throw new Error('failed ' + u);
  return r.text();
})));
const code = atob(texts.join(''));
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
await import(url);
