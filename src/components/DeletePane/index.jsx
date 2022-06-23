import { Button, Popconfirm } from "@/components/antd"
import { ShellContext } from "@/libs/contexts"
import { t } from "logseq-l10n"
import { useCallback, useContext, useRef } from "preact/hooks"

export default function DeletePane() {
  const containerRef = useRef()
  const { batchProcess, resetQuery } = useContext(ShellContext)

  const deleteThem = useCallback(
    async (data) => {
      await Promise.all(
        data.map((block) =>
          block.page != null
            ? logseq.Editor.removeBlock(block.uuid)
            : logseq.Editor.deletePage(block.name),
        ),
      )
      resetQuery()
    },
    [resetQuery],
  )

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
        onConfirm={() => batchProcess(deleteThem)}
      >
        <Button type="primary" danger block>
          {t("Delete Block/Page")}
        </Button>
      </Popconfirm>
    </div>
  )
}
