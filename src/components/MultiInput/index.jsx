import { Button } from "@/components/antd"
import MinusIcon from "@/icons/minus.svg"
import { t } from "logseq-l10n"
import { cloneElement, forwardRef } from "preact/compat"
import { useImperativeHandle, useRef, useState } from "preact/hooks"
import styles from "./index.css"

function MultiInput({ template, doneButton, onDone }, ref) {
  const data = useRef([""])
  const [changeFns, setChangeFns] = useState(() => [makeChangeFn(0)])

  useImperativeHandle(ref, () => ({
    reset() {
      data.current = [""]
      setChangeFns([makeChangeFn(0)])
    },
  }))

  function makeChangeFn(index) {
    return (prop) => {
      data.current[index] = prop
    }
  }

  function removeInput(index) {
    data.current.splice(index, 1)
    setChangeFns((fns) => fns.slice(0, fns.length - 1))
  }

  function addOne() {
    data.current.push("")
    setChangeFns((fns) => [...fns, makeChangeFn(fns.length)])
  }

  function finish() {
    onDone?.(data.current.slice())
  }

  return (
    <div class={styles.container}>
      {cloneElement(template(changeFns[0]), { key: changeFns[0] })}
      {changeFns.slice(1).map((fn, i) => (
        <div key={i} class={styles.row}>
          {template(fn)}
          <Button
            size="small"
            shape="circle"
            icon={<MinusIcon width={18} height={22} fill="#888" />}
            onClick={() => removeInput(i)}
          />
        </div>
      ))}
      <div class={styles.addBtn}>
        <Button onClick={addOne}>{t("Add one")}</Button>
      </div>
      {doneButton(finish)}
    </div>
  )
}

MultiInput = forwardRef(MultiInput)

export default MultiInput
