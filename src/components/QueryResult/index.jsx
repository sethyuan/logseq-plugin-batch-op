import { Button, Empty } from "@/components/antd"
import { t } from "logseq-l10n"
import { useState } from "preact/hooks"
import styles from "./index.css"

const PROCESS = 1
const RESET = 2

export default function QueryResult({ data, onProcess, onReset }) {
  const [mode, setMode] = useState(PROCESS)

  function toggleMode() {
    if (mode === PROCESS) {
      setMode(RESET)
      onProcess()
    } else {
      setMode(PROCESS)
      onReset()
    }
  }

  return (
    <section class={styles.container}>
      <div class={styles.bar}>
        {data?.length > 0 && (
          <Button type="primary" onClick={toggleMode}>
            {mode === PROCESS ? t("Process") : t("Reset")}
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
  const properties = Object.entries(data.properties ?? {})

  return (
    <div class={styles.result}>
      <div class={styles.resultContent} title={content}>
        {content}
      </div>
      {properties.length > 0 && (
        <div class={styles.resultProps}>
          {properties.map(([name, val]) => (
            <div>
              <span class={styles.resultPropName}>{name}</span>: {val}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PageResult({ data }) {
  const properties = Object.entries(data.properties ?? {})

  return (
    <div class={styles.result}>
      <div class={styles.resultContent}>{data.name}</div>
      {properties.length > 0 && (
        <div class={styles.resultProps}>
          {properties.map(([name, val]) => (
            <div>
              <span class={styles.resultPropName}>{name}</span>: {val}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
