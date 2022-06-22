import { Button, Input, Popconfirm } from "@/components/antd"
import { ShellContext } from "@/libs/contexts"
import { t } from "logseq-l10n"
import { useContext, useRef, useState } from "preact/hooks"
import styles from "./index.css"

const { TextArea } = Input

export default function DeletePropsPane() {
  const [text, setText] = useState("")
  const buttonContainerRef = useRef()
  const { batchProcess, getNewestQueryResults } = useContext(ShellContext)

  const deleteProps = useCallback(
    async (data, props) => {
      await Promise.all(
        data.map(async (block) => {
          await Promise.all(
            props.map((prop) =>
              logseq.Editor.removeBlockProperty(block.uuid, prop),
            ),
          )
          if (block.page == null) {
            block = (await logseq.Editor.getPageBlocksTree(block.name))[0]
            if (block == null) return
            await Promise.all(
              props.map((prop) =>
                logseq.Editor.removeBlockProperty(block.uuid, prop),
              ),
            )
          }
        }),
      )
      await getNewestQueryResults()
    },
    [getNewestQueryResults],
  )

  function onDelete() {
    const props = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
    batchProcess(deleteProps, props)
    setText("")
  }

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
          onConfirm={onDelete}
        >
          <Button type="primary" block>
            {t("Delete")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}
