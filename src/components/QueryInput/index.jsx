import { Button, Input } from "@/components/antd"
import { t } from "logseq-l10n"
import { useEffect, useRef, useState } from "preact/hooks"
import { useCompositionChange } from "reactutils"
import styles from "./index.css"

const { TextArea } = Input

export default function QueryInput({ onQuery }) {
  const [text, setText] = useState("")
  const textarea = useRef()

  useEffect(() => {
    logseq.on("ui:visible:changed", ({ visible }) => {
      if (visible) {
        setTimeout(() => textarea.current?.focus({ cursor: "start" }), 0)
      }
    })
    return () => {
      logseq.off("ui:visible:changed")
    }
  }, [])

  function onKeyDown(e) {
    // cmd+enter or ctrl+enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      onQuery(text)
    }
  }

  const textareaProps = useCompositionChange((e) => setText(e.target.value))

  return (
    <section class={styles.container}>
      <div class={styles.bar}>
        <div>
          <span class={styles.shortcut}>cmd/ctrl + enter</span>
          <Button
            type="primary"
            title="mod+enter"
            onClick={() => onQuery(text)}
          >
            {t("Query")}
          </Button>
        </div>
      </div>
      <TextArea
        ref={textarea}
        placeholder={t(
          "Write down your query here. You can use either Smart Search syntax, simple query syntax or advanced query syntax.",
        )}
        value={text}
        {...textareaProps}
        onKeyDown={onKeyDown}
      />
    </section>
  )
}
