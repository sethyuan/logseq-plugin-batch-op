import "@logseq/libs"
import Button from "antd/es/button"
import ConfigProvider from "antd/es/config-provider"
import zhCN from "antd/es/locale/zh_CN"
import { setup, t } from "logseq-l10n"
import { useEffect, useState } from "preact/hooks"
import styles from "./index.css"

const BatchSvg = `<svg t="1655087098291" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="950" width="200" height="200"><path d="M768 864a96.2 96.2 0 0 0 27.89-4.11C783.94 899.31 747.32 928 704 928H192c-53.02 0-96-42.98-96-96V320c0-43.32 28.69-79.94 68.11-91.89A96.2 96.2 0 0 0 160 256v512c0 53.02 42.98 96 96 96h512z" p-id="951"></path><path d="M832 96H320c-43.32 0-79.94 28.69-91.89 68.11A96.2 96.2 0 0 0 224 192v512c0 53.02 42.98 96 96 96h512a96.2 96.2 0 0 0 27.89-4.11C899.31 783.94 928 747.32 928 704V192c0-53.02-42.98-96-96-96zM701.42 361.04L497.77 564.69 441.21 576l11.31-56.57 203.65-203.65c12.49-12.49 32.75-12.49 45.25 0 12.5 12.5 12.5 32.76 0 45.26z" p-id="952"></path></svg>`

const READY = "logseq.ready"

export default function App() {
  const [locale, setLocale] = useState()

  useEffect(() => {
    async function main() {
      await setup({
        urlTemplate:
          "https://raw.githubusercontent.com/sethyuan/logseq-plugin-batch-op/master/src/translations/${locale}.json",
        builtinTranslations: { "zh-CN": zhCN },
      })

      logseq.provideStyle(`
        .kef-batchop-icon {
          display: block;
          width: 30px;
          height: 30px;
          padding: 7px 5px 4px;
          border-radius: 4px;
        }
        .kef-batchop-icon svg {
          width: 20px;
          height: 20px;
        }
        .kef-batchop-icon svg path {
          fill: var(--ls-icon-color);
        }
        .kef-batchop-icon:hover {
          background: var(--ls-tertiary-background-color);
        }
        .kef-batchop-icon:hover svg path {
          fill: var(--ls-primary-text-color);
        }
      `)

      logseq.App.registerUIItem("toolbar", {
        key: `kef-batchop-tb`,
        template: `<a class="kef-batchop-icon" data-on-click="showUI" title="${t(
          "Batch processing",
        )}">${BatchSvg}</a>`,
      })

      logseq.App.registerCommandPalette(
        {
          key: "kef-batchop-showui",
          label: t("Open batch processing"),
          ...(logseq.settings?.shortcut && {
            keybinding: {
              binding: logseq.settings.shortcut,
            },
          }),
        },
        (e) => {
          model.showUI()
        },
      )

      logseq.useSettingsSchema([
        {
          key: "shortcut",
          type: "string",
          default: "",
          description: t("Defines a shortcut for opening batch processing."),
        },
      ])

      logseq.beforeunload(async () => {
        sessionStorage.removeItem(READY)
      })

      sessionStorage.setItem(READY, "1")
      setLocale((await logseq.App.getUserConfigs()).preferredLanguage)
      console.log("#batch-op loaded")
    }

    const model = {
      showUI() {
        logseq.showMainUI()
      },
    }

    logseq.ready(model, main).catch(console.error)
  }, [])

  return (
    sessionStorage.getItem(READY) && (
      <ConfigProvider locale={locale === "zh-CN" ? zhCN : undefined}>
        <main class={styles.app}>
          <Button
            onClick={() => {
              logseq.hideMainUI()
            }}
          >
            Push Me!
          </Button>
        </main>
      </ConfigProvider>
    )
  )
}
