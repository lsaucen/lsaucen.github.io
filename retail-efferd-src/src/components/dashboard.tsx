"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CircleDollarSignIcon,
  FilterIcon,
  GaugeIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  TrendingDownIcon,
  UsersIcon,
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

type WindowKey = "12m" | "6m" | "3m"
type PlanKey = "all" | "Starter" | "Growth" | "Pro"
type SourceKey = "all" | "Organic" | "Paid" | "Partner" | "Product-led"

type DetailState = {
  eyebrow: string
  title: string
  description: string
  metrics: Array<{ label: string; value: string }>
} | null

type SegmentRow = {
  segment: string
  customers: number
  retention90: number
  churn: number
  nrr: number
  ltv: number
  cac: number
  risk: number
  value: number
}

const cohortRows = [
  { cohort: "Jan", size: 2160, values: [100, 88, 82, 79, 77, 76, 74, 73, 72] },
  { cohort: "Feb", size: 2240, values: [100, 87, 81, 78, 76, 74, 73, 72] },
  { cohort: "Mar", size: 2380, values: [100, 89, 84, 81, 79, 77, 76] },
  { cohort: "Apr", size: 2470, values: [100, 90, 85, 82, 80, 79] },
  { cohort: "May", size: 2590, values: [100, 91, 86, 83, 82] },
  { cohort: "Jun", size: 2710, values: [100, 91, 87, 85] },
  { cohort: "Jul", size: 2820, values: [100, 92, 88] },
  { cohort: "Aug", size: 2960, values: [100, 93] },
]

const retentionCurves = [
  { month: "M0", Starter: 100, Growth: 100, Pro: 100 },
  { month: "M1", Starter: 84, Growth: 89, Pro: 94 },
  { month: "M2", Starter: 77, Growth: 84, Pro: 91 },
  { month: "M3", Starter: 72, Growth: 81, Pro: 89 },
  { month: "M4", Starter: 69, Growth: 79, Pro: 88 },
  { month: "M5", Starter: 66, Growth: 77, Pro: 87 },
  { month: "M6", Starter: 64, Growth: 76, Pro: 86 },
  { month: "M9", Starter: 60, Growth: 73, Pro: 84 },
  { month: "M12", Starter: 57, Growth: 71, Pro: 83 },
]

const hazard = [
  { tenure: "M1", churn: 7.8, cumulative: 7.8 },
  { tenure: "M2", churn: 6.1, cumulative: 13.4 },
  { tenure: "M3", churn: 4.8, cumulative: 17.6 },
  { tenure: "M4", churn: 3.9, cumulative: 20.8 },
  { tenure: "M5", churn: 3.4, cumulative: 23.5 },
  { tenure: "M6", churn: 3.0, cumulative: 25.8 },
  { tenure: "M7", churn: 2.7, cumulative: 27.8 },
  { tenure: "M8", churn: 2.5, cumulative: 29.6 },
  { tenure: "M9", churn: 2.3, cumulative: 31.2 },
  { tenure: "M10", churn: 2.2, cumulative: 32.7 },
  { tenure: "M11", churn: 2.0, cumulative: 34.0 },
  { tenure: "M12", churn: 1.9, cumulative: 35.3 },
]

const churnReasons = [
  { reason: "Low product usage", share: 31 },
  { reason: "Price / budget", share: 24 },
  { reason: "Missing capability", share: 18 },
  { reason: "Support friction", share: 12 },
  { reason: "Switched provider", share: 9 },
  { reason: "Other", share: 6 },
]

const lifecycleNodes = [
  { id: "new", label: "New", x: 38, y: 74, h: 116, color: "var(--chart-4)" },
  { id: "active", label: "Active", x: 306, y: 84, h: 158, color: "var(--chart-2)" },
  { id: "risk", label: "At risk", x: 574, y: 116, h: 102, color: "var(--chart-3)" },
  { id: "churned", label: "Churned", x: 842, y: 66, h: 92, color: "var(--chart-5)" },
  { id: "reactivated", label: "Reactivated", x: 842, y: 224, h: 76, color: "var(--chart-1)" },
]

