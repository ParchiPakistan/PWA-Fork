import { useState, useEffect, useCallback } from 'react'
import { getSelfieChangeRequests, resolveSelfieChangeRequest, SelfieChangeRequest } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

export function useSelfieChangeRequests(status = 'pending') {
  const [requests, setRequests] = useState<SelfieChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSelfieChangeRequests(status)
      setRequests(data || [])
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch selfie change requests'
      setError(msg)
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setLoading(false)
    }
  }, [status, toast])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const resolve = async (id: string, action: 'approve' | 'reject', adminNote?: string) => {
    setResolvingId(id)
    try {
      await resolveSelfieChangeRequest(id, action, adminNote)
      toast({
        title: action === 'approve' ? 'Selfie Approved' : 'Request Rejected',
        description: `Selfie change request has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
      })
      await fetchRequests()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to resolve request',
      })
    } finally {
      setResolvingId(null)
    }
  }

  return { requests, loading, error, resolvingId, refetch: fetchRequests, resolve }
}
