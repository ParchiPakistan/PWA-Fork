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
import { Plus, Ticket, MoreHorizontal, Calendar, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getOffers, approveRejectOffer, deleteOffer, Offer, getCorporateMerchants, CorporateMerchant } from "@/lib/api-client"
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
        <Button onClick={() => setIsCreateOpen(true)}>
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
            <DialogTitle>Create New Offer</DialogTitle>
            <DialogDescription>
              Set up a new discount offer for a merchant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Merchant</Label>
              <Select>
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
              <Label>Offer Title</Label>
              <Input placeholder="e.g. Flat 20% Off" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select defaultValue="percentage">
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
                <Input type="number" placeholder="e.g. 20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Brief description of the offer" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsCreateOpen(false)}>Create Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
