'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ExpenseForm } from '@/components/expenses/expense-form';
import { ExpenseList } from '@/components/expenses/expense-list';
import { useToast } from '@/hooks/use-toast';
import type { Expense } from '@/types';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

   // --- Local State Management (Replace with API/DB interaction later) ---

   // Load expenses from local storage on initial render
   useEffect(() => {
     const storedExpenses = localStorage.getItem('pennywise_expenses');
     if (storedExpenses) {
       try {
          // Parse and ensure dates are Date objects
          const parsedExpenses = JSON.parse(storedExpenses).map((exp: any) => ({
              ...exp,
              date: new Date(exp.date)
          }));
          setExpenses(parsedExpenses);
       } catch (error) {
          console.error("Failed to parse expenses from local storage:", error);
          localStorage.removeItem('pennywise_expenses'); // Clear invalid data
       }
     }
   }, []);

   // Save expenses to local storage whenever they change
   useEffect(() => {
       // Debounce or throttle this in a real app if updates are frequent
       try {
         localStorage.setItem('pennywise_expenses', JSON.stringify(expenses));
       } catch (error) {
         console.error("Failed to save expenses to local storage:", error);
         toast({
             title: "Error Saving Data",
             description: "Could not save expenses locally. Data might be lost on refresh.",
             variant: "destructive",
         });
       }
   }, [expenses, toast]); // Added toast dependency


  // --- Handlers ---

  const handleAddExpense = async (data: Omit<Expense, 'id'>) => {
    setIsSubmitting(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newExpense: Expense = {
      ...data,
      id: crypto.randomUUID(), // Simple unique ID generation
      date: new Date(data.date) // Ensure it's a Date object
    };
    setExpenses((prev) => [newExpense, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime())); // Add and sort by date descending
    setIsSubmitting(false);
    setIsFormOpen(false); // Close dialog on success
    toast({
      title: 'Expense Added',
      description: `Successfully added ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.amount)}.`,
    });
  };

  const handleEditExpense = async (data: Omit<Expense, 'id'>) => {
     if (!editingExpense) return;
     setIsSubmitting(true);
     await new Promise(resolve => setTimeout(resolve, 300));

     setExpenses((prev) =>
       prev.map((exp) =>
         exp.id === editingExpense.id ? { ...exp, ...data, date: new Date(data.date) } : exp
       ).sort((a, b) => b.date.getTime() - a.date.getTime()) // Re-sort after edit
     );
     setIsSubmitting(false);
     setEditingExpense(null);
     setIsFormOpen(false); // Close dialog on success
     toast({
       title: 'Expense Updated',
       description: 'Expense details saved successfully.',
     });
   };

   const handleDeleteConfirm = async () => {
      if (!deletingExpenseId) return;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setExpenses((prev) => prev.filter((exp) => exp.id !== deletingExpenseId));
      toast({
        title: 'Expense Deleted',
        description: 'The expense has been removed.',
        variant: 'destructive' // Use destructive variant for delete confirmation
      });
      setDeletingExpenseId(null); // Close the dialog
   };


  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: string) => {
     setDeletingExpenseId(id);
  }

   const closeForm = () => {
      setIsFormOpen(false);
      setEditingExpense(null); // Clear editing state when closing
   }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingExpense(null)}> {/* Ensure editingExpense is null for add */}
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
             {/* Remove DialogClose from here if handled by form submission/cancel */}
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
              initialData={editingExpense ?? undefined} // Pass initial data or undefined
              isSubmitting={isSubmitting}
            />
             {/* Optionally add a manual close/cancel button if needed */}
            {/* <Button variant="outline" onClick={closeForm} className="mt-4 w-full">Cancel</Button> */}
          </DialogContent>
        </Dialog>
      </div>

      <ExpenseList
        expenses={expenses}
        onEdit={openEditForm}
        onDelete={openDeleteDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingExpenseId} onOpenChange={(open) => !open && setDeletingExpenseId(null)}>
         {/* AlertDialogTrigger is not needed here as we trigger manually */}
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
             <AlertDialogDescription>
               This action cannot be undone. This will permanently delete the expense record.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setDeletingExpenseId(null)}>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

    </div>
  );
}
