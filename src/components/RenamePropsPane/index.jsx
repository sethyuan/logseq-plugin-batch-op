import { Button, Input, Popconfirm } from "@/components/antd"
import { ShellContext } from "@/libs/contexts"
import { t } from "logseq-l10n"
import { useCallback, useContext, useRef, useState } from "preact/hooks"
import { useCompositionChange } from "reactutils"
import styles from "./index.css"

const { TextArea } = Input

export default function RenamePropsPane() {
  const [text, setText] = useState("")
  const buttonContainerRef = useRef()
  const { batchProcess, getNewestQueryResults } = useContext(ShellContext)

  const renameProps = useCallback(
    async (data, props) => {
      await Promise.all(
        data.map(async (block) => {
          await Promise.all(
            props.map(async ([k, v]) => {
              await logseq.Editor.removeBlockProperty(block.uuid, k)
              await logseq.Editor.upsertBlockProperty(
                block.uuid,
                v,
                block.properties[k],
              )
            }),
          )
          if (block.page == null) {
            block = (await logseq.Editor.getPageBlocksTree(block.name))[0]
            if (block == null) return
            await Promise.all(
              props.map(async ([k, v]) => {
                await logseq.Editor.removeBlockProperty(block.uuid, k)
                await logseq.Editor.upsertBlockProperty(
                  block.uuid,
                  v,
                  block.properties[k],
                )
              }),
            )
          }
        }),
      )
      await getNewestQueryResults()
    },
    [getNewestQueryResults],
  )

  function onRename() {
    const props = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => line.split("->").map((fragment) => fragment.trim()))
      .filter((fragments) => fragments.length === 2 && fragments[0])
    batchProcess(renameProps, props)
    setText("")
  }

  const textareaProps = useCompositionChange((e) => setText(e.target.value))

  return (
    <div class={styles.container}>
      <TextArea
        placeholder={t(
          "Each line is a property to rename. E.g:\nprop-a -> prop-b",
        )}
        value={text}
        {...textareaProps}
        autoSize={{ minRows: 3 }}
      />
      <div ref={buttonContainerRef}>
        <Popconfirm
          getPopupContainer={() => buttonContainerRef.current}
          placement="bottom"
          title={t("Sure to rename these properties?")}
          okText={t("Yes")}
          cancelText={t("I'll reconsider")}
          onConfirm={onRename}
        >
          <Button type="primary" block>
            {t("Rename")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}
