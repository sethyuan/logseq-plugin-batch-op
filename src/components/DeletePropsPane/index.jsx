import { Button, Input, Popconfirm } from "@/components/antd"
import { ShellContext } from "@/libs/contexts"
import { camelToDash } from "@/libs/utils"
import produce from "immer"
import { t } from "logseq-l10n"
import { useCallback, useContext, useRef } from "preact/hooks"
import { debounce } from "rambdax"
import { useCompositionChange, useStateRef } from "reactutils"
import styles from "./index.css"

const { TextArea } = Input

export default function DeletePropsPane() {
  const [text, setText] = useStateRef("")
  const buttonContainerRef = useRef()
  const { batchProcess, getNewestQueryResults, setQueryResults } =
    useContext(ShellContext)

  const preview = useCallback(
    debounce(() => {
      const props = new Set(
        text.current
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line),
      )

      setQueryResults((data) =>
        produce(data, (draft) => {
          for (const block of draft) {
            const markers = new Set()
            if (block.page != null) {
              // it's a block
              const lines = block.content.split("\n")
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                for (const prop of props) {
                  if (line.startsWith(`${prop}::`)) {
                    markers.add(i)
                    break
                  }
                }
              }
            } else {
              // it's a page
              const properties = Object.entries(block.properties ?? {})
              for (let i = 0; i < properties.length; i++) {
                const [k] = properties[i]
                const property = camelToDash(k)
                if (props.has(property)) {
                  markers.add(i)
                }
              }
            }
            if (markers.size > 0) {
              block.deletePropMarkers = markers
            } else {
              block.deletePropMarkers = undefined
            }
          }
        }),
      )
    }, 500),
    [],
  )

  const deleteProps = useCallback(
    async (data, props) => {
      for (let block of data) {
        for (const prop of props) {
          await logseq.Editor.removeBlockProperty(block.uuid, prop)
        }
        if (block.page == null) {
          block = (await logseq.Editor.getPageBlocksTree(block.name))[0]
          if (block == null) return
          for (const prop of props) {
            await logseq.Editor.removeBlockProperty(block.uuid, prop)
          }
        }
      }
      await getNewestQueryResults()
    },
    [getNewestQueryResults],
  )

  const onDelete = useCallback(() => {
    const props = text.current
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
    batchProcess(deleteProps, props)
    setText("")
  }, [batchProcess])

  const textareaProps = useCompositionChange((e) => {
    setText(e.target.value)
    preview()
  })

  return (
    <div class={styles.container}>
      <TextArea
        placeholder={t(
          "Each line is a property to delete. E.g:\nprop-a\nprop-b",
        )}
        value={text.current}
        {...textareaProps}
        autoSize={{ minRows: 3 }}
      />
      <div ref={buttonContainerRef}>
        <Popconfirm
          getPopupContainer={() => buttonContainerRef.current}
          placement="bottom"
          title={t(
            "Are you sure you want to delete these properties from the selected blocks/pages?",
          )}
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
