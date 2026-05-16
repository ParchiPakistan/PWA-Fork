"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, X, Search, Eye, MoreHorizontal, Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, ZoomIn, Trash2, Save, Mail, Apple, Smartphone, ShieldCheck, CheckCircle2, School, Calendar as CalendarIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { usePendingStudents, useAllStudents, useStudentDetail, useApproveRejectStudent, useUpdateStudentStatus, useDeleteStudent, useUpdateStudentAdmin, useVerifyStudentEmail } from "@/hooks/use-kyc"
import type { Student, UpdateStudentAdminRequest, Institute } from "@/lib/api-client"
import { getActiveInstitutes } from "@/lib/api-client"

import { AdminInstitutesDialog } from "./admin-institutes-dialog"

export function AdminKYC({ 
  externalSelectedId, 
  onExternalIdHandled 
}: { 
  externalSelectedId?: string | null;
  onExternalIdHandled?: () => void;
}) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  // Handle external selection from other tabs
  useEffect(() => {
    if (externalSelectedId) {
      setSelectedStudentId(externalSelectedId)
      setIsReviewOpen(true)
      if (onExternalIdHandled) onExternalIdHandled()
    }
  }, [externalSelectedId, onExternalIdHandled])
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isInstitutesDialogOpen, setIsInstitutesDialogOpen] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [expandedImage, setExpandedImage] = useState<{ url: string; alt: string } | null>(null)
  const [pendingPage, setPendingPage] = useState(1)
  const [allPage, setAllPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'expired' | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [instituteQuery, setInstituteQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [debouncedInstitute, setDebouncedInstitute] = useState("")
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<boolean | undefined>(undefined)
  const [groupByFilter, setGroupByFilter] = useState<'university' | 'city' | undefined>(undefined)
  // New state for deactivation
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [deactivationReason, setDeactivationReason] = useState("")
  const [studentToDeactivate, setStudentToDeactivate] = useState<Student | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [selectedInstituteId, setSelectedInstituteId] = useState("")
  const [studentIdNumberInput, setStudentIdNumberInput] = useState("")
  const [availableInstitutes, setAvailableInstitutes] = useState<Institute[]>([])
  const { toast } = useToast()


  const { students: pendingStudents, loading: pendingLoading, error: pendingError, pagination: pendingPagination, refetch: refetchPending } = usePendingStudents(pendingPage, 12)

  // Load institutes once for the approve dropdown
  useEffect(() => {
    getActiveInstitutes()
      .then(setAvailableInstitutes)
      .catch(() => { /* non-critical */ })
  }, [])

  // Debounce search and institute queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setDebouncedInstitute(instituteQuery)
      // Reset to page 1 when search or institute changes
      if (searchQuery !== debouncedSearch || instituteQuery !== debouncedInstitute) {
        setAllPage(1)
      }
    }, 500) // Increased debounce time for both
    return () => clearTimeout(timer)
  }, [searchQuery, instituteQuery, debouncedSearch, debouncedInstitute]) // Added debounced values to dependencies to trigger page reset correctly

  // Memoize filters object to prevent unnecessary re-renders
  const allStudentsFilters = useMemo(() => ({
    status: statusFilter,
    page: allPage,
    limit: 12,
    search: debouncedSearch.trim() || undefined,
    institute: debouncedInstitute.trim() || undefined,
    emailVerified: emailVerifiedFilter,
    groupBy: groupByFilter
  }), [statusFilter, allPage, debouncedSearch, debouncedInstitute, emailVerifiedFilter, groupByFilter])

  const { students: allStudents, loading: allLoading, error: allError, pagination: allPagination, refetch: refetchAll } = useAllStudents(allStudentsFilters)
  const { student: studentDetail, loading: detailLoading, error: detailError, refetch: refetchDetail } = useStudentDetail(selectedStudentId)
  const { approveReject, loading: approveRejectLoading, error: approveRejectError } = useApproveRejectStudent()
  const { updateStatus, loading: updateStatusLoading, error: updateStatusError } = useUpdateStudentStatus()
  const { removeStudent, loading: deleteStudentLoading, error: deleteStudentError } = useDeleteStudent()
  const { save: saveStudentProfile, loading: saveProfileLoading, error: saveProfileError } = useUpdateStudentAdmin()
  const { verifyEmail, loading: verifyEmailLoading } = useVerifyStudentEmail()

  const [profileDraft, setProfileDraft] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    university: "",
    graduationYear: "",
    isFoundersClub: false,
    totalSavings: "0",
    totalRedemptions: "0",
    verificationStatus: "pending" as Student["verificationStatus"],
    verificationExpiresAt: "",
    instituteId: "",
    studentIdNumber: "",
    dateOfBirth: "",
    profilePicture: "",
    verificationSelfiePath: "",
    isActive: true,
    gender: "",
    degree: "",
    yearOfStudy: "",
    notes: "",
  })

  useEffect(() => {
    if (!studentDetail) return
    setProfileDraft({
      firstName: studentDetail.firstName,
      lastName: studentDetail.lastName,
      email: studentDetail.email,
      phone: studentDetail.phone ?? "",
      university: studentDetail.university,
      graduationYear: studentDetail.graduationYear != null ? String(studentDetail.graduationYear) : "",
      isFoundersClub: studentDetail.isFoundersClub,
      totalSavings: String(studentDetail.totalSavings ?? 0),
      totalRedemptions: String(studentDetail.totalRedemptions ?? 0),
      verificationStatus: studentDetail.verificationStatus,
      verificationExpiresAt: studentDetail.verificationExpiresAt
        ? new Date(studentDetail.verificationExpiresAt).toISOString().slice(0, 16)
        : "",
      instituteId: studentDetail.instituteId ?? "",
      studentIdNumber: studentDetail.studentIdNumber ?? "",
      dateOfBirth: studentDetail.dateOfBirth ? studentDetail.dateOfBirth.slice(0, 10) : "",
      profilePicture: studentDetail.profilePicture ?? "",
      verificationSelfiePath: studentDetail.verificationSelfiePath ?? "",
      isActive: studentDetail.isActive,
      gender: studentDetail.gender ?? "",
      degree: studentDetail.degree ?? "",
      yearOfStudy: studentDetail.yearOfStudy ?? "",
      notes: studentDetail.adminNotes ?? "",
    })
    setSelectedInstituteId(studentDetail.instituteId ?? "")
    setStudentIdNumberInput(studentDetail.studentIdNumber ?? "")
  }, [studentDetail?.id, studentDetail?.updatedAt])

  // Reset page when status filter changes
  useEffect(() => {
    setAllPage(1)
  }, [statusFilter])

  const handleRefresh = () => {
    refetchPending()
    refetchAll()
  }

  const handleReview = (studentId: string) => {
    setSelectedStudentId(studentId)
    setIsReviewOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedStudentId) return
    
    if (!selectedInstituteId) {
      toast({
        title: "Institute Required",
        description: "Please select the student's institute before approving.",
        variant: "destructive"
      })
      return
    }
    if (!studentIdNumberInput.trim()) {
      toast({
        title: "Student ID Required",
        description: "Please enter the student's ID number before approving.",
        variant: "destructive"
      })
      return
    }

    const result = await approveReject(selectedStudentId, { 
      action: 'approve',
      instituteId: selectedInstituteId,
      studentIdNumber: studentIdNumberInput.trim(),
    })
    if (result) {
      toast({
        title: "Success",
        description: "Student approved successfully",
      })
      setIsReviewOpen(false)
      setSelectedStudentId(null)
      setSelectedInstituteId("")
      setStudentIdNumberInput("")
      refetchPending()
      refetchAll()
    } else {

      toast({
        title: "Error",
        description: approveRejectError || "Failed to approve student",
        variant: "destructive",
      })
    }
  }

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!selectedStudentId) return

    const result = await approveReject(selectedStudentId, {
      action: 'reject',
      reviewNotes: rejectionNotes.trim() || undefined,
    })
    if (result) {
      toast({
        title: "Success",
        description: "Student rejected successfully",
      })
      setIsReviewOpen(false)
      setIsRejectDialogOpen(false)
      setRejectionNotes("")
      setSelectedStudentId(null)
      refetchPending()
      refetchAll()
    } else {
      toast({
        title: "Error",
        description: approveRejectError || "Failed to reject student",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (student: Student) => {
    // If activating, just call update
    if (!student.isActive) {
      const result = await updateStatus(student.id, true)
      if (result) {
        toast({
          title: "Success",
          description: "Student activated successfully",
        })
        refetchAll()
      } else {
        toast({
          title: "Error",
          description: updateStatusError || "Failed to activate student",
          variant: "destructive",
        })
      }
    } else {
      // If deactivating, open dialog
      setStudentToDeactivate(student)
      setIsDeactivateDialogOpen(true)
    }
  }

  const handleConfirmDeactivate = async () => {
    if (!studentToDeactivate) return

    const result = await updateStatus(studentToDeactivate.id, false, deactivationReason)

    if (result) {
      toast({
        title: "Success",
        description: "Student deactivated successfully",
      })
      setIsDeactivateDialogOpen(false)
      setStudentToDeactivate(null)
      setDeactivationReason("")
      refetchAll()
    } else {
      toast({
        title: "Error",
        description: updateStatusError || "Failed to deactivate student",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    const ok = await removeStudent(studentToDelete.id)
    if (ok) {
      toast({
        title: "Student Deleted",
        description: `${studentToDelete.firstName} ${studentToDelete.lastName} was deleted successfully.`,
      })
      setIsDeleteDialogOpen(false)
      setStudentToDelete(null)
      refetchAll()
      refetchPending()
    } else {
      toast({
        title: "Error",
        description: deleteStudentError || "Failed to delete student",
        variant: "destructive",
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!selectedStudentId || !studentDetail) return
    const gy = profileDraft.graduationYear.trim()
    let graduationYear: number | null = null
    if (gy !== "") {
      const n = parseInt(gy, 10)
      if (Number.isNaN(n)) {
        toast({
          title: "Error",
          description: "Graduation year must be a valid number.",
          variant: "destructive",
        })
        return
      }
      graduationYear = n
    }
     const payload: UpdateStudentAdminRequest = {
      firstName: profileDraft.firstName.trim(),
      lastName: profileDraft.lastName.trim(),
      email: profileDraft.email.trim(),
      phone: profileDraft.phone.trim() || null,
      university: profileDraft.university.trim(),
      graduationYear,
      isFoundersClub: profileDraft.isFoundersClub,
      totalSavings: Number(profileDraft.totalSavings) || 0,
      totalRedemptions: parseInt(profileDraft.totalRedemptions, 10) || 0,
      verificationStatus: profileDraft.verificationStatus,
      verificationExpiresAt: profileDraft.verificationExpiresAt.trim() || null,
      instituteId: profileDraft.instituteId.trim() || null,
      studentIdNumber: profileDraft.studentIdNumber.trim() || null,
      dateOfBirth: profileDraft.dateOfBirth.trim() || null,
      profilePicture: profileDraft.profilePicture.trim() || null,
      verificationSelfiePath: profileDraft.verificationSelfiePath.trim() || null,
      isActive: profileDraft.isActive,
      gender: profileDraft.gender.trim() || null,
      degree: profileDraft.degree.trim() || null,
      yearOfStudy: profileDraft.yearOfStudy.trim() || null,
      notes: profileDraft.notes.trim() || null,
    }
    const result = await saveStudentProfile(selectedStudentId, payload)
    if (result) {
      toast({
        title: "Saved",
        description: "Student profile updated successfully.",
      })
      refetchDetail()
      refetchAll()
      refetchPending()
    } else {
      toast({
        title: "Error",
        description: saveProfileError || "Failed to save profile",
        variant: "destructive",
      })
    }
  }

  const handleVerifyEmail = async (studentId: string) => {
    const result = await verifyEmail(studentId)
    if (result) {
      toast({
        title: "Email Verified",
        description: "Student email has been manually verified.",
      })
      refetchAll()
      if (selectedStudentId === studentId) {
        refetchDetail()
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to verify student email.",
        variant: "destructive",
      })
    }
  }

  // Server-side search is now handled by the API, but keep client-side filtering as fallback
  // This will be removed once backend search is fully implemented
  const filteredAllStudents = allStudents.filter((student) =>
    !searchQuery.trim() ||
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.parchiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.university.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'expired':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      case 'expired': return 'Expired'
      default: return status
    }
  }

  // Generate pagination items logic
  const generatePaginationItems = (currentPage: number, totalPages: number) => {
    const items: (number | null)[] = []

    // Always show first page
    items.push(1)

    // Calculate start and end of visible pages around current
    let start = Math.max(2, currentPage - 1)
    let end = Math.min(totalPages - 1, currentPage + 1)

    // Adjust if near start or end to keep consistent number of items if possible
    if (currentPage <= 3) {
      end = Math.min(totalPages - 1, 4)
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3)
    }

    // Add ellipsis before start if needed
    if (start > 2) {
      items.push(null)
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
      items.push(i)
    }

    // Add ellipsis after end if needed
    if (end < totalPages - 1) {
      items.push(null)
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(totalPages)
    }

    return items
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student KYC</h2>
          <p className="text-muted-foreground">Manage student verifications and records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsInstitutesDialogOpen(true)}>
            Manage Institutes
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={pendingLoading || allLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${pendingLoading || allLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <AdminInstitutesDialog open={isInstitutesDialogOpen} onOpenChange={setIsInstitutesDialogOpen} />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals {pendingPagination ? `(${pendingPagination.total})` : ''}
          </TabsTrigger>
          <TabsTrigger value="all">
            All Students {allPagination ? `(${allPagination.total})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{pendingError}</AlertDescription>
            </Alert>
          )}

          {pendingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading pending students...</span>
            </div>
          ) : pendingStudents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending students found.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingStudents.map((student) => (
                  <div key={student.id} className="group relative p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                      <ShieldCheck className="w-24 h-24" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] border border-blue-100 dark:border-blue-800">
                          <School className="w-5 h-5" />
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-full font-black uppercase text-[10px] tracking-widest px-3 h-6">
                           Verification Pending
                        </Badge>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{student.firstName} {student.lastName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{student.university}</p>
                           <div className="w-1 h-1 rounded-full bg-slate-300" />
                           <p className="text-[10px] font-black uppercase text-[#007AFF] tracking-tighter">ID: {student.parchiId}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-6">
                         <div className="flex items-center gap-3">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">{student.email}</p>
                         </div>
                      </div>

                      <Button 
                        className="w-full h-12 rounded-2xl bg-[#007AFF] hover:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 transition-all duration-300" 
                        onClick={() => handleReview(student.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> Begin Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {pendingPagination && pendingPagination.pages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {pendingPagination.page} of {pendingPagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPendingPage(p => Math.max(1, p - 1))
                      }}
                      disabled={!pendingPagination.hasPrev || pendingLoading}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPendingPage(p => Math.min(pendingPagination.pages, p + 1))
                      }}
                      disabled={!pendingPagination.hasNext || pendingLoading}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Database</CardTitle>
                  <CardDescription>
                    A list of all registered students and their verification status.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchAll()}
                  disabled={allLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${allLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {allError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{allError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-4 py-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder="Filter by institute..."
                    value={instituteQuery}
                    onChange={(e) => setInstituteQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === undefined && emailVerifiedFilter === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter(undefined)
                      setEmailVerifiedFilter(undefined)
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('pending')
                      setEmailVerifiedFilter(undefined)
                    }}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('approved')
                      setEmailVerifiedFilter(undefined)
                    }}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={statusFilter === 'rejected' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('rejected')
                      setEmailVerifiedFilter(undefined)
                    }}
                  >
                    Rejected
                  </Button>
                  <Button
                    variant={emailVerifiedFilter === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => {
                      setEmailVerifiedFilter(emailVerifiedFilter === false ? undefined : false)
                      setStatusFilter(undefined)
                    }}
                  >
                    Unverified
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">Segmentation:</Label>
                  <Select value={groupByFilter || 'none'} onValueChange={(v) => setGroupByFilter(v === 'none' ? undefined : v as any)}>
                    <SelectTrigger className="h-9 w-[160px] text-xs font-bold">
                      <SelectValue placeholder="Group by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">List View</SelectItem>
                      <SelectItem value="university">By Institution</SelectItem>
                      <SelectItem value="city">By City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {allLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading students...</span>
                </div>
              ) : filteredAllStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No students found matching your search.' : 'No students found.'}
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    {groupByFilter ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">{groupByFilter === 'university' ? 'Institution' : 'City'}</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Total Students</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-green-600">Approved</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-yellow-600">Pending</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-red-600">Rejected</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allStudents.map((group: any) => (
                            <TableRow key={group.group} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <TableCell className="font-black text-slate-900 dark:text-white">{group.group}</TableCell>
                              <TableCell className="font-bold">{group.total}</TableCell>
                              <TableCell>
                                <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                                  {group.approved}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                  {group.pending}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
                                  {group.rejected}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Institute</TableHead>
                          <TableHead>Parchi ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Email Status</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>KYC Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAllStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>{student.university}</TableCell>
                            <TableCell>{student.parchiId}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              <Badge variant={student.emailConfirmed ? "default" : "destructive"} className="text-xs">
                                {student.emailConfirmed ? "Verified" : "Unverified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {student.platform === 'ios' ? (
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <Apple className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-bold uppercase tracking-tighter">iOS</span>
                                </div>
                              ) : student.platform === 'android' ? (
                                <div className="flex items-center gap-1.5 text-green-600">
                                  <Smartphone className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-bold uppercase tracking-tighter">Android</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(student.verificationStatus)}>
                                {getStatusText(student.verificationStatus)}
                              </Badge>
                              {student.verificationStatus === 'rejected' && student.reviewNotes && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-[10px] text-destructive mt-1 max-w-[150px] truncate leading-tight font-medium cursor-help">
                                        ↳ {student.reviewNotes}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs p-3 text-xs bg-slate-900 text-white border-slate-800 shadow-2xl">
                                      <p className="font-bold mb-1 uppercase tracking-tighter opacity-60">Rejection Reason</p>
                                      <p className="leading-relaxed">{student.reviewNotes}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {!student.isActive && student.verificationStatus === 'approved' && (
                                <Badge variant="secondary" className="ml-2">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleReview(student.id)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {student.isActive ? (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(student)} className="text-red-600">
                                      <X className="mr-2 h-4 w-4" /> Deactivate Account
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(student)} className="text-green-600">
                                      <Check className="mr-2 h-4 w-4" /> Activate Account
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleDeleteClick(student)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                                  </DropdownMenuItem>
                                  {!student.emailConfirmed && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleVerifyEmail(student.id)} className="text-blue-600">
                                        <Mail className="mr-2 h-4 w-4" /> Verify Email
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    )}
                  </div>

                  {!groupByFilter && allPagination && allPagination.pages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setAllPage(p => Math.max(1, p - 1))}
                              className={!allPagination.hasPrev || allLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>

                          {generatePaginationItems(allPagination.page, allPagination.pages).map((p, i) => (
                            <PaginationItem key={i}>
                              {p === null ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  isActive={allPagination.page === p}
                                  onClick={() => setAllPage(p)}
                                  className="cursor-pointer"
                                >
                                  {p}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setAllPage(p => Math.min(allPagination.pages, p + 1))}
                              className={!allPagination.hasNext || allLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={(open) => {
        setIsReviewOpen(open)
        if (!open) {
          setSelectedStudentId(null)
        }
      }}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0 bg-slate-50 dark:bg-slate-950 border-none shadow-2xl">
          <div className="flex flex-col h-full max-h-[95vh]">
            {/* Header */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                    KYC Verification Portal
                  </DialogTitle>
                  {studentDetail && (
                    <Badge variant={getStatusVariant(studentDetail.verificationStatus)} className="h-6 px-3 rounded-full font-black uppercase text-[10px] tracking-widest">
                      {getStatusText(studentDetail.verificationStatus)}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
                  {studentDetail
                    ? `Reviewing credentials for ${studentDetail.firstName} ${studentDetail.lastName}`
                    : "Loading student intelligence..."}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={() => refetchDetail()} disabled={detailLoading} className="rounded-xl border-slate-200 dark:border-slate-800">
                    <RefreshCw className={`h-4 w-4 mr-2 ${detailLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => setIsReviewOpen(false)} className="rounded-full">
                    <X className="h-5 w-5" />
                 </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left Column: Document Review (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#007AFF]" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Student Documents...</p>
                  </div>
                ) : studentDetail ? (
                  <>
                    {/* Document Section */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">KYC Documentation</h3>
                         <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-6 opacity-50" />
                      </div>
                      
                      {studentDetail.kyc ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* ID Front */}
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Student ID (Front View)</Label>
                            <div 
                              className="group relative rounded-3xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 cursor-zoom-in transition-all hover:scale-[1.02] duration-500"
                              onClick={() => setExpandedImage({ url: studentDetail.kyc!.studentIdCardFrontPath, alt: "ID Front" })}
                            >
                              <img 
                                src={studentDetail.kyc.studentIdCardFrontPath} 
                                alt="ID Front" 
                                className="w-full h-56 object-cover"
                                onError={(e) => (e.target as HTMLImageElement).src = '/placeholder.svg?height=300&width=500'}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                                  <ZoomIn className="h-6 w-6" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ID Back */}
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Student ID (Back View)</Label>
                            <div 
                              className="group relative rounded-3xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 cursor-zoom-in transition-all hover:scale-[1.02] duration-500"
                              onClick={() => setExpandedImage({ url: studentDetail.kyc!.studentIdCardBackPath, alt: "ID Back" })}
                            >
                              <img 
                                src={studentDetail.kyc.studentIdCardBackPath} 
                                alt="ID Back" 
                                className="w-full h-56 object-cover"
                                onError={(e) => (e.target as HTMLImageElement).src = '/placeholder.svg?height=300&width=500'}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                                  <ZoomIn className="h-6 w-6" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Verification Selfie */}
                          <div className="lg:col-span-2 space-y-3">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Live Verification Selfie</Label>
                            <div className="flex flex-col md:flex-row gap-6 p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-white dark:border-slate-800">
                              <div 
                                className="group relative w-full md:w-64 h-64 shrink-0 rounded-2xl overflow-hidden cursor-zoom-in transition-all hover:scale-[1.02] duration-500"
                                onClick={() => setExpandedImage({ url: studentDetail.kyc!.selfieImagePath, alt: "Selfie" })}
                              >
                                <img 
                                  src={studentDetail.kyc.selfieImagePath} 
                                  alt="Selfie" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => (e.target as HTMLImageElement).src = '/placeholder.svg?height=400&width=400'}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                                    <ZoomIn className="h-6 w-6" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 space-y-4 py-2">
                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                                   <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Selfie Analysis</p>
                                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                      Ensure the face in the selfie matches the ID card photo. The student should be clearly visible with adequate lighting.
                                   </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                      <p className="text-[10px] font-black uppercase text-slate-400">Submission Date</p>
                                      <p className="text-sm font-bold">{studentDetail.kyc.submittedAt ? new Date(studentDetail.kyc.submittedAt).toLocaleString() : 'N/A'}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] font-black uppercase text-slate-400">Renewal Status</p>
                                      <Badge variant={studentDetail.kyc.isAnnualRenewal ? "outline" : "secondary"} className="h-5 px-2 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                                        {studentDetail.kyc.isAnnualRenewal ? "Annual Renewal" : "First Submission"}
                                      </Badge>
                                   </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-12 text-center rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
                           <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                           <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest">No KYC Documents</h4>
                           <p className="text-slate-400 text-sm mt-2">This student hasn't submitted their KYC documentation yet.</p>
                        </div>
                      )}
                    </section>

                    {/* Technical Profile Section */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Account Intel</h3>
                         <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-6 opacity-50" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-white dark:border-slate-800">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#007AFF]">
                                 <Mail className="h-4 w-4" />
                              </div>
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Identity</p>
                           </div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{studentDetail.email}</p>
                           <Badge variant={studentDetail.emailConfirmed ? "default" : "destructive"} className="mt-2 h-5 px-2 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                              {studentDetail.emailConfirmed ? "Confirmed" : "Unverified"}
                           </Badge>
                        </div>

                        <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-white dark:border-slate-800">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600">
                                 <Smartphone className="h-4 w-4" />
                              </div>
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Origin Platform</p>
                           </div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
                              {studentDetail.platform || 'Web / Unknown'}
                           </p>
                           <p className="text-[10px] text-slate-400 mt-1 font-bold">DEVICE ID: {studentDetail.deviceId?.substring(0, 12).toUpperCase() || 'N/A'}</p>
                        </div>

                        <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-white dark:border-slate-800">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                                 <CalendarIcon className="h-4 w-4" />
                              </div>
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Engagement</p>
                           </div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {studentDetail.createdAt ? format(new Date(studentDetail.createdAt), "MMM d, yyyy") : 'N/A'}
                           </p>
                           <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-tighter uppercase">Member Since</p>
                        </div>
                      </div>
                    </section>
                  </>
                ) : null}
              </div>

              {/* Right Column: Profile Edits & Decisions (Scrollable) */}
              <div className="w-full md:w-[450px] bg-white dark:bg-slate-900 border-l overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {studentDetail && (
                  <>
                    {/* Verification Panel */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#007AFF]">Review Decisions</h3>
                         <div className="h-px flex-1 bg-blue-100 dark:bg-blue-900/30 ml-6 opacity-50" />
                      </div>

                      <Card className="rounded-[2.5rem] border-2 border-indigo-500/10 shadow-2xl shadow-indigo-500/5 bg-gradient-to-br from-indigo-500/[0.02] to-white dark:to-slate-900 overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                          {studentDetail.verificationStatus === 'approved' ? (
                            <div className="space-y-4 text-center py-4">
                               <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border-2 border-emerald-500/20">
                                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                               </div>
                               <div>
                                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Verified Student</h4>
                                  <p className="text-sm text-slate-500 font-medium">This account has been successfully verified.</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left space-y-2">
                                  <div className="flex justify-between text-xs font-bold">
                                     <span className="text-slate-400 uppercase tracking-widest">Verified By</span>
                                     <span className="text-[#007AFF]">{studentDetail.verifiedBy?.email || 'System'}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold">
                                     <span className="text-slate-400 uppercase tracking-widest">Date</span>
                                     <span className="text-slate-600 dark:text-slate-300">{studentDetail.verifiedAt ? format(new Date(studentDetail.verifiedAt), "MMM d, h:mm a") : 'N/A'}</span>
                                  </div>
                               </div>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Assign Institute *</Label>
                                  <Select value={selectedInstituteId} onValueChange={setSelectedInstituteId}>
                                    <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#007AFF] transition-all">
                                      <SelectValue placeholder="Select verified institute" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableInstitutes.map((inst) => (
                                        <SelectItem key={inst.id} value={inst.id} className="rounded-xl my-1">{inst.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Official Student ID *</Label>
                                  <div className="relative group">
                                     <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#007AFF] transition-colors" />
                                     <Input
                                        placeholder="Enter manual ID number..."
                                        value={studentIdNumberInput}
                                        onChange={(e) => setStudentIdNumberInput(e.target.value)}
                                        className="h-12 pl-11 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#007AFF] transition-all font-bold"
                                        autoComplete="off"
                                     />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                  variant="outline"
                                  onClick={handleRejectClick}
                                  disabled={approveRejectLoading}
                                  className="h-12 rounded-2xl border-2 border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 font-black uppercase text-[10px] tracking-widest transition-all duration-300 shadow-lg shadow-red-500/5"
                                >
                                  <X className="mr-2 h-4 w-4" /> Reject
                                </Button>
                                <Button
                                  onClick={handleApprove}
                                  disabled={approveRejectLoading || !selectedInstituteId || !studentIdNumberInput.trim()}
                                  className="h-12 rounded-2xl bg-[#007AFF] hover:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest transition-all duration-300 shadow-xl shadow-blue-500/20"
                                >
                                  {approveRejectLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <><Check className="mr-2 h-4 w-4" /> Approve</>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </section>

                    {/* Profile Information */}
                    <section className="space-y-6 pb-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Profile Intelligence</h3>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={handleSaveProfile} 
                           disabled={saveProfileLoading}
                           className="text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full font-black uppercase text-[10px] tracking-widest"
                         >
                            {saveProfileLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" />}
                            Sync Profile
                         </Button>
                      </div>

                      <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</Label>
                               <Input 
                                 value={profileDraft.firstName} 
                                 onChange={(e) => setProfileDraft(d => ({...d, firstName: e.target.value}))}
                                 className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-sm font-bold"
                               />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</Label>
                               <Input 
                                 value={profileDraft.lastName} 
                                 onChange={(e) => setProfileDraft(d => ({...d, lastName: e.target.value}))}
                                 className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-sm font-bold"
                               />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Academic Institution</Label>
                            <Input 
                              value={profileDraft.university} 
                              onChange={(e) => setProfileDraft(d => ({...d, university: e.target.value}))}
                              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-sm font-bold"
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Graduation Year</Label>
                               <Input 
                                 type="number"
                                 value={profileDraft.graduationYear} 
                                 onChange={(e) => setProfileDraft(d => ({...d, graduationYear: e.target.value}))}
                                 className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-sm font-bold"
                               />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Birth Date</Label>
                               <Input 
                                 type="date"
                                 value={profileDraft.dateOfBirth} 
                                 onChange={(e) => setProfileDraft(d => ({...d, dateOfBirth: e.target.value}))}
                                 className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-sm font-bold"
                               />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Academic Degree</Label>
                               <Input 
                                 value={profileDraft.degree} 
                                 onChange={(e) => setProfileDraft(d => ({...d, degree: e.target.value}))}
                                 className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-sm font-bold"
                                 placeholder="e.g. BS Computer Science"
                               />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Year of Study</Label>
                               <Input 
                                 value={profileDraft.yearOfStudy} 
                                 onChange={(e) => setProfileDraft(d => ({...d, yearOfStudy: e.target.value}))}
                                 className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-sm font-bold"
                                 placeholder="e.g. 3rd Year"
                               />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Internal Admin Notes</Label>
                            <textarea
                              value={profileDraft.notes}
                              onChange={(e) => setProfileDraft(d => ({...d, notes: e.target.value}))}
                              className="w-full min-h-[100px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-sm font-bold focus:ring-2 focus:ring-[#007AFF] transition-all outline-none resize-none"
                              placeholder="Add private internal notes about this student..."
                            />
                         </div>

                         <div className="p-4 rounded-3xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-4">
                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Founders Club</p>
                                  <p className="text-[10px] text-slate-500 font-medium">Early Adopter Privilege</p>
                               </div>
                               <Switch 
                                 checked={profileDraft.isFoundersClub} 
                                 onCheckedChange={(v) => setProfileDraft(d => ({...d, isFoundersClub: v}))}
                               />
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800" />
                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Account Status</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{profileDraft.isActive ? 'Actively participating' : 'Restricted Access'}</p>
                               </div>
                               <Switch 
                                 checked={profileDraft.isActive} 
                                 onCheckedChange={(v) => setProfileDraft(d => ({...d, isActive: v}))}
                               />
                            </div>
                         </div>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>

      </Dialog>

      {/* Rejection Notes Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={(open) => {
        setIsRejectDialogOpen(open)
        if (!open) {
          setRejectionNotes("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Student KYC</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will help the student understand why their application was rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-notes">Rejection Reason (Optional but Recommended)</Label>
              <Textarea
                id="rejection-notes"
                placeholder="e.g., Student ID image is unclear or doesn't match the selfie..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {rejectionNotes.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectionNotes("")
              }}
              disabled={approveRejectLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={approveRejectLoading || !selectedStudentId}
            >
              {approveRejectLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expanded Image Dialog */}
      <Dialog open={!!expandedImage} onOpenChange={(open) => {
        if (!open) {
          setExpandedImage(null)
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0">
          {expandedImage && (
            <div className="relative">
              <img
                src={expandedImage.url}
                alt={expandedImage.alt}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg?height=600&width=800'
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setExpandedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Deactivation Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={(open) => {
        setIsDeactivateDialogOpen(open)
        if (!open) {
          setStudentToDeactivate(null)
          setDeactivationReason("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Student Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {studentToDeactivate?.firstName} {studentToDeactivate?.lastName}?
              They will not be able to log in until reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deactivation-reason">Reason for Deactivation</Label>
              <Textarea
                id="deactivation-reason"
                placeholder="e.g., Suspicious activity, Violation of terms..."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {deactivationReason.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeactivateDialogOpen(false)
                setStudentToDeactivate(null)
                setDeactivationReason("")
              }}
              disabled={updateStatusLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivate}
              disabled={updateStatusLoading || !deactivationReason.trim()}
            >
              {updateStatusLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirm Deactivation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Student Deletion Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setStudentToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student Account</DialogTitle>
            <DialogDescription>
              This will permanently delete {studentToDelete?.firstName} {studentToDelete?.lastName} and all linked records.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteStudentLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteStudentLoading}>
              {deleteStudentLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
