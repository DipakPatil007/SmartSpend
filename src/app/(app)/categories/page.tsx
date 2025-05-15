"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAppData } from '@/contexts/AppDataContext';
import type { Category } from '@/lib/types';
import { CategoryForm } from './CategoryForm';
import { PlusCircle, MoreHorizontal, Edit2, Trash2, Tags } from 'lucide-react';
import { getIconComponent } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const { categories, deleteCategory } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { toast } = useToast();

  const handleAddNew = () => {
    setCategoryToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      try {
        deleteCategory(categoryToDelete.id);
        toast({ title: "Category Deleted", description: `"${categoryToDelete.name}" has been deleted.` });
      } catch (error) {
        toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
        console.error("Error deleting category:", error);
      }
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <PageHeader title="Spending Categories" description="Manage your spending categories.">
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>View and manage all your spending categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <TableRow key={category.id}>
                      <TableCell>
                        {IconComponent && <IconComponent className="h-6 w-6 text-muted-foreground" />}
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setCategoryToDelete(category)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Tags className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">No categories yet.</p>
              <p>Start by adding a new category to organize your expenses.</p>
              <Button onClick={handleAddNew} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        categoryToEdit={categoryToEdit}
      />

      {categoryToDelete && (
        <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete "{categoryToDelete.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category and remove its association from any transactions or budgets.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
