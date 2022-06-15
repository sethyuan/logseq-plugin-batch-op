import { ConfigProvider, message, zhCN } from "@/components/antd"
import BatchOps from "@/components/BatchOps"
import QueryInput, { SIMPLE } from "@/components/QueryInput"
import QueryResult from "@/components/QueryResult"
import CloseIcon from "@/icons/close.svg"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { t } from "logseq-l10n"
import { useRef, useState } from "preact/hooks"
import styles from "./index.css"

export default function Shell({ locale }) {
  const [inputShown, setInputShown] = useState(true)
  const [opShown, setOpShown] = useState(false)
  const [queryResults, setQueryResults] = useState(null)
  const [panelsRef] = useAutoAnimate()
  const lastQuery = useRef({})

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
        Array.isArray(res)
          ? res.filter((x) => typeof x === "object" && x.uuid)
          : [],
      )
      lastQuery.current.mode = mode
      lastQuery.current.q = q
    } catch (err) {
      console.error(err)
      message.error(t("Wrong query, please check."))
    }
  }

  function switchToProcessing() {
    setInputShown(false)
    setOpShown(true)
  }

  function reset() {
    setInputShown(true)
    setOpShown(false)
    setQueryResults(null)
  }

  function deleteBlocks() {
    // TODO impl
    console.log("delete blocks")
    reset()
  }

  function deleteProps(props) {
    // TODO impl
    console.log("delete props", props)
    performQuery(lastQuery.current.mode, lastQuery.current.q)
  }

  function writeProps() {
    // TODO impl
    console.log("write props")
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
            onProcess={switchToProcessing}
            onReset={reset}
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
