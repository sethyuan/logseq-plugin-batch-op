import { cls } from "reactutils"
import styles from "./index.css"

export default function WritePropsBlockPreview({ data }) {
  const content = data.content
  const markers = data.writePropMarkers
  const lines = content.split("\n")
  const nodes = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (markers.replaced.has(i)) {
      nodes.push(
        <p class={cls(styles.p, styles.matched)}>{line}</p>,
        <p class={cls(styles.p, styles.substitution)}>
          {markers.replaced.get(i)}
        </p>,
      )
    } else {
      nodes.push(<p class={styles.p}>{line}</p>)
    }
  }

  for (const line of markers.added) {
    nodes.push(<p class={cls(styles.p, styles.substitution)}>{line}</p>)
  }

  return nodes
}
