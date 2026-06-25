'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, Plus, Edit2, Trash2, Check, X, Tag, FolderOpen, ArrowUpDown } from 'lucide-react'
import { DASHBOARD_COLORS } from '@/lib/colors'
import {
  useAdminCategories,
  type MerchantCategory,
  type MerchantSubcategory
} from '@/hooks/use-categories'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '@/lib/api-client'

export default function AdminCategories() {
  const { categories, loading, error, refetch } = useAdminCategories()
  const colors = DASHBOARD_COLORS('admin')

  // UI state for adding a category
  const [newCatName, setNewCatName] = useState('')
  const [newCatSortOrder, setNewCatSortOrder] = useState('0')
  const [isAddingCat, setIsAddingCat] = useState(false)

  // UI state for editing categories
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatSort, setEditCatSort] = useState('0')

  // UI state for adding subcategories
  const [addingSubCatId, setAddingSubCatId] = useState<string | null>(null)
  const [newSubName, setNewSubName] = useState('')
  const [newSubSortOrder, setNewSubSortOrder] = useState('0')
  const [isAddingSub, setIsAddingSub] = useState(false)

  // UI state for editing subcategories
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editSubName, setEditSubName] = useState('')
  const [editSubSort, setEditSubSort] = useState('0')

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    setIsAddingCat(true)
    try {
      await createCategory(newCatName.trim(), parseInt(newCatSortOrder) || 0)
      toast.success('Category created successfully')
      setNewCatName('')
      setNewCatSortOrder('0')
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to create category')
    } finally {
      setIsAddingCat(false)
    }
  }

  const handleUpdateCategory = async (id: string) => {
    if (!editCatName.trim()) return
    try {
      await updateCategory(id, editCatName.trim(), undefined, parseInt(editCatSort) || 0)
      toast.success('Category updated successfully')
      setEditingCatId(null)
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update category')
    }
  }

  const handleToggleCategoryActive = async (id: string, currentActive: boolean) => {
    try {
      await updateCategory(id, undefined, !currentActive, undefined)
      toast.success(`Category ${!currentActive ? 'activated' : 'deactivated'} successfully`)
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to toggle category state')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await deleteCategory(id)
      toast.success('Category deleted successfully')
      refetch()
    } catch (err: any) {
      console.error(err)
      if (err.statusCode === 409) {
        toast.error(err.message || 'This category is in use by merchants. Deactivate it instead.')
      } else {
        toast.error(err.message || 'Failed to delete category')
      }
    }
  }

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubName.trim()) return
    setIsAddingSub(true)
    try {
      await createSubcategory(categoryId, newSubName.trim(), parseInt(newSubSortOrder) || 0)
      toast.success('Subcategory created successfully')
      setNewSubName('')
      setNewSubSortOrder('0')
      setAddingSubCatId(null)
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to create subcategory')
    } finally {
      setIsAddingSub(false)
    }
  }

  const handleUpdateSubcategory = async (id: string) => {
    if (!editSubName.trim()) return
    try {
      await updateSubcategory(id, editSubName.trim(), undefined, parseInt(editSubSort) || 0)
      toast.success('Subcategory updated successfully')
      setEditingSubId(null)
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update subcategory')
    }
  }

  const handleToggleSubcategoryActive = async (id: string, currentActive: boolean) => {
    try {
      await updateSubcategory(id, undefined, !currentActive, undefined)
      toast.success(`Subcategory ${!currentActive ? 'activated' : 'deactivated'} successfully`)
      refetch()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to toggle subcategory state')
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return
    try {
      await deleteSubcategory(id)
      toast.success('Subcategory deleted successfully')
      refetch()
    } catch (err: any) {
      console.error(err)
      if (err.statusCode === 409) {
        toast.error(err.message || 'This subcategory is in use by merchants. Deactivate it instead.')
      } else {
        toast.error(err.message || 'Failed to delete subcategory')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 text-red-900">
        <CardHeader>
          <CardTitle>Error Loading Categories</CardTitle>
          <CardDescription className="text-red-700">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Merchant Categories</h2>
          <p className="text-muted-foreground">Manage the taxonomy of categories and subcategories used by merchants.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Categories List */}
        <div className="md:col-span-2 space-y-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No categories found. Start by adding one.
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className={`${!category.isActive ? 'opacity-70 bg-secondary/20' : ''}`}>
                <CardHeader className="py-4 border-b">
                  {editingCatId === category.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="h-8 max-w-sm"
                        placeholder="Category Name"
                      />
                      <Input
                        type="number"
                        value={editCatSort}
                        onChange={(e) => setEditCatSort(e.target.value)}
                        className="h-8 w-20"
                        placeholder="Sort"
                      />
                      <Button size="icon" className="h-8 w-8" onClick={() => handleUpdateCategory(category.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCatId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowUpDown className="h-3 w-3" /> {category.sortOrder}
                        </span>
                        {!category.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={() => handleToggleCategoryActive(category.id, category.isActive)}
                          />
                          <Label className="text-xs text-muted-foreground cursor-pointer">Active</Label>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingCatId(category.id)
                              setEditCatName(category.name)
                              setEditCatSort(category.sortOrder.toString())
                            }}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-destructive/10"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    {/* Subcategories List */}
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${
                            !sub.isActive ? 'bg-secondary/40 text-muted-foreground border-dashed' : 'bg-primary/5 text-primary border-primary/20'
                          }`}
                        >
                          {editingSubId === sub.id ? (
                            <div className="flex items-center gap-1.5">
                              <Input
                                value={editSubName}
                                onChange={(e) => setEditSubName(e.target.value)}
                                className="h-6 px-1.5 py-0.5 text-xs w-28"
                              />
                              <Input
                                type="number"
                                value={editSubSort}
                                onChange={(e) => setEditSubSort(e.target.value)}
                                className="h-6 px-1.5 py-0.5 text-xs w-14"
                              />
                              <Button
                                size="icon"
                                className="h-5 w-5 p-0"
                                onClick={() => handleUpdateSubcategory(sub.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => setEditingSubId(null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Tag className="h-3 w-3" />
                              <span>{sub.name}</span>
                              <span className="text-[10px] text-muted-foreground">({sub.sortOrder})</span>
                              <Switch
                                checked={sub.isActive}
                                onCheckedChange={() => handleToggleSubcategoryActive(sub.id, sub.isActive)}
                                className="scale-75"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                  setEditingSubId(sub.id)
                                  setEditSubName(sub.name)
                                  setEditSubSort(sub.sortOrder.toString())
                                }}
                              >
                                <Edit2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleDeleteSubcategory(sub.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Subcategory Trigger / Form */}
                    {addingSubCatId === category.id ? (
                      <div className="flex items-center gap-2 max-w-md pt-2 border-t border-dashed">
                        <Input
                          placeholder="Subcategory name"
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="Sort"
                          value={newSubSortOrder}
                          onChange={(e) => setNewSubSortOrder(e.target.value)}
                          className="h-8 w-20 text-sm"
                        />
                        <Button
                          size="sm"
                          disabled={isAddingSub}
                          onClick={() => handleAddSubcategory(category.id)}
                          style={{ backgroundColor: colors.primary }}
                          className="text-white h-8"
                        >
                          {isAddingSub ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAddingSubCatId(null)}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAddingSubCatId(category.id)
                          setNewSubName('')
                          setNewSubSortOrder('0')
                        }}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Subcategory
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Category Sidebar Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Category</CardTitle>
              <CardDescription>Add a new top-level category to the taxonomy.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name</Label>
                  <Input
                    id="catName"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Health & Beauty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catSort">Sort Order</Label>
                  <Input
                    id="catSort"
                    type="number"
                    value={newCatSortOrder}
                    onChange={(e) => setNewCatSortOrder(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isAddingCat}
                  style={{ backgroundColor: colors.primary }}
                  className="w-full text-white"
                >
                  {isAddingCat ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Category
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
