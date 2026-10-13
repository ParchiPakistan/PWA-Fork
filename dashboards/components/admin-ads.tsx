'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  ExternalLink,
  Calendar,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  Timer,
} from 'lucide-react'
import { useAdminAds } from '@/hooks/use-ads'
import {
  createAdminAd,
  updateAdminAd,
  deleteAdminAd,
  getAppConfig,
  updateAppConfig,
  type AdminAd,
} from '@/lib/api-client'
import { SupabaseStorageService } from '@/lib/storage'

// Must match the AspectRatio of the carousel in the student app.
const AD_ASPECT_RATIO = 3.2

interface AdFormState {
  title: string
  imageUrl: string
  linkUrl: string
  startsAt: string // datetime-local value (local time)
  endsAt: string
  displayOrder: string
  isActive: boolean
}

const EMPTY_FORM: AdFormState = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  startsAt: '',
  endsAt: '',
  displayOrder: '0',
  isActive: true,
}

/** ISO string -> value for <input type="datetime-local"> in local time */
function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function extractError(err: any, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as any).message
    return Array.isArray(msg) ? msg.join(', ') : msg || fallback
  }
  return fallback
}

function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

/** Whether students currently see the ad (live toggle + schedule window). */
function scheduleStatus(ad: AdminAd): 'hidden' | 'scheduled' | 'expired' | 'live' {
  if (!ad.isActive) return 'hidden'
  const now = Date.now()
  if (ad.startsAt && new Date(ad.startsAt).getTime() > now) return 'scheduled'
  if (ad.endsAt && new Date(ad.endsAt).getTime() <= now) return 'expired'
  return 'live'
}

const STATUS_BADGE: Record<ReturnType<typeof scheduleStatus>, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-green-100 text-green-800' },
  hidden: { label: 'Hidden', className: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
  expired: { label: 'Expired', className: 'bg-amber-100 text-amber-800' },
}

