import { Tabs } from "@/components/antd"
import DeletePane from "@/components/DeletePane"
import DeletePropsPane from "@/components/DeletePropsPane"
import RenamePropsPane from "@/components/RenamePropsPane"
import ReplaceContentPane from "@/components/ReplaceContentPane"
import WritePropsPane from "@/components/WritePropsPane"
import { t } from "logseq-l10n"
import styles from "./index.css"

const { TabPane } = Tabs

export default function BatchOps({ onTabChange }) {
  return (
    <section class={styles.container}>
      <Tabs defaultActiveKey="delete" onChange={onTabChange}>
        <TabPane key="delete" tab={t("Delete")}>
          <DeletePane />
        </TabPane>
        <TabPane key="delete-prop" tab={t("Delete Properties")}>
          <DeletePropsPane />
        </TabPane>
        <TabPane key="rename-prop" tab={t("Rename Properties")}>
          <RenamePropsPane />
        </TabPane>
        <TabPane key="write-prop" tab={t("Write Properties")}>
          <WritePropsPane />
        </TabPane>
        <TabPane key="replace-content" tab={t("Replace Content")}>
          <ReplaceContentPane />
        </TabPane>
      </Tabs>
    </section>
  )
}
