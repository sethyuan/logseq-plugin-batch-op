import { Button, Empty, Skeleton } from "@/components/antd"
import HierarchyIcon from "@/icons/hierarchy.svg"
import { t } from "logseq-l10n"
import styles from "./index.css"

export const PROCESS = 1
export const RESET = 2

export default function QueryResult({
  loading,
  data,
  mode,
  onProcess,
  onReset,
}) {
  return (
    <section class={styles.container}>
      <div class={styles.bar}>
        {data?.length > 0 && (
          <Button
            type="primary"
            onClick={mode === PROCESS ? onProcess : onReset}
          >
            {mode === PROCESS ? t("Process") : t("Reset")}
          </Button>
        )}
      </div>

      <div class={styles.results}>
        {loading ? (
          <Skeleton active />
        ) : data?.length > 0 ? (
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
  const content = data.content
    .replace(/\b[^:\n]+:: [^\n]+\n?/g, "")
    .replace(/:LOGBOOK:.+:END:/s, "")
  const properties = Object.entries(data.properties ?? {})

  return (
    <div class={styles.result}>
      <div
        class={styles.resultContent}
        dangerouslySetInnerHTML={{ __html: content.replaceAll("\n", "<br>") }}
      />
      {properties.length > 0 && (
        <div class={styles.resultProps}>
          {properties.map(([name, val]) => (
            <div>
              <span class={styles.resultPropName}>{name}</span>: {val}
            </div>
          ))}
        </div>
      )}
      {/* TODO data.parent is a logseq bug, should be data.children */}
      {data.parent?.length > 0 && (
        <div class={styles.hierarchy} title={t("Has sub-blocks")}>
          <HierarchyIcon width={16} height={16} />
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
