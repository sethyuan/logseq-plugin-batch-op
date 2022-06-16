import { Button, Popconfirm } from "@/components/antd"
import { t } from "logseq-l10n"
import { useRef } from "preact/hooks"

export default function DeletePane({ onDelete }) {
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
