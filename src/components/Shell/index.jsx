import { ConfigProvider, message, zhCN } from "@/components/antd"
import BatchOps from "@/components/BatchOps"
import QueryInput, { SIMPLE } from "@/components/QueryInput"
import QueryResult, { PROCESS, RESET } from "@/components/QueryResult"
import CloseIcon from "@/icons/close.svg"
import { ShellContext } from "@/libs/contexts"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { t } from "logseq-l10n"
import { useCallback, useMemo, useState } from "preact/hooks"
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
  const [currentTab, setCurrentTab] = useState("delete")

  function hideUI() {
    resetQuery()
    logseq.hideMainUI()
  }

  const performQuery = useCallback(async (mode, q) => {
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
  }, [])

  const changeSelection = useCallback((i, value) => {
    setResultsSelection((selections) => [
      ...selections.slice(0, i),
      value,
      ...selections.slice(i + 1),
    ])
  }, [])

  const changeSelectionForAll = useCallback(() => {
    setResultsSelection(
      resultsSelection.every((v) => v)
        ? resultsSelection.map(() => false)
        : resultsSelection.map(() => true),
    )
  }, [resultsSelection])

  const switchToProcessing = useCallback(() => {
    setInputShown(false)
    setOpShown(true)
    setQueryResultMode(RESET)
  }, [])

  const resetQuery = useCallback(() => {
    setOpShown(false)
    setQueryResults(null)
    setQueryResultMode(PROCESS)
    if (inputShown) {
      setInputShown(false)
      setTimeout(() => setInputShown(true), 0)
    } else {
      setInputShown(true)
    }
  }, [inputShown])

  const getNewestQueryResults = useCallback(async () => {
    const newestBlocks = await Promise.all(
      queryResults.map((block) =>
        block.page != null
          ? logseq.Editor.getBlock(block.uuid)
          : logseq.Editor.getPage(block.name),
      ),
    )
    setQueryResults(newestBlocks)
  }, [queryResults])

  const batchProcess = useCallback(
    async (fn, ...args) => {
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
    },
    [queryResults, resultsSelection],
  )

  const contextValue = useMemo(
    () => ({
      batchProcess,
      getNewestQueryResults,
      setQueryResults,
      resetQuery,
    }),
    [batchProcess, getNewestQueryResults, setQueryResults, resetQuery],
  )

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
        <ShellContext.Provider value={contextValue}>
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
              tab={currentTab}
            />
            {opShown && <BatchOps onTabChange={setCurrentTab} />}
          </section>
        </ShellContext.Provider>
        <div class={cls(styles.overlay, isProcessing && styles.visible)} />
      </main>
    </ConfigProvider>
  )
}