export default function AdminAds() {
  const { ads, loading, error, refetch } = useAdminAds()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminAd | null>(null)
  const [form, setForm] = useState<AdFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [interval, setIntervalValue] = useState('')
  const [savedInterval, setSavedInterval] = useState<number | null>(null)
  const [savingInterval, setSavingInterval] = useState(false)

  useEffect(() => {
    getAppConfig()
      .then((res) => {
        const seconds = res?.data?.home_ad_interval_seconds ?? 4
        setSavedInterval(seconds)
        setIntervalValue(String(seconds))
      })
      .catch((err) => toast.error(extractError(err, 'Failed to load rotation speed')))
  }, [])

  const handleSaveInterval = async () => {
    const seconds = parseInt(interval, 10)
    if (isNaN(seconds) || seconds < 2 || seconds > 30) {
      toast.error('Rotation speed must be between 2 and 30 seconds')
      return
    }
    setSavingInterval(true)
    try {
      await updateAppConfig({ home_ad_interval_seconds: seconds })
      setSavedInterval(seconds)
      toast.success('Rotation speed updated')
    } catch (err) {
      toast.error(extractError(err, 'Failed to update rotation speed'))
    } finally {
      setSavingInterval(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    const nextOrder = ads.length ? Math.max(...ads.map((a) => a.displayOrder)) + 1 : 0
    setForm({ ...EMPTY_FORM, displayOrder: String(nextOrder) })
    setDialogOpen(true)
  }

  const openEdit = (ad: AdminAd) => {
    setEditing(ad)
    setForm({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl ?? '',
      startsAt: toLocalInput(ad.startsAt),
      endsAt: toLocalInput(ad.endsAt),
      displayOrder: String(ad.displayOrder),
      isActive: ad.isActive,
    })
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    setUploading(true)
    try {
      const url = await SupabaseStorageService.uploadAdImage(file)
      setForm((prev) => ({ ...prev, imageUrl: url }))
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(extractError(err, 'Failed to upload image'))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const title = form.title.trim()
    const imageUrl = form.imageUrl.trim()
    const linkUrl = form.linkUrl.trim()

    if (!title) {
      toast.error('Name is required')
      return
    }
    if (!isValidHttpsUrl(imageUrl)) {
      toast.error('Upload an image or paste a URL starting with https://')
      return
    }
    if (linkUrl && !isValidHttpsUrl(linkUrl)) {
      toast.error('Link must be a full URL starting with https://')
      return
    }

    const startsAt = form.startsAt ? new Date(form.startsAt).toISOString() : null
    const endsAt = form.endsAt ? new Date(form.endsAt).toISOString() : null
    if (startsAt && endsAt && endsAt <= startsAt) {
      toast.error('End time must be after start time')
      return
    }

    const displayOrder = parseInt(form.displayOrder, 10)

    setSaving(true)
    try {
      const payload = {
        title,
        imageUrl,
        isActive: form.isActive,
        displayOrder: isNaN(displayOrder) ? 0 : displayOrder,
      }
      if (editing) {
        // Send null to clear optional fields the admin emptied.
        await updateAdminAd(editing.id, { ...payload, linkUrl: linkUrl || null, startsAt, endsAt })
        toast.success('Ad updated')
      } else {
        await createAdminAd({
          ...payload,
          ...(linkUrl && { linkUrl }),
          ...(startsAt && { startsAt }),
          ...(endsAt && { endsAt }),
        })
        toast.success('Ad created')
      }
      setDialogOpen(false)
      await refetch()
    } catch (err) {
      toast.error(extractError(err, 'Failed to save ad'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (ad: AdminAd) => {
    setBusyId(ad.id)
    try {
      await updateAdminAd(ad.id, { isActive: !ad.isActive })
      toast.success(ad.isActive ? 'Ad hidden from students' : 'Ad is now live')
      await refetch()
    } catch (err) {
      toast.error(extractError(err, 'Failed to update ad'))
    } finally {
      setBusyId(null)
    }
  }

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= ads.length) return
    const reordered = [...ads]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]

    setReordering(true)
    try {
      // Renumber 0..n-1 so ties from manual edits can't make the order ambiguous.
      await Promise.all(
        reordered
          .map((ad, i) => ({ ad, i }))
          .filter(({ ad, i }) => ad.displayOrder !== i)
          .map(({ ad, i }) => updateAdminAd(ad.id, { displayOrder: i })),
      )
      await refetch()
    } catch (err) {
      toast.error(extractError(err, 'Failed to reorder ads'))
      await refetch()
    } finally {
      setReordering(false)
    }
  }

  const handleDelete = async (ad: AdminAd) => {
    if (!window.confirm(`Delete "${ad.title}"? This cannot be undone.`)) return
    setBusyId(ad.id)
    try {
      await deleteAdminAd(ad.id)
      toast.success('Ad deleted')
      await refetch()
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete ad'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading && ads.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle>Error Loading Ads</CardTitle>
          <CardDescription className="text-red-700">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const liveCount = ads.filter((ad) => scheduleStatus(ad) === 'live').length

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Home Ads</h2>
          <p className="text-muted-foreground">
            The auto-swiping banner carousel under Top Brands in the student app. Ads play top to
            bottom and loop. {liveCount} live right now.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Ad
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex items-end gap-3 flex-wrap">
          <div className="space-y-2">
            <Label htmlFor="ad-interval" className="flex items-center gap-1">
              <Timer className="h-4 w-4" /> Seconds per ad
            </Label>
            <Input
              id="ad-interval"
              type="number"
              min={2}
              max={30}
              className="w-28"
              value={interval}
              onChange={(e) => setIntervalValue(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            disabled={savingInterval || savedInterval === null || String(savedInterval) === interval}
            onClick={handleSaveInterval}
          >
            {savingInterval && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
          <p className="text-xs text-muted-foreground pb-2">
            Applies the next time students open the app.
          </p>
        </CardContent>
      </Card>

      {ads.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No ads yet, so the carousel is hidden in the app. Click &quot;Add Ad&quot; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ads.map((ad, index) => {
            const status = scheduleStatus(ad)
            const badge = STATUS_BADGE[status]
            const busy = busyId === ad.id || reordering
            return (
              <Card key={ad.id} className={status !== 'live' ? 'opacity-70 bg-secondary/20' : ''}>
                <CardContent className="p-4 flex gap-4 items-center flex-wrap md:flex-nowrap">
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={busy || index === 0}
                      onClick={() => handleMove(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={busy || index === ads.length - 1}
                      onClick={() => handleMove(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div
                    className="w-64 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0"
                    style={{ aspectRatio: AD_ASPECT_RATIO }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
                      <h3 className="font-semibold text-lg truncate">{ad.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {(ad.startsAt || ad.endsAt) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {ad.startsAt ? new Date(ad.startsAt).toLocaleString() : 'Now'} →{' '}
                          {ad.endsAt ? new Date(ad.endsAt).toLocaleString() : 'No end'}
                        </span>
                      )}
                      {ad.linkUrl ? (
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline truncate max-w-xs"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{ad.linkUrl}</span>
                        </a>
                      ) : (
                        <span>Not tappable (no link)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ad.isActive}
                        disabled={busy}
                        onCheckedChange={() => handleToggleActive(ad)}
                      />
                      <Label className="text-xs text-muted-foreground">Live</Label>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      disabled={busy}
                      onClick={() => openEdit(ad)}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-destructive/10"
                      disabled={busy}
                      onClick={() => handleDelete(ad)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Ad' : 'Add Ad'}</DialogTitle>
            <DialogDescription>
              Use a 3.2:1 image (e.g. 1600×500). Anything else gets cropped to fit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ad-title">Name *</Label>
              <Input
                id="ad-title"
                value={form.title}
                maxLength={255}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. PrismFest'26"
              />
              <p className="text-xs text-muted-foreground">Only admins see this.</p>
            </div>

            <div className="space-y-2">
              <Label>Image *</Label>
              {form.imageUrl && (
                <div
                  className="relative w-full rounded-xl overflow-hidden bg-muted"
                  style={{ aspectRatio: AD_ASPECT_RATIO }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Ad preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!form.imageUrl && (
                <div
                  className="w-full rounded-xl bg-muted flex items-center justify-center"
                  style={{ aspectRatio: AD_ASPECT_RATIO }}
                >
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="or paste an image URL (https://...)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-link">Link when tapped</Label>
              <Input
                id="ad-link"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://... (leave empty for a non-tappable ad)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad-starts">Show from</Label>
                <Input
                  id="ad-starts"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-ends">Show until</Label>
                <Input
                  id="ad-ends"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="ad-order">Position</Label>
                <Input
                  id="ad-order"
                  type="number"
                  min={0}
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label className="text-sm">Live in student app</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Save changes' : 'Create ad'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
