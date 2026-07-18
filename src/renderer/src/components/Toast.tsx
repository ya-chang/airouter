import { useStore } from '../stores/store'

export default function Toast() {
  const { toast } = useStore()

  if (!toast) return null

  return <div className="toast">{toast}</div>
}
