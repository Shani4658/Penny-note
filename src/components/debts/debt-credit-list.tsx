'use client';

import React from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, User, TrendingUp, TrendingDown } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import type { DebtCredit } from '@/types';

interface DebtCreditListProps {
  items: DebtCredit[];
  onEdit: (item: DebtCredit) => void;
  onDelete: (id: string) => void;
}

export function DebtCreditList({ items, onEdit, onDelete }: DebtCreditListProps) {
   const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Table>
      <TableCaption>A list of your recorded debts and credits.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Date</TableHead>
          <TableHead>Person</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No debts or credits recorded yet.
            </TableCell>
          </TableRow>
        )}
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{format(new Date(item.date), 'PP')}</TableCell>
            <TableCell className="font-medium flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              {item.person}
            </TableCell>
             <TableCell>
              <Badge variant={item.type === 'credit' ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit bg-opacity-80">
                 {item.type === 'credit' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                 {item.type === 'credit' ? 'They Owe You' : 'You Owe Them'}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{item.description || '-'}</TableCell>
            <TableCell className={`text-right font-medium ${item.type === 'credit' ? 'text-accent-foreground' : 'text-destructive'}`}>
               {item.type === 'credit' ? '+' : '-'} {formatCurrency(item.amount)}
            </TableCell>
            <TableCell className="text-right">
               <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="mr-1 h-8 w-8">
                 <Edit className="h-4 w-4" />
                 <span className="sr-only">Edit</span>
               </Button>
               <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="text-destructive hover:text-destructive h-8 w-8">
                 <Trash2 className="h-4 w-4" />
                 <span className="sr-only">Delete</span>
               </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
