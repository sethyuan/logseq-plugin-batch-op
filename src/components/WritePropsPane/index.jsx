import { Button, Input, Popconfirm } from "@/components/antd"
import { ShellContext } from "@/libs/contexts"
import { t } from "logseq-l10n"
import { useContext, useRef, useState } from "preact/hooks"
import styles from "./index.css"

const { TextArea } = Input

export default function WritePropsPane() {
  const [text, setText] = useState("")
  const buttonContainerRef = useRef()
  const { batchProcess, getNewestQueryResults } = useContext(ShellContext)

  const writeProps = useCallback(
    async (data, props) => {
      await Promise.all(
        data.map(async (block) => {
          await Promise.all(
            props.map(([k, v]) =>
              logseq.Editor.upsertBlockProperty(block.uuid, k, v),
            ),
          )
          if (block.page == null) {
            block = (await logseq.Editor.getPageBlocksTree(block.name))[0]
            if (block == null) return
            await Promise.all(
              props.map(([k, v]) =>
                logseq.Editor.upsertBlockProperty(block.uuid, k, v),
              ),
            )
          }
        }),
      )
      await getNewestQueryResults()
    },
    [getNewestQueryResults],
  )

  function onWrite() {
    const props = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => line.split("::").map((fragment) => fragment.trim()))
      .filter((fragments) => fragments.length === 2 && fragments[0])
    batchProcess(writeProps, props)
  }

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
          onConfirm={onWrite}
        >
          <Button type="primary" block>
            {t("Write")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}
