"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAppData } from "@/contexts/AppDataContext";
import type { Budget } from "@/lib/types";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Please select a category."),
  amount: z.coerce.number().positive("Budget amount must be a positive number."),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetToEdit?: Budget | null;
}

export function BudgetForm({ open, onOpenChange, budgetToEdit }: BudgetFormProps) {
  const { categories, budgets, addBudget, updateBudget } = useAppData();
  const { toast } = useToast();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: "",
      amount: 0,
    },
  });

  useEffect(() => {
    if (budgetToEdit) {
      form.reset({
        categoryId: budgetToEdit.categoryId,
        amount: budgetToEdit.amount,
      });
    } else {
      form.reset({ categoryId: "", amount: 0 });
    }
  }, [budgetToEdit, form, open]);

  const onSubmit = (data: BudgetFormValues) => {
    // Check if a budget for this category already exists if not editing
    if (!budgetToEdit && budgets.find(b => b.categoryId === data.categoryId)) {
      toast({
        title: "Budget Exists",
        description: "A budget for this category already exists. Please edit the existing one.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (budgetToEdit) {
        updateBudget({ ...budgetToEdit, ...data });
        toast({ title: "Budget Updated", description: `Budget for selected category updated.` });
      } else {
        addBudget(data);
        toast({ title: "Budget Added", description: `Budget for selected category added.` });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Could not save budget.", variant: "destructive" });
      console.error("Error saving budget:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) form.reset(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budgetToEdit ? "Edit Budget Goal" : "Set New Budget Goal"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    value={field.value}
                    disabled={!!budgetToEdit} // Disable category change when editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category for the budget" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} disabled={!budgetToEdit && budgets.some(b => b.categoryId === category.id)}>
                          {category.name} {!budgetToEdit && budgets.some(b => b.categoryId === category.id) && "(Budget set)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Budget Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : (budgetToEdit ? "Save Changes" : "Set Budget")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
