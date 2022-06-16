import { ConfigProvider, message, zhCN } from "@/components/antd"
import BatchOps from "@/components/BatchOps"
import QueryInput, { SIMPLE } from "@/components/QueryInput"
import QueryResult, { PROCESS, RESET } from "@/components/QueryResult"
import CloseIcon from "@/icons/close.svg"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { t } from "logseq-l10n"
import { useState } from "preact/hooks"
import styles from "./index.css"

export default function Shell({ locale }) {
  const [inputShown, setInputShown] = useState(true)
  const [opShown, setOpShown] = useState(false)
  const [queryResultMode, setQueryResultMode] = useState(PROCESS)
  const [queryResults, setQueryResults] = useState(null)
  const [panelsRef] = useAutoAnimate()

  function hideUI() {
    logseq.hideMainUI()
  }

  async function performQuery(mode, q) {
    try {
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

  async function deleteBlocks() {
    // TODO impl
    // TODO test containing block case (one parent block is deleted first,
    // what happens to the child block?)
    // TODO test if `removeBlock` can delete pages.
    // await Promise.all(queryResults.map((block) => logseq.Editor.removeBlock(block.uuid)))
    resetQuery()
  }

  async function deleteProps(props) {
    // TODO impl
    console.log("delete props", props)
    // await Promise.all(
    //   queryResults.map((block) =>
    //     Promise.all(
    //       props.map((prop) =>
    //         logseq.Editor.removeBlockProperty(block.uuid, prop),
    //       ),
    //     ),
    //   ),
    // )
    await getNewestQueryResults()
  }

  async function writeProps(props) {
    console.log("write props", props)
    // TODO impl
    // await Promise.all(
    //   queryResults.map((block) =>
    //     Promise.all(
    //       props.map(([k, v]) =>
    //         logseq.Editor.upsertBlockProperty(block.uuid, k, v),
    //       ),
    //     ),
    //   ),
    // )
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
            data={queryResults}
            mode={queryResultMode}
            onProcess={switchToProcessing}
            onReset={resetQuery}
          />
          {opShown && (
            <BatchOps
              data={queryResults}
              onDelete={deleteBlocks}
              onDeleteProps={deleteProps}
              onWriteProps={writeProps}
              onReplace={replaceContent}
            />
          )}
        </section>
      </main>
    </ConfigProvider>
  )
}
