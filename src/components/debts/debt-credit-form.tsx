'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { DebtCredit } from '@/types';

const formSchema = z.object({
  person: z.string().min(1, { message: "Person's name is required." }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }).min(0.01, {message: "Amount must be greater than 0"}),
  type: z.enum(['debt', 'credit'], {
    required_error: 'You need to select whether you owe or are owed.',
  }),
  date: z.date({
    required_error: 'A date is required.',
  }),
  description: z.string().optional(),
});

type DebtCreditFormValues = z.infer<typeof formSchema>;

interface DebtCreditFormProps {
  onSubmit: (data: DebtCreditFormValues) => Promise<void> | void;
  initialData?: Partial<DebtCredit>; // For editing
  isSubmitting?: boolean;
}

export function DebtCreditForm({ onSubmit, initialData, isSubmitting = false }: DebtCreditFormProps) {
  const form = useForm<DebtCreditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      person: initialData?.person || '',
      amount: initialData?.amount || undefined,
      type: initialData?.type || undefined,
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      description: initialData?.description || '',
    },
  });

   const handleSubmit = async (data: DebtCreditFormValues) => {
     await onSubmit(data);
      // Optionally reset form after successful submission if not editing
     if (!initialData) {
        form.reset({
           person: '',
           amount: undefined,
           type: undefined,
           date: new Date(),
           description: ''
        });
     }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Person Field */}
        <FormField
          control={form.control}
          name="person"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Person</FormLabel>
              <FormControl>
                <Input placeholder="Enter the person's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount Field */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type Field (Debt/Credit) */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4" // Changed to horizontal layout
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="debt" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      You Owe Them (Debt)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="credit" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      They Owe You (Credit)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Field */}
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
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a short note (e.g., 'Borrowed for lunch', 'Lent for movie ticket')"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <Button type="submit" disabled={isSubmitting} className="w-full">
           {isSubmitting ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Saving...
             </>
           ) : initialData ? (
             'Save Changes'
           ) : (
             'Add Record'
           )}
         </Button>
      </form>
    </Form>
  );
}
