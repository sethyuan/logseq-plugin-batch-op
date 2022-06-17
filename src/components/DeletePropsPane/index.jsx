import { Button, Input, Popconfirm } from "@/components/antd"
import { t } from "logseq-l10n"
import { useRef, useState } from "preact/hooks"
import { useWaitedAction } from "reactutils"
import styles from "./index.css"

const { TextArea } = Input

export default function DeletePropsPane({ data, onDeleteProps }) {
  const [text, setText] = useState("")
  const buttonContainerRef = useRef()

  function deleteProps() {
    const props = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
    onDeleteProps?.(props)
  }
  const { action, duringAction } = useWaitedAction(deleteProps)

  return (
    <div class={styles.container}>
      <TextArea
        placeholder={t(
          "Each line is a property to delete. E.g:\nprop-a\nprop-b",
        )}
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoSize={{ minRows: 3 }}
      />
      <div ref={buttonContainerRef}>
        <Popconfirm
          getPopupContainer={() => buttonContainerRef.current}
          placement="bottom"
          title={t("Sure to delete these properties?")}
          okText={t("Yes")}
          cancelText={t("I'll reconsider")}
          onConfirm={action}
        >
          <Button type="primary" block disabled={duringAction}>
            {t("Delete")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}
