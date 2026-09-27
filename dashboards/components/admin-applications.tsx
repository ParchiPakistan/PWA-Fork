"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  getAmbassadorApplications,
  getMerchantApplications,
  updateAmbassadorApplicationStatus,
  updateMerchantApplicationStatus,
  type AmbassadorApplication,
  type ApplicationStatus,
  type MerchantApplication,
} from "@/lib/api-client"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { Store, GraduationCap, RefreshCw, Search, Inbox, ExternalLink, Loader2 } from "lucide-react"

const STATUS_OPTIONS: ApplicationStatus[] = ["new", "contacted", "approved", "rejected"]

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`
  }
  return "just now"
}

function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: ApplicationStatus
  disabled: boolean
  onChange: (status: ApplicationStatus) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ApplicationStatus)} disabled={disabled}>
      <SelectTrigger className={`h-8 w-[130px] text-xs capitalize font-medium ${STATUS_COLORS[value]}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-16 text-center text-muted-foreground">
      <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No {label} found</p>
    </div>
  )
}

function MerchantApplicationsTab() {
  const colors = DASHBOARD_COLORS("admin")
  const { toast } = useToast()

  const [applications, setApplications] = useState<MerchantApplication[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detail, setDetail] = useState<MerchantApplication | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMerchantApplications(page, 15, statusFilter === "all" ? undefined : statusFilter)
      setApplications(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch {
      toast({ title: "Error", description: "Failed to load merchant applications", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, toast])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const filtered = search.trim()
    ? applications.filter(
        (a) =>
          a.business_name.toLowerCase().includes(search.toLowerCase()) ||
          a.contact_name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase()) ||
          a.city.toLowerCase().includes(search.toLowerCase()),
      )
    : applications

  const handleStatusChange = async (app: MerchantApplication, status: ApplicationStatus) => {
    setActionLoading(app.id)
    try {
      await updateMerchantApplicationStatus(app.id, status)
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)))
      toast({ title: "Updated", description: `${app.business_name} marked as ${status}.` })
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message || "Please try again.", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{total}</div>
            <p className="text-xs text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        {STATUS_OPTIONS.map((s) => (
          <Card key={s}>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold capitalize">
                {applications.filter((a) => a.status === s).length}
              </div>
              <p className="text-xs text-muted-foreground capitalize">{s} (this page)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by business, contact, email or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchApplications} disabled={loading} className="shrink-0">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold">Business</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">City / Category</TableHead>
                  <TableHead className="font-semibold">Branches</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}><EmptyState label="merchant applications" /></TableCell>
                  </TableRow>
                ) : (
                  filtered.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium max-w-[180px] truncate" title={app.business_name}>
                        {app.business_name}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate">{app.contact_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                        <p className="text-xs text-muted-foreground">{app.phone}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <p>{app.city}</p>
                        <p className="text-xs text-muted-foreground">{app.category}</p>
                      </TableCell>
                      <TableCell className="text-sm">{app.branch_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {timeAgo(app.created_at)}
                      </TableCell>
                      <TableCell>
                        <StatusSelect
                          value={app.status}
                          disabled={actionLoading === app.id}
                          onChange={(status) => handleStatusChange(app, status)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setDetail(app)}>
                          {actionLoading === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden divide-y">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <EmptyState label="merchant applications" />
            ) : (
              filtered.map((app) => (
                <div key={app.id} className="p-4 space-y-3" onClick={() => setDetail(app)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{app.business_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.contact_name} · {timeAgo(app.created_at)}</p>
                    </div>
                    <Badge variant="outline" className={`capitalize text-xs shrink-0 ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{app.city} · {app.category} · {app.branch_count} branches</p>
                </div>
              ))
            )}
          </div>
        </CardContent>

        {totalPages > 1 && (
          <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={15} onPageChange={setPage} colors={colors} />
        )}
      </Card>

      <ApplicationDetailDialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.business_name}
        subtitle="Become a Merchant application"
        fields={detail ? [
          { label: "Contact name", value: detail.contact_name },
          { label: "Email", value: detail.email },
          { label: "Phone", value: detail.phone },
          { label: "City", value: detail.city },
          { label: "Category", value: detail.category },
          { label: "Branches", value: detail.branch_count },
          { label: "Website / Instagram", value: detail.website, link: detail.website ? normalizeUrl(detail.website) : undefined },
          { label: "Message", value: detail.message, multiline: true },
          { label: "Submitted", value: detail.created_at ? new Date(detail.created_at).toLocaleString() : undefined },
        ] : []}
      />
    </div>
  )
}

function AmbassadorApplicationsTab() {
  const colors = DASHBOARD_COLORS("admin")
  const { toast } = useToast()

  const [applications, setApplications] = useState<AmbassadorApplication[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detail, setDetail] = useState<AmbassadorApplication | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAmbassadorApplications(page, 15, statusFilter === "all" ? undefined : statusFilter)
      setApplications(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch {
      toast({ title: "Error", description: "Failed to load ambassador applications", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, toast])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const filtered = search.trim()
    ? applications.filter(
        (a) =>
          a.full_name.toLowerCase().includes(search.toLowerCase()) ||
          a.institute.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase()) ||
          a.city.toLowerCase().includes(search.toLowerCase()),
      )
    : applications

  const handleStatusChange = async (app: AmbassadorApplication, status: ApplicationStatus) => {
    setActionLoading(app.id)
    try {
      await updateAmbassadorApplicationStatus(app.id, status)
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)))
      toast({ title: "Updated", description: `${app.full_name} marked as ${status}.` })
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message || "Please try again.", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{total}</div>
            <p className="text-xs text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        {STATUS_OPTIONS.map((s) => (
          <Card key={s}>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold capitalize">
                {applications.filter((a) => a.status === s).length}
              </div>
              <p className="text-xs text-muted-foreground capitalize">{s} (this page)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, institute, email or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchApplications} disabled={loading} className="shrink-0">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Institute</TableHead>
                  <TableHead className="font-semibold">Year / City</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}><EmptyState label="ambassador applications" /></TableCell>
                  </TableRow>
                ) : (
                  filtered.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium max-w-[180px] truncate" title={app.full_name}>
                        {app.full_name}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate">{app.email}</p>
                        <p className="text-xs text-muted-foreground">{app.phone}</p>
                      </TableCell>
                      <TableCell className="text-sm max-w-[180px] truncate" title={app.institute}>{app.institute}</TableCell>
                      <TableCell className="text-sm">
                        <p>{app.year_of_study}</p>
                        <p className="text-xs text-muted-foreground">{app.city}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {timeAgo(app.created_at)}
                      </TableCell>
                      <TableCell>
                        <StatusSelect
                          value={app.status}
                          disabled={actionLoading === app.id}
                          onChange={(status) => handleStatusChange(app, status)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setDetail(app)}>
                          {actionLoading === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden divide-y">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <EmptyState label="ambassador applications" />
            ) : (
              filtered.map((app) => (
                <div key={app.id} className="p-4 space-y-3" onClick={() => setDetail(app)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{app.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.institute} · {timeAgo(app.created_at)}</p>
                    </div>
                    <Badge variant="outline" className={`capitalize text-xs shrink-0 ${STATUS_COLORS[app.status]}`}>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{app.year_of_study} · {app.city}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>

        {totalPages > 1 && (
          <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={15} onPageChange={setPage} colors={colors} />
        )}
      </Card>

      <ApplicationDetailDialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.full_name}
        subtitle="Become a Campus Ambassador application"
        fields={detail ? [
          { label: "Email", value: detail.email },
          { label: "Phone", value: detail.phone },
          { label: "University / College", value: detail.institute },
          { label: "Year of study", value: detail.year_of_study },
          { label: "City", value: detail.city },
          { label: "Instagram", value: detail.instagram, link: detail.instagram ? `https://instagram.com/${detail.instagram.replace(/^@/, "")}` : undefined },
          { label: "Why you?", value: detail.motivation, multiline: true },
          { label: "Submitted", value: detail.created_at ? new Date(detail.created_at).toLocaleString() : undefined },
        ] : []}
      />
    </div>
  )
}

function normalizeUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith("@")) return `https://instagram.com/${value.slice(1)}`
  return `https://${value}`
}

function PaginationFooter({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  colors,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  colors: { primary: string }
}) {
  return (
    <div className="p-4 border-t">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page - 2 + i
              if (pg < 1 || pg > totalPages) return null
              return (
                <PaginationItem key={pg}>
                  <PaginationLink
                    isActive={pg === page}
                    onClick={() => onPageChange(pg)}
                    className="cursor-pointer"
                    style={pg === page ? { backgroundColor: colors.primary, color: "white", borderColor: colors.primary } : {}}
                  >
                    {pg}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

function ApplicationDetailDialog({
  open,
  onClose,
  title,
  subtitle,
  fields,
}: {
  open: boolean
  onClose: () => void
  title?: string
  subtitle: string
  fields: { label: string; value?: string | null; multiline?: boolean; link?: string }[]
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {fields.map((f) => (
            <div key={f.label} className="text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</p>
              {!f.value ? (
                <p className="text-muted-foreground/60 italic">Not provided</p>
              ) : f.link ? (
                <a
                  href={f.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 break-all"
                >
                  {f.value} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <p className={f.multiline ? "whitespace-pre-wrap leading-relaxed" : ""}>{f.value}</p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdminApplications() {
  const colors = DASHBOARD_COLORS("admin")
  const [tab, setTab] = useState<"merchant" | "ambassador">("merchant")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Landing-page submissions from the Become a Merchant and Become a Campus Ambassador forms
        </p>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab("merchant")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "merchant" ? "border-current" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          style={tab === "merchant" ? { color: colors.primary, borderColor: colors.primary } : {}}
        >
          <Store className="w-4 h-4" /> Merchants
        </button>
        <button
          onClick={() => setTab("ambassador")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "ambassador" ? "border-current" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          style={tab === "ambassador" ? { color: colors.primary, borderColor: colors.primary } : {}}
        >
          <GraduationCap className="w-4 h-4" /> Campus Ambassadors
        </button>
      </div>

      {tab === "merchant" ? <MerchantApplicationsTab /> : <AmbassadorApplicationsTab />}
    </div>
  )
}
