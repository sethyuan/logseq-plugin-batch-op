export function camelToDash(str) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

export function dashToCamel(str) {
  return str.replace(/(?:-|_)([a-z])/g, (m, c) => c.toUpperCase())
}
