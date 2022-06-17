import { Button, Checkbox, Empty, Skeleton } from "@/components/antd"
import HierarchyIcon from "@/icons/hierarchy.svg"
import { t } from "logseq-l10n"
import { cls } from "reactutils"
import styles from "./index.css"

export const PROCESS = 1
export const RESET = 2

export default function QueryResult({
  loading,
  data,
  selection,
  mode,
  onProcess,
  onReset,
  onSelect,
  onSelectAll,
}) {
  function calcCheckAllStatus() {
    if (!selection?.length) return false
    let status = selection[0]
    for (let i = 1; i < selection.length; i++) {
      if (selection[i] !== status) return null
    }
    return status
  }

  const allChecked = calcCheckAllStatus()

  return (
    <section class={styles.container}>
      <div class={styles.bar}>
        {mode === RESET && data?.length > 0 ? (
          <Checkbox
            checked={allChecked}
            indeterminate={allChecked === null}
            onChange={onSelectAll}
          >
            {t("All")}
          </Checkbox>
        ) : (
          <div />
        )}
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
          data.map((block, i) => {
            if (block.page != null) {
              return (
                <BlockResult
                  key={i}
                  data={block}
                  checked={selection[i]}
                  index={i}
                  onSelect={onSelect}
                  showSelection={mode === RESET}
                />
              )
            } else {
              return (
                <PageResult
                  key={i}
                  data={block}
                  checked={selection[i]}
                  index={i}
                  onSelect={onSelect}
                  showSelection={mode === RESET}
                />
              )
            }
          })
        ) : (
          <Empty description={t("No Data")} />
        )}
      </div>
    </section>
  )
}

function BlockResult({ data, checked, index, onSelect, showSelection }) {
  const content = data.content
    .replace(/\b[^:\n]+:: [^\n]+\n?/g, "")
    .replace(/:LOGBOOK:.+:END:/s, "")
  const properties = Object.entries(data.properties ?? {})

  return (
    <div class={cls(styles.result, showSelection && styles.showSelection)}>
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
      {(data.children?.length || data.parent?.length) > 0 && (
        <div class={styles.hierarchy} title={t("Has sub-blocks")}>
          <HierarchyIcon width={20} height={20} />
        </div>
      )}
      {showSelection && (
        <Checkbox
          checked={checked}
          onChange={(e) => onSelect(index, e.target.checked)}
        />
      )}
    </div>
  )
}

function PageResult({ data, checked, index, onSelect, showSelection }) {
  const properties = Object.entries(data.properties ?? {})

  return (
    <div class={cls(styles.result, showSelection && styles.showSelection)}>
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
      <div class={styles.hierarchy} title={t("Has sub-blocks")}>
        <HierarchyIcon width={20} height={20} />
      </div>
      {showSelection && (
        <Checkbox
          checked={checked}
          onChange={(e) => onSelect(index, e.target.checked)}
        />
      )}
    </div>
  )
}
