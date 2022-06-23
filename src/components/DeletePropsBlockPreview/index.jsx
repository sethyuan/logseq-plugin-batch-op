import { cls } from "reactutils"
import styles from "./index.css"

export default function DeletePropsBlockPreview({ data }) {
  const content = data.content
  const markers = data.deletePropMarkers
  const lines = content.split("\n")
  const nodes = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (markers.has(i)) {
      nodes.push(<p class={cls(styles.p, styles.todelete)}>{line}</p>)
    } else {
      nodes.push(<p class={styles.p}>{line}</p>)
    }
  }

  return nodes
}
