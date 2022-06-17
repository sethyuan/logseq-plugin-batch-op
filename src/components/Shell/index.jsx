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
  const [panelsRef] = useAutoAnimate()
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  function hideUI() {
    logseq.hideMainUI()
  }

  async function performQuery(mode, q) {
    try {
      setIsLoading(true)
      const res =
        mode === SIMPLE
          ? await logseq.DB.q(q)
          : await logseq.DB.datascriptQuery(q)
      setQueryResults(
        // Accept only blocks/pages.
        Array.isArray(res)
          ? res.filter((x) => typeof x === "object" && x.uuid)
          : [],
      )
    } catch (err) {
      console.error(err)
      message.error(t("Wrong query, please check."))
    } finally {
      setIsLoading(false)
    }
  }

  function switchToProcessing() {
    setInputShown(false)
    setOpShown(true)
    setQueryResultMode(RESET)
  }

  function resetQuery() {
    setInputShown(true)
    setOpShown(false)
    setQueryResults(null)
    setQueryResultMode(PROCESS)
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
      await fn(...args)
      logseq.App.showMsg(t("Batch processing finished."))
    } catch (err) {
      logseq.App.showMsg(err.message, "error")
    } finally {
      setIsProcessing(false)
    }
  }

  async function deleteBlocks() {
    await Promise.all(
      queryResults.map((block) =>
        block.page != null
          ? logseq.Editor.removeBlock(block.uuid)
          : logseq.Editor.deletePage(block.name),
      ),
    )
    resetQuery()
  }

  async function deleteProps(props) {
    await Promise.all(
      queryResults.map((block) =>
        Promise.all(
          props.map((prop) =>
            logseq.Editor.removeBlockProperty(block.uuid, prop),
          ),
        ),
      ),
    )
    await getNewestQueryResults()
  }

  async function writeProps(props) {
    await Promise.all(
      queryResults.map((block) =>
        Promise.all(
          props.map(([k, v]) =>
            logseq.Editor.upsertBlockProperty(block.uuid, k, v),
          ),
        ),
      ),
    )
    await getNewestQueryResults()
  }

  function replaceContent() {
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
            mode={queryResultMode}
            onProcess={switchToProcessing}
            onReset={resetQuery}
          />
          {opShown && (
            <BatchOps
              data={queryResults}
              onDelete={() => batchProcess(deleteBlocks)}
              onDeleteProps={(...args) => batchProcess(deleteProps, args)}
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
