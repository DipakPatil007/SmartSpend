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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAppData } from "@/contexts/AppDataContext";
import type { Transaction, Category } from "@/lib/types";
// import { categorizeTransaction } from "@/ai/flows/categorize-transaction"; // TODO: AI feature disabled for static export
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const NONE_CATEGORY_VALUE = "_NONE_"; // Ensure this value is not an empty string

const transactionFormSchema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters.").max(100, "Description too long."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  date: z.date({ required_error: "Please select a date." }),
  categoryId: z.string().nullable(), // Allow null, will be mapped to NONE_CATEGORY_VALUE for the select
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionToEdit?: Transaction | null;
}

export function TransactionForm({ open, onOpenChange, transactionToEdit }: TransactionFormProps) {
  const { categories, addTransaction, updateTransaction } = useAppData();
  const { toast } = useToast();
  // const [isSuggestingCategory, setIsSuggestingCategory] = useState(false); // TODO: AI feature disabled for static export

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      categoryId: null, // Default to null, which maps to NONE_CATEGORY_VALUE
    },
  });

  useEffect(() => {
    if (transactionToEdit) {
      form.reset({
        description: transactionToEdit.description,
        amount: transactionToEdit.amount,
        date: parseISO(transactionToEdit.date),
        categoryId: transactionToEdit.categoryId === null ? NONE_CATEGORY_VALUE : transactionToEdit.categoryId,
      });
    } else {
      form.reset({ description: "", amount: 0, date: new Date(), categoryId: NONE_CATEGORY_VALUE });
    }
  }, [transactionToEdit, form, open]);

  /*
  // TODO: AI Category Suggestion feature is disabled for static export as it requires a server environment.
  const handleSuggestCategory = async () => {
    const description = form.getValues("description");
    if (!description.trim()) {
      toast({ title: "Suggestion Error", description: "Please enter a description first.", variant: "destructive"});
      return;
    }
    if (categories.length === 0) {
      toast({ title: "Suggestion Error", description: "No categories available to suggest from.", variant: "destructive"});
      return;
    }

    setIsSuggestingCategory(true);
    try {
      const spendingCategories = categories.map(c => c.name);
      const suggestedCategoryName = await categorizeTransaction({
        transactionDescription: description,
        spendingCategories,
      });
      
      const matchedCategory = categories.find(c => c.name.toLowerCase() === suggestedCategoryName.toLowerCase());
      if (matchedCategory) {
        form.setValue("categoryId", matchedCategory.id, { shouldValidate: true });
        toast({ title: "Category Suggested!", description: `AI suggested: "${matchedCategory.name}"`});
      } else if (suggestedCategoryName && suggestedCategoryName.toLowerCase() !== "other") {
         toast({ title: "Suggestion Made", description: `AI suggested: "${suggestedCategoryName}". Could not match to an existing category.`});
      } else {
        form.setValue("categoryId", NONE_CATEGORY_VALUE, { shouldValidate: true });
        toast({ title: "No specific category found", description: "AI suggested 'Other' or could not determine a category. Defaulting to 'No Category'."});
      }
    } catch (error) {
      console.error("AI Category Suggestion Error:", error);
      toast({ title: "Suggestion Error", description: "Could not get AI suggestion.", variant: "destructive"});
    } finally {
      setIsSuggestingCategory(false);
    }
  };
  */

  const onSubmit = (data: TransactionFormValues) => {
    const transactionData = {
      ...data,
      categoryId: data.categoryId === NONE_CATEGORY_VALUE ? null : data.categoryId,
      date: format(data.date, "yyyy-MM-dd"), // Store date as ISO string
    };
    try {
      if (transactionToEdit) {
        updateTransaction({ ...transactionToEdit, ...transactionData });
        toast({ title: "Transaction Updated", description: `Transaction for ${data.description} updated.` });
      } else {
        addTransaction(transactionData);
        toast({ title: "Transaction Added", description: `Transaction for ${data.description} added.` });
      }
      onOpenChange(false);
      form.reset({ description: "", amount: 0, date: new Date(), categoryId: NONE_CATEGORY_VALUE });
    } catch (error) {
       toast({ title: "Error", description: "Could not save transaction.", variant: "destructive" });
       console.error("Error saving transaction:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) form.reset({ description: "", amount: 0, date: new Date(), categoryId: NONE_CATEGORY_VALUE }); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1 max-h-[70vh] overflow-y-auto">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Coffee with Sarah, Netflix Subscription" {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex items-center gap-2">
                    <Select 
                      onValueChange={(value) => field.onChange(value === NONE_CATEGORY_VALUE ? null : value)} 
                      value={field.value === null ? NONE_CATEGORY_VALUE : field.value} 
                      defaultValue={NONE_CATEGORY_VALUE} // Default to "No Category"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_CATEGORY_VALUE}>No Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* TODO: AI Category Suggestion Button disabled for static export
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleSuggestCategory}
                      disabled={isSuggestingCategory || categories.length === 0}
                      title="Suggest Category (AI)"
                      aria-label="Suggest Category (AI)"
                    >
                      {isSuggestingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                    */}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : (transactionToEdit ? "Save Changes" : "Add Transaction")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
