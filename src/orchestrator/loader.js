const cache = {}

export async function loadAgent(name) {
  if (!cache[name]) {
    cache[name] = await import(`../agents/${name}/index.js`)
  }
  return cache[name]
}
