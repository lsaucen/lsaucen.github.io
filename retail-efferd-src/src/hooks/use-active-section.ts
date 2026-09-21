"use client"

import { useEffect, useState } from "react"

export const RETENTION_SECTION_IDS = [
  "overview",
  "cohorts",
  "churn",
  "lifecycle",
  "economics",
  "segments",
  "methodology",
] as const

export type RetentionSectionId = (typeof RETENTION_SECTION_IDS)[number]

function sectionFromHash(): RetentionSectionId {
  const hash = window.location.hash.replace("#", "") as RetentionSectionId
  return RETENTION_SECTION_IDS.includes(hash) ? hash : "overview"
}

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<RetentionSectionId>(() =>
    typeof window === "undefined" ? "overview" : sectionFromHash()
  )

  useEffect(() => {
    let frame = 0

    const updateActiveSection = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const marker = window.scrollY + 110
        let next: RetentionSectionId = "overview"

        for (const id of RETENTION_SECTION_IDS) {
          const section = document.getElementById(id)
          if (section && section.offsetTop <= marker) next = id
        }

        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 24

        if (nearBottom) {
          const lastVisible = [...RETENTION_SECTION_IDS]
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
