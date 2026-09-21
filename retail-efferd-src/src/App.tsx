import { AppShell } from "@/components/app-shell"
import { Dashboard } from "@/components/dashboard"
import { TooltipProvider } from "@/components/ui/tooltip"

export function App() {
  return (
    <TooltipProvider>
      <AppShell>
        <Dashboard />
      </AppShell>
    </TooltipProvider>
  )
}

export default App
