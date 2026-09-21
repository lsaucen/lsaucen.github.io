"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import {
  ActivityIcon,
  BadgeCheckIcon,
  ChartNoAxesCombinedIcon,
  DatabaseIcon,
  LandmarkIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
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

type RiskMetric = "sharpe" | "return"
type DcaHorizon = "10y" | "20y"
type BenchmarkWindow = "1y" | "5y" | "10y"
type MomentumFormation = "3m" | "6m" | "12m"

type DetailState = {
  eyebrow: string
  title: string
  description: string
  metrics: Array<{ label: string; value: string }>
  caveat?: string
} | null

const sectorRisk = [
  { ticker: "XLV", sector: "Health Care", ret: 9.1, vol: 14.2, sharpe: 0.642, ciLo: 0.326, ciHi: 1.031 },
  { ticker: "XLP", sector: "Consumer Staples", ret: 7.2, vol: 12.4, sharpe: 0.581, ciLo: 0.213, ciHi: 0.976 },
  { ticker: "XLI", sector: "Industrials", ret: 10.8, vol: 18.7, sharpe: 0.578, ciLo: 0.199, ciHi: 0.999 },
  { ticker: "XLY", sector: "Consumer Discretionary", ret: 10.9, vol: 19.2, sharpe: 0.571, ciLo: 0.221, ciHi: 0.969 },
  { ticker: "XLU", sector: "Utilities", ret: 8.6, vol: 15.2, sharpe: 0.567, ciLo: 0.187, ciHi: 0.972 },
  { ticker: "XLK", sector: "Technology", ret: 12.6, vol: 23.1, sharpe: 0.546, ciLo: 0.137, ciHi: 1.009 },
  { ticker: "XLB", sector: "Materials", ret: 9.9, vol: 20.7, sharpe: 0.479, ciLo: 0.102, ciHi: 0.851 },
  { ticker: "XLE", sector: "Energy", ret: 11.4, vol: 24.9, sharpe: 0.455, ciLo: 0.053, ciHi: 0.829 },
  { ticker: "XLF", sector: "Financials", ret: 8.1, vol: 20.9, sharpe: 0.386, ciLo: -0.041, ciHi: 0.843 },
]

const regimeData = [
  { asset: "TLT", low: -0.282, high: 0.088 },
  { asset: "AGG", low: -0.002, high: 0.401 },
  { asset: "SHY", low: -0.232, high: -0.037 },
  { asset: "GLD", low: -0.017, high: 0.177 },
]

const dcaData = {
  "10y": [
    { asset: "SPY", n: 284, p5: 1.02, p25: 1.33, median: 1.66, p75: 1.94, p95: 2.23 },
    { asset: "QQQ", n: 210, p5: 1.14, p25: 1.77, median: 2.28, p75: 2.68, p95: 3.22 },
    { asset: "GLD", n: 142, p5: 0.99, p25: 1.08, median: 1.25, p75: 1.38, p95: 2.39 },
    { asset: "60/40", n: 155, p5: 1.43, p25: 1.50, median: 1.56, p75: 1.63, p95: 1.73 },
  ],
  "20y": [
    { asset: "SPY", n: 164, p5: 2.09, p25: 2.30, median: 2.69, p75: 3.62, p95: 4.39 },
    { asset: "QQQ", n: 90, p5: 3.91, p25: 5.14, median: 6.40, p75: 7.16, p95: 8.16 },
    { asset: "GLD", n: 22, p5: 2.26, p25: 2.56, median: 2.77, p75: 3.21, p95: 3.58 },
    { asset: "60/40", n: 35, p5: 2.25, p25: 2.46, median: 2.57, p75: 2.70, p95: 2.78 },
  ],
}

