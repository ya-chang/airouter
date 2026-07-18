import { useEffect } from 'react'
import { useStore } from './stores/store'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Guide from './components/Guide'

export default function App() {
  const { loadAgents, loadSettings } = useStore()

  useEffect(() => {
    loadAgents()
    loadSettings()
  }, [])

  return (
    <>
      <Guide />
      <Sidebar />
      <Toast />
    </>
  )
}
