const a = await (await fetch(new URL("./chunks/b64-0.txt", import.meta.url))).text();
const b = await (await fetch(new URL("./chunks/b64-1.txt", import.meta.url))).text();
const bin = Uint8Array.from(atob(a + b), c => c.charCodeAt(0));
const url = URL.createObjectURL(new Blob([bin], { type: "text/javascript" }));
await import(url);
