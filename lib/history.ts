type Report = {
  id: string
  timestamp: string
  filename: string
  imageUrl: string
  report: {
    findings: string
    impression: string
    recommendation: string
  }
}

const HISTORY_KEY = "xray-report-history"

export function getHistory(): Report[] {
  if (typeof window === "undefined") return []

  try {
    const historyData = localStorage.getItem(HISTORY_KEY)
    return historyData ? JSON.parse(historyData) : []
  } catch (error) {
    console.error("Error getting history:", error)
    return []
  }
}

export function saveToHistory(report: Report): void {
  if (typeof window === "undefined") return

  try {
    const history = getHistory()
    const updatedHistory = [report, ...history]
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Error saving to history:", error)
  }
}

export function getReportById(id: string): Report | null {
  if (typeof window === "undefined") return null

  try {
    const history = getHistory()
    return history.find((report) => report.id === id) || null
  } catch (error) {
    console.error("Error getting report by ID:", error)
    return null
  }
}

export function deleteReportById(id: string): void {
  if (typeof window === "undefined") return

  try {
    const history = getHistory()
    const updatedHistory = history.filter((report) => report.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Error deleting report:", error)
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error("Error clearing history:", error)
  }
}
