import styles from "./index.css"

export default function ReplaceBlockPreview({ data, rootData }) {
  const content = data.content
  const markers = data.searchMarkers
  const replacement = rootData.searchReplacement ?? ""

  let index = 0
  const nodes = []

  for (const [start, end] of markers) {
    const raw = content.substring(index, start)
    addLineNodes(nodes, raw)

    const matched = content.substring(start, end)
    const matchedNodes = []
    addLineNodes(matchedNodes, matched)
    nodes.push(<span class={styles.matched}>{matchedNodes}</span>)
    nodes.push(<span class={styles.substitution}>{replacement}</span>)

    index = end
  }
  const rest = content.substring(index)
  addLineNodes(nodes, rest)

  return nodes
}

function addLineNodes(nodes, str) {
  const lines = str.split("\n")
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i]
    nodes.push(<span>{line}</span>)
    nodes.push(<br />)
  }
  nodes.push(<span>{lines[lines.length - 1]}</span>)
}
