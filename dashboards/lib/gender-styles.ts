/** Tailwind classes for gender display / selection (Male=blue, Female=rose, Other=slate). */

export function genderTextClass(gender?: string | null): string {
  switch (gender) {
    case "Male":
      return "text-blue-600"
    case "Female":
      return "text-rose-600"
    case "Other":
      return "text-slate-600"
    default:
      return "text-muted-foreground"
  }
}

export function genderBadgeClass(gender?: string | null): string {
  switch (gender) {
    case "Male":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "Female":
      return "bg-rose-50 text-rose-700 border-rose-200"
    case "Other":
      return "bg-slate-100 text-slate-700 border-slate-200"
    default:
      return "bg-muted text-muted-foreground border-transparent"
  }
}

export function genderButtonClass(gender: string): string {
  switch (gender) {
    case "Male":
      return "border-blue-300 text-blue-700 hover:border-blue-500 hover:bg-blue-50"
    case "Female":
      return "border-rose-300 text-rose-700 hover:border-rose-500 hover:bg-rose-50"
    case "Other":
      return "border-slate-300 text-slate-700 hover:border-slate-500 hover:bg-slate-50"
    default:
      return "hover:border-primary hover:bg-primary/5"
  }
}

export function genderSelectItemClass(gender: string): string {
  switch (gender) {
    case "Male":
      return "text-blue-700 focus:text-blue-700 focus:bg-blue-50"
    case "Female":
      return "text-rose-700 focus:text-rose-700 focus:bg-rose-50"
    case "Other":
      return "text-slate-700 focus:text-slate-700 focus:bg-slate-50"
    default:
      return ""
  }
}