const lifecycleLinks = [
  { from: "new", to: "active", value: 68, fromOffset: 48, toOffset: 66, color: "var(--chart-4)" },
  { from: "new", to: "risk", value: 14, fromOffset: 88, toOffset: 24, color: "var(--chart-3)" },
  { from: "active", to: "risk", value: 21, fromOffset: 112, toOffset: 58, color: "var(--chart-3)" },
  { from: "risk", to: "churned", value: 16, fromOffset: 46, toOffset: 42, color: "var(--chart-5)" },
  { from: "risk", to: "reactivated", value: 8, fromOffset: 76, toOffset: 34, color: "var(--chart-1)" },
  { from: "reactivated", to: "active", value: 6, fromOffset: 54, toOffset: 136, color: "var(--chart-1)", reverse: true },
]

const waterfall = [
  { label: "Starting MRR", delta: 1000, total: 1000, kind: "base" },
  { label: "Expansion", delta: 126, total: 1126, kind: "positive" },
  { label: "Contraction", delta: -47, total: 1079, kind: "negative" },
  { label: "Churn", delta: -82, total: 997, kind: "negative" },
  { label: "Reactivation", delta: 89, total: 1086, kind: "positive" },
  { label: "Ending MRR", delta: 1086, total: 1086, kind: "base" },
]

const segments: SegmentRow[] = [
  { segment: "Pro · Product-led", customers: 2840, retention90: 86.2, churn: 1.8, nrr: 121.4, ltv: 8420, cac: 1180, risk: 24, value: 92 },
  { segment: "Growth · Organic", customers: 4620, retention90: 78.6, churn: 2.6, nrr: 112.8, ltv: 4860, cac: 840, risk: 36, value: 77 },
  { segment: "Growth · Partner", customers: 2210, retention90: 75.1, churn: 3.0, nrr: 108.7, ltv: 4210, cac: 970, risk: 44, value: 70 },
  { segment: "Starter · Organic", customers: 3980, retention90: 69.8, churn: 3.8, nrr: 98.4, ltv: 2180, cac: 610, risk: 58, value: 49 },
  { segment: "Starter · Paid", customers: 3120, retention90: 61.4, churn: 5.2, nrr: 90.1, ltv: 1640, cac: 760, risk: 76, value: 34 },
  { segment: "Pro · Partner", customers: 1680, retention90: 82.4, churn: 2.1, nrr: 116.3, ltv: 7210, cac: 1320, risk: 31, value: 86 },
]

const ltvScatter = segments.map((row) => ({
  ...row,
  ratio: +(row.ltv / row.cac).toFixed(1),
}))

const retentionConfig = {
  Starter: { label: "Starter", color: "var(--chart-5)" },
  Growth: { label: "Growth", color: "var(--chart-2)" },
  Pro: { label: "Pro", color: "var(--chart-1)" },
} satisfies ChartConfig

const hazardConfig = {
  churn: { label: "Monthly churn hazard", color: "var(--chart-5)" },
  cumulative: { label: "Cumulative churn", color: "var(--chart-4)" },
} satisfies ChartConfig

const emptyConfig = {} satisfies ChartConfig

const windowFactor: Record<WindowKey, number> = { "12m": 1, "6m": 0.56, "3m": 0.30 }
const planFactor: Record<PlanKey, number> = { all: 1, Starter: 0.44, Growth: 0.38, Pro: 0.18 }
const sourceFactor: Record<SourceKey, number> = { all: 1, Organic: 0.34, Paid: 0.24, Partner: 0.18, "Product-led": 0.24 }

function compact(value: number) {
  if (value >= 1000) return (value / 1000).toFixed(value >= 10000 ? 1 : 2) + "K"
  return Math.round(value).toLocaleString()
}

function money(value: number) {
  return "$" + Math.round(value).toLocaleString()
}

