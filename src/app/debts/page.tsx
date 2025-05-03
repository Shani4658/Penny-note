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
} from "@/components/ui/alert-dialog";

import { DebtCreditForm } from '@/components/debts/debt-credit-form';
import { DebtCreditList } from '@/components/debts/debt-credit-list';
import { useToast } from '@/hooks/use-toast';
import type { DebtCredit } from '@/types';

export default function DebtsPage() {
  const [debtCredits, setDebtCredits] = useState<DebtCredit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DebtCredit | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // --- Local State Management (Replace with API/DB interaction later) ---

  // Load data from local storage on initial render
   useEffect(() => {
     const storedData = localStorage.getItem('pennywise_debtcredits');
     if (storedData) {
        try {
             // Parse and ensure dates are Date objects
             const parsedData = JSON.parse(storedData).map((item: any) => ({
                 ...item,
                 date: new Date(item.date)
             }));
             setDebtCredits(parsedData);
        } catch (error) {
             console.error("Failed to parse debt/credit data from local storage:", error);
             localStorage.removeItem('pennywise_debtcredits'); // Clear invalid data
        }
     }
   }, []);

   // Save data to local storage whenever it changes
   useEffect(() => {
        // Debounce or throttle this in a real app if updates are frequent
       try {
         localStorage.setItem('pennywise_debtcredits', JSON.stringify(debtCredits));
       } catch (error) {
         console.error("Failed to save debt/credit data to local storage:", error);
         toast({
             title: "Error Saving Data",
             description: "Could not save debts/credits locally. Data might be lost on refresh.",
             variant: "destructive",
         });
       }
   }, [debtCredits, toast]); // Added toast dependency


  // --- Handlers ---

  const handleAddItem = async (data: Omit<DebtCredit, 'id'>) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call

    const newItem: DebtCredit = {
      ...data,
      id: crypto.randomUUID(),
      date: new Date(data.date)
    };
    setDebtCredits((prev) => [newItem, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    setIsSubmitting(false);
    setIsFormOpen(false);
    toast({
      title: 'Record Added',
      description: `Successfully added record for ${data.person}.`,
    });
  };

   const handleEditItem = async (data: Omit<DebtCredit, 'id'>) => {
     if (!editingItem) return;
     setIsSubmitting(true);
     await new Promise(resolve => setTimeout(resolve, 300));

     setDebtCredits((prev) =>
       prev.map((item) =>
         item.id === editingItem.id ? { ...item, ...data, date: new Date(data.date) } : item
       ).sort((a, b) => b.date.getTime() - a.date.getTime())
     );
     setIsSubmitting(false);
     setEditingItem(null);
     setIsFormOpen(false);
     toast({
       title: 'Record Updated',
       description: 'Record details saved successfully.',
     });
   };

   const handleDeleteConfirm = async () => {
      if (!deletingItemId) return;

      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call

      setDebtCredits((prev) => prev.filter((item) => item.id !== deletingItemId));
      toast({
        title: 'Record Deleted',
        description: 'The record has been removed.',
        variant: 'destructive'
      });
      setDeletingItemId(null);
   };


  const openEditForm = (item: DebtCredit) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

   const openDeleteDialog = (id: string) => {
     setDeletingItemId(id);
   }

   const closeForm = () => {
      setIsFormOpen(false);
      setEditingItem(null); // Clear editing state when closing
   }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Debts & Credits</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
             <Button onClick={() => setEditingItem(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Record' : 'Add New Debt/Credit'}</DialogTitle>
            </DialogHeader>
            <DebtCreditForm
              onSubmit={editingItem ? handleEditItem : handleAddItem}
              initialData={editingItem ?? undefined}
              isSubmitting={isSubmitting}
            />
            {/* <Button variant="outline" onClick={closeForm} className="mt-4 w-full">Cancel</Button> */}
          </DialogContent>
        </Dialog>
      </div>

      <DebtCreditList
        items={debtCredits}
        onEdit={openEditForm}
        onDelete={openDeleteDialog}
      />

       {/* Delete Confirmation Dialog */}
       <AlertDialog open={!!deletingItemId} onOpenChange={(open) => !open && setDeletingItemId(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
             <AlertDialogDescription>
               This action cannot be undone. This will permanently delete the debt/credit record.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setDeletingItemId(null)}>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
