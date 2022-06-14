import { ConfigProvider, message, zhCN } from "@/components/antd"
import BatchOps from "@/components/BatchOps"
import QueryInput, { SIMPLE } from "@/components/QueryInput"
import QueryResult from "@/components/QueryResult"
import CloseIcon from "@/icons/close.svg"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { t } from "logseq-l10n"
import { useState } from "preact/hooks"
import styles from "./index.css"

export default function Shell({ locale }) {
  const [inputShown, setInputShown] = useState(true)
  const [opShown, setOpShown] = useState(false)
  const [queryResults, setQueryResults] = useState(null)
  const [panelsRef] = useAutoAnimate()

  function hideUI() {
    logseq.hideMainUI()
  }

  async function performQuery(mode, q) {
    try {
      // TODO Add loading skeleton for QueryResult.
      const res =
        mode === SIMPLE
          ? await logseq.DB.q(q)
          : await logseq.DB.datascriptQuery(q)
      setQueryResults(
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
  }

  function reset() {
    setInputShown(true)
    setOpShown(false)
    setQueryResults(null)
  }

  return (
    <ConfigProvider locale={locale === "zh-CN" ? zhCN : undefined}>
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
          <QueryResult data={queryResults} onProcess={switchToProcessing} />
          {opShown && <BatchOps onDone={reset} />}
        </section>
      </main>
    </ConfigProvider>
  )
}
