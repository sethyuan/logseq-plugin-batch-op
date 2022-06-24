import { camelToDash } from "@/libs/utils"
import styles from "./index.css"

export default function DeletePropsPagePreview({ data }) {
  const properties = Object.entries(data.properties ?? {})
  const markers = data.deletePropMarkers
  const nodes = []

  for (let i = 0; i < properties.length; i++) {
    const [k, value] = properties[i]
    const name = camelToDash(k)
    if (markers.has(i)) {
      nodes.push(
        <div class={styles.todelete}>
          <span class={styles.propName}>{name}</span>: {value}
        </div>,
      )
    } else {
      nodes.push(
        <div>
          <span class={styles.propName}>{name}</span>: {value}
        </div>,
      )
    }
  }

  return nodes
}
