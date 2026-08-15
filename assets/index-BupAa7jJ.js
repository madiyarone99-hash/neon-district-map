const n = 6;
const parts = await Promise.all(
  Array.from({ length: n }, (_, i) =>
    fetch(new URL(`./chunks/part-${i}.js`, import.meta.url)).then((r) => {
      if (!r.ok) throw new Error(`Failed to load chunk ${i}: ${r.status}`);
      return r.text();
    })
  )
);
const code = parts.join("");
const blob = new Blob([code], { type: "text/javascript" });
const url = URL.createObjectURL(blob);
await import(url);
