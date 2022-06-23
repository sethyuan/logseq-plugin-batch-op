import styles from "./index.css"

export default function WritePropsPagePreview({ data }) {
  const properties = Object.entries(data.properties ?? {})
  const markers = data.writePropMarkers
  const nodes = []

  for (const [name, value] of properties) {
    if (markers.replaced[name] != null) {
      nodes.push(
        <div class={styles.matched}>
          <span class={styles.propName}>{name}</span>: {value}
        </div>,
        <div class={styles.substitution}>
          <span class={styles.propName}>{name}</span>: {markers.replaced[name]}
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

  for (const [name, value] of Object.entries(markers.added)) {
    nodes.push(
      <div class={styles.substitution}>
        <span class={styles.propName}>{name}</span>: {value}
      </div>,
    )
  }

  return nodes
}
