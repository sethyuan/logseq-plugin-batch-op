import { Button, Input, Popconfirm } from "@/components/antd"
import { t } from "logseq-l10n"
import { useRef, useState } from "preact/hooks"
import { useWaitedAction } from "reactutils"
import styles from "./index.css"

const { TextArea } = Input

export default function WritePropsPane({ data, onWriteProps }) {
  const [text, setText] = useState("")
  const buttonContainerRef = useRef()

  function writeProps() {
    const props = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => line.split("::").map((fragment) => fragment.trim()))
      .filter((fragments) => fragments.length === 2 && fragments[0])
    onWriteProps?.(props)
  }
  const { action, duringAction } = useWaitedAction(writeProps)

  return (
    <div class={styles.container}>
      <TextArea
        placeholder={t(
          "Each line is a property to write. E.g:\nprop-a:: value\nprop-b:: value",
        )}
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoSize={{ minRows: 3 }}
      />
      <div ref={buttonContainerRef}>
        <Popconfirm
          getPopupContainer={() => buttonContainerRef.current}
          placement="bottom"
          title={t("Sure to write these properties?")}
          okText={t("Yes")}
          cancelText={t("I'll reconsider")}
          onConfirm={action}
        >
          <Button type="primary" block disabled={duringAction}>
            {t("Write")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}
