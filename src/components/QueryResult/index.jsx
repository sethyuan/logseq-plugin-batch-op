import { Button, Empty } from "@/components/antd"
import { t } from "logseq-l10n"
import styles from "./index.css"

export default function QueryResult({ data, onProcess }) {
  return (
    <section class={styles.container}>
      <div class={styles.bar}>
        {data?.length > 0 && (
          <Button type="primary" onClick={onProcess}>
            {t("Process")}
          </Button>
        )}
      </div>

      <div class={styles.results}>
        {data?.length > 0 ? (
          data.map((block) => {
            if (block.page != null) {
              return <BlockResult data={block} />
            } else {
              return <PageResult data={block} />
            }
          })
        ) : (
          <Empty description={t("No Data")} />
        )}
      </div>
    </section>
  )
}

function BlockResult({ data }) {
  const content = data.content.replace(/\b[^:\n]+:: [^\n]+/g, "")
  return (
    <div class={styles.result}>
      <div class={styles.resultContent}>{content}</div>
      <div class={styles.resultProps}>
        {Object.entries(data.properties).map(([name, val]) => (
          <div>
            <span class={styles.resultPropName}>{name}</span>: {val}
          </div>
        ))}
      </div>
    </div>
  )
}

function PageResult({ data }) {
  return (
    <div class={styles.result}>
      <div class={styles.resultContent}>{data.name}</div>
      <div class={styles.resultProps}>
        {Object.entries(data.properties).map(([name, val]) => (
          <div>
            <span class={styles.resultPropName}>{name}</span>: {val}
          </div>
        ))}
      </div>
    </div>
  )
}
