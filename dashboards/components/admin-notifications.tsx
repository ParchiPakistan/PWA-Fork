"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SupabaseStorageService } from "@/lib/storage"
import { sendBroadcastNotification } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Image as ImageIcon, X, Send } from "lucide-react"

export function AdminNotifications() {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    linkUrl: "",
    imageUrl: "",
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const url = await SupabaseStorageService.uploadNotificationImage(file)
      setFormData(prev => ({ ...prev, imageUrl: url }))
      toast({
        title: "Image Uploaded",
        description: "Notification image uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and Content are required.",
      })
      return
    }

    setIsSending(true)
    try {
      await sendBroadcastNotification({
        title: formData.title,
        content: formData.content,
        imageUrl: formData.imageUrl || undefined,
        linkUrl: formData.linkUrl || undefined,
      })

      toast({
        title: "Notification Sent",
        description: "Broadcast notification sent successfully to all users.",
      })

      // Reset form
      setFormData({
        title: "",
        content: "",
        linkUrl: "",
        imageUrl: "",
      })
    } catch (error) {
      console.error("Failed to send notification:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification. Please try again.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Broadcast Notifications</h2>
          <p className="text-muted-foreground">Send push notifications to all users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Broadcast</CardTitle>
          <CardDescription>
            Create and send a message to all registered users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input 
                id="title"
                placeholder="e.g. New Semester Offer!" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content <span className="text-destructive">*</span></Label>
              <Textarea 
                id="content"
                placeholder="e.g. Get 50% off at all coffee shops this week."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="resize-none"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link URL (Optional)</Label>
              <Input 
                id="linkUrl"
                type="url"
                placeholder="e.g. https://parchiapp.com/offers" 
                value={formData.linkUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Image (Optional)</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="notification-image-upload"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('notification-image-upload')?.click()}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        Select Image
                      </>
                    )}
                  </Button>
                  {formData.imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive/90"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {formData.imageUrl && (
                  <div className="relative w-full h-48 rounded border overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSending || isUploading}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Broadcast...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
