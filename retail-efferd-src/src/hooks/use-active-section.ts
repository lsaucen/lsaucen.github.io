"use client"

import { useEffect, useState } from "react"

export const ANALYTICS_SECTION_IDS = [
  "overview",
  "acquisition",
  "funnel",
  "journeys",
  "content",
  "devices",
  "methodology",
] as const

export type AnalyticsSectionId = (typeof ANALYTICS_SECTION_IDS)[number]

function sectionFromHash(): AnalyticsSectionId {
  const hash = window.location.hash.replace("#", "") as AnalyticsSectionId
  return ANALYTICS_SECTION_IDS.includes(hash) ? hash : "overview"
}

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<AnalyticsSectionId>(() =>
    typeof window === "undefined" ? "overview" : sectionFromHash()
  )

  useEffect(() => {
    let frame = 0

    const updateActiveSection = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const marker = window.scrollY + 110
        let next: AnalyticsSectionId = "overview"

        for (const id of ANALYTICS_SECTION_IDS) {
          const section = document.getElementById(id)
          if (section && section.offsetTop <= marker) next = id
        }

        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 24

        if (nearBottom) {
          const lastVisible = [...ANALYTICS_SECTION_IDS]
            .reverse()
            .find((id) => document.getElementById(id))
          if (lastVisible) next = lastVisible
        }

        setActiveSection((current) => (current === next ? current : next))
      })
    }

    const updateFromHash = () => {
      setActiveSection(sectionFromHash())
      window.setTimeout(updateActiveSection, 80)
    }

    window.addEventListener("scroll", updateActiveSection, { passive: true })
    window.addEventListener("resize", updateActiveSection)
    window.addEventListener("hashchange", updateFromHash)
    updateActiveSection()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", updateActiveSection)
      window.removeEventListener("resize", updateActiveSection)
      window.removeEventListener("hashchange", updateFromHash)
    }
  }, [])

  return activeSection
}
