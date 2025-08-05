"use client"
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageData?: string | null;
  imageName?: string | null;
  imageType?: string | null;
  imageSize?: number | null;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  image?: {
    data: string;
    type: string;
    name: string;
  } | null;
}

function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

// Slugify helper
function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function TourCategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true,
    image: null as File | null,
  });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editValues, setEditValues] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true,
    image: null as File | null,
  });
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addSlugEdited, setAddSlugEdited] = useState(false);
  const [editSlugEdited, setEditSlugEdited] = useState(false);

  useEffect(() => {
    fetch('/api/admin/tours/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load categories');
        setLoading(false);
      });
  }, []);

  // Auto-generate slug for add modal
  useEffect(() => {
    if (!addSlugEdited) {
      setNewCategory((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [newCategory.name, addSlugEdited]);

  // Auto-generate slug for edit modal
  useEffect(() => {
    if (!editSlugEdited && editCategory) {
      setEditValues((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [editValues.name, editSlugEdited, editCategory]);

  // Handle image preview for add
  const handleAddImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewCategory(prev => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setAddImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAddImagePreview(null);
    }
  };

  // Handle image preview for edit
  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditValues(prev => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setEditImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setEditImagePreview(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('slug', newCategory.slug);
      formData.append('description', newCategory.description);
      formData.append('displayOrder', String(newCategory.displayOrder));
      formData.append('isActive', String(newCategory.isActive));
      if (newCategory.image) formData.append('image', newCategory.image);

      const res = await fetch('/api/admin/tours/categories', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add category');
      const added = await res.json();
      setCategories([...categories, added]);
      setNewCategory({ name: '', slug: '', description: '', displayOrder: 0, isActive: true, image: null });
      setAddImagePreview(null);
      setAddModalOpen(false);
    } catch (err) {
      setError('Failed to add category');
    }
  };

  const startEdit = (cat: Category) => {
    setEditCategory(cat);
    setEditValues({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive ?? true,
      image: null,
    });
    setEditImagePreview(null);
    setEditModalOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', editValues.name);
      formData.append('slug', editValues.slug);
      formData.append('description', editValues.description);
      formData.append('displayOrder', String(editValues.displayOrder));
      formData.append('isActive', String(editValues.isActive));
      if (editValues.image) formData.append('image', editValues.image);

      const res = await fetch(`/api/admin/tours/categories/${editCategory.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update category');
      const updated = await res.json();
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
      setEditCategory(null);
      setEditImagePreview(null);
      setEditModalOpen(false);
    } catch (err) {
      setError('Failed to update category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/tours/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete category. It may be in use.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-2xl font-bold">Tour Categories</CardTitle>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

          <h2 className="text-lg font-semibold mb-2">Categories</h2>
          <div className="overflow-x-auto">
            <Table className="shadow-sm border rounded-lg bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="align-middle text-center">Image</TableHead>
                  <TableHead className="align-middle">Name</TableHead>
                  <TableHead className="align-middle">Slug</TableHead>
                  <TableHead className="align-middle">Description</TableHead>
                  <TableHead className="align-middle text-right">Order</TableHead>
                  <TableHead className="align-middle text-center">Active</TableHead>
                  <TableHead className="align-middle text-right">Created</TableHead>
                  <TableHead className="align-middle text-right">Updated</TableHead>
                  <TableHead className="align-middle text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">No categories found.</TableCell>
                  </TableRow>
                ) : (
                  categories.map(cat => (
                    <TableRow key={cat.id} className="hover:bg-gray-50 transition-colors group">
                      <TableCell className="align-middle text-center py-3">
                        {cat.image && cat.image.data ? (
                          <img
                            src={`data:${cat.image.type || 'image/jpeg'};base64,${cat.image.data}`}
                            alt={cat.image.name || 'Category'}
                            className="w-12 h-12 object-cover rounded border bg-gray-100 mx-auto"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <span className="inline-flex items-center justify-center w-12 h-12 rounded border bg-gray-100 text-gray-400 mx-auto">
                            <ImageIcon className="h-6 w-6" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="align-middle font-bold text-lg text-gray-900 whitespace-nowrap py-3">{cat.name}</TableCell>
                      <TableCell className="align-middle max-w-[120px] truncate py-3" title={cat.slug}>{cat.slug}</TableCell>
                      <TableCell className="align-middle max-w-xs py-3 whitespace-nowrap truncate" title={cat.description}>
                        {cat.description && cat.description.length > 80
                          ? cat.description.slice(0, 80) + '...'
                          : cat.description || <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="align-middle text-right font-mono py-3">{cat.displayOrder ?? 0}</TableCell>
                      <TableCell className="align-middle text-center py-3">
                        {cat.isActive ? (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-500">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell className="align-middle text-right text-xs text-gray-500 py-3">{formatDate(cat.createdAt)}</TableCell>
                      <TableCell className="align-middle text-right text-xs text-gray-500 py-3">{formatDate(cat.updatedAt)}</TableCell>
                      <TableCell className="align-middle text-right py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => { setViewCategory(cat); setViewModalOpen(true); }}>
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => startEdit(cat)}>
                            <Edit2 className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="absolute top-2 right-2 p-2"><X className="h-4 w-4" /></Button>
            </DialogClose>
          </DialogHeader>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="name" className="block mb-1">Name</Label>
              <Input
                id="name"
                placeholder="Name"
                value={newCategory.name}
                onChange={e => {
                  setNewCategory({ ...newCategory, name: e.target.value });
                  if (!addSlugEdited) setNewCategory(prev => ({ ...prev, slug: slugify(e.target.value) }));
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug" className="block mb-1">Slug</Label>
              <Input
                id="slug"
                placeholder="Slug"
                value={newCategory.slug}
                onChange={e => {
                  setNewCategory({ ...newCategory, slug: e.target.value });
                  setAddSlugEdited(true);
                }}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description" className="block mb-1">Description</Label>
              <Input
                id="description"
                placeholder="Description"
                value={newCategory.description}
                onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="displayOrder" className="block mb-1">Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={newCategory.displayOrder}
                onChange={e => setNewCategory({ ...newCategory, displayOrder: Number(e.target.value) })}
                min={0}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={newCategory.isActive}
                onCheckedChange={checked => setNewCategory({ ...newCategory, isActive: checked })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="image" className="block mb-1">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleAddImageChange}
              />
              {addImagePreview && (
                <img src={addImagePreview} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded border" />
              )}
            </div>
            <Button type="submit" className="col-span-1 md:col-span-2 w-full mt-4">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={editModalOpen} onOpenChange={open => { setEditModalOpen(open); if (!open) setEditCategory(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="absolute top-2 right-2 p-2"><X className="h-4 w-4" /></Button>
            </DialogClose>
          </DialogHeader>
          {editCategory && (
            <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="edit-name" className="block mb-1">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Name"
                  value={editValues.name}
                  onChange={e => {
                    setEditValues({ ...editValues, name: e.target.value });
                    if (!editSlugEdited) setEditValues(prev => ({ ...prev, slug: slugify(e.target.value) }));
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-slug" className="block mb-1">Slug</Label>
                <Input
                  id="edit-slug"
                  placeholder="Slug"
                  value={editValues.slug}
                  onChange={e => {
                    setEditValues({ ...editValues, slug: e.target.value });
                    setEditSlugEdited(true);
                  }}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-description" className="block mb-1">Description</Label>
                <Input
                  id="edit-description"
                  placeholder="Description"
                  value={editValues.description}
                  onChange={e => setEditValues({ ...editValues, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-displayOrder" className="block mb-1">Order</Label>
                <Input
                  id="edit-displayOrder"
                  type="number"
                  value={editValues.displayOrder}
                  onChange={e => setEditValues({ ...editValues, displayOrder: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="edit-isActive">Active</Label>
                <Switch
                  id="edit-isActive"
                  checked={editValues.isActive}
                  onCheckedChange={checked => setEditValues({ ...editValues, isActive: checked })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-image" className="block mb-1">Image</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
                {(editImagePreview || editCategory.imageData) && (
                  <img
                    src={editImagePreview || (editCategory.imageData ? `data:${editCategory.imageType};base64,${editCategory.imageData}` : undefined)}
                    alt="Preview"
                    className="mt-2 w-16 h-16 object-cover rounded border"
                  />
                )}
              </div>
              <Button type="submit" className="col-span-1 md:col-span-2 w-full mt-4">
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Category Modal */}
      <Dialog open={viewModalOpen} onOpenChange={open => { setViewModalOpen(open); if (!open) setViewCategory(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="absolute top-2 right-2 p-2"><X className="h-4 w-4" /></Button>
            </DialogClose>
          </DialogHeader>
          {viewCategory && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {viewCategory.image && viewCategory.image.data ? (
                  <img
                    src={`data:${viewCategory.image.type || 'image/jpeg'};base64,${viewCategory.image.data}`}
                    alt={viewCategory.image.name || 'Category'}
                    className="w-20 h-20 object-cover rounded border bg-gray-100"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center w-20 h-20 rounded border bg-gray-100 text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                  </span>
                )}
                <div>
                  <div className="font-bold text-xl text-gray-900">{viewCategory.name}</div>
                  <div className="text-sm text-gray-500">Slug: {viewCategory.slug}</div>
                  <div className="text-xs text-gray-400">ID: {viewCategory.id}</div>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="mt-1 text-gray-700 whitespace-pre-line bg-gray-50 rounded p-2 border max-h-40 overflow-auto">
                  {viewCategory.description || <span className="text-gray-400">—</span>}
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label>Order</Label>
                  <div className="font-mono">{viewCategory.displayOrder ?? 0}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  {viewCategory.isActive ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">Active</span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-500">Inactive</span>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label>Created</Label>
                  <div className="text-xs text-gray-500">{formatDate(viewCategory.createdAt)}</div>
                </div>
                <div>
                  <Label>Updated</Label>
                  <div className="text-xs text-gray-500">{formatDate(viewCategory.updatedAt)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
