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

export default function WritePropsPane() {
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
        .map((line) => line.split("::").map((fragment) => fragment.trim()))
        .filter((fragments) => fragments.length === 2 && fragments[0])
        .reduce((obj, [name, value]) => {
          obj[name] = value
          return obj
        }, {})

      setQueryResults((data) =>
        produce(data, (draft) => {
          for (const block of draft) {
            if (block.page != null) {
              // it's a block
              const markers = {
                replaced: new Map(),
                added: [],
              }
              const propsClone = { ...props }
              const lines = block.content.split("\n")
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                for (const prop of Object.keys(props)) {
                  if (line.startsWith(`${prop}::`)) {
                    markers.replaced.set(i, `${prop}:: ${props[prop]}`)
                    delete propsClone[prop]
                    break
                  }
                }
              }
              markers.added = Object.entries(propsClone ?? {}).map(
                ([name, value]) => `${name}:: ${value}`,
              )
              if (markers.replaced.size > 0 || markers.added.length > 0) {
                block.writePropMarkers = markers
              } else {
                block.writePropMarkers = undefined
              }
            } else {
              // it's a page
              const markers = {
                replaced: {},
                added: { ...props },
              }
              const properties = Object.keys(block.properties ?? {}).map(
                (name) => camelToDash(name),
              )
              for (const property of properties) {
                if (props[property] != null) {
                  markers.replaced[property] = props[property]
                  delete markers.added[property]
                }
              }
              if (
                Object.keys(markers.replaced).length > 0 ||
                Object.keys(markers.added).length > 0
              ) {
                block.writePropMarkers = markers
              } else {
                block.writePropMarkers = undefined
              }
            }
          }
        }),
      )
    }, 500),
    [],
  )

  const writeProps = useCallback(
    async (data, props) => {
      for (let block of data) {
        for (const [k, v] of props) {
          await logseq.Editor.upsertBlockProperty(block.uuid, k, v)
        }
        if (block.page == null) {
          block = (await logseq.Editor.getPageBlocksTree(block.name))[0]
          if (block == null) return
          for (const [k, v] of props) {
            await logseq.Editor.upsertBlockProperty(block.uuid, k, v)
          }
        }
      }
      await getNewestQueryResults()
    },
    [getNewestQueryResults],
  )

  const onWrite = useCallback(() => {
    const props = text.current
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => line.split("::").map((fragment) => fragment.trim()))
      .filter((fragments) => fragments.length === 2 && fragments[0])
    batchProcess(writeProps, props)
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
          "Each line is a property to write. E.g:\nprop-a:: value\nprop-b:: value",
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
            "Are you sure you want to write these properties on the selected blocks/pages?",
          )}
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
