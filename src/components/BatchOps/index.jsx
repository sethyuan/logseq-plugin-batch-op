import { Button } from "@/components/antd"
import styles from "./index.css"

export default function BatchOps({ onDone }) {
  return (
    <section class={styles.container}>
      <div class={styles.bar}></div>
      <div>
        Batch processing
        <Button onClick={onDone}>Reset</Button>
      </div>
    </section>
  )
}
