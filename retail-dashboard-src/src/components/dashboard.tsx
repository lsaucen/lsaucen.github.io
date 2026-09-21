"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BoxesIcon,
  CircleDollarSignIcon,
  PackageCheckIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  ShoppingCartIcon,
  TargetIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type PeriodKey = "ytd" | "last6" | "q3"
type RegionKey = "all" | "North" | "East" | "Central" | "South"
type ChannelKey = "all" | "Store" | "Online" | "Marketplace"
type CategoryKey = "all" | "Home" | "Electronics" | "Beauty" | "Sports" | "Kids"

type RegionRow = {
  region: Exclude<RegionKey, "all">
  share: number
  revenue: number
  target: number
  margin: number
  growth: number
  stores: number
}

type ProductRow = {
  sku: string
  product: string
  category: Exclude<CategoryKey, "all">
  revenue: number
  margin: number
  units: number
  target: number
  returnRate: number
}

type OrderRow = {
  id: string
  customer: string
  region: Exclude<RegionKey, "all">
  channel: Exclude<ChannelKey, "all">
  amount: number
  items: number
  status: "Completed" | "Processing" | "Returned"
}

type DetailState = {
  title: string
  eyebrow: string
  description: string
  metrics: Array<{ label: string; value: string }>
} | null

const trendBase = [
  { month: "Jan", actual: 430, target: 450, prior: 392, store: 245, online: 136, marketplace: 49 },
  { month: "Feb", actual: 480, target: 500, prior: 428, store: 269, online: 157, marketplace: 54 },
  { month: "Mar", actual: 500, target: 520, prior: 447, store: 279, online: 164, marketplace: 57 },
  { month: "Apr", actual: 520, target: 530, prior: 462, store: 286, online: 172, marketplace: 62 },
  { month: "May", actual: 535, target: 550, prior: 476, store: 291, online: 178, marketplace: 66 },
  { month: "Jun", actual: 550, target: 570, prior: 489, store: 296, online: 184, marketplace: 70 },
  { month: "Jul", actual: 575, target: 590, prior: 510, store: 305, online: 194, marketplace: 76 },
  { month: "Aug", actual: 590, target: 610, prior: 523, store: 309, online: 201, marketplace: 80 },
  { month: "Sep", actual: 640, target: 680, prior: 583, store: 331, online: 218, marketplace: 91 },
]

const regionBase: RegionRow[] = [
  { region: "North", share: 0.30, revenue: 1446, target: 1418, margin: 39.8, growth: 14.4, stores: 12 },
  { region: "East", share: 0.245, revenue: 1181, target: 1256, margin: 36.1, growth: 9.1, stores: 10 },
  { region: "Central", share: 0.225, revenue: 1085, target: 1192, margin: 35.7, growth: 7.5, stores: 9 },
  { region: "South", share: 0.23, revenue: 1108, target: 1134, margin: 38.2, growth: 12.0, stores: 8 },
]

const categoryBase = [
  { category: "Home" as const, share: 0.245, revenue: 1181, margin: 41.2, growth: 15.8, fill: "var(--chart-1)" },
  { category: "Electronics" as const, share: 0.216, revenue: 1041, margin: 38.7, growth: 12.6, fill: "var(--chart-2)" },
  { category: "Beauty" as const, share: 0.191, revenue: 921, margin: 36.5, growth: 10.4, fill: "var(--chart-3)" },
  { category: "Sports" as const, share: 0.181, revenue: 872, margin: 34.9, growth: 7.8, fill: "var(--chart-4)" },
  { category: "Kids" as const, share: 0.167, revenue: 805, margin: 33.8, growth: 5.9, fill: "var(--chart-5)" },
]

