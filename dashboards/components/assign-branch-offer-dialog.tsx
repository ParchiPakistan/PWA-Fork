"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Tag } from "lucide-react"
import { toast } from "sonner"
import {
  AdminBranch,
  Offer,
  assignBranchOffers,
  getOffers,
} from "@/lib/api-client"

function formatOfferLabel(offer: Offer) {
  const discount =
    offer.discountType === "percentage"
      ? `${offer.discountValue}%`
      : `Rs. ${offer.discountValue}`
  return `${offer.title} (${discount})`
}

function isOfferRedeemableNow(offer: Offer) {
  if (offer.status !== "active") return false
  const now = Date.now()
  return new Date(offer.validFrom).getTime() <= now && new Date(offer.validUntil).getTime() >= now
}

export interface AssignBranchOfferDialogProps {
  branch: AdminBranch | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentOfferId: string | null
  onAssigned: () => void
}

export function AssignBranchOfferDialog({
  branch,
  open,
  onOpenChange,
  currentOfferId,
  onAssigned,
}: AssignBranchOfferDialogProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [selectedOfferId, setSelectedOfferId] = useState<string>("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !branch) return

    setSelectedOfferId(currentOfferId ?? "")

    const loadOffers = async () => {
      setLoadingOffers(true)
      try {
        const res = await getOffers({ merchantId: branch.merchant_id, limit: 100 })
        setOffers(res.data?.items ?? [])
      } catch {
        toast.error("Failed to load offers for this merchant")
        setOffers([])
      } finally {
        setLoadingOffers(false)
      }
    }

    loadOffers()
  }, [open, branch, currentOfferId])

  const handleSave = async () => {
    if (!branch || !selectedOfferId) {
      toast.error("Select an offer to assign")
      return
    }

    try {
      setSaving(true)
      await assignBranchOffers(branch.id, selectedOfferId)
      toast.success(`Offer assigned to ${branch.branch_name}`)
      onOpenChange(false)
      onAssigned()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to assign offer"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const activeOffers = offers.filter((o) => o.status === "active")
  const otherOffers = offers.filter((o) => o.status !== "active")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Assign offer to branch
          </DialogTitle>
          <DialogDescription>
            {branch ? (
              <>
                <span className="font-medium text-foreground">{branch.branch_name}</span>
                {branch.merchant?.business_name && (
                  <> · {branch.merchant.business_name}</>
                )}
                <br />
                Required for QR redemption. Replaces any existing offer on this branch.
              </>
            ) : (
              "Select a standard offer for this branch."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label>Standard offer</Label>
          {loadingOffers ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading offers…
            </div>
          ) : offers.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
              No offers found for this merchant. Create and approve an offer first (Admin → Offers).
            </p>
          ) : (
            <Select value={selectedOfferId || undefined} onValueChange={setSelectedOfferId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an offer" />
              </SelectTrigger>
              <SelectContent>
                {activeOffers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {formatOfferLabel(offer)}
                    {!isOfferRedeemableNow(offer) ? " · outside dates" : ""}
                  </SelectItem>
                ))}
                {otherOffers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {formatOfferLabel(offer)} · {offer.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loadingOffers || !selectedOfferId || offers.length === 0}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
