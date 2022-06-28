import { Button, Checkbox, Empty, Skeleton } from "@/components/antd"
import DeletePropsBlockPreview from "@/components/DeletePropsBlockPreview"
import DeletePropsPagePreview from "@/components/DeletePropsPagePreview"
import RenamePropsBlockPreview from "@/components/RenamePropsBlockPreview"
import RenamePropsPagePreview from "@/components/RenamePropsPagePreview"
import ReplaceBlockPreview from "@/components/ReplaceBlockPreview"
import WritePropsBlockPreview from "@/components/WritePropsBlockPreview"
import WritePropsPagePreview from "@/components/WritePropsPagePreview"
import HierarchyIcon from "@/icons/hierarchy.svg"
import { camelToDash } from "@/libs/utils"
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
  tab,
}) {
  function getCheckedNum() {
    if (!selection?.length) return 0
    return selection.reduce((total, checked) => total + checked, 0)
  }

  const checkedNum = getCheckedNum()

  return (
    <section class={styles.container}>
      <div class={styles.bar}>
        {mode === RESET && data?.length > 0 ? (
          <Checkbox
            checked={checkedNum === data.length}
            indeterminate={checkedNum < data.length && checkedNum > 0}
            onChange={onSelectAll}
          >
            {t("All")}
          </Checkbox>
        ) : (
          <div />
        )}
        {data?.length > 0 && (
          <div>
            <span class={styles.count}>
              <span
                class={cls(styles.selCount, mode === RESET && styles.showSel)}
              >
                {checkedNum} /{" "}
              </span>
              {data.length}
            </span>
            <Button
              type="primary"
              onClick={mode === PROCESS ? onProcess : onReset}
            >
              {mode === PROCESS ? t("Process") : t("Reset")}
            </Button>
          </div>
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
                  rootData={data}
                  checked={selection[i]}
                  index={i}
                  onSelect={onSelect}
                  showSelection={mode === RESET}
                  tab={tab}
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
                  tab={tab}
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

function BlockResult({
  data,
  rootData,
  checked,
  index,
  onSelect,
  showSelection,
  tab,
}) {
  const content = data.content

  let view
  if (tab === "delete-prop" && data.deletePropMarkers != null) {
    view = <DeletePropsBlockPreview data={data} />
  } else if (tab === "rename-prop" && data.renamePropMarkers != null) {
    view = <RenamePropsBlockPreview data={data} />
  } else if (tab === "write-prop" && data.writePropMarkers != null) {
    view = <WritePropsBlockPreview data={data} />
  } else if (tab === "replace-content" && data.searchMarkers != null) {
    view = <ReplaceBlockPreview data={data} rootData={rootData} />
  } else {
    view = content.split("\n").map((line, i) => (
      <p key={i} class={styles.resultContentP}>
        {line}
      </p>
    ))
  }

  return (
    <div class={cls(styles.result, showSelection && styles.showSelection)}>
      <div class={styles.resultContent}>{view}</div>
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

function PageResult({ data, checked, index, onSelect, showSelection, tab }) {
  const properties = Object.entries(data.properties ?? {})

  let view
  if (tab === "delete-prop" && data.deletePropMarkers != null) {
    view = <DeletePropsPagePreview data={data} />
  } else if (tab === "rename-prop" && data.renamePropMarkers != null) {
    view = <RenamePropsPagePreview data={data} />
  } else if (tab === "write-prop" && data.writePropMarkers != null) {
    view = <WritePropsPagePreview data={data} />
  } else {
    view = properties.map(([name, val], i) => (
      <div key={i}>
        <span class={styles.resultPropName}>{camelToDash(name)}</span>:{" "}
        {Array.isArray(val) ? val.join(", ") : val}
      </div>
    ))
  }

  return (
    <div class={cls(styles.result, showSelection && styles.showSelection)}>
      <>
        <div class={styles.resultContent}>{data.name}</div>
        {properties.length > 0 && <div class={styles.resultProps}>{view}</div>}
      </>
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
