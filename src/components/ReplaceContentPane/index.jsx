import {
  Alert,
  Button,
  Checkbox,
  Input,
  message,
  Popconfirm,
} from "@/components/antd"
import { ShellContext } from "@/libs/contexts"
import produce from "immer"
import { t } from "logseq-l10n"
import { useCallback, useContext, useRef } from "preact/hooks"
import { debounce } from "rambdax"
import { useCompositionChange, useStateRef } from "reactutils"
import styles from "./index.css"

export default function ReplaceContentPane() {
  const [patternText, setPatternText] = useStateRef("")
  const [replacementText, setReplacementText] = useStateRef("")
  const lastPattern = useRef("")
  const lastReplacement = useRef("")
  const buttonContainerRef = useRef()
  const { batchProcess, getNewestQueryResults, setQueryResults } =
    useContext(ShellContext)
  const [isRegex, setIsRegex] = useStateRef(false)
  const [sensitive, setSensitive] = useStateRef(false)

  const preview = useCallback(
    debounce((forceRun = false) => {
      const pattern = patternText.current
      const replacement = replacementText.current

      if (pattern !== lastPattern.current || forceRun) {
        setQueryResults((data) => {
          const value = produce(data, (draft) => {
            for (const block of draft) {
              // Only do replacements for blocks, not pages.
              if (block.page == null) continue

              if (!pattern) {
                if (block.searchMarkers != null) {
                  block.searchMarkers = undefined
                }
                continue
              }

              const searchMarkers = isRegex.current
                ? regexMatch(
                    pattern,
                    block.content,
                    replacement,
                    sensitive.current,
                  )
                : textMatch(pattern, block.content, replacement)
              if (searchMarkers.length > 0) {
                block.searchMarkers = searchMarkers
              } else {
                block.searchMarkers = undefined
              }
            }
          })
          return value
        })
        lastPattern.current = pattern
        lastReplacement.current = replacement
        return
      }

      if (replacement !== lastReplacement.current || forceRun) {
        setQueryResults((data) => {
          const value = produce(data, (draft) => {
            try {
              const regex = toRegex(pattern, sensitive.current)
              for (const block of draft) {
                if (block.searchMarkers == null) continue
                for (const marker of block.searchMarkers) {
                  if (isRegex.current) {
                    const [start, end] = marker
                    marker[2] = block.content
                      .substring(start, end)
                      .replace(regex, replacement)
                  } else {
                    marker[2] = replacement
                  }
                }
              }
            } catch {
              // Ignore regex errors
            }
          })
          return value
        })
        lastReplacement.current = replacement
      }
    }, 500),
    [],
  )

  const replaceContent = useCallback(
    async (data, pattern, replacement) => {
      if (!pattern) {
        message.error(t("What do you want to search?"))
        return
      }

      // Only do replacements for blocks, not pages.
      data = data.filter((block) => block.page != null)

      await Promise.all(
        data.map((block) => {
          try {
            const replaced = block.content.replaceAll(
              isRegex.current ? toRegex(pattern, sensitive.current) : pattern,
              replacement ?? "",
            )
            return logseq.Editor.updateBlock(block.uuid, replaced)
          } catch {
            // Ignore replacement errors.
          }
        }),
      )
      await getNewestQueryResults()
    },
    [getNewestQueryResults],
  )

  const onReplace = useCallback(() => {
    batchProcess(replaceContent, patternText.current, replacementText.current)
    setPatternText("")
    setReplacementText("")
  }, [batchProcess])

  const patternChangeProps = useCompositionChange((e) => {
    setPatternText(e.target.value)
    preview()
  })

  const replacementChangeProps = useCompositionChange((e) => {
    setReplacementText(e.target.value)
    preview()
  })

  function handleSetRegex(e) {
    setIsRegex(e.target.checked)
    preview(true)
  }

  function handleSensitive(e) {
    setSensitive(e.target.checked)
    preview(true)
  }

  return (
    <div class={styles.container}>
      <Alert
        type="info"
        message={t("NOTE: Can only work against blocks, not pages.")}
      />
      <div>
        <span>{t("Search: ")}</span>
        <Checkbox checked={sensitive.current} onChange={handleSensitive}>
          <span title={t("Case sensitive")}>{t("Case")}</span>
        </Checkbox>
        <Checkbox checked={isRegex.current} onChange={handleSetRegex}>
          {t("Regex")}
        </Checkbox>
      </div>
      <Input value={patternText.current} {...patternChangeProps} />
      <div>{t("Replace: ")}</div>
      <Input value={replacementText.current} {...replacementChangeProps} />
      <div ref={buttonContainerRef}>
        <Popconfirm
          getPopupContainer={() => buttonContainerRef.current}
          placement="bottom"
          title={t(
            "Are you sure you want to make these replacements on the selected blocks/pages?",
          )}
          okText={t("Yes")}
          cancelText={t("I'll reconsider")}
          onConfirm={onReplace}
        >
          <Button type="primary" block>
            {t("Replace")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}

function textMatch(pattern, text, replacement) {
  const searchMarkers = []
  const patternLength = pattern.length
  for (
    let i = 0, matchStart = 0;
    i < text.length;
    i = matchStart + patternLength
  ) {
    matchStart = text.indexOf(pattern, i)
    if (matchStart < 0) break
    searchMarkers.push([matchStart, matchStart + patternLength, replacement])
  }
  return searchMarkers
}

function regexMatch(pattern, text, replacement, sensitive) {
  const searchMarkers = []
  try {
    const regex = toRegex(pattern, sensitive)
    for (const m of text.matchAll(regex)) {
      searchMarkers.push([
        m.index,
        m.index + m[0].length,
        m[0].replace(regex, replacement),
      ])
    }
  } catch {
    // Ignore regex errors and return no markers.
  }
  return searchMarkers
}

function toRegex(pattern, sensitive) {
  return new RegExp(pattern, `g${sensitive ? "" : "i"}`)
}
