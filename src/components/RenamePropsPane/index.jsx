import { Button, Input, Popconfirm } from "@/components/antd"
import { ShellContext } from "@/libs/contexts"
import produce from "immer"
import { t } from "logseq-l10n"
import { useCallback, useContext, useRef } from "preact/hooks"
import { debounce } from "rambdax"
import { useCompositionChange, useStateRef } from "reactutils"
import styles from "./index.css"

const { TextArea } = Input

export default function RenamePropsPane() {
  const [text, setText] = useStateRef("")
  const buttonContainerRef = useRef()
  const { batchProcess, getNewestQueryResults, setQueryResults } =
    useContext(ShellContext)

  const preview = useCallback(
    debounce(() => {
      const props = text.current
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => line.split("->").map((fragment) => fragment.trim()))
        .filter(
          (fragments) => fragments.length === 2 && fragments[0] && fragments[1],
        )
        .reduce((obj, [name, value]) => {
          obj[name] = value
          return obj
        }, {})

      setQueryResults((data) =>
        produce(data, (draft) => {
          for (const block of draft) {
            if (block.page != null) {
              // it's a block
              const markers = new Map()
              const lines = block.content.split("\n")
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                for (const prop of Object.keys(props)) {
                  if (line.startsWith(`${prop}::`)) {
                    markers.set(i, props[prop])
                    break
                  }
                }
              }
              if (markers.size > 0) {
                block.renamePropMarkers = markers
              } else {
                block.renamePropMarkers = undefined
              }
            } else {
              // it's a page
              const markers = {}
              const properties = Object.keys(block.properties ?? {})
              for (const property of properties) {
                if (props[property] != null) {
                  markers[property] = props[property]
                }
              }
              if (Object.keys(markers).length > 0) {
                block.renamePropMarkers = markers
              } else {
                block.renamePropMarkers = undefined
              }
            }
          }
        }),
      )
    }, 500),
    [],
  )

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
    const props = text.current
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => line.split("->").map((fragment) => fragment.trim()))
      .filter(
        (fragments) => fragments.length === 2 && fragments[0] && fragments[1],
      )
    batchProcess(renameProps, props)
    setText("")
  }

  const textareaProps = useCompositionChange((e) => {
    setText(e.target.value)
    preview()
  })

  return (
    <div class={styles.container}>
      <TextArea
        placeholder={t(
          "Each line is a property to rename. E.g:\nprop-a -> prop-b",
        )}
        value={text.current}
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
