'use client';

import React from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Receipt } from 'lucide-react'; // Using Receipt as a generic icon

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // For categories
import type { Expense } from '@/types';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

// Map categories to icons (example) - customize as needed
const categoryIcons: Record<string, React.ElementType> = {
  Food: Receipt, // Replace with more specific icons if available/desired
  Transport: Receipt,
  Groceries: Receipt,
  Entertainment: Receipt,
  Utilities: Receipt,
  Rent: Receipt,
  Shopping: Receipt,
  Other: Receipt,
};

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Table>
      <TableCaption>A list of your recent expenses.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No expenses recorded yet.
            </TableCell>
          </TableRow>
        )}
        {expenses.map((expense) => {
          const Icon = categoryIcons[expense.category] || Receipt; // Default icon
          return (
          <TableRow key={expense.id}>
            <TableCell>{format(new Date(expense.date), 'PP')}</TableCell> {/* Format date */}
            <TableCell>
               <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                 <Icon className="h-3 w-3" />
                 {expense.category}
               </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{expense.description || '-'}</TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} className="mr-1 h-8 w-8">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="text-destructive hover:text-destructive h-8 w-8">
                <Trash2 className="h-4 w-4" />
                 <span className="sr-only">Delete</span>
              </Button>
            </TableCell>
          </TableRow>
          )
        })}
      </TableBody>
    </Table>
  );
}
