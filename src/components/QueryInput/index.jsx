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
        <Button type="primary" onClick={() => onQuery?.(mode, text)}>
          {t("Query")}
        </Button>
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
      />
    </section>
  )
}
