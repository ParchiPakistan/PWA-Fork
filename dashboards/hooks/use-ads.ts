'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAdminAds, type AdminAd, type ApiError } from '@/lib/api-client'

interface UseAdminAdsResult {
  ads: AdminAd[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAdminAds(): UseAdminAdsResult {
  const [ads, setAds] = useState<AdminAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminAds()
      setAds(data || [])
    } catch (err: any) {
      console.error('Error fetching admin ads:', err)
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError
        setError(
          Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to fetch ads'
        )
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching ads')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  return { ads, loading, error, refetch: fetchAds }
}
