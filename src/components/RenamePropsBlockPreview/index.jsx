import styles from "./index.css"

export default function RenamePropsBlockPreview({ data }) {
  const content = data.content
  const markers = data.renamePropMarkers
  const lines = content.split("\n")
  const nodes = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (markers.has(i)) {
      const index = line.indexOf("::")
      if (index >= 0) {
        nodes.push(
          <p class={styles.p}>
            <span class={styles.matched}>{line.substring(0, index)}</span>
            <span class={styles.substitution}>{markers.get(i)}</span>::
            {line.substring(index + 2)}
          </p>,
        )
      }
    } else {
      nodes.push(<p class={styles.p}>{line}</p>)
    }
  }

  return nodes
}
