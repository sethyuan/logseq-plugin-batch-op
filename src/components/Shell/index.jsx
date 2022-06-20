import { ConfigProvider, message, zhCN } from "@/components/antd"
import BatchOps from "@/components/BatchOps"
import QueryInput, { SIMPLE } from "@/components/QueryInput"
import QueryResult, { PROCESS, RESET } from "@/components/QueryResult"
import CloseIcon from "@/icons/close.svg"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { t } from "logseq-l10n"
import { useState } from "preact/hooks"
import { cls } from "reactutils"
import styles from "./index.css"

export default function Shell({ locale }) {
  const [inputShown, setInputShown] = useState(true)
  const [opShown, setOpShown] = useState(false)
  const [queryResultMode, setQueryResultMode] = useState(PROCESS)
  const [queryResults, setQueryResults] = useState(null)
  const [resultsSelection, setResultsSelection] = useState(null)
  const [panelsRef] = useAutoAnimate()
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  function hideUI() {
    resetQuery()
    logseq.hideMainUI()
  }

  async function performQuery(mode, q) {
    try {
      setIsLoading(true)
      const res =
        mode === SIMPLE
          ? await logseq.DB.q(q)
          : await logseq.DB.datascriptQuery(q)
      // Accept only blocks and pages.
      const results = Array.isArray(res)
        ? res.filter((x) => typeof x === "object" && x.uuid)
        : []
      setQueryResults(results)
      setResultsSelection(results.map(() => true))
    } catch (err) {
      console.error(err)
      message.error(t("Wrong query, please check."))
    } finally {
      setIsLoading(false)
    }
  }

  function changeSelection(i, value) {
    setResultsSelection((selections) => [
      ...selections.slice(0, i),
      value,
      ...selections.slice(i + 1),
    ])
  }

  function changeSelectionForAll() {
    setResultsSelection(
      resultsSelection.every((v) => v)
        ? resultsSelection.map(() => false)
        : resultsSelection.map(() => true),
    )
  }

  function switchToProcessing() {
    setInputShown(false)
    setOpShown(true)
    setQueryResultMode(RESET)
  }

  function resetQuery() {
    setOpShown(false)
    setQueryResults(null)
    setQueryResultMode(PROCESS)
    if (inputShown) {
      setInputShown(false)
      setTimeout(() => setInputShown(true), 0)
    } else {
      setInputShown(true)
    }
  }

  async function getNewestQueryResults() {
    const newestBlocks = await Promise.all(
      queryResults.map((block) => logseq.Editor.getBlock(block.uuid)),
    )
    setQueryResults(newestBlocks)
  }

  async function batchProcess(fn, args = []) {
    setIsProcessing(true)
    try {
      const data = queryResults.filter((_, i) => resultsSelection[i])
      await fn(data, ...args)
      logseq.App.showMsg(t("Batch processing finished."))
    } catch (err) {
      logseq.App.showMsg(err.message, "error")
    } finally {
      setIsProcessing(false)
    }
  }

  async function deleteBlocks(data) {
    await Promise.all(
      data.map((block) =>
        block.page != null
          ? logseq.Editor.removeBlock(block.uuid)
          : logseq.Editor.deletePage(block.name),
      ),
    )
    resetQuery()
  }

  async function deleteProps(data, props) {
    await Promise.all(
      data.map((block) =>
        Promise.all(
          props.map((prop) =>
            logseq.Editor.removeBlockProperty(block.uuid, prop),
          ),
        ),
      ),
    )
    await getNewestQueryResults()
  }

  async function renameProps(data, props) {
    await Promise.all(
      data.map((block) =>
        Promise.all(
          props.map(async ([k, v]) => {
            await logseq.Editor.removeBlockProperty(block.uuid, k)
            await logseq.Editor.upsertBlockProperty(
              block.uuid,
              v,
              block.properties[k],
            )
          }),
        ),
      ),
    )
    await getNewestQueryResults()
  }

  async function writeProps(data, props) {
    await Promise.all(
      data.map((block) =>
        Promise.all(
          props.map(([k, v]) =>
            logseq.Editor.upsertBlockProperty(block.uuid, k, v),
          ),
        ),
      ),
    )
    await getNewestQueryResults()
  }

  function replaceContent(data) {
    // TODO impl
    console.log("replace content")
  }

  return (
    <ConfigProvider
      autoInsertSpaceInButton={false}
      locale={locale === "zh-CN" ? zhCN : undefined}
    >
      <main class={styles.container}>
        <section class={styles.titleBar}>
          <h1 class={styles.title}>{t("Batch processing")}</h1>
          <p class={styles.subtitle}>
            {t("A backup is recommended before performing batch processing")}
          </p>
          <CloseIcon class={styles.close} onClick={hideUI} />
        </section>
        <section ref={panelsRef} class={styles.panels}>
          {inputShown && <QueryInput onQuery={performQuery} />}
          <QueryResult
            loading={isLoading}
            data={queryResults}
            selection={resultsSelection}
            mode={queryResultMode}
            onProcess={switchToProcessing}
            onReset={resetQuery}
            onSelect={changeSelection}
            onSelectAll={changeSelectionForAll}
          />
          {opShown && (
            <BatchOps
              data={queryResults}
              onDelete={() => batchProcess(deleteBlocks)}
              onDeleteProps={(...args) => batchProcess(deleteProps, args)}
              onRenameProps={(...args) => batchProcess(renameProps, args)}
              onWriteProps={(...args) => batchProcess(writeProps, args)}
              onReplace={(...args) => batchProcess(replaceContent, args)}
            />
          )}
        </section>
        <div class={cls(styles.overlay, isProcessing && styles.visible)} />
      </main>
    </ConfigProvider>
  )
}
