import { Tabs } from "@/components/antd"
import DeletePane from "@/components/DeletePane"
import DeletePropsPane from "@/components/DeletePropsPane"
import RenamePropsPane from "@/components/RenamePropsPane"
import ReplaceContentPane from "@/components/ReplaceContentPane"
import WritePropsPane from "@/components/WritePropsPane"
import { t } from "logseq-l10n"
import styles from "./index.css"

const { TabPane } = Tabs

export default function BatchOps({
  data,
  onDelete,
  onDeleteProps,
  onRenameProps,
  onWriteProps,
  onReplace,
}) {
  return (
    <section class={styles.container}>
      <Tabs defaultActiveKey="delete">
        <TabPane key="delete" tab={t("Delete")}>
          <DeletePane onDelete={onDelete} />
        </TabPane>
        <TabPane key="delete-prop" tab={t("Delete Properties")}>
          <DeletePropsPane data={data} onDeleteProps={onDeleteProps} />
        </TabPane>
        <TabPane key="rename-prop" tab={t("Rename Properties")}>
          <RenamePropsPane data={data} onRenameProps={onRenameProps} />
        </TabPane>
        <TabPane key="write-prop" tab={t("Write Properties")}>
          <WritePropsPane data={data} onWriteProps={onWriteProps} />
        </TabPane>
        <TabPane key="replace-content" tab={t("Replace Content")}>
          <ReplaceContentPane data={data} onReplace={onReplace} />
        </TabPane>
      </Tabs>
    </section>
  )
}
