"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Pencil, Trash2, Save, X, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getInstitutes, createInstitute, updateInstitute, deleteInstitute, Institute } from "@/lib/api-client"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface AdminInstitutesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AdminInstitutesDialog({ open, onOpenChange }: AdminInstitutesDialogProps) {
    const [institutes, setInstitutes] = useState<Institute[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    const [newInstituteName, setNewInstituteName] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editIsActive, setEditIsActive] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (open) {
            fetchInstitutes()
        } else {
            // Reset state when closed
            setIsAdding(false)
            setNewInstituteName("")
            setEditingId(null)
            setSearchQuery("")
        }
    }, [open])

    const fetchInstitutes = async () => {
        setLoading(true)
        try {
            const data = await getInstitutes()
            setInstitutes(data)
        } catch (error: any) {
            console.error("Failed to fetch institutes:", error)
            toast({
                title: "Error",
                description: error?.message || "Failed to load institutes",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        const trimmed = newInstituteName.trim()
        if (!trimmed) return

        setActionLoading(true)
        try {
            const newInst = await createInstitute(trimmed)
            setInstitutes(prev => [...prev, newInst].sort((a, b) => a.name.localeCompare(b.name)))
            setNewInstituteName("")
            setIsAdding(false)
            toast({
                title: "Success",
                description: "Institute created successfully",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to create institute",
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const handleUpdate = async (id: string, name: string, isActive: boolean) => {
        const trimmed = name.trim()
        if (!trimmed) {
            toast({
                title: "Error",
                description: "Institute name cannot be empty",
                variant: "destructive",
            })
            return
        }

        setActionLoading(true)
        try {
            const updatedDiff = await updateInstitute(id, trimmed, isActive)
            setInstitutes(prev =>
                prev.map(i => i.id === id ? updatedDiff : i).sort((a, b) => a.name.localeCompare(b.name))
            )
            setEditingId(null)
            toast({
                title: "Success",
                description: "Institute updated successfully",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to update institute",
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleStatus = async (inst: Institute) => {
        setActionLoading(true)
        try {
            const updated = await updateInstitute(inst.id, inst.name, !inst.isActive)
            setInstitutes(prev => prev.map(i => i.id === inst.id ? updated : i))
            toast({
                title: "Success",
                description: `Institute ${!inst.isActive ? 'activated' : 'deactivated'} successfully`,
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to update institute status",
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setActionLoading(true)
        try {
            await deleteInstitute(deleteId)
            setInstitutes(prev => prev.filter(i => i.id !== deleteId))
            setDeleteId(null)
            toast({
                title: "Success",
                description: "Institute deleted successfully",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to delete institute",
                variant: "destructive",
            })
        } finally {
            setActionLoading(false)
        }
    }

    const filteredInstitutes = institutes.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-[95vw] max-w-2xl sm:max-w-2xl max-h-[85vh] flex flex-col p-6">
                    <DialogHeader className="pb-1">
                        <DialogTitle className="text-xl font-bold">Manage Institutes</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm">
                            Add, edit, or remove institutes available for student sign-up.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-between gap-3 pt-2 pb-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder="Search institutes by name..."
                                className="pl-9 pr-9 h-10 rounded-xl text-sm font-medium shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button
                            onClick={() => {
                                setIsAdding(true)
                                setEditingId(null)
                            }}
                            disabled={isAdding}
                            className="h-10 rounded-xl font-bold shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> Add Institute
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden border rounded-xl min-h-[320px]">
                        <table className="w-full text-sm table-fixed border-collapse">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 border-b shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-700 dark:text-slate-200">Name</th>
                                    <th className="py-3 px-2 text-center font-semibold text-slate-700 dark:text-slate-200 w-[100px]">Status</th>
                                    <th className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-200 w-[110px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isAdding && (
                                    <tr className="bg-blue-50/50 dark:bg-blue-950/20">
                                        <td className="py-2.5 px-4">
                                            <Input
                                                value={newInstituteName}
                                                onChange={(e) => setNewInstituteName(e.target.value)}
                                                placeholder="Enter institute name..."
                                                autoFocus
                                                className="h-9 w-full rounded-lg bg-white dark:bg-slate-900 border-blue-300 focus-visible:ring-blue-500"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleCreate()
                                                    if (e.key === 'Escape') {
                                                        setIsAdding(false)
                                                        setNewInstituteName("")
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="py-2.5 px-2 text-center">
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                Active
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg" onClick={handleCreate} disabled={actionLoading || !newInstituteName.trim()} title="Save">
                                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg" onClick={() => { setIsAdding(false); setNewInstituteName(""); }} title="Cancel">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-12 text-slate-400">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                                            Loading institutes...
                                        </td>
                                    </tr>
                                ) : filteredInstitutes.length === 0 && !isAdding ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-12 text-slate-400">
                                            {searchQuery ? "No institutes match your search." : "No institutes found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInstitutes.map((inst) => {
                                        const isEditingThis = editingId === inst.id
                                        return (
                                            <tr key={inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                                                <td className="py-3 px-4 align-middle">
                                                    {isEditingThis ? (
                                                        <Input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="h-9 w-full rounded-lg bg-white dark:bg-slate-900 border-blue-300 focus-visible:ring-blue-500"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdate(inst.id, editName, editIsActive)
                                                                if (e.key === 'Escape') setEditingId(null)
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="font-medium text-slate-800 dark:text-slate-200 break-words whitespace-normal leading-snug">
                                                            <span className={!inst.isActive ? "text-slate-400 dark:text-slate-500 line-through" : ""}>
                                                                {inst.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-2 text-center align-middle">
                                                    {isEditingThis ? (
                                                        <div className="flex items-center justify-center">
                                                            <Switch
                                                                checked={editIsActive}
                                                                onCheckedChange={setEditIsActive}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Badge
                                                            variant={inst.isActive ? "default" : "secondary"}
                                                            className={`cursor-pointer select-none text-xs font-semibold ${
                                                                inst.isActive
                                                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 border-0"
                                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 border-0"
                                                            }`}
                                                            onClick={() => handleToggleStatus(inst)}
                                                            title="Click to toggle status"
                                                        >
                                                            {inst.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right align-middle">
                                                    {isEditingThis ? (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg" onClick={() => handleUpdate(inst.id, editName, editIsActive)} disabled={actionLoading || !editName.trim()} title="Save">
                                                                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg" onClick={() => setEditingId(null)} title="Cancel">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
                                                                onClick={() => {
                                                                    setIsAdding(false)
                                                                    setEditingId(inst.id)
                                                                    setEditName(inst.name)
                                                                    setEditIsActive(inst.isActive)
                                                                }}
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                                                                onClick={() => setDeleteId(inst.id)}
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the institute. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
