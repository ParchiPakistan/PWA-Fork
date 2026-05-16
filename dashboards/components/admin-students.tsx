"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Eye, 
  Loader2, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X,
  Users,
  Trophy,
  Calendar as CalendarIcon,
  User,
  GraduationCap,
  MoreHorizontal
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useAllStudents, useUpdateStudentStatus } from "@/hooks/use-kyc"
import type { Student, Institute } from "@/lib/api-client"
import { getActiveInstitutes } from "@/lib/api-client"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminStudents({ 
  onViewProfile, 
  onViewRedemptions 
}: { 
  onViewProfile?: (id: string) => void;
  onViewRedemptions?: (id: string) => void;
}) {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  
  // Filters
  const [search, setSearch] = useState("")
  const [university, setUniversity] = useState<string | undefined>(undefined)
  const [gender, setGender] = useState<string | undefined>(undefined)
  const [kycStatuses, setKycStatuses] = useState<string[]>([])
  const [minRedemptions, setMinRedemptions] = useState<string>("")
  const [maxRedemptions, setMaxRedemptions] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [hasRedeemed, setHasRedeemed] = useState<boolean | undefined>(undefined)
  const [foundersClub, setFoundersClub] = useState<boolean | undefined>(undefined)
  
  const [availableInstitutes, setAvailableInstitutes] = useState<Institute[]>([])
  const [isFilterVisible, setIsFilterVisible] = useState(false)

  // Fetch data
  const filters = useMemo(() => ({
    page,
    limit,
    search: search.trim() || undefined,
    university,
    gender,
    kycStatus: kycStatuses.length > 0 ? kycStatuses.join(',') : undefined,
    minRedemptions: minRedemptions ? parseInt(minRedemptions, 10) : undefined,
    maxRedemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : undefined,
    dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
    dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
    hasRedeemed,
    foundersClub
  }), [page, limit, search, university, gender, kycStatuses, minRedemptions, maxRedemptions, dateRange, hasRedeemed, foundersClub])

  const { students, loading, error, pagination, refetch } = useAllStudents(filters)
  const { updateStatus } = useUpdateStudentStatus()

  useEffect(() => {
    getActiveInstitutes()
      .then(setAvailableInstitutes)
      .catch(() => {})
  }, [])

  const handleResetFilters = () => {
    setSearch("")
    setUniversity(undefined)
    setGender(undefined)
    setKycStatuses([])
    setMinRedemptions("")
    setMaxRedemptions("")
    setDateRange(undefined)
    setHasRedeemed(undefined)
    setFoundersClub(undefined)
    setPage(1)
  }

  const toggleKycStatus = (status: string) => {
    setKycStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    )
    setPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
      case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      case 'suspended': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Suspended</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Directory</h2>
          <p className="text-muted-foreground">Manage and filter all registered students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFilterVisible(!isFilterVisible)}>
            <Filter className="mr-2 h-4 w-4" />
            {isFilterVisible ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {isFilterVisible && (
        <Card className="bg-slate-50/50">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Name, ID, Email..." 
                    className="pl-9"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>University</Label>
                <Select value={university || "all"} onValueChange={(v) => { setUniversity(v === "all" ? undefined : v); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Universities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Universities</SelectItem>
                    {availableInstitutes.map((inst) => (
                      <SelectItem key={inst.id} value={inst.name}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Joined</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => { setDateRange(range); setPage(1); }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>KYC Status</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['pending', 'approved', 'rejected', 'suspended'].map(status => (
                    <Badge 
                      key={status}
                      variant={kycStatuses.includes(status) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleKycStatus(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Redemption Range</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minRedemptions}
                    onChange={(e) => { setMinRedemptions(e.target.value); setPage(1); }}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxRedemptions}
                    onChange={(e) => { setMaxRedemptions(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Redemption History</Label>
                <Select value={hasRedeemed === undefined ? "all" : String(hasRedeemed)} onValueChange={(v) => { setHasRedeemed(v === "all" ? undefined : v === "true"); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="true">Has Redeemed</SelectItem>
                    <SelectItem value="false">Never Redeemed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Founders Club</Label>
                <Select value={foundersClub === undefined ? "all" : String(foundersClub)} onValueChange={(v) => { setFoundersClub(v === "all" ? undefined : v === "true"); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="true">Members Only</SelectItem>
                    <SelectItem value="false">Non-Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end justify-end pt-4">
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Parchi ID</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead className="text-center">Redemptions</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Loading students...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <p className="text-muted-foreground">No students found matching your criteria</p>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      #{(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.profilePicture || ""} alt={student.firstName} />
                          <AvatarFallback className="bg-slate-100 text-[10px]">
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {student.firstName} {student.lastName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{student.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {student.parchiId}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 max-w-[150px] truncate">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs truncate">{student.university}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">{student.gender || "Not Set"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(student.verificationStatus)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm">{student.totalRedemptions || 0}</span>
                        {student.isFoundersClub && (
                          <Trophy className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {student.createdAt ? format(new Date(student.createdAt), "MMM d, yyyy") : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onViewProfile?.(student.id)}
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Student Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onViewProfile?.(student.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewRedemptions?.(student.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Redemption History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {}}>
                            {student.isActive ? "Deactivate Account" : "Activate Account"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <b>{(page - 1) * limit + 1}</b> to <b>{Math.min(page * limit, pagination.total)}</b> of <b>{pagination.total}</b> students
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                // Simple pagination window logic
                let pageNum = page
                if (page <= 3) pageNum = i + 1
                else if (page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                else pageNum = page - 2 + i

                if (pageNum < 1 || pageNum > pagination.pages) return null

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={!pagination.hasNext || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
