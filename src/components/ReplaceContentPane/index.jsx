import { Button, Input, Popconfirm } from "@/components/antd"
import { t } from "logseq-l10n"
import { useCallback, useRef } from "preact/hooks"
import { debounce } from "rambdax"
import { useStateRef, useWaitedAction } from "reactutils"
import styles from "./index.css"

export default function ReplaceContentPane({
  data,
  onPreviewReplace,
  onReplace,
}) {
  const [patternText, setPatternText] = useStateRef("")
  const [replacementText, setReplacementText] = useStateRef("")
  const buttonContainerRef = useRef()

  function replace() {
    onReplace(patternText.current, replacementText.current)
    setPatternText("")
    setReplacementText("")
  }

  const { action, duringAction } = useWaitedAction(replace)

  const previewReplace = useCallback(
    debounce(() => {
      onPreviewReplace(patternText.current, replacementText.current)
    }, 500),
    [onPreviewReplace],
  )

  return (
    <div class={styles.container}>
      <div>{t("Search: ")}</div>
      <Input
        value={patternText.current}
        onChange={(e) => {
          setPatternText(e.target.value)
          previewReplace()
        }}
      />
      <div>{t("Replace: ")}</div>
      <Input
        value={replacementText.current}
        onChange={(e) => {
          setReplacementText(e.target.value)
          previewReplace()
        }}
      />
      <div ref={buttonContainerRef}>
        <Popconfirm
          getPopupContainer={() => buttonContainerRef.current}
          placement="bottom"
          title={t("Sure to make these replacements?")}
          okText={t("Yes")}
          cancelText={t("I'll reconsider")}
          onConfirm={action}
        >
          <Button type="primary" block disabled={duringAction}>
            {t("Replace")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}
