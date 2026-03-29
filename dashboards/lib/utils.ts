import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date/time string to Pakistan time (GMT+5)
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted time string in Pakistan timezone
 */
const PAKISTAN_TZ = 'Asia/Karachi'

export function formatPakistanTime(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }
): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-PK', {
    ...options,
    timeZone: PAKISTAN_TZ,
  })
}

/** Date and time in PKT (e.g. redemption log). */
export function formatPakistanDateTime(dateString: string | Date): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-PK', {
    timeZone: PAKISTAN_TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
