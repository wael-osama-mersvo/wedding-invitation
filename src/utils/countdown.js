import { weddingStartEnd } from './calendar.js'

export function getCountdownState(now = new Date()) {
  const { start, end } = weddingStartEnd()
  const ms = start.getTime() - now.getTime()
  if (now.getTime() >= end.getTime()) {
    return { phase: 'after', days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  if (now.getTime() >= start.getTime()) {
    return { phase: 'weddingDay', days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { phase: 'countdown', days, hours, minutes, seconds }
}