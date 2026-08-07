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
import { Checkbox } from "@/components/ui/checkbox"
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
      : offer.discountType === "item"
        ? offer.additionalItem || "Free item"
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
  /** Offer IDs currently live at this branch. */
  currentOfferIds: string[]
  onAssigned: () => void
}

export function AssignBranchOfferDialog({
  branch,
  open,
  onOpenChange,
  currentOfferIds,
  onAssigned,
}: AssignBranchOfferDialogProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !branch) return

    setSelectedOfferIds(currentOfferIds)

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
    // currentOfferIds is derived fresh from the parent each time the dialog
    // opens for a branch; including it would re-run this on every keystroke
    // elsewhere in the parent's state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, branch])

  const toggleOffer = (offerId: string, checked: boolean) => {
    setSelectedOfferIds((prev) =>
      checked ? [...prev, offerId] : prev.filter((id) => id !== offerId),
    )
  }

  const handleSave = async () => {
    if (!branch) return

    try {
      setSaving(true)
      await assignBranchOffers(branch.id, selectedOfferIds)
      const count = selectedOfferIds.length
      toast.success(
        count === 0
          ? `Removed all offers from ${branch.branch_name}`
          : `${count} offer${count === 1 ? "" : "s"} active at ${branch.branch_name}`,
      )
      onOpenChange(false)
      onAssigned()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save offers"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const activeOffers = offers.filter((o) => o.status === "active")
  const otherOffers = offers.filter((o) => o.status !== "active")

  const renderOfferRow = (offer: Offer) => {
    const checked = selectedOfferIds.includes(offer.id)
    const redeemableNow = isOfferRedeemableNow(offer)
    return (
      <label
        key={offer.id}
        className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/40 transition-colors"
      >
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => toggleOffer(offer.id, value === true)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{formatOfferLabel(offer)}</div>
          <div className="text-xs text-muted-foreground">
            {offer.status !== "active" ? `Status: ${offer.status}` : redeemableNow ? "Live now" : "Outside its valid dates"}
          </div>
        </div>
      </label>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Offers at this branch
          </DialogTitle>
          <DialogDescription>
            {branch ? (
              <>
                <span className="font-medium text-foreground">{branch.branch_name}</span>
                {branch.merchant?.business_name && <> · {branch.merchant.business_name}</>}
                <br />
                Tick every offer this branch should accept. A branch can have more than one
                offer active at once — when a student scans the QR code, they'll pick which one
                to use.
              </>
            ) : (
              "Select the offers this branch should accept."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label>Offers ({selectedOfferIds.length} selected)</Label>
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
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {activeOffers.map(renderOfferRow)}
              {otherOffers.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground pt-2">Not currently active</div>
                  {otherOffers.map(renderOfferRow)}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loadingOffers}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
