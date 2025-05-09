"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppData } from '@/contexts/AppDataContext';
import type { Budget } from '@/lib/types';
import { BudgetForm } from './BudgetForm';
import { PlusCircle, Edit2, Trash2, Target, PiggyBank } from 'lucide-react';
import { getIconComponent } from '@/lib/constants';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function BudgetsPage() {
  const { budgets, categories, transactions, deleteBudget } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const { toast } = useToast();

  const handleAddNew = () => {
    setBudgetToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (budgetToDelete) {
      try {
        deleteBudget(budgetToDelete.id);
        const categoryName = categories.find(c => c.id === budgetToDelete.categoryId)?.name || "Selected";
        toast({ title: "Budget Deleted", description: `Budget for ${categoryName} category deleted.` });
      } catch (error) {
         toast({ title: "Error", description: "Could not delete budget.", variant: "destructive" });
         console.error("Error deleting budget:", error);
      }
      setBudgetToDelete(null);
    }
  };

  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const monthlyTransactions = transactions.filter(t => 
    isWithinInterval(parseISO(t.date), { start: currentMonthStart, end: currentMonthEnd })
  );

  return (
    <>
      <PageHeader title="Budget Goals" description="Set and track your monthly spending goals for each category.">
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Set New Budget
        </Button>
      </PageHeader>

      {budgets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const category = categories.find(c => c.id === budget.categoryId);
            const spentAmount = monthlyTransactions
              .filter(t => t.categoryId === budget.categoryId)
              .reduce((sum, t) => sum + t.amount, 0);
            const progress = budget.amount > 0 ? Math.min((spentAmount / budget.amount) * 100, 100) : 0;
            const remaining = budget.amount - spentAmount;
            const IconComponent = category ? getIconComponent(category.icon) : PiggyBank;

            return (
              <Card key={budget.id} className="flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {IconComponent && <IconComponent className="h-7 w-7 text-primary" />}
                      <CardTitle className="text-xl">{category?.name || 'Uncategorized Budget'}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(budget)}>
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit Budget</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setBudgetToDelete(budget)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Budget</span>
                        </Button>
                    </div>
                  </div>
                  <CardDescription>Monthly Goal: {formatCurrency(budget.amount)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div>
                    <Progress value={progress} className="h-3 mb-2" indicatorClassName={progress > 100 ? "bg-destructive" : "bg-primary"} />
                    <div className="text-sm text-muted-foreground flex justify-between">
                      <span>Spent: {formatCurrency(spentAmount)}</span>
                      <span className={remaining < 0 ? 'text-destructive font-semibold' : ''}>
                        Remaining: {formatCurrency(remaining)}
                      </span>
                    </div>
                    {progress > 100 && <p className="text-xs text-destructive mt-1">Overspent by {formatCurrency(spentAmount - budget.amount)}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Target className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">No budget goals set yet.</p>
            <p>Create budgets for your spending categories to track your progress.</p>
            <Button onClick={handleAddNew} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Set First Budget
            </Button>
          </CardContent>
        </Card>
      )}

      <BudgetForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        budgetToEdit={budgetToEdit}
      />

      {budgetToDelete && (
         <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Budget Goal?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the budget for "{categories.find(c=>c.id === budgetToDelete.categoryId)?.name || 'this category'}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBudgetToDelete(null)}>Cancel</AlertDialogCancel>
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
