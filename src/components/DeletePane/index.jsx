import { Button, Popconfirm } from "@/components/antd"
import { t } from "logseq-l10n"
import { useRef } from "preact/hooks"
import { useWaitedAction } from "reactutils"

export default function DeletePane({ onDelete }) {
  const containerRef = useRef()
  const { action, duringAction } = useWaitedAction(onDelete)

  return (
    <div ref={containerRef}>
      <Popconfirm
        getPopupContainer={() => containerRef.current}
        placement="bottom"
        title={t(
          "Deleting a page/block will also delete its sub-blocks, are you sure to continue?",
        )}
        okText={t("Yes")}
        cancelText={t("I'll reconsider")}
        okButtonProps={{ danger: true }}
        onConfirm={action}
      >
        <Button type="primary" danger block disabled={duringAction}>
          {t("Delete Block/Page")}
        </Button>
      </Popconfirm>
    </div>
  )
}
