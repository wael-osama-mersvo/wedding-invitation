import { formatCoupleNames, weddingConfig } from '../config/wedding.js'

function pad(n) {
  return String(n).padStart(2, '0')
}

/** Build start/end Date objects anchored in Africa/Cairo wall time. */
export function weddingStartEnd() {
  const { weddingDate, weddingTime, timezone } = weddingConfig
  // Interpret configured local time in the wedding timezone using a stable offset probe.
  const localStamp = `${weddingDate}T${weddingTime}:00`
  const start = zonedTimeToUtc(localStamp, timezone)
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)
  return { start, end, timezone }
}

function zonedTimeToUtc(localIso, timeZone) {
  // localIso like 2026-06-15T18:00:00 without Z
  const asUtc = new Date(`${localIso}Z`)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(formatter.formatToParts(asUtc).map((p) => [p.type, p.value]))
  const asLocal = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  const offset = asLocal - asUtc.getTime()
  return new Date(asUtc.getTime() - offset)
}

function toGoogleStamp(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function buildGoogleCalendarUrl(language = 'en') {
  const { start, end } = weddingStartEnd()
  const title = formatCoupleNames(language).display
  const details = weddingConfig.wording[language]?.message || ''
  const location = `${weddingConfig.venueName[language]}, ${weddingConfig.venueAddress[language]}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toGoogleStamp(start)}/${toGoogleStamp(end)}`,
    details,
    location,
    ctz: weddingConfig.timezone,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildIcsContent(language = 'en') {
  const { start, end, timezone } = weddingStartEnd()
  const title = escapeIcs(formatCoupleNames(language).display)
  const description = escapeIcs(weddingConfig.wording[language]?.message || '')
  const location = escapeIcs(
    `${weddingConfig.venueName[language]}, ${weddingConfig.venueAddress[language]}`,
  )
  const stamp = toGoogleStamp(new Date())
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${weddingConfig.weddingDate}@invitation`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${timezone}:${weddingConfig.weddingDate.replace(/-/g, '')}T${weddingConfig.weddingTime.replace(':', '')}00`,
    `DTEND;TZID=${timezone}:${formatLocalEnd(end, timezone)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

function formatLocalEnd(endUtc, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(formatter.formatToParts(endUtc).map((p) => [p.type, p.value]))
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`
}

export function downloadIcs(language = 'en') {
  const content = buildIcsContent(language)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'wedding.ics'
  a.click()
  URL.revokeObjectURL(url)
}