"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Ticket, MoreHorizontal, Calendar, Loader2, Store, Pencil, Upload } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getOffers, approveRejectOffer, deleteOffer, Offer, getCorporateMerchants, CorporateMerchant, CreateOfferRequest, createOffer, getBranches, AdminBranch, assignOfferBranches, removeOfferBranches, updateOffer, UpdateOfferRequest } from "@/lib/api-client"
import { SupabaseStorageService } from "@/lib/storage"
import { toast } from "sonner"


export function AdminOffers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<CorporateMerchant[]>([])
  const [filters, setFilters] = useState({
    status: undefined as 'active' | 'inactive' | undefined,
    merchantId: undefined as string | undefined
  })

  // Form State
  const [formData, setFormData] = useState<Partial<CreateOfferRequest>>({
    discountType: 'percentage',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  const [isBranchSpecific, setIsBranchSpecific] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [merchantBranches, setMerchantBranches] = useState<AdminBranch[]>([])
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [isImageUploading, setIsImageUploading] = useState(false)

  // Manage Branches State
  const [isManageBranchesOpen, setIsManageBranchesOpen] = useState(false)
  const [managingOffer, setManagingOffer] = useState<Offer | null>(null)
  const [manageBranchIds, setManageBranchIds] = useState<string[]>([])
  const [isManageBranchSpecific, setIsManageBranchSpecific] = useState(false)

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const response = await getOffers(filters)
      setOffers(response?.data?.items || [])
    } catch (error) {
      toast.error("Failed to fetch offers")
      setOffers([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchMerchants = async () => {
    // Prevent refetch if merchants are already loaded
    if (merchants.length > 0) return
    
    try {
      const response = await getCorporateMerchants()
      setMerchants(response.data)
    } catch (error) {
      console.error("Failed to fetch merchants")
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [filters])

  useEffect(() => {
    fetchMerchants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMerchantBranches = async (merchantId: string) => {
    try {
      const data = await getBranches({ corporateAccountId: merchantId })
      setMerchantBranches(data)
    } catch (error) {
      console.error("Failed to fetch merchant branches")
      setMerchantBranches([])
    }
  }

  const handleMerchantChange = (merchantId: string) => {
    setFormData({ ...formData, merchantId })
    fetchMerchantBranches(merchantId)
    setSelectedBranches([])
    setIsBranchSpecific(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // If no title is set, use a temp name, but warn user or handle it
    const title = formData.title || "untitled-offer"

    setIsImageUploading(true)
    try {
      const url = await SupabaseStorageService.uploadOfferImage(file, title)
      setFormData(prev => ({ ...prev, imageUrl: url }))
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsImageUploading(false)
    }
  }

  const handleCreateOffer = async () => {
    if (!formData.merchantId) {
      toast.error("Please select a merchant")
      return
    }
    if (!formData.title || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validation
    if (formData.discountValue < 0) {
      toast.error("Discount value cannot be negative")
      return
    }
    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%")
      return
    }
    if (formData.discountType === 'fixed' && formData.discountValue > 99999999) {
      toast.error("Fixed discount value is too large")
      return
    }
    if (formData.minOrderValue && formData.minOrderValue > 99999999) {
      toast.error("Minimum order value is too large")
      return
    }
    if (formData.maxDiscountAmount && formData.maxDiscountAmount > 99999999) {
      toast.error("Max discount amount is too large")
      return
    }
    if (formData.dailyLimit && formData.dailyLimit > 2147483647) {
      toast.error("Daily limit is too large")
      return
    }
    if (formData.totalLimit && formData.totalLimit > 2147483647) {
      toast.error("Total limit is too large")
      return
    }

    try {
      setIsSubmitting(true)
      
      if (editingOffer) {
        // Update existing offer
        await updateOffer(editingOffer.id, {
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          minOrderValue: formData.minOrderValue,
          maxDiscountAmount: formData.maxDiscountAmount,
          validFrom: formData.validFrom,
          validUntil: formData.validUntil,
          dailyLimit: formData.dailyLimit,
          totalLimit: formData.totalLimit,
        })
        toast.success("Offer updated successfully")
      } else {
        // Create new offer
        await createOffer({
          ...formData as CreateOfferRequest,
          branchIds: isBranchSpecific ? selectedBranches : undefined
        })
        toast.success("Offer created successfully")
      }
      
      setIsCreateOpen(false)
      fetchOffers()
      // Reset form
      setFormData({
        discountType: 'percentage',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      setSelectedBranches([])
      setIsBranchSpecific(false)
      setMerchantBranches([])
      setEditingOffer(null)
    } catch (error) {
      toast.error(editingOffer ? "Failed to update offer" : "Failed to create offer. Please check your inputs.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditOffer = (offer: Offer) => {
    setEditingOffer(offer)
    setFormData({
      merchantId: offer.merchantId,
      title: offer.title,
      description: offer.description || undefined,
      imageUrl: offer.imageUrl || undefined,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minOrderValue: offer.minOrderValue || undefined,
      maxDiscountAmount: offer.maxDiscountAmount || undefined,
      validFrom: new Date(offer.validFrom).toISOString().split('T')[0],
      validUntil: new Date(offer.validUntil).toISOString().split('T')[0],
      dailyLimit: offer.dailyLimit || undefined,
      totalLimit: offer.totalLimit || undefined,
    })
    // For editing, we don't handle branch selection in the same modal currently
    // Branch management is done via "Manage Branches"
    setIsCreateOpen(true)
  }

  const openManageBranches = async (offer: Offer) => {
    setManagingOffer(offer)
    const currentBranchIds = offer.branches.map(b => b.branchId)
    setManageBranchIds(currentBranchIds)
    setIsManageBranchSpecific(currentBranchIds.length > 0)
    
    try {
      // Fetch branches for this offer's merchant
      const branches = await getBranches({ corporateAccountId: offer.merchantId })
      setMerchantBranches(branches)
      setIsManageBranchesOpen(true)
    } catch (error) {
      toast.error("Failed to fetch merchant branches")
    }
  }

  const handleSaveBranches = async () => {
    if (!managingOffer) return

    try {
      setIsSubmitting(true)
      const currentIds = managingOffer.branches.map(b => b.branchId)
      
      // If switching to "All Branches" (not specific), remove all assignments
      if (!isManageBranchSpecific) {
        if (currentIds.length > 0) {
          await removeOfferBranches(managingOffer.id, currentIds)
        }
      } else {
        // Calculate additions and removals
        const toAdd = manageBranchIds.filter(id => !currentIds.includes(id))
        const toRemove = currentIds.filter(id => !manageBranchIds.includes(id))

        if (toAdd.length > 0) {
          await assignOfferBranches(managingOffer.id, toAdd)
        }
        if (toRemove.length > 0) {
          await removeOfferBranches(managingOffer.id, toRemove)
        }
      }

      toast.success("Branch assignments updated successfully")
      setIsManageBranchesOpen(false)
      fetchOffers()
    } catch (error) {
      toast.error("Failed to update branch assignments")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveReject = async (id: string, action: 'approve' | 'reject') => {
    try {
      await approveRejectOffer(id, action)
      toast.success(`Offer ${action}d successfully`)
      fetchOffers()
    } catch (error) {
      toast.error(`Failed to ${action} offer`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer? This action cannot be undone.")) return
    
    try {
      await deleteOffer(id)
      toast.success("Offer deleted successfully")
      fetchOffers()
    } catch (error) {
      toast.error("Failed to delete offer")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Offers Management</h2>
          <p className="text-muted-foreground">Create and manage merchant offers</p>
        </div>
        <Button onClick={() => {
          setEditingOffer(null)
          setFormData({
            discountType: 'percentage',
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })
          setIsCreateOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" /> Create Offer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
          <CardDescription>
            A list of all active and inactive offers across merchants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 py-4">
            <Input
              placeholder="Search offers..."
              className="max-w-sm"
              disabled // Search API not implemented in this iteration
            />
            <Select 
              value={filters.status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, status: val === "all" ? undefined : val as 'active' | 'inactive' }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.merchantId || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, merchantId: val === "all" ? undefined : val }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by merchant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Merchants</SelectItem>
                {merchants.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.businessName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : !offers || offers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No offers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-primary" />
                          {offer.title}
                        </div>
                      </TableCell>
                      <TableCell>{offer.merchant?.businessName || 'Unknown'}</TableCell>
                      <TableCell>
                        {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `Rs. ${offer.discountValue}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(offer.validUntil).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={offer.status === "active" ? "default" : "secondary"}>
                          {offer.status}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => openManageBranches(offer)}>
                              <Store className="mr-2 h-4 w-4" /> Manage Branches
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditOffer(offer)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApproveReject(offer.id, 'approve')}>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApproveReject(offer.id, 'reject')}>
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(offer.id)}>
                              Delete
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
        </CardContent>
      </Card>

      {/* Create Offer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
            <DialogDescription>
              {editingOffer ? 'Update offer details.' : 'Set up a new discount offer for a merchant.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Merchant</Label>
              <Select 
                onValueChange={handleMerchantChange} 
                value={formData.merchantId}
                disabled={!!editingOffer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map(corp => (
                    <SelectItem key={corp.id} value={corp.id}>{corp.businessName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Offer Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                    disabled={isImageUploading}
                  />
                  {isImageUploading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {formData.imageUrl && (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    Uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Offer Title</Label>
              <Input 
                placeholder="e.g. Flat 20% Off" 
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(val: 'percentage' | 'fixed') => setFormData({...formData, discountType: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (Rs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 20" 
                  value={formData.discountValue || ''}
                  onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Order Value (Optional)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 500" 
                  value={formData.minOrderValue || ''}
                  onChange={(e) => setFormData({...formData, minOrderValue: e.target.value ? Number(e.target.value) : undefined})}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Discount (Optional)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 1000" 
                  value={formData.maxDiscountAmount || ''}
                  onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined})}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Daily Limit (Optional)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 50" 
                  value={formData.dailyLimit || ''}
                  onChange={(e) => setFormData({...formData, dailyLimit: e.target.value ? Number(e.target.value) : undefined})}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Limit (Optional)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 1000" 
                  value={formData.totalLimit || ''}
                  onChange={(e) => setFormData({...formData, totalLimit: e.target.value ? Number(e.target.value) : undefined})}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input 
                  type="date" 
                  value={formData.validFrom || ''}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input 
                  type="date" 
                  value={formData.validUntil || ''}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                placeholder="Brief description of the offer" 
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            </div>
            
            {!editingOffer && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="branch-specific" 
                    checked={isBranchSpecific}
                    onCheckedChange={(checked) => {
                      setIsBranchSpecific(checked as boolean)
                      if (!checked) setSelectedBranches([])
                    }}
                    disabled={!formData.merchantId}
                  />
                  <Label htmlFor="branch-specific" className="text-sm font-normal cursor-pointer">
                    Make this offer branch-specific
                  </Label>
                </div>

                {isBranchSpecific && formData.merchantId && (
                  <div className="space-y-2 pl-6">
                    <Label>Select Branches</Label>
                    <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                      {merchantBranches.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No branches found for this merchant.</p>
                      ) : (
                        merchantBranches.map((branch) => (
                          <div key={branch.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`branch-${branch.id}`}
                              checked={selectedBranches.includes(branch.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBranches([...selectedBranches, branch.id])
                                } else {
                                  setSelectedBranches(selectedBranches.filter(id => id !== branch.id))
                                }
                              }}
                            />
                            <Label htmlFor={`branch-${branch.id}`} className="text-sm font-normal cursor-pointer">
                              {branch.branch_name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                    {selectedBranches.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {selectedBranches.length} branch{selectedBranches.length > 1 ? 'es' : ''} selected
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOffer} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Branches Dialog */}
      <Dialog open={isManageBranchesOpen} onOpenChange={setIsManageBranchesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Offer Availability</DialogTitle>
            <DialogDescription>
              Select which branches this offer is available at.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="manage-branch-specific" 
                checked={isManageBranchSpecific}
                onCheckedChange={(checked) => {
                  setIsManageBranchSpecific(checked as boolean)
                  if (!checked) setManageBranchIds([])
                }}
              />
              <Label htmlFor="manage-branch-specific" className="text-sm font-normal cursor-pointer">
                Limit to specific branches
              </Label>
            </div>

            {!isManageBranchSpecific && (
              <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                This offer is currently available at <strong>All Branches</strong>.
              </div>
            )}

            {isManageBranchSpecific && (
              <div className="space-y-2 pl-6">
                <Label>Select Branches</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
                  {merchantBranches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No branches found.</p>
                  ) : (
                    merchantBranches.map((branch) => (
                      <div key={branch.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`manage-branch-${branch.id}`}
                          checked={manageBranchIds.includes(branch.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setManageBranchIds([...manageBranchIds, branch.id])
                            } else {
                              setManageBranchIds(manageBranchIds.filter(id => id !== branch.id))
                            }
                          }}
                        />
                        <Label htmlFor={`manage-branch-${branch.id}`} className="text-sm font-normal cursor-pointer">
                          {branch.branch_name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {manageBranchIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {manageBranchIds.length} branch{manageBranchIds.length > 1 ? 'es' : ''} selected
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageBranchesOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBranches} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
