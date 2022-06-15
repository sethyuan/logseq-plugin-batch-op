import { Button, Input, Popconfirm, Tabs } from "@/components/antd"
import MultiInput from "@/components/MultiInput"
import { t } from "logseq-l10n"
import { useEffect, useRef } from "preact/hooks"
import styles from "./index.css"

const { TabPane } = Tabs

export default function BatchOps({
  data,
  onDelete,
  onDeleteProps,
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

function DeletePane({ onDelete }) {
  const containerRef = useRef()

  return (
    <div ref={containerRef}>
      <Popconfirm
        getPopupContainer={() => containerRef.current}
        placement="bottom"
        title={t("Sure to delete all these blocks and pages?")}
        okText={t("Yes")}
        cancelText={t("I'll reconsider")}
        okButtonProps={{ danger: true }}
        onConfirm={onDelete}
      >
        <Button type="primary" danger block>
          {t("Delete Block/Page")}
        </Button>
      </Popconfirm>
    </div>
  )
}

function DeletePropsPane({ data, onDeleteProps }) {
  const multiInputRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    multiInputRef.current.reset()
  }, [data])

  return (
    <MultiInput
      ref={multiInputRef}
      template={(onChange) => (
        <Input
          placeholder={t("Property to delete")}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      onDone={onDeleteProps}
      doneButton={(finish) => (
        <div ref={containerRef}>
          <Popconfirm
            getPopupContainer={() => containerRef.current}
            placement="bottom"
            title={t("Sure to delete all these blocks and pages?")}
            okText={t("Yes")}
            cancelText={t("I'll reconsider")}
            okButtonProps={{ danger: true }}
            onConfirm={finish}
          >
            <Button type="primary" danger block>
              {t("Delete")}
            </Button>
          </Popconfirm>
        </div>
      )}
    />
  )
}

function WritePropsPane({ data, onWriteProps }) {
  const multiInputRef = useRef()

  useEffect(() => {
    multiInputRef.current.reset()
  }, [data])

  return (
    <MultiInput
      ref={multiInputRef}
      template={({ onChange }) => (
        <Input onChange={(e) => onChange(e.target.value)} />
      )}
      onProcess={onWriteProps}
    />
  )
}

function ReplaceContentPane({ data, onReplace }) {
  useEffect(() => {
    // TODO clear inputs
  }, [data])

  return null
}
