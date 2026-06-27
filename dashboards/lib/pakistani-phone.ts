export function splitPakistaniPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return {
    prefix: digits.slice(0, 4),
    suffix: digits.slice(4, 11),
  }
}

export function buildPakistaniPhone(prefix: string, suffix: string) {
  const normalizedPrefix = prefix.replace(/\D/g, '').slice(0, 4)
  const normalizedSuffix = suffix.replace(/\D/g, '').slice(0, 7)

  if (!normalizedPrefix && !normalizedSuffix) {
    return ''
  }
  if (!normalizedSuffix) {
    return normalizedPrefix
  }

  return `${normalizedPrefix}-${normalizedSuffix}`
}

export function isCompletePakistaniPhone(value: string) {
  return value.replace(/\D/g, '').length === 11
}