const benchmarkData: Record<BenchmarkWindow, Array<{ ticker: string; win: number; lo?: number; hi?: number }>> = {
  "1y": [
    { ticker: "QQQ", win: 0.67 },
    { ticker: "XLK", win: 0.63 },
    { ticker: "VTI", win: 0.55 },
    { ticker: "XLV", win: 0.47 },
  ],
  "5y": [
    { ticker: "QQQ", win: 0.844, lo: 0.699, hi: 0.959 },
    { ticker: "XLK", win: 0.765, lo: 0.595, hi: 0.904 },
    { ticker: "XLV", win: 0.596, lo: 0.423, hi: 0.750 },
    { ticker: "VTI", win: 0.545, lo: 0.368, hi: 0.744 },
  ],
  "10y": [
    { ticker: "QQQ", win: 0.89 },
    { ticker: "XLK", win: 0.79 },
    { ticker: "XLV", win: 0.75 },
    { ticker: "VTI", win: 0.58 },
  ],
}

const momentumData = {
  "3m": { annual: -0.0067, lo: -0.0038, hi: 0.0030, n: 327 },
  "6m": { annual: -0.0106, lo: -0.0047, hi: 0.0029, n: 324 },
  "12m": { annual: 0.0052, lo: -0.0037, hi: 0.0045, n: 318 },
}

const findings = [
  {
    id: "rq1",
    label: "RQ1",
    title: "Extra sector risk was not rewarded",
    verdict: "Confirmed",
    value: "ρ = -0.85",
    note: "Volatility vs Sharpe · p = 0.004",
    description: "Across nine S&P 500 sectors, higher volatility was associated with lower risk-adjusted return. Health Care led Sharpe; Financials ranked last.",
    metrics: [
      { label: "Spearman rho", value: "-0.850" },
      { label: "p-value", value: "0.004" },
      { label: "Best Sharpe", value: "XLV · 0.642" },
      { label: "Worst Sharpe", value: "XLF · 0.386" },
    ],
    caveat: "Only nine sector observations; survival bias remains in the investable universe.",
  },
  {
    id: "rq2",
    label: "RQ2",
    title: "Bond protection weakened with inflation",
    verdict: "Confirmed",
    value: "-0.28 → +0.09",
    note: "SPY–TLT correlation · low vs high inflation",
    description: "The SPY–TLT relationship changed materially across inflation regimes, and the difference survived a one-month CPI publication lag robustness check.",
    metrics: [
      { label: "Low inflation", value: "-0.282" },
      { label: "High inflation", value: "+0.088" },
      { label: "Fisher z", value: "3.18" },
      { label: "p-value", value: "0.0015" },
    ],
    caveat: "The sign change is dominated by the post-2015 period, especially 2021–2023.",
  },
  {
    id: "rq3",
    label: "RQ3",
    title: "Destination mattered more than timing",
    verdict: "Confirmed",
    value: "4.1× / 10.3×",
    note: "Destination effect vs start-date dispersion",
    description: "Across exhaustive DCA windows, asset choice explained far more outcome dispersion than the specific start date—especially over twenty years.",
    metrics: [
      { label: "10-year ratio", value: "4.1×" },
      { label: "20-year ratio", value: "10.3×" },
      { label: "QQQ 20y median", value: "6.40×" },
      { label: "SPY 20y median", value: "2.69×" },
    ],
    caveat: "No transaction costs or taxes; 20-year coverage differs by asset.",
  },
  {
    id: "rq4",
    label: "RQ4",
    title: "Persistent outperformance was concentrated",
    verdict: "Refuted",
    value: "84.4%",
    note: "QQQ beat SPY in 5-year windows",
    description: "The hypothesis that no ETF consistently beat SPY was rejected, but the exception was concentrated in US technology: QQQ and XLK.",
    metrics: [
      { label: "QQQ 5y win rate", value: "84.4%" },
      { label: "XLK 5y win rate", value: "76.5%" },
      { label: "QQQ bootstrap CI", value: "69.9–95.9%" },
      { label: "Comparisons", value: "17" },
    ],
    caveat: "QQQ and XLK express the same structural technology concentration; results should not be generalized to all active bets.",
  },
  {
    id: "rq5",
    label: "RQ5",
    title: "Sector momentum did not add value",
    verdict: "Refuted",
    value: "-1.06%",
    note: "Annualized top-minus-bottom spread",
    description: "A monthly sector rotation rule using six-month momentum produced a negative average spread before costs, with bootstrap intervals crossing zero.",
    metrics: [
      { label: "Annualized spread", value: "-1.06%" },
      { label: "Monthly CI low", value: "-0.47%" },
      { label: "Monthly CI high", value: "+0.29%" },
      { label: "Months", value: "324" },
    ],
    caveat: "Nine sectors is a narrow cross-section; transaction costs would only worsen the result.",
  },
]

