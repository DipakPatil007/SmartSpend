"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAppData } from '@/contexts/AppDataContext';
import type { Transaction } from '@/lib/types';
import { TransactionForm } from './TransactionForm';
import { PlusCircle, MoreHorizontal, Edit2, Trash2, ListChecks } from 'lucide-react';
import { getIconComponent } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function TransactionsPage() {
  const { transactions, categories, deleteTransaction } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const handleAddNew = () => {
    setTransactionToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      try {
        deleteTransaction(transactionToDelete.id);
        toast({ title: "Transaction Deleted", description: `Transaction for "${transactionToDelete.description}" deleted.` });
      } catch(error) {
        toast({ title: "Error", description: "Could not delete transaction.", variant: "destructive" });
        console.error("Error deleting transaction:", error);
      }
      setTransactionToDelete(null);
    }
  };

  return (
    <>
      <PageHeader title="Transactions" description="Log and manage all your financial transactions.">
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Transaction
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A complete list of your recorded transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  const IconComponent = category ? getIconComponent(category.icon) : ListChecks;
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium truncate max-w-xs">{transaction.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                          <span>{category?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTransactionToDelete(transaction)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
              <ListChecks className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">No transactions recorded yet.</p>
              <p>Start by adding a new transaction to track your spending.</p>
              <Button onClick={handleAddNew} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        transactionToEdit={transactionToEdit}
      />

      {transactionToDelete && (
        <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the transaction for "{transactionToDelete.description}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
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
