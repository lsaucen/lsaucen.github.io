import type { ReactNode } from "react"
import {
  ActivityIcon,
  ChartNoAxesCombinedIcon,
  CompassIcon,
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  MonitorSmartphoneIcon,
  MousePointerClickIcon,
  RouteIcon,
  ArrowUpRightIcon,
  DatabaseIcon,
} from "lucide-react"

export type SidebarNavItem = {
  title: string
  url: string
  icon: ReactNode
  isActive?: boolean
}

export type SidebarNavGroup = {
  label?: string
  items: SidebarNavItem[]
}

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Web analytics",
    items: [
      { title: "Overview", url: "#overview", icon: <LayoutDashboardIcon />, isActive: true },
      { title: "Acquisition", url: "#acquisition", icon: <CompassIcon /> },
      { title: "Funnel", url: "#funnel", icon: <MousePointerClickIcon /> },
      { title: "Journeys", url: "#journeys", icon: <RouteIcon /> },
      { title: "Content", url: "#content", icon: <GalleryVerticalEndIcon /> },
      { title: "Devices", url: "#devices", icon: <MonitorSmartphoneIcon /> },
    ],
  },
]

export const footerNavLinks: SidebarNavItem[] = [
  { title: "Methodology", url: "#methodology", icon: <DatabaseIcon /> },
  { title: "Main portfolio", url: "https://lsaucen.github.io/", icon: <ArrowUpRightIcon /> },
]

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) => group.items),
  ...footerNavLinks,
]

export const dashboardIdentity = {
  name: "Web Analytics",
  subtitle: "Acquisition & journey analysis",
  icon: <ActivityIcon />,
}

export const sectionLabels: Record<string, string> = {
  overview: "Overview",
  acquisition: "Acquisition",
  funnel: "Funnel",
  journeys: "Journeys",
  content: "Content",
  devices: "Devices",
  methodology: "Methodology",
}

export const analyticsIcon = <ChartNoAxesCombinedIcon />
