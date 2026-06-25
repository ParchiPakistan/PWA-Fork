'use client'

import { useState, useEffect } from 'react'
import {
  getCategories,
  getAdminCategories,
  type MerchantCategory,
  type ApiError
} from '@/lib/api-client'

interface UseCategoriesResult {
  categories: MerchantCategory[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<MerchantCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCategories()
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  }
}

export function useAdminCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<MerchantCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminCategories()
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching admin categories:', err)
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError
        const errorMessage = Array.isArray(apiError.message)
          ? apiError.message.join(', ')
          : apiError.message || 'Failed to fetch categories'
        setError(errorMessage)
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching categories')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  }
}

/**
 * Builds a mapping from category name to an array of active subcategory names.
 * Keyed by Category name.
 */
export function buildCategoryMap(categories: MerchantCategory[]): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  categories.forEach((cat) => {
    if (cat.isActive) {
      map[cat.name] = cat.subcategories
        .filter((sub) => sub.isActive)
        .map((sub) => sub.name)
    }
  })
  return map
}
