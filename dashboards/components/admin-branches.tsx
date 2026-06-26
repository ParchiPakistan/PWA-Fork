"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, Loader2, CheckCircle, XCircle, Edit, Key, MoreHorizontal, Zap, Tag, Copy, Check, Eye, EyeOff } from "lucide-react"
import { AssignBranchOfferDialog } from "./assign-branch-offer-dialog"
import { TestMerchantAlert } from "./test-merchant-alert"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  getBranches,
  approveRejectBranch,
  updateBranch,
  deleteBranch,
  adminResetPassword,
  getBranchAssignments,
  getOffers,
  AdminBranch,
} from "@/lib/api-client"

export function AdminBranches() {
  const [branches, setBranches] = useState<AdminBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<AdminBranch | null>(null)
  const [editForm, setEditForm] = useState({
    branchName: "",
    email: "",
    address: "",
    city: "",
    contactPhone: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Password Reset Modal State
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false)
  const [resettingBranch, setResettingBranch] = useState<AdminBranch | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [credentialsDialog, setCredentialsDialog] = useState<{
    accountName: string
    email: string
    password: string
  } | null>(null)

  // Reject Modal State
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [branchToReject, setBranchToReject] = useState<AdminBranch | null>(null)
  const [isDeletingBranch, setIsDeletingBranch] = useState(false)

  // Copy state
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    toast({ title: "Copied", description: "Email address copied to clipboard" })
    setTimeout(() => {
      setCopiedEmail(null)
    }, 2000)
  }

  const handleCopyCredentials = () => {
    if (!credentialsDialog) return
    const text = `Login Email: ${credentialsDialog.email}\nPassword: ${credentialsDialog.password}`
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Credentials copied to clipboard" })
  }

  // Offer assignment
  const [assignmentByBranchId, setAssignmentByBranchId] = useState<Record<string, string | null>>({})
  const [offerTitleById, setOfferTitleById] = useState<Record<string, string>>({})
  const [assignOfferBranch, setAssignOfferBranch] = useState<AdminBranch | null>(null)
  const [isAssignOfferOpen, setIsAssignOfferOpen] = useState(false)

  const loadAssignmentsAndOfferTitles = useCallback(async (branchList: AdminBranch[]) => {
    try {
      const assignments = await getBranchAssignments()
      const byBranch: Record<string, string | null> = {}
      assignments.forEach((a) => {
        byBranch[a.id] = a.standardOfferId
      })
      setAssignmentByBranchId(byBranch)

      const merchantIds = [...new Set(branchList.map((b) => b.merchant_id))]
      const titles: Record<string, string> = {}
      await Promise.all(
        merchantIds.map(async (merchantId) => {
          try {
            const res = await getOffers({ merchantId, limit: 100 })
            for (const offer of res.data?.items ?? []) {
              titles[offer.id] = offer.title
            }
          } catch {
            /* skip merchant */
          }
        }),
      )
      setOfferTitleById(titles)
    } catch (error) {
      console.error("Failed to load branch offer assignments:", error)
    }
  }, [])

  const fetchBranches = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      const data = await getBranches({ search })
      setBranches(data)
      await loadAssignmentsAndOfferTitles(data)
    } catch (error) {
      console.error('Failed to fetch branches:', error)
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, loadAssignmentsAndOfferTitles])

  const openAssignOfferModal = (branch: AdminBranch) => {
    setAssignOfferBranch(branch)
    setIsAssignOfferOpen(true)
  }

  const handleOfferAssigned = () => {
    fetchBranches(searchQuery)
  }

  useEffect(() => {
    let mounted = true

    const loadBranches = async () => {
      if (mounted) {
        await fetchBranches(searchQuery)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      loadBranches()
    }, searchQuery ? 300 : 0)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [searchQuery, fetchBranches])

  const handleApprove = async (id: string) => {
    try {
      await approveRejectBranch(id, 'approved')
      toast({ title: "Success", description: "Branch approved successfully" })
      fetchBranches()
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve branch", variant: "destructive" })
    }
  }

  const handleToggleQrAutoApprove = async (branch: AdminBranch) => {
    try {
      await updateBranch(branch.id, { qrAutoApprove: !branch.qr_auto_approve })
      toast({
        title: "Success",
        description: `QR mode set to ${!branch.qr_auto_approve ? "Auto-Approve" : "Manual Approval"} for ${branch.branch_name}`,
      })
      fetchBranches(searchQuery)
    } catch (error) {
      toast({ title: "Error", description: "Failed to update QR settings", variant: "destructive" })
    }
  }

  const handleToggleBranchStatus = async (branch: AdminBranch) => {
    try {
      await updateBranch(branch.id, { isActive: !branch.is_active })
      toast({
        title: "Success",
        description: `Branch ${branch.is_active ? "deactivated" : "activated"} successfully`,
      })
      fetchBranches(searchQuery)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update branch status",
        variant: "destructive",
      })
    }
  }

  const openRejectModal = (branch: AdminBranch) => {
    setBranchToReject(branch)
    setIsRejectOpen(true)
  }

  const confirmReject = async () => {
    if (!branchToReject) return
    try {
      setIsDeletingBranch(true)
      await deleteBranch(branchToReject.id)
      toast({ title: "Success", description: "Branch deleted successfully" })
      setIsRejectOpen(false)
      setBranchToReject(null)
      fetchBranches() // This will also handle loading state
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete branch", variant: "destructive" })
    } finally {
      setIsDeletingBranch(false)
    }
  }

  const openEditModal = (branch: AdminBranch) => {
    setEditingBranch(branch)
    setEditForm({
      branchName: branch.branch_name,
      email: branch.email || "",
      address: branch.address,
      city: branch.city,
      contactPhone: branch.contact_phone,
      latitude: branch.latitude,
      longitude: branch.longitude,
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingBranch) return
    try {
      setIsSaving(true)
      const updateData = {
        branchName: editForm.branchName,
        address: editForm.address,
        city: editForm.city,
        contactPhone: editForm.contactPhone,
        latitude: editForm.latitude ?? undefined,
        longitude: editForm.longitude ?? undefined,
        email: editForm.email.trim() || undefined,
      }
      await updateBranch(editingBranch.id, updateData)
      toast({ title: "Success", description: "Branch updated successfully" })
      setIsEditOpen(false)
      fetchBranches()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update branch", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const openPasswordResetModal = (branch: AdminBranch) => {
    setResettingBranch(branch)
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    })
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setIsPasswordResetOpen(true)
  }

  const handlePasswordReset = async () => {
    if (!resettingBranch) return

    // Validation
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters long", variant: "destructive" })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }

    try {
      setIsResettingPassword(true)
      const newPassword = passwordForm.newPassword
      await adminResetPassword(resettingBranch.user_id!, newPassword)
      setIsPasswordResetOpen(false)
      setPasswordForm({ newPassword: "", confirmPassword: "" })
      setCredentialsDialog({
        accountName: resettingBranch.branch_name,
        email: resettingBranch.email || "N/A",
        password: newPassword,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive"
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  // Branches are already filtered server-side based on searchQuery
  const filteredBranches = branches

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Branch Management</h2>
        <p className="text-muted-foreground">Manage and approve merchant branches</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
          <CardDescription>View and manage all registered branches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant Name</TableHead>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Login Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>QR Mode</TableHead>
                    <TableHead>Assigned offer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredBranches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No branches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {branch.merchant?.business_name || 'N/A'}
                            <TestMerchantAlert merchantName={branch.merchant?.business_name} />
                          </div>
                        </TableCell>
                        <TableCell>{branch.branch_name}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={branch.email || undefined}>
                          {branch.email || "—"}
                        </TableCell>
                        <TableCell>{branch.city}</TableCell>
                        <TableCell>{branch.contact_phone}</TableCell>
                        <TableCell>
                          <Badge variant={branch.is_active ? "default" : "secondary"}>
                            {branch.is_active ? "Active" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${branch.qr_auto_approve ? "bg-green-50 text-green-700 border-green-300" : "bg-blue-50 text-blue-700 border-blue-300"}`}
                          >
                            {branch.qr_auto_approve ? "⚡ Auto" : "👁 Manual"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignmentByBranchId[branch.id] ? (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-300 max-w-[180px] truncate"
                              title={offerTitleById[assignmentByBranchId[branch.id]!] ?? undefined}
                            >
                              {offerTitleById[assignmentByBranchId[branch.id]!] ?? "Offer linked"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-50 text-amber-700 border-amber-300"
                            >
                              No offer
                            </Badge>
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
                              <DropdownMenuItem onClick={() => openAssignOfferModal(branch)}>
                                <Tag className="mr-2 h-4 w-4 text-violet-600" />
                                {assignmentByBranchId[branch.id] ? "Change offer" : "Assign offer"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(branch)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openPasswordResetModal(branch)} disabled={!branch.user_id}>
                                <Key className="mr-2 h-4 w-4 text-blue-600" /> Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleBranchStatus(branch)}>
                                {branch.is_active ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4 text-orange-600" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleQrAutoApprove(branch)}>
                                <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                                {branch.qr_auto_approve ? "Set QR to Manual" : "Enable QR Auto-Approve"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openRejectModal(branch)}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> {branch.is_active ? "Delete" : "Reject"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No branches found
                </div>
              ) : (
                filteredBranches.map((branch) => (
                  <div key={branch.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-base flex items-center gap-2">
                          {branch.merchant?.business_name || 'N/A'}
                          <TestMerchantAlert merchantName={branch.merchant?.business_name} />
                        </div>
                        <div className="text-sm text-muted-foreground">{branch.branch_name}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditModal(branch)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPasswordResetModal(branch)} disabled={!branch.user_id}>
                            <Key className="mr-2 h-4 w-4 text-blue-600" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleBranchStatus(branch)}>
                            {branch.is_active ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4 text-orange-600" /> Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleQrAutoApprove(branch)}>
                            <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                            {branch.qr_auto_approve ? "Set QR to Manual" : "Enable QR Auto-Approve"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openRejectModal(branch)}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> {branch.is_active ? "Delete" : "Reject"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant={branch.is_active ? "default" : "secondary"}>
                        {branch.is_active ? "Active" : "Pending"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${branch.qr_auto_approve ? "bg-green-50 text-green-700 border-green-300" : "bg-blue-50 text-blue-700 border-blue-300"}`}
                      >
                        {branch.qr_auto_approve ? "⚡ Auto" : "👁 Manual"}
                      </Badge>
                      {assignmentByBranchId[branch.id] ? (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                          {offerTitleById[assignmentByBranchId[branch.id]!] ?? "Offer linked"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                          No offer
                        </Badge>
                      )}
                      <span className="text-muted-foreground">{branch.city}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openAssignOfferModal(branch)}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      {assignmentByBranchId[branch.id] ? "Change offer" : "Assign offer"}
                    </Button>

                    <div className="text-sm bg-muted/50 p-3 rounded-md space-y-1">
                      <div className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact</div>
                      {branch.email && <div className="truncate">{branch.email}</div>}
                      {branch.contact_phone && <div>{branch.contact_phone}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch Details</DialogTitle>
            <DialogDescription>Update branch information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(editingBranch?.merchant?.business_name?.toLowerCase() === 'test merchant' || editingBranch?.merchant?.business_name?.toLowerCase() === 'tester merchant') && (
              <div className="flex items-center gap-4 rounded-md bg-destructive/10 p-4 border border-destructive/20 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div className="text-sm text-destructive font-medium">
                  This branch belongs to a Test Merchant. It is not visible to students.
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Login Email</Label>
              <div className="flex gap-2">
                {editForm.email && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleCopyEmail(editForm.email)}
                  >
                    {copiedEmail === editForm.email ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="branch@parchipakistan.com"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used to sign in to the branch dashboard</p>
            </div>
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input
                value={editForm.branchName}
                onChange={(e) => setEditForm({ ...editForm, branchName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={editForm.contactPhone}
                  onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 24.8607"
                  value={editForm.latitude ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                />
                <p className="text-xs text-muted-foreground">Valid range: -90 to 90</p>
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 67.0011"
                  value={editForm.longitude ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                />
                <p className="text-xs text-muted-foreground">Valid range: -180 to 180</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {resettingBranch?.branch_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min 8 characters)"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must contain at least 8 characters. Existing passwords cannot be viewed — only reset.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordResetOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordReset} disabled={isResettingPassword}>
              {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog (shown once after password reset) */}
      <Dialog open={!!credentialsDialog} onOpenChange={(open) => !open && setCredentialsDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Credentials</DialogTitle>
            <DialogDescription>
              Password reset for {credentialsDialog?.accountName}. Save these credentials — the password will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Login Email</Label>
              <div className="font-mono text-sm bg-muted p-2 rounded">{credentialsDialog?.email}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">New Password</Label>
              <div className="font-mono text-sm bg-muted p-2 rounded">{credentialsDialog?.password}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredentialsDialog(null)}>Close</Button>
            <Button onClick={handleCopyCredentials}>
              <Copy className="mr-2 h-4 w-4" />
              Copy All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignBranchOfferDialog
        branch={assignOfferBranch}
        open={isAssignOfferOpen}
        onOpenChange={setIsAssignOfferOpen}
        currentOfferId={assignOfferBranch ? assignmentByBranchId[assignOfferBranch.id] ?? null : null}
        onAssigned={handleOfferAssigned}
      />

      {/* Reject/Delete Confirmation Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this branch? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 py-4 rounded-md bg-destructive/10 p-4 border border-destructive/20">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
            <div className="text-sm text-destructive font-medium">
              Warning: This will permanently remove the branch "{branchToReject?.branch_name}".
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={isDeletingBranch}
            >
              {isDeletingBranch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