const productBase: ProductRow[] = [
  { sku: "HOM-104", product: "Oak Dining Set", category: "Home", revenue: 410, margin: 43.2, units: 3800, target: 107, returnRate: 2.2 },
  { sku: "HOM-221", product: "Air Fryer Pro", category: "Home", revenue: 355, margin: 39.8, units: 5200, target: 101, returnRate: 2.9 },
  { sku: "ELE-431", product: "Nova Headphones", category: "Electronics", revenue: 338, margin: 36.9, units: 4700, target: 98, returnRate: 4.8 },
  { sku: "ELE-118", product: "Smart Display", category: "Electronics", revenue: 292, margin: 40.5, units: 2800, target: 101, returnRate: 3.7 },
  { sku: "BEA-390", product: "Hydra Serum", category: "Beauty", revenue: 275, margin: 45.1, units: 6100, target: 104, returnRate: 1.4 },
  { sku: "BEA-155", product: "Daily Essentials", category: "Beauty", revenue: 244, margin: 34.2, units: 6900, target: 92, returnRate: 2.0 },
  { sku: "SPO-251", product: "Trail Runner X", category: "Sports", revenue: 230, margin: 31.8, units: 3400, target: 89, returnRate: 6.2 },
  { sku: "SPO-087", product: "Core Yoga Kit", category: "Sports", revenue: 205, margin: 38.3, units: 4500, target: 96, returnRate: 2.6 },
  { sku: "KID-288", product: "PlayLab Blocks", category: "Kids", revenue: 194, margin: 35.7, units: 5100, target: 93, returnRate: 3.1 },
  { sku: "KID-073", product: "Mini Explorer", category: "Kids", revenue: 178, margin: 30.6, units: 3900, target: 87, returnRate: 5.5 },
]

const orders: OrderRow[] = [
  { id: "R-10948", customer: "Marina Stores", region: "North", channel: "Store", amount: 4280, items: 34, status: "Completed" },
  { id: "R-10947", customer: "Camila Reyes", region: "East", channel: "Online", amount: 684, items: 4, status: "Processing" },
  { id: "R-10946", customer: "Urban Haus", region: "Central", channel: "Marketplace", amount: 2310, items: 18, status: "Completed" },
  { id: "R-10945", customer: "José Valdez", region: "South", channel: "Online", amount: 418, items: 3, status: "Returned" },
  { id: "R-10944", customer: "Norte Living", region: "North", channel: "Store", amount: 5630, items: 41, status: "Completed" },
  { id: "R-10943", customer: "Andrea Molina", region: "East", channel: "Online", amount: 952, items: 7, status: "Completed" },
  { id: "R-10942", customer: "Casa Uno", region: "Central", channel: "Store", amount: 3180, items: 25, status: "Processing" },
  { id: "R-10941", customer: "MarketHub", region: "South", channel: "Marketplace", amount: 1760, items: 13, status: "Completed" },
]

const returnReasons = [
  { name: "Damaged", value: 31, fill: "var(--chart-5)" },
  { name: "Wrong size / fit", value: 24, fill: "var(--chart-4)" },
  { name: "Changed mind", value: 21, fill: "var(--chart-3)" },
  { name: "Late delivery", value: 14, fill: "var(--chart-2)" },
  { name: "Other", value: 10, fill: "var(--chart-1)" },
]

const trendConfig = {
  actual: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-4)" },
  prior: { label: "Prior year", color: "var(--chart-2)" },
} satisfies ChartConfig

const channelConfig = {
  store: { label: "Store", color: "var(--chart-1)" },
  online: { label: "Online", color: "var(--chart-2)" },
  marketplace: { label: "Marketplace", color: "var(--chart-3)" },
} satisfies ChartConfig

const regionConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
} satisfies ChartConfig

const emptyConfig = {} satisfies ChartConfig

const regionShare: Record<RegionKey, number> = {
  all: 1,
  North: 0.30,
  East: 0.245,
  Central: 0.225,
  South: 0.23,
}

const channelShare: Record<ChannelKey, number> = {
  all: 1,
  Store: 0.56,
  Online: 0.32,
  Marketplace: 0.12,
}

const categoryShare: Record<CategoryKey, number> = {
  all: 1,
  Home: 0.245,
  Electronics: 0.216,
  Beauty: 0.191,
  Sports: 0.181,
  Kids: 0.167,
}

function moneyK(value: number) {
  if (value >= 1000) return "$" + (value / 1000).toFixed(2) + "M"
  return "$" + Math.round(value) + "K"
}

function numberCompact(value: number) {
  if (value >= 1000) return (value / 1000).toFixed(1) + "K"
  return Math.round(value).toLocaleString()
}

function statusVariant(status: OrderRow["status"]) {
  if (status === "Completed") return "secondary" as const
  if (status === "Returned") return "destructive" as const
  return "outline" as const
}

