import { Button, Input, Segmented } from "@/components/antd"
import { t } from "logseq-l10n"
import { useState } from "preact/hooks"
import styles from "./index.css"

const { TextArea } = Input

export const SIMPLE = 1
export const ADVANCED = 2

export default function QueryInput({ onQuery }) {
  const [mode, setMode] = useState(SIMPLE)
  const [text, setText] = useState("")

  function onSwitchMode(value) {
    setMode(value)
    setText("")
  }

  function onKeyDown(e) {
    // cmd+enter or ctrl+enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      onQuery?.(mode, text)
    }
  }

  return (
    <section class={styles.container}>
      <div class={styles.bar}>
        <Segmented
          options={[
            { label: t("Simple"), value: SIMPLE },
            { label: t("Advanced"), value: ADVANCED },
          ]}
          value={mode}
          onChange={onSwitchMode}
        />
        <div>
          <span class={styles.shortcut}>cmd/ctrl + enter</span>
          <Button
            type="primary"
            title="mod+enter"
            onClick={() => onQuery?.(mode, text)}
          >
            {t("Query")}
          </Button>
        </div>
      </div>
      <TextArea
        placeholder={
          mode === SIMPLE
            ? t("Write down your query here.\n(and [[A]] [[B]])")
            : t(
                "Write down your advanced query here.\n[:find (pull ?b [*])\n :where\n [?b :block/marker _]]",
              )
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </section>
  )
}