export function Dashboard() {
  const [windowKey, setWindowKey] = useState<WindowKey>("12m")
  const [plan, setPlan] = useState<PlanKey>("all")
  const [source, setSource] = useState<SourceKey>("all")
  const [detail, setDetail] = useState<DetailState>(null)

  const scale = windowFactor[windowKey] * planFactor[plan] * sourceFactor[source]

  const planRetentionAdjustment = plan === "Pro" ? 9.8 : plan === "Growth" ? 4.1 : plan === "Starter" ? -4.8 : 0
  const sourceRetentionAdjustment = source === "Product-led" ? 5.6 : source === "Organic" ? 2.2 : source === "Paid" ? -5.1 : source === "Partner" ? 1.3 : 0
  const retention90 = 72.4 + planRetentionAdjustment + sourceRetentionAdjustment
  const monthlyChurn = Math.max(1.2, 3.1 - planRetentionAdjustment * 0.12 - sourceRetentionAdjustment * 0.10)
  const nrr = 108.6 + planRetentionAdjustment * 0.9 + sourceRetentionAdjustment * 0.5
  const activeCustomers = 18450 * scale
  const atRisk = 842 * scale * (monthlyChurn / 3.1)
  const expansionMrr = 92_000 * scale * (nrr / 108.6)

  const visibleCohorts = useMemo(() => {
    const rows = windowKey === "3m" ? cohortRows.slice(-3) : windowKey === "6m" ? cohortRows.slice(-6) : cohortRows
    const offset = planRetentionAdjustment * 0.25 + sourceRetentionAdjustment * 0.25
    return rows.map((row) => ({
      ...row,
      values: row.values.map((value, index) =>
        index === 0 ? 100 : Math.min(98, Math.max(40, Number((value + offset).toFixed(1))))
      ),
    }))
  }, [windowKey, planRetentionAdjustment, sourceRetentionAdjustment])

  function resetFilters() {
    setWindowKey("12m")
    setPlan("all")
    setSource("all")
  }

  function openSegment(row: SegmentRow) {
    setDetail({
      eyebrow: "Segment drill-through",
      title: row.segment,
      description:
        row.nrr >= 110
          ? "This segment combines durable retention with expansion. The operational question is how to preserve the acquisition and product behaviors producing that value."
          : row.churn >= 4
            ? "This segment carries elevated churn risk and should be investigated for onboarding, pricing or activation friction."
            : "This segment sits between healthy and fragile behavior and benefits from closer lifecycle monitoring.",
      metrics: [
        { label: "Customers", value: row.customers.toLocaleString() },
        { label: "90-day retention", value: row.retention90.toFixed(1) + "%" },
        { label: "Monthly churn", value: row.churn.toFixed(1) + "%" },
        { label: "NRR", value: row.nrr.toFixed(1) + "%" },
        { label: "LTV", value: money(row.ltv) },
        { label: "CAC", value: money(row.cac) },
      ],
    })
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-7">
        <section id="overview" className="scroll-mt-20">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <Badge className="mb-3" variant="outline">Subscription analytics · synthetic data</Badge>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Customer retention intelligence</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                See which cohorts survive, when customers become fragile, how lifecycle states change and where retention creates or destroys recurring revenue.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={windowKey} onValueChange={(value) => setWindowKey(value as WindowKey)}>
                <SelectTrigger className="min-w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                </SelectContent>
              </Select>

              <Select value={plan} onValueChange={(value) => setPlan(value as PlanKey)}>
                <SelectTrigger className="min-w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={source} onValueChange={(value) => setSource(value as SourceKey)}>
                <SelectTrigger className="min-w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="Organic">Organic</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Product-led">Product-led</SelectItem>
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
              <MetricCard icon={<UsersIcon />} label="Active customers" value={compact(activeCustomers)} delta={8.4} sublabel="vs prior period" />
              <MetricCard icon={<GaugeIcon />} label="90-day retention" value={retention90.toFixed(1) + "%"} delta={2.7} sublabel="cohort survival" />
              <MetricCard icon={<TrendingDownIcon />} label="Monthly churn" value={monthlyChurn.toFixed(1) + "%"} delta={-0.6} sublabel="logo churn" invertDelta />
              <MetricCard icon={<CircleDollarSignIcon />} label="Net revenue retention" value={nrr.toFixed(1) + "%"} delta={4.2} sublabel="including expansion" />
              <MetricCard icon={<ArrowUpRightIcon />} label="Expansion MRR" value={money(expansionMrr)} delta={13.1} sublabel="upsell + seat growth" />
              <MetricCard icon={<ShieldAlertIcon />} label="At-risk customers" value={compact(atRisk)} delta={-7.9} sublabel="behavioral risk" invertDelta />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Signal title="The danger zone is early" body="Churn hazard peaks in months 1–2, before customers establish durable product habits." />
            <Signal title="Pro customers expand after they retain" body="The Pro plan carries the strongest 90-day survival and the highest net revenue retention." />
            <Signal title="Paid acquisition needs a retention lens" body="Paid cohorts enter at scale but trail organic and product-led cohorts on 90-day retention." />
          </div>
        </section>

        <section id="cohorts" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Cohorts"
            title="Retention is a curve, not a single KPI"
            description="The cohort matrix shows how each signup month decays; the curve view compares plan durability over longer tenure."
          />

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly retention cohorts</CardTitle>
                <CardDescription>Rows = signup cohort · columns = months since signup</CardDescription>
              </CardHeader>
              <CardContent>
                <CohortHeatmap rows={visibleCohorts} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Retention survival curves</CardTitle>
                <CardDescription>Plan-level retention over customer tenure</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[360px] w-full" config={retentionConfig}>
                  <LineChart data={retentionCurves} margin={{ left: 4, right: 16, top: 12, bottom: 4 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="Starter" dot={false} stroke="var(--color-Starter)" strokeWidth={2.2} type="monotone" />
                    <Line dataKey="Growth" dot={false} stroke="var(--color-Growth)" strokeWidth={2.4} type="monotone" />
                    <Line dataKey="Pro" dot={false} stroke="var(--color-Pro)" strokeWidth={2.6} type="monotone" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="churn" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Churn"
            title="When and why customers leave"
            description="Hazard analysis identifies the tenure moments with the highest cancellation risk; reason concentration shows where intervention can matter."
          />

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Churn hazard by tenure</CardTitle>
                <CardDescription>Bars = monthly risk · line = cumulative churn</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[340px] w-full" config={hazardConfig}>
                  <ComposedChart data={hazard} margin={{ left: 8, right: 12, top: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="tenure" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" domain={[0, 9]} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 40]} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="churn" fill="var(--color-churn)" radius={[5, 5, 0, 0]} />
                    <Line yAxisId="right" dataKey="cumulative" dot={false} stroke="var(--color-cumulative)" strokeWidth={2.4} type="monotone" />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Churn reason concentration</CardTitle>
                <CardDescription>Pareto-style ranking of cancellation drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <ReasonPareto />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="lifecycle" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Lifecycle"
            title="Customers move between states before they churn"
            description="A lifecycle flow makes risk visible before cancellation and separates true churn from recoverable customers."
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lifecycle state transitions</CardTitle>
              <CardDescription>Flow width approximates customer movement between states</CardDescription>
            </CardHeader>
            <CardContent>
              <LifecycleFlow />
            </CardContent>
          </Card>
        </section>

        <section id="economics" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Economics"
            title="Retention becomes valuable when revenue survives and expands"
            description="NRR decomposition explains recurring-revenue movement; LTV/CAC shows which segments create enough lifetime value to justify acquisition cost."
          />

          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">NRR bridge</CardTitle>
                <CardDescription>Starting MRR → expansion, contraction, churn, reactivation → ending MRR</CardDescription>
              </CardHeader>
              <CardContent>
                <WaterfallChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">LTV vs CAC by segment</CardTitle>
                <CardDescription>Bubble size = customers · stronger segments sit high and left</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[350px] w-full" config={emptyConfig}>
                  <ScatterChart margin={{ left: 8, right: 24, top: 16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="cac" name="CAC" domain={[400, 1500]} axisLine={false} tickLine={false} tickFormatter={(v) => "$" + v} />
                    <YAxis type="number" dataKey="ltv" name="LTV" domain={[1000, 9000]} axisLine={false} tickLine={false} tickFormatter={(v) => "$" + Math.round(v / 1000) + "K"} />
                    <ZAxis type="number" dataKey="customers" range={[130, 520]} />
                    <ReferenceLine y={3000} stroke="var(--muted-foreground)" strokeDasharray="5 5" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Scatter data={ltvScatter} fill="var(--chart-2)" name="Segments" />
                  </ScatterChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="segments" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Segments"
            title="High value and high risk are not the same problem"
            description="The matrix separates retention risk from customer value; the scorecard below supports drill-through into individual segments."
          />

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk × value matrix</CardTitle>
                <CardDescription>Prioritize interventions using both churn risk and economic value</CardDescription>
              </CardHeader>
              <CardContent>
                <RiskValueMatrix />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Segment scorecard</CardTitle>
                <CardDescription>Click a row for drill-through.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Segment</TableHead>
                      <TableHead>Customers</TableHead>
                      <TableHead>90d retention</TableHead>
                      <TableHead>Churn</TableHead>
                      <TableHead>NRR</TableHead>
                      <TableHead className="pr-6 text-right">LTV/CAC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segments.map((row) => (
                      <TableRow className="cursor-pointer" key={row.segment} onClick={() => openSegment(row)}>
                        <TableCell className="pl-6 font-medium">{row.segment}</TableCell>
                        <TableCell>{row.customers.toLocaleString()}</TableCell>
                        <TableCell>{row.retention90.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant={row.churn >= 4 ? "destructive" : row.churn <= 2.2 ? "secondary" : "outline"}>
                            {row.churn.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{row.nrr.toFixed(1)}%</TableCell>
                        <TableCell className="pr-6 text-right">{(row.ltv / row.cac).toFixed(1)}x</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="methodology" className="scroll-mt-20 rounded-xl border bg-muted/25 p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background">
              <FilterIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium">Portfolio methodology</h2>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground">
                All values are synthetic. The case study demonstrates cohort survival, churn hazard, lifecycle transitions,
                net revenue retention, segment economics, filter context and drill-through without exposing production customer data.
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
            <h3 className="text-sm font-medium">Retention action</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              The next step is to isolate the lifecycle event or product behavior that separates durable customers from fragile ones inside this segment.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</div>
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
  invertDelta = false,
}: {
  icon: ReactNode
  label: string
  value: string
  delta: number
  sublabel: string
  invertDelta?: boolean
}) {
  const favorable = invertDelta ? delta <= 0 : delta >= 0
  return (
    <div className="min-h-32 bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="grid size-7 place-items-center rounded-md border bg-muted/25 text-muted-foreground [&>svg]:size-3.5">{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-[11px]">
        <span className={favorable ? "text-emerald-600" : "text-rose-600"}>
          {delta >= 0 ? <ArrowUpRightIcon className="inline size-3" /> : <ArrowDownRightIcon className="inline size-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="text-muted-foreground">{sublabel}</span>
      </div>
    </div>
  )
}

function Signal({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-xs font-medium">{title}</div>
      <div className="mt-1 text-[11px] leading-4 text-muted-foreground">{body}</div>
    </div>
  )
}

function CohortHeatmap({ rows }: { rows: typeof cohortRows }) {
  const maxMonths = 9
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[72px_68px_repeat(9,minmax(52px,1fr))] gap-1 text-[10px]">
          <div />
          <div className="pb-1 text-center text-muted-foreground">Size</div>
          {Array.from({ length: maxMonths }, (_, i) => (
            <div className="pb-1 text-center text-muted-foreground" key={i}>M{i}</div>
          ))}
          {rows.map((row) => (
            <div className="contents" key={row.cohort}>
              <div className="flex items-center font-medium">{row.cohort}</div>
              <div className="flex items-center justify-center rounded-md border bg-muted/25 text-muted-foreground">{row.size.toLocaleString()}</div>
              {Array.from({ length: maxMonths }, (_, i) => {
                const value = row.values[i]
                if (value === undefined) return <div key={i} className="h-10 rounded-md border border-dashed bg-muted/10" />
                const intensity = Math.max(10, Math.round((value - 45) * 1.7))
                return (
                  <div
                    className="flex h-10 items-center justify-center rounded-md border text-[10px] font-medium"
                    key={i}
                    style={{
                      backgroundColor: "color-mix(in oklab, var(--primary) " + Math.min(92, intensity) + "%, transparent)",
                      color: value >= 78 ? "var(--primary-foreground)" : "var(--foreground)",
                    }}
                  >
                    {value.toFixed(value % 1 ? 1 : 0)}%
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReasonPareto() {
  let cumulative = 0
  return (
    <div className="space-y-4">
      {churnReasons.map((row, index) => {
        cumulative += row.share
        return (
          <div key={row.reason}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium">{row.reason}</span>
              <span className="tabular-nums text-muted-foreground">{row.share}% · {cumulative}% cumulative</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: row.share * 2.7 + "%",
                  backgroundColor: index < 2 ? "var(--chart-5)" : index < 4 ? "var(--chart-3)" : "var(--chart-4)",
                }}
              />
            </div>
          </div>
        )
      })}
      <div className="rounded-lg border bg-muted/25 p-3 text-[11px] leading-5 text-muted-foreground">
        The top two reasons account for 55% of churn, which makes activation and pricing the highest-leverage investigation areas.
      </div>
    </div>
  )
}

function LifecycleFlow() {
  const byId = Object.fromEntries(lifecycleNodes.map((node) => [node.id, node]))
  return (
    <div className="overflow-x-auto">
      <svg className="min-w-[1000px] w-full" viewBox="0 0 1040 360" role="img" aria-label="Customer lifecycle transition flow">
        {lifecycleLinks.map((link, index) => {
          const from = byId[link.from]
          const to = byId[link.to]
          const x1 = link.reverse ? from.x : from.x + 20
          const y1 = from.y + link.fromOffset
          const x2 = link.reverse ? to.x + 20 : to.x
          const y2 = to.y + link.toOffset
          const c1 = link.reverse ? x1 - 120 : x1 + 110
          const c2 = link.reverse ? x2 + 120 : x2 - 110
          return (
            <path
              d={"M " + x1 + " " + y1 + " C " + c1 + " " + y1 + ", " + c2 + " " + y2 + ", " + x2 + " " + y2}
              fill="none"
              key={index}
              opacity="0.28"
              stroke={link.color}
              strokeLinecap="round"
              strokeWidth={Math.max(6, link.value * 0.52)}
            />
          )
        })}
        {lifecycleNodes.map((node) => (
          <g key={node.id}>
            <rect x={node.x} y={node.y} width="20" height={node.h} rx="6" fill={node.color} />
            <text x={node.x + 32} y={node.y + 20} fill="var(--foreground)" fontSize="12" fontWeight="700">{node.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <Signal title="68% reach Active" body="Most new customers establish an active state before the first renewal window." />
        <Signal title="At-risk is recoverable" body="A meaningful portion of at-risk customers reactivate before cancellation." />
        <Signal title="Reactivation matters to NRR" body="Recovered customers contribute enough MRR to materially offset churn." />
      </div>
    </div>
  )
}

function WaterfallChart() {
  const max = 1150
  return (
    <div className="space-y-3">
      <div className="flex h-[280px] items-end gap-2 rounded-lg border bg-muted/10 p-4">
        {waterfall.map((row, index) => {
          const previousTotal = index === 0 ? 0 : waterfall[index - 1].total
          const positive = row.delta >= 0
          const isBase = row.kind === "base"
          const top = isBase ? row.total : Math.max(previousTotal, row.total)
          const bottom = isBase ? 0 : Math.min(previousTotal, row.total)
          const height = ((top - bottom) / max) * 210
          const spacer = (bottom / max) * 210
          const color =
            row.kind === "positive" ? "var(--chart-2)" :
            row.kind === "negative" ? "var(--chart-5)" :
            "var(--chart-4)"
          return (
            <div className="flex h-full min-w-0 flex-1 flex-col justify-end" key={row.label}>
              <div className="flex h-[220px] flex-col justify-end">
                <div style={{ height: spacer }} />
                <div
                  className="rounded-t-md"
                  style={{ height: Math.max(8, height), backgroundColor: color }}
                  title={row.label + ": " + row.delta}
                />
              </div>
              <div className="mt-2 text-center text-[9px] leading-3 text-muted-foreground">{row.label}</div>
              <div className="mt-1 text-center text-[10px] font-semibold">
                {isBase ? row.total : (positive ? "+" : "") + row.delta}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between rounded-lg border bg-muted/25 p-3 text-xs">
        <span className="text-muted-foreground">Net revenue retention</span>
        <strong className="text-base">108.6%</strong>
      </div>
    </div>
  )
}

function RiskValueMatrix() {
  return (
    <div className="relative aspect-square max-h-[430px] w-full rounded-xl border bg-muted/10">
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed" />
      <div className="absolute inset-y-0 left-1/2 border-l border-dashed" />

      <div className="absolute left-3 top-3 text-[10px] font-medium text-muted-foreground">High value · low risk</div>
      <div className="absolute right-3 top-3 text-[10px] font-medium text-muted-foreground">High value · high risk</div>
      <div className="absolute bottom-3 left-3 text-[10px] font-medium text-muted-foreground">Low value · low risk</div>
      <div className="absolute bottom-3 right-3 text-[10px] font-medium text-muted-foreground">Low value · high risk</div>

      {segments.map((row, index) => {
        const left = Math.min(92, Math.max(8, row.risk))
        const top = Math.min(90, Math.max(10, 100 - row.value))
        return (
          <button
            key={row.segment}
            className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-background text-[9px] font-bold text-white shadow-sm transition-transform hover:scale-110"
            style={{
              left: left + "%",
              top: top + "%",
              backgroundColor: index % 3 === 0 ? "var(--chart-1)" : index % 3 === 1 ? "var(--chart-2)" : "var(--chart-5)",
            }}
            title={row.segment}
          >
            {index + 1}
          </button>
        )
      })}

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground">Risk →</div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-muted-foreground">Value →</div>
    </div>
  )
}