export function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>("ytd")
  const [region, setRegion] = useState<RegionKey>("all")
  const [channel, setChannel] = useState<ChannelKey>("all")
  const [category, setCategory] = useState<CategoryKey>("all")
  const [detail, setDetail] = useState<DetailState>(null)

  const periodRows = useMemo(() => {
    if (period === "q3") return trendBase.slice(-3)
    if (period === "last6") return trendBase.slice(-6)
    return trendBase
  }, [period])

  const timeFactor = periodRows.reduce((sum, row) => sum + row.actual, 0) / 4820
  const scopeFactor = regionShare[region] * channelShare[channel] * categoryShare[category]

  const filteredTrend = useMemo(
    () =>
      periodRows.map((row) => ({
        ...row,
        actual: Math.round(row.actual * scopeFactor),
        target: Math.round(row.target * scopeFactor),
        prior: Math.round(row.prior * scopeFactor),
        store: Math.round(row.store * regionShare[region] * categoryShare[category]),
        online: Math.round(row.online * regionShare[region] * categoryShare[category]),
        marketplace: Math.round(row.marketplace * regionShare[region] * categoryShare[category]),
      })),
    [periodRows, scopeFactor, region, category]
  )

  const revenueK = filteredTrend.reduce((sum, row) => sum + row.actual, 0)
  const targetK = filteredTrend.reduce((sum, row) => sum + row.target, 0)
  const priorK = filteredTrend.reduce((sum, row) => sum + row.prior, 0)
  const growth = priorK ? ((revenueK - priorK) / priorK) * 100 : 0
  const targetAttainment = targetK ? (revenueK / targetK) * 100 : 0

  const marginAdjustment =
    category === "Home" ? 3.6 :
    category === "Electronics" ? 1.1 :
    category === "Beauty" ? -0.8 :
    category === "Sports" ? -2.7 :
    category === "Kids" ? -3.8 : 0

  const margin = 37.6 + marginAdjustment
  const grossProfitK = revenueK * (margin / 100)
  const ordersCount = Math.max(1, Math.round(57300 * timeFactor * scopeFactor))
  const aov = (revenueK * 1000) / ordersCount
  const returnRate = category === "Sports" ? 5.1 : category === "Electronics" ? 4.4 : 3.8

  const visibleRegions = useMemo(() => {
    const base = region === "all" ? regionBase : regionBase.filter((r) => r.region === region)
    return base.map((r) => ({
      ...r,
      revenue: Math.round(r.revenue * timeFactor * channelShare[channel] * categoryShare[category]),
      target: Math.round(r.target * timeFactor * channelShare[channel] * categoryShare[category]),
    }))
  }, [region, timeFactor, channel, category])

  const visibleCategories = useMemo(() => {
    const base = category === "all" ? categoryBase : categoryBase.filter((c) => c.category === category)
    return base.map((c) => ({
      ...c,
      revenue: Math.round(c.revenue * timeFactor * regionShare[region] * channelShare[channel]),
    }))
  }, [category, timeFactor, region, channel])

  const visibleProducts = useMemo(() => {
    const base = category === "all" ? productBase : productBase.filter((p) => p.category === category)
    return base
      .map((p) => ({
        ...p,
        revenue: Math.round(p.revenue * timeFactor * regionShare[region] * channelShare[channel]),
        units: Math.round(p.units * timeFactor * regionShare[region] * channelShare[channel]),
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [category, timeFactor, region, channel])

  const visibleOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (region === "all" || order.region === region) &&
          (channel === "all" || order.channel === channel)
      ),
    [region, channel]
  )

  function resetFilters() {
    setPeriod("ytd")
    setRegion("all")
    setChannel("all")
    setCategory("all")
  }

  function openRegionDetail(row: RegionRow) {
    setDetail({
      eyebrow: "Region drill-through",
      title: row.region,
      description:
        row.revenue >= row.target
          ? "This region is above target. The next management question is whether the gain is coming from sustainable volume, pricing, or product mix."
          : "This region is below target. The detail view separates commercial scale from margin quality so the shortfall is easier to diagnose.",
      metrics: [
        { label: "Revenue", value: moneyK(row.revenue) },
        { label: "Target", value: moneyK(row.target) },
        { label: "Gross margin", value: row.margin.toFixed(1) + "%" },
        { label: "Stores", value: String(row.stores) },
      ],
    })
  }

  function openProductDetail(row: ProductRow) {
    setDetail({
      eyebrow: "Product drill-through",
      title: row.product,
      description:
        row.target >= 100
          ? "The product is above plan. Focus on protecting availability and margin while demand remains strong."
          : "The product is below plan. Review assortment, promotion intensity and channel placement before increasing discounting.",
      metrics: [
        { label: "SKU", value: row.sku },
        { label: "Revenue", value: moneyK(row.revenue) },
        { label: "Margin", value: row.margin.toFixed(1) + "%" },
        { label: "Target", value: row.target + "%" },
        { label: "Units", value: numberCompact(row.units) },
        { label: "Return rate", value: row.returnRate.toFixed(1) + "%" },
      ],
    })
  }

  function openOrderDetail(row: OrderRow) {
    setDetail({
      eyebrow: "Order drill-through",
      title: row.id,
      description:
        "Order-level detail keeps the selected transaction context while surfacing channel, region, basket size and current status.",
      metrics: [
        { label: "Customer", value: row.customer },
        { label: "Amount", value: "$" + row.amount.toLocaleString() },
        { label: "Items", value: String(row.items) },
        { label: "Region", value: row.region },
        { label: "Channel", value: row.channel },
        { label: "Status", value: row.status },
      ],
    })
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-6">
        <section id="overview" className="scroll-mt-20">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <Badge className="mb-3" variant="outline">Retail performance · 2026</Badge>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Executive retail performance
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Sales, margin, target attainment, product performance and order quality in one interactive view.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={period} onValueChange={(value) => setPeriod(value as PeriodKey)}>
                <SelectTrigger className="min-w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ytd">YTD 2026</SelectItem>
                  <SelectItem value="last6">Last 6 months</SelectItem>
                  <SelectItem value="q3">Q3 2026</SelectItem>
                </SelectContent>
              </Select>

              <Select value={region} onValueChange={(value) => setRegion(value as RegionKey)}>
                <SelectTrigger className="min-w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="East">East</SelectItem>
                  <SelectItem value="Central">Central</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                </SelectContent>
              </Select>

              <Select value={channel} onValueChange={(value) => setChannel(value as ChannelKey)}>
                <SelectTrigger className="min-w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="Store">Store</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={(value) => setCategory(value as CategoryKey)}>
                <SelectTrigger className="min-w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={resetFilters} size="sm" variant="ghost">
                <RotateCcwIcon />
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border bg-border">
            <div className="grid grid-cols-2 gap-px lg:grid-cols-3 xl:grid-cols-6">
              <MetricCard
                icon={<CircleDollarSignIcon />}
                label="Revenue"
                value={moneyK(revenueK)}
                delta={growth}
                sublabel="vs prior year"
              />
              <MetricCard
                icon={<TrendingUpIcon />}
                label="Gross profit"
                value={moneyK(grossProfitK)}
                delta={2.6}
                sublabel={margin.toFixed(1) + "% margin"}
              />
              <MetricCard
                icon={<TargetIcon />}
                label="Target attainment"
                value={targetAttainment.toFixed(1) + "%"}
                delta={targetAttainment - 100}
                sublabel={moneyK(Math.abs(targetK - revenueK)) + " gap"}
              />
              <MetricCard
                icon={<ReceiptTextIcon />}
                label="Orders"
                value={numberCompact(ordersCount)}
                delta={8.4}
                sublabel="completed baskets"
              />
              <MetricCard
                icon={<ShoppingCartIcon />}
                label="Average order"
                value={"$" + aov.toFixed(2)}
                delta={6.2}
                sublabel="basket value"
              />
              <MetricCard
                icon={<PackageCheckIcon />}
                label="Return rate"
                value={returnRate.toFixed(1) + "%"}
                delta={-0.7}
                sublabel="vs prior period"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Signal
              icon={<TargetIcon />}
              title="Central remains the largest target gap"
              body="91% attainment before filters; growth is positive, but still not enough to close plan."
            />
            <Signal
              icon={<BoxesIcon />}
              title="Home combines scale and margin"
              body="The category leads revenue while keeping the strongest margin profile among large categories."
            />
            <Signal
              icon={<ArrowUpRightIcon />}
              title="Online is gaining share"
              body="Digital contribution expands through Q3 without requiring a proportional increase in returns."
            />
          </div>
        </section>

        <section id="sales" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Sales"
            title="Revenue movement and channel mix"
            description="Performance against target and prior year, with the channel composition underneath the same filter context."
          />

          <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue trend</CardTitle>
                <CardDescription>Actual vs target vs prior year · $K</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[330px] w-full" config={trendConfig}>
                  <AreaChart data={filteredTrend} margin={{ left: 6, right: 14, top: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tickFormatter={(value) => "$" + Number(value) + "K"}
                    />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area
                      dataKey="actual"
                      fill="var(--color-actual)"
                      fillOpacity={0.12}
                      stroke="var(--color-actual)"
                      strokeWidth={2.5}
                      type="monotone"
                    />
                    <Line
                      dataKey="target"
                      dot={false}
                      stroke="var(--color-target)"
                      strokeDasharray="6 5"
                      strokeWidth={2}
                      type="monotone"
                    />
                    <Line
                      dataKey="prior"
                      dot={false}
                      stroke="var(--color-prior)"
                      strokeWidth={1.5}
                      type="monotone"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Channel contribution</CardTitle>
                <CardDescription>Revenue mix by month · stacked</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[330px] w-full" config={channelConfig}>
                  <BarChart data={filteredTrend} margin={{ left: 4, right: 4, top: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="store" fill="var(--color-store)" radius={[3, 3, 0, 0]} stackId="sales" />
                    <Bar dataKey="online" fill="var(--color-online)" stackId="sales" />
                    <Bar dataKey="marketplace" fill="var(--color-marketplace)" radius={[3, 3, 0, 0]} stackId="sales" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="regions" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Regions"
            title="Where plan is being won or lost"
            description="Regional scale, assigned target, margin and store footprint."
          />

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue vs regional target</CardTitle>
                <CardDescription>Click a row in the table for drill-through.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px] w-full" config={regionConfig}>
                  <BarChart
                    data={visibleRegions}
                    layout="vertical"
                    margin={{ left: 4, right: 16, top: 8 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(v) => "$" + v + "K"} />
                    <YAxis
                      dataKey="region"
                      type="category"
                      width={62}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="target" fill="var(--color-target)" opacity={0.28} radius={4} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Regional scorecard</CardTitle>
                <CardDescription>Scale and quality side by side.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Region</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Growth</TableHead>
                      <TableHead className="pr-6 text-right">Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRegions.map((row) => {
                      const plan = row.target ? (row.revenue / row.target) * 100 : 0
                      return (
                        <TableRow
                          className="cursor-pointer"
                          key={row.region}
                          onClick={() => openRegionDetail(row)}
                        >
                          <TableCell className="pl-6 font-medium">{row.region}</TableCell>
                          <TableCell>{row.margin.toFixed(1)}%</TableCell>
                          <TableCell className="text-emerald-600">+{row.growth.toFixed(1)}%</TableCell>
                          <TableCell className="pr-6 text-right">
                            <Badge variant={plan >= 100 ? "secondary" : plan >= 95 ? "outline" : "destructive"}>
                              {plan.toFixed(0)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="products" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Products"
            title="Portfolio mix and profitability"
            description="Category contribution plus product-level scale, margin and unit velocity."
          />

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.35fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Category revenue mix</CardTitle>
                <CardDescription>Contribution to filtered revenue.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[310px] w-full" config={emptyConfig}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
                    <Pie
                      data={visibleCategories}
                      dataKey="revenue"
                      nameKey="category"
                      innerRadius={68}
                      outerRadius={106}
                      paddingAngle={2}
                    >
                      {visibleCategories.map((row) => (
                        <Cell fill={row.fill} key={row.category} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Scale vs profitability</CardTitle>
                <CardDescription>Revenue on X, gross margin on Y, bubble size = units sold.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[310px] w-full" config={emptyConfig}>
                  <ScatterChart margin={{ left: 8, right: 24, top: 12, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="revenue"
                      name="Revenue"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => "$" + v + "K"}
                    />
                    <YAxis
                      type="number"
                      dataKey="margin"
                      name="Margin"
                      domain={[28, 47]}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v + "%"}
                    />
                    <ZAxis type="number" dataKey="units" range={[70, 320]} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <div className="flex min-w-36 items-center justify-between gap-4">
                              <span className="text-muted-foreground">{String(name)}</span>
                              <span className="font-mono font-medium">
                                {name === "margin" ? Number(value).toFixed(1) + "%" : String(value)}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    {(["Home", "Electronics", "Beauty", "Sports", "Kids"] as const).map((cat, index) => {
                      const rows = visibleProducts.filter((p) => p.category === cat)
                      if (!rows.length) return null
                      const fills = [
                        "var(--chart-1)",
                        "var(--chart-2)",
                        "var(--chart-3)",
                        "var(--chart-4)",
                        "var(--chart-5)",
                      ]
                      return <Scatter data={rows} fill={fills[index]} key={cat} name={cat} />
                    })}
                    <Legend />
                  </ScatterChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Top products</CardTitle>
              <CardDescription>Click any product to open the drill-through panel.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead className="pr-6 text-right">Plan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.slice(0, 8).map((row) => (
                    <TableRow
                      className="cursor-pointer"
                      key={row.sku}
                      onClick={() => openProductDetail(row)}
                    >
                      <TableCell className="pl-6">
                        <div className="font-medium">{row.product}</div>
                        <div className="text-xs text-muted-foreground">{row.sku}</div>
                      </TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{moneyK(row.revenue)}</TableCell>
                      <TableCell>{row.margin.toFixed(1)}%</TableCell>
                      <TableCell>{numberCompact(row.units)}</TableCell>
                      <TableCell>{row.returnRate.toFixed(1)}%</TableCell>
                      <TableCell className="pr-6 text-right">
                        <Badge variant={row.target >= 100 ? "secondary" : row.target >= 95 ? "outline" : "destructive"}>
                          {row.target}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section id="orders" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Orders"
            title="Transaction quality and returns"
            description="Recent order activity paired with the reasons behind returned merchandise."
          />

          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent orders</CardTitle>
                <CardDescription>Click an order to preserve its context in drill-through.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="pr-6 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleOrders.map((row) => (
                      <TableRow
                        className="cursor-pointer"
                        key={row.id}
                        onClick={() => openOrderDetail(row)}
                      >
                        <TableCell className="pl-6 font-mono text-xs">{row.id}</TableCell>
                        <TableCell className="font-medium">{row.customer}</TableCell>
                        <TableCell>{row.region}</TableCell>
                        <TableCell>{row.channel}</TableCell>
                        <TableCell>{row.items}</TableCell>
                        <TableCell>{"$" + row.amount.toLocaleString()}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!visibleOrders.length && (
                      <TableRow>
                        <TableCell className="h-24 text-center text-muted-foreground" colSpan={7}>
                          No recent orders match the current region and channel filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Return reasons</CardTitle>
                <CardDescription>Share of returned orders.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[285px] w-full" config={emptyConfig}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={returnReasons}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {returnReasons.map((row) => (
                        <Cell fill={row.fill} key={row.name} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="methodology" className="scroll-mt-20 rounded-xl border bg-muted/25 p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background">
              <BoxesIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium">Portfolio methodology</h2>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground">
                All values are synthetic. The project is designed to demonstrate dashboard UX, filter context,
                KPI hierarchy, multiple chart forms, exception analysis and drill-through without exposing client
                or employer data.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Sheet open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="border-b">
            <Badge className="mb-2 w-fit" variant="outline">{detail?.eyebrow}</Badge>
            <SheetTitle className="text-xl">{detail?.title}</SheetTitle>
            <SheetDescription>{detail?.description}</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 px-4">
            {detail?.metrics.map((metric) => (
              <div className="rounded-lg border bg-muted/25 p-3" key={metric.label}>
                <div className="text-[11px] text-muted-foreground">{metric.label}</div>
                <div className="mt-1 text-base font-semibold tabular-nums">{metric.value}</div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <h3 className="text-sm font-medium">How to use this detail</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Drill-through should answer the next question created by the selected visual, not repeat the same
              KPI. In a production model this panel would receive the selected region, product or order key and
              query the detailed fact table.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  delta,
  sublabel,
}: {
  icon: React.ReactNode
  label: string
  value: string
  delta: number
  sublabel: string
}) {
  const positive = delta >= 0
  return (
    <div className="min-h-32 bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="grid size-7 place-items-center rounded-md border bg-muted/25 text-muted-foreground [&>svg]:size-3.5">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-[11px]">
        <span className={positive ? "text-emerald-600" : "text-rose-600"}>
          {positive ? <ArrowUpRightIcon className="inline size-3" /> : <ArrowDownRightIcon className="inline size-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="text-muted-foreground">{sublabel}</span>
      </div>
    </div>
  )
}

function Signal({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3 rounded-lg border bg-background p-4">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground [&>svg]:size-4">
        {icon}
      </div>
      <div>
        <div className="text-xs font-medium">{title}</div>
        <div className="mt-1 text-[11px] leading-4 text-muted-foreground">{body}</div>
      </div>
    </div>
  )
}
