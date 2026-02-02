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
export function formatPakistanTime(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-PK', {
    ...options,
    timeZone: 'Asia/Karachi',
  })
}
