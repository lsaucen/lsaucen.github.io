import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/20">
      <SidebarProvider className="relative mx-auto min-h-svh w-full max-w-[1600px] border-x bg-background">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex flex-1 flex-col overflow-y-auto p-4 md:p-6 xl:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
