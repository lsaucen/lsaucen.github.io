import type { ReactNode } from "react"
import {
  ChartNoAxesCombinedIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  PackageSearchIcon,
  ShoppingBagIcon,
  SquareChartGanttIcon,
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
    label: "Retail performance",
    items: [
      {
        title: "Overview",
        url: "#overview",
        icon: <LayoutDashboardIcon />,
        isActive: true,
      },
      {
        title: "Sales",
        url: "#sales",
        icon: <ChartNoAxesCombinedIcon />,
      },
      {
        title: "Products",
        url: "#products",
        icon: <PackageSearchIcon />,
      },
      {
        title: "Regions",
        url: "#regions",
        icon: <MapPinnedIcon />,
      },
      {
        title: "Orders",
        url: "#orders",
        icon: <ShoppingBagIcon />,
      },
    ],
  },
]

export const footerNavLinks: SidebarNavItem[] = [
  {
    title: "Methodology",
    url: "#methodology",
    icon: <DatabaseIcon />,
  },
  {
    title: "Main portfolio",
    url: "https://lsaucen.github.io/",
    icon: <ArrowUpRightIcon />,
  },
]

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) => group.items),
  ...footerNavLinks,
]

export const dashboardIdentity = {
  name: "Retail Analytics",
  subtitle: "Performance command center",
  icon: <SquareChartGanttIcon />,
}
