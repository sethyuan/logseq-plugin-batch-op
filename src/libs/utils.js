export function camelToDash(str) {
  const buffer = []
  const len = str.length
  let lastOffset = 0
  for (let i = 0; i < len; i++) {
    const char = str.charAt(i)
    if (/[A-Z]/.test(char)) {
      buffer.push(str.substring(lastOffset, i))
      buffer.push("-")
      buffer.push(char.toLowerCase())
      lastOffset = i + 1
    }
  }
  buffer.push(str.substring(lastOffset))
  return buffer.join("")
}
