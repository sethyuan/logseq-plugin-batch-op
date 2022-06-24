import { camelToDash } from "@/libs/utils"
import styles from "./index.css"

export default function RenamePropsPagePreview({ data }) {
  const properties = Object.entries(data.properties ?? {})
  const markers = data.renamePropMarkers
  const nodes = []

  for (const [k, value] of properties) {
    const name = camelToDash(k)
    if (markers[name] != null) {
      nodes.push(
        <div>
          <span class={styles.propName}>
            <span class={styles.matched}>{name}</span>
            <span class={styles.substitution}>{markers[name]}</span>
          </span>
          : {value}
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