const riskConfig = {
  sharpe: { label: "Sharpe", color: "var(--chart-1)" },
  ret: { label: "Annual return", color: "var(--chart-2)" },
} satisfies ChartConfig

export function Dashboard() {
  const [riskMetric, setRiskMetric] = useState<RiskMetric>("sharpe")
  const [dcaHorizon, setDcaHorizon] = useState<DcaHorizon>("20y")
  const [benchmarkWindow, setBenchmarkWindow] = useState<BenchmarkWindow>("5y")
  const [momentumFormation, setMomentumFormation] = useState<MomentumFormation>("6m")
  const [detail, setDetail] = useState<DetailState>(null)

  const riskRows = useMemo(() => sectorRisk.map((row) => ({
    ...row,
    y: riskMetric === "sharpe" ? row.sharpe : row.ret,
  })), [riskMetric])

  const benchmarkRows = [...benchmarkData[benchmarkWindow]].sort((a, b) => b.win - a.win)
  const selectedMomentum = momentumData[momentumFormation]

  function openFinding(finding: typeof findings[number]) {
    setDetail({
      eyebrow: finding.label + " · " + finding.verdict,
      title: finding.title,
      description: finding.description,
      metrics: finding.metrics,
      caveat: finding.caveat,
    })
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-7">
        <section id="overview" className="scroll-mt-20">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="outline">Historical market research</Badge>
                <Badge variant="outline">1999–2026 sector sample</Badge>
                <Badge variant="outline">Not investment advice</Badge>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Financial intelligence research dashboard</h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                Five pre-registered research questions spanning risk, macro regimes, dollar-cost averaging, benchmark consistency and sector momentum.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border bg-border">
            <div className="grid grid-cols-2 gap-px lg:grid-cols-3 xl:grid-cols-6">
              <MetricCard icon={<DatabaseIcon />} label="Assets analyzed" value="24" sublabel="ETFs + reference stocks" />
              <MetricCard icon={<LandmarkIcon />} label="Macro series" value="4" sublabel="CPI, Fed, Treasury, jobs" />
              <MetricCard icon={<ActivityIcon />} label="Max history" value="64y" sublabel="asset-dependent coverage" />
              <MetricCard icon={<ChartNoAxesCombinedIcon />} label="Vol vs Sharpe" value="-0.85" sublabel="Spearman rho · p=.004" />
              <MetricCard icon={<TrendingUpIcon />} label="QQQ 5y win rate" value="84.4%" sublabel="vs SPY · 269 windows" />
              <MetricCard icon={<ShieldAlertIcon />} label="Momentum spread" value="-1.06%" sublabel="annualized · before costs" />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Signal title="Asset choice dominated timing" body="The destination effect was 4.1× the start-date dispersion at 10 years and 10.3× at 20 years." />
            <Signal title="Diversification depended on regime" body="SPY–TLT correlation moved from -0.282 in low inflation to +0.088 in high inflation." />
            <Signal title="Two hypotheses failed" body="Consistent tech outperformance existed, while mechanical sector momentum did not." />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {findings.map((finding) => (
              <button
                key={finding.id}
                className="group rounded-xl border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50"
                onClick={() => openFinding(finding)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">{finding.label}</span>
                  <Badge variant={finding.verdict === "Confirmed" ? "secondary" : "outline"}>{finding.verdict}</Badge>
                </div>
                <div className="mt-5 text-2xl font-semibold tabular-nums">{finding.value}</div>
                <div className="mt-2 text-xs font-medium leading-4">{finding.title}</div>
                <div className="mt-2 text-[10px] leading-4 text-muted-foreground">{finding.note}</div>
              </button>
            ))}
          </div>
        </section>

        <section id="risk" className="scroll-mt-20">
          <SectionHeading
            eyebrow="RQ1 · Risk & Return"
            title="More sector volatility did not buy better risk-adjusted return"
            description="Exact sector statistics from the research notebook. Toggle the vertical metric to separate gross return from risk-adjusted performance."
          />

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Sector risk map</CardTitle>
                  <CardDescription>X = annualized volatility · bubble = sector ETF</CardDescription>
                </div>
                <Select value={riskMetric} onValueChange={(v) => setRiskMetric(v as RiskMetric)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sharpe">Sharpe ratio</SelectItem>
                    <SelectItem value="return">Annual return</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[390px] w-full" config={riskConfig}>
                  <ScatterChart margin={{ left: 10, right: 24, top: 18, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="vol"
                      name="Volatility"
                      domain={[10, 27]}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v + "%"}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name={riskMetric === "sharpe" ? "Sharpe" : "Annual return"}
                      domain={riskMetric === "sharpe" ? [0.32, 0.68] : [5, 14]}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => riskMetric === "sharpe" ? v.toFixed(1) : v + "%"}
                    />
                    <ZAxis range={[180, 180]} />
                    <ChartTooltip content={<ChartTooltipContent nameKey="ticker" />} />
                    <Scatter data={riskRows} fill="var(--chart-1)" />
                  </ScatterChart>
                </ChartContainer>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <MiniStat label="Best Sharpe" value="XLV · 0.642" />
                  <MiniStat label="Worst Sharpe" value="XLF · 0.386" />
                  <MiniStat label="Spearman" value="ρ = -0.850" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sector ranking</CardTitle>
                <CardDescription>Sharpe ratio with annual return and volatility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sectorRisk.slice().sort((a,b)=>b.sharpe-a.sharpe).map((row, index) => (
                  <div key={row.ticker} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-lg border p-3">
                    <div className="grid size-7 place-items-center rounded-md bg-muted text-[10px] font-semibold">{index + 1}</div>
                    <div>
                      <div className="text-xs font-medium">{row.ticker} · {row.sector}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{row.ret.toFixed(1)}% return · {row.vol.toFixed(1)}% vol</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{row.sharpe.toFixed(3)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="regimes" className="scroll-mt-20">
          <SectionHeading
            eyebrow="RQ2 · Macro Regimes"
            title="Bond diversification changed when inflation changed"
            description="Correlation against SPY by inflation regime. Left dots are low-inflation months; right dots are high-inflation months."
          />

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Correlation regime shift</CardTitle>
                <CardDescription>288 monthly observations · median inflation threshold = 2.33%</CardDescription>
              </CardHeader>
              <CardContent>
                <RegimeDumbbell />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Robustness checks</CardTitle>
                <CardDescription>The SPY–TLT relationship is not equally stable across eras.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <EvidenceCard label="Headline test" value="z = 3.18 · p = 0.0015" note="High vs low inflation" positive />
                <EvidenceCard label="CPI lagged 1 month" value="p = 0.0141" note="+0.040 vs -0.247" positive />
                <EvidenceCard label="2002–2014" value="-0.389 vs -0.256" note="Negative in both regimes" />
                <EvidenceCard label="2015–2026" value="+0.541 vs -0.353" note="Large regime divergence" positive />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="dca" className="scroll-mt-20">
          <SectionHeading
            eyebrow="RQ3 · Dollar-Cost Averaging"
            title="Where you invested mattered more than exactly when you started"
            description="Distribution of final portfolio value divided by total contributions across every historical start window."
          />

          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">DCA outcome distributions</CardTitle>
                <CardDescription>Whisker = p5–p95 · box = p25–p75 · dot = median</CardDescription>
              </div>
              <Select value={dcaHorizon} onValueChange={(v) => setDcaHorizon(v as DcaHorizon)}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10y">10 years</SelectItem>
                  <SelectItem value="20y">20 years</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <DcaIntervals horizon={dcaHorizon} />
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <MiniStat label="Destination / timing effect" value={dcaHorizon === "10y" ? "4.1×" : "10.3×"} />
                <MiniStat label="Friedman p-value" value={dcaHorizon === "10y" ? "2.09e-79" : "4.04e-13"} />
                <MiniStat label="No 20y nominal losses" value={dcaHorizon === "20y" ? "All destinations" : "Switch to 20y"} />
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">DCA vs lump sum · SPY · 10 years</CardTitle>
                <CardDescription>Return versus dispersion trade-off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <OutcomeTile label="Lump-sum median" value="2.29×" detail="Std dev 0.94" />
                  <OutcomeTile label="DCA median" value="1.66×" detail="Std dev 0.39" />
                </div>
                <div className="mt-3 rounded-lg border bg-muted/25 p-3 text-xs">
                  Lump sum finished ahead in <strong>90.8%</strong> of 284 ten-year windows, while DCA cut dispersion by more than half.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">20-year median multiples</CardTitle>
                <CardDescription>Final value ÷ contributed capital</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ProgressRow label="QQQ" value={6.40} max={7} color="var(--chart-4)" />
                <ProgressRow label="GLD" value={2.77} max={7} color="var(--chart-3)" />
                <ProgressRow label="SPY" value={2.69} max={7} color="var(--chart-1)" />
                <ProgressRow label="60/40" value={2.57} max={7} color="var(--chart-2)" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="benchmark" className="scroll-mt-20">
          <SectionHeading
            eyebrow="RQ4 · Benchmark Consistency"
            title="Beating SPY consistently was possible—but concentrated in technology"
            description="Share of rolling windows in which each ETF outperformed SPY. The five-year view includes block-bootstrap confidence intervals."
          />

          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Outperformance consistency</CardTitle>
                <CardDescription>Win rate against SPY across rolling windows</CardDescription>
              </div>
              <Select value={benchmarkWindow} onValueChange={(v) => setBenchmarkWindow(v as BenchmarkWindow)}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1y">1-year</SelectItem>
                  <SelectItem value="5y">5-year</SelectItem>
                  <SelectItem value="10y">10-year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <BenchmarkBars rows={benchmarkRows} showCi={benchmarkWindow === "5y"} />
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <MiniStat label="Bonferroni comparisons" value="17" />
                <MiniStat label="QQQ 5y bootstrap CI" value="69.9–95.9%" />
                <MiniStat label="Repeated both decades" value="QQQ + XLK" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="momentum" className="scroll-mt-20">
          <SectionHeading
            eyebrow="RQ5 · Momentum"
            title="Mechanical sector rotation failed the robustness test"
            description="Top-minus-bottom sector momentum spreads across formation windows. Confidence intervals include zero in every specification."
          />

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Momentum spread by formation period</CardTitle>
                  <CardDescription>Annualized top-tercile minus bottom-tercile return</CardDescription>
                </div>
                <Select value={momentumFormation} onValueChange={(v) => setMomentumFormation(v as MomentumFormation)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">3 months</SelectItem>
                    <SelectItem value="6m">6 months</SelectItem>
                    <SelectItem value="12m">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <MomentumBars selected={momentumFormation} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected formation window</CardTitle>
                <CardDescription>{momentumFormation.toUpperCase()} momentum robustness</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <EvidenceCard
                  label="Annualized spread"
                  value={(selectedMomentum.annual * 100).toFixed(2) + "%"}
                  note={selectedMomentum.n + " monthly observations"}
                />
                <EvidenceCard
                  label="95% block-bootstrap CI"
                  value={(selectedMomentum.lo * 100).toFixed(2) + "% to +" + (selectedMomentum.hi * 100).toFixed(2) + "%"}
                  note="Monthly mean · interval crosses zero"
                />
                <EvidenceCard label="Rates rising" value="+0.82% annual" note="6m formation · not significant" />
                <EvidenceCard label="Rates falling" value="-3.14% annual" note="6m formation · not significant" />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="methodology" className="scroll-mt-20 rounded-xl border bg-muted/25 p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background">
              <DatabaseIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium">Reproducible research architecture</h2>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-muted-foreground">
                Yahoo Finance and FRED feed an idempotent PostgreSQL ETL, SQL analytical views, one notebook per research question,
                block-bootstrap inference, a Streamlit app and a version-controlled Power BI project. No look-ahead is used in signal construction.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Python 3.12","PostgreSQL 16","SQL window functions","SciPy","Bootstrap","Streamlit","Power BI","pytest"].map((x)=>(
                  <Badge key={x} variant="outline">{x}</Badge>
                ))}
              </div>
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
          {detail?.caveat && (
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium">Limitation</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail.caveat}</p>
            </div>
          )}
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
      <p className="max-w-4xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function MetricCard({ icon, label, value, sublabel }: { icon: ReactNode; label: string; value: string; sublabel: string }) {
  return (
    <div className="min-h-32 bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="grid size-7 place-items-center rounded-md border bg-muted/25 text-muted-foreground [&>svg]:size-3.5">{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-2 text-[11px] text-muted-foreground">{sublabel}</div>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}

function EvidenceCard({ label, value, note, positive=false }: { label: string; value: string; note: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        {positive && <BadgeCheckIcon className="size-3.5 text-emerald-500" />}
      </div>
      <div className="mt-1 text-sm font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-[10px] leading-4 text-muted-foreground">{note}</div>
    </div>
  )
}

function OutcomeTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{detail}</div>
    </div>
  )
}

function ProgressRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">{value.toFixed(2)}×</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: (value / max * 100) + "%", backgroundColor: color }} />
      </div>
    </div>
  )
}

function RegimeDumbbell() {
  const min = -0.5
  const max = 0.5
  const x = (v: number) => 110 + ((v - min) / (max - min)) * 610
  return (
    <div className="overflow-x-auto">
      <svg className="min-w-[760px] w-full" viewBox="0 0 780 320" role="img" aria-label="SPY correlation by inflation regime">
        {[-0.5,-0.25,0,0.25,0.5].map((tick)=>(
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1="30" y2="270" stroke={tick===0 ? "var(--foreground)" : "var(--border)"} strokeDasharray={tick===0 ? "0" : "4 4"} opacity={tick===0 ? 0.45 : 1}/>
            <text x={x(tick)} y="294" textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{tick>0?"+":""}{tick.toFixed(2)}</text>
          </g>
        ))}
        {regimeData.map((row,index)=>{
          const y=62+index*58
          return (
            <g key={row.asset}>
              <text x="16" y={y+4} fill="var(--foreground)" fontSize="12" fontWeight="700">{row.asset}</text>
              <line x1={x(row.low)} x2={x(row.high)} y1={y} y2={y} stroke="var(--muted-foreground)" strokeWidth="3" opacity="0.45"/>
              <circle cx={x(row.low)} cy={y} r="8" fill="var(--chart-2)"/>
              <circle cx={x(row.high)} cy={y} r="8" fill="var(--chart-3)"/>
              <text x={x(row.low)} y={y-14} textAnchor="middle" fill="var(--chart-2)" fontSize="10">{row.low.toFixed(3)}</text>
              <text x={x(row.high)} y={y-14} textAnchor="middle" fill="var(--chart-3)" fontSize="10">{row.high>0?"+":""}{row.high.toFixed(3)}</text>
            </g>
          )
        })}
        <g transform="translate(470,306)">
          <circle cx="0" cy="0" r="5" fill="var(--chart-2)"/><text x="10" y="4" fill="var(--muted-foreground)" fontSize="10">Low inflation</text>
          <circle cx="108" cy="0" r="5" fill="var(--chart-3)"/><text x="118" y="4" fill="var(--muted-foreground)" fontSize="10">High inflation</text>
        </g>
      </svg>
    </div>
  )
}

function DcaIntervals({ horizon }: { horizon: DcaHorizon }) {
  const rows=dcaData[horizon]
  const max=horizon==="10y" ? 3.5 : 8.5
  const min=0.5
  const x=(v:number)=>130+((v-min)/(max-min))*650
  return (
    <div className="overflow-x-auto">
      <svg className="min-w-[820px] w-full" viewBox="0 0 840 300" role="img" aria-label="DCA outcome interval chart">
        {[min,1,2,3,4,5,6,7,8].filter(v=>v<=max).map((tick)=>(
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1="24" y2="248" stroke="var(--border)" strokeDasharray="4 4"/>
            <text x={x(tick)} y="274" textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{tick.toFixed(tick%1?1:0)}×</text>
          </g>
        ))}
        {rows.map((row,index)=>{
          const y=55+index*52
          return (
            <g key={row.asset}>
              <text x="12" y={y+4} fill="var(--foreground)" fontSize="12" fontWeight="700">{row.asset}</text>
              <text x="65" y={y+4} fill="var(--muted-foreground)" fontSize="9">n={row.n}</text>
              <line x1={x(row.p5)} x2={x(row.p95)} y1={y} y2={y} stroke="var(--muted-foreground)" strokeWidth="3"/>
              <line x1={x(row.p5)} x2={x(row.p5)} y1={y-7} y2={y+7} stroke="var(--muted-foreground)" strokeWidth="2"/>
              <line x1={x(row.p95)} x2={x(row.p95)} y1={y-7} y2={y+7} stroke="var(--muted-foreground)" strokeWidth="2"/>
              <rect x={x(row.p25)} y={y-11} width={Math.max(4,x(row.p75)-x(row.p25))} height="22" rx="6" fill="var(--chart-1)" opacity="0.42"/>
              <circle cx={x(row.median)} cy={y} r="7" fill="var(--chart-3)" stroke="var(--background)" strokeWidth="2"/>
              <text x={x(row.median)} y={y-17} textAnchor="middle" fill="var(--foreground)" fontSize="10" fontWeight="700">{row.median.toFixed(2)}×</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function BenchmarkBars({ rows, showCi }: { rows: Array<{ticker:string;win:number;lo?:number;hi?:number}>; showCi:boolean }) {
  return (
    <div className="space-y-4">
      {rows.map((row)=>(
        <div key={row.ticker}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold">{row.ticker}</span>
            <span className="tabular-nums">{(row.win*100).toFixed(1)}%</span>
          </div>
          <div className="relative h-7 overflow-hidden rounded-md border bg-muted/20">
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-muted-foreground/50"/>
            <div className="h-full rounded-md bg-primary/65" style={{width:(row.win*100)+"%"}}/>
            {showCi && row.lo!==undefined && row.hi!==undefined && (
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/80"
                style={{left:(row.lo*100)+"%",width:((row.hi-row.lo)*100)+"%"}}
                title={"Bootstrap CI: "+(row.lo*100).toFixed(1)+"–"+(row.hi*100).toFixed(1)+"%"}
              />
            )}
          </div>
        </div>
      ))}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0%</span><span>50% parity</span><span>100%</span>
      </div>
    </div>
  )
}

function MomentumBars({ selected }: { selected: MomentumFormation }) {
  const rows = [
    { key:"3m" as const, label:"3 months", ...momentumData["3m"] },
    { key:"6m" as const, label:"6 months", ...momentumData["6m"] },
    { key:"12m" as const, label:"12 months", ...momentumData["12m"] },
  ]
  const max=0.015
  return (
    <div className="space-y-5">
      {rows.map((row)=>{
        const pct=row.annual*100
        const width=Math.min(46,Math.abs(row.annual)/max*46)
        const positive=row.annual>=0
        return (
          <div key={row.key} className={selected===row.key ? "rounded-lg border border-primary/40 bg-primary/5 p-3" : "p-3"}>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium">{row.label}</span>
              <span className={positive ? "font-semibold text-emerald-500" : "font-semibold text-rose-500"}>{positive?"+":""}{pct.toFixed(2)}%</span>
            </div>
            <div className="relative h-8 rounded-md border bg-muted/20">
              <div className="absolute inset-y-0 left-1/2 border-l border-muted-foreground/50"/>
              <div
                className="absolute top-1/2 h-4 -translate-y-1/2 rounded-sm"
                style={{
                  width:width+"%",
                  left:positive ? "50%" : (50-width)+"%",
                  backgroundColor:positive ? "var(--chart-1)" : "var(--chart-5)"
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
              <span>{(row.lo*100).toFixed(2)}% monthly CI low</span>
              <span>{(row.hi*100).toFixed(2)}% high</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
