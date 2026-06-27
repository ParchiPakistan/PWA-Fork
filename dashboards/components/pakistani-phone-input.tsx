"use client"

import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { buildPakistaniPhone, splitPakistaniPhone } from "@/lib/pakistani-phone"

interface PakistaniPhoneInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function PakistaniPhoneInput({
  id,
  value,
  onChange,
  required,
}: PakistaniPhoneInputProps) {
  const { prefix, suffix } = splitPakistaniPhone(value)
  const prefixRef = useRef<HTMLInputElement>(null)
  const suffixRef = useRef<HTMLInputElement>(null)

  const handlePrefixChange = (rawValue: string) => {
    const nextPrefix = rawValue.replace(/\D/g, "").slice(0, 4)
    onChange(buildPakistaniPhone(nextPrefix, suffix))

    if (nextPrefix.length === 4) {
      suffixRef.current?.focus()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={prefixRef}
        id={id ? `${id}-prefix` : undefined}
        inputMode="numeric"
        placeholder="0300"
        value={prefix}
        onChange={(e) => handlePrefixChange(e.target.value)}
        maxLength={4}
        className="w-24"
        required={required}
      />
      <span className="text-muted-foreground font-medium">-</span>
      <Input
        ref={suffixRef}
        id={id ? `${id}-suffix` : undefined}
        inputMode="numeric"
        placeholder="1234567"
        value={suffix}
        onChange={(e) => {
          onChange(buildPakistaniPhone(prefix, e.target.value))
        }}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && suffix.length === 0) {
            prefixRef.current?.focus()
          }
        }}
        maxLength={7}
        className="flex-1"
        required={required}
      />
    </div>
  )
}
