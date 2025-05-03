'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import type { Expense, DebtCredit } from '@/types'; // Assuming types are defined

export default function Home() {
  // --- State for data from localStorage ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debtCredits, setDebtCredits] = useState<DebtCredit[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Load data from localStorage ---
  useEffect(() => {
    setLoading(true);
    let loadedExpenses: Expense[] = [];
    let loadedDebtCredits: DebtCredit[] = [];

    // Load Expenses
    const storedExpenses = localStorage.getItem('pennywise_expenses');
    if (storedExpenses) {
      try {
        loadedExpenses = JSON.parse(storedExpenses).map((exp: any) => ({
          ...exp,
          date: new Date(exp.date), // Ensure date is a Date object
        }));
      } catch (error) {
        console.error("Failed to parse expenses from local storage:", error);
        // Optionally clear invalid data: localStorage.removeItem('pennywise_expenses');
      }
    }

    // Load Debts/Credits
    const storedDebtCredits = localStorage.getItem('pennywise_debtcredits');
    if (storedDebtCredits) {
      try {
        loadedDebtCredits = JSON.parse(storedDebtCredits).map((item: any) => ({
          ...item,
          date: new Date(item.date), // Ensure date is a Date object
        }));
      } catch (error) {
        console.error("Failed to parse debt/credit data from local storage:", error);
        // Optionally clear invalid data: localStorage.removeItem('pennywise_debtcredits');
      }
    }

    // Sort data by date descending before setting state
    loadedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
    loadedDebtCredits.sort((a, b) => b.date.getTime() - a.date.getTime());


    setExpenses(loadedExpenses);
    setDebtCredits(loadedDebtCredits);
    setLoading(false);

    // --- Add event listeners to update summary when storage changes ---
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'pennywise_expenses' || event.key === 'pennywise_debtcredits') {
            // Re-load data when relevant local storage items change
             const updatedStoredExpenses = localStorage.getItem('pennywise_expenses');
             const updatedStoredDebtCredits = localStorage.getItem('pennywise_debtcredits');

             let updatedExpenses: Expense[] = [];
             let updatedDebtCredits: DebtCredit[] = [];

             if (updatedStoredExpenses) {
               try {
                 updatedExpenses = JSON.parse(updatedStoredExpenses).map((exp: any) => ({ ...exp, date: new Date(exp.date) }));
               } catch { /* handle error */ }
             }
             if (updatedStoredDebtCredits) {
                try {
                 updatedDebtCredits = JSON.parse(updatedStoredDebtCredits).map((item: any) => ({ ...item, date: new Date(item.date) }));
               } catch { /* handle error */ }
             }

            updatedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
            updatedDebtCredits.sort((a, b) => b.date.getTime() - a.date.getTime());

            setExpenses(updatedExpenses);
            setDebtCredits(updatedDebtCredits);
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, []); // Empty dependency array means this runs once on mount and sets up listener

  // --- Calculations ---
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalOwedToYou = debtCredits.filter(dc => dc.type === 'credit').reduce((sum, dc) => sum + dc.amount, 0);
  const totalYouOwe = debtCredits.filter(dc => dc.type === 'debt').reduce((sum, dc) => sum + dc.amount, 0);
  const netPosition = totalOwedToYou - totalYouOwe;

  // --- Formatting Function ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // --- Loading State ---
  if (loading) {
    // Basic loading indicator
    return <div className="text-center p-10">Loading summary...</div>;
  }

  // --- Render Summary ---
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Financial Summary</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Total amount spent</p>
          </CardContent>
        </Card>

        {/* Total Owed To You Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owed to You</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent-foreground" /> {/* Use accent color */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">{formatCurrency(totalOwedToYou)}</div>
            <p className="text-xs text-muted-foreground">Total money others owe you</p>
          </CardContent>
        </Card>

        {/* Total You Owe Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" /> {/* Use destructive color */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalYouOwe)}</div>
            <p className="text-xs text-muted-foreground">Total money you owe others</p>
          </CardContent>
        </Card>

        {/* Net Position Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netPosition >= 0 ? 'text-accent-foreground' : 'text-destructive'}`}>
              {formatCurrency(netPosition)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netPosition >= 0 ? 'Overall balance is positive' : 'Overall balance is negative'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Lists using data from localStorage */}
      <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Expenses */}
          <Card>
              <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Your latest tracked expenses.</CardDescription>
              </CardHeader>
              <CardContent>
                  {expenses.slice(0, 5).map(exp => (
                      <div key={exp.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                              <p className="font-medium">{exp.category}</p>
                              <p className="text-sm text-muted-foreground">{exp.description || new Date(exp.date).toLocaleDateString()}</p>
                          </div>
                          <p className="font-medium">{formatCurrency(exp.amount)}</p>
                      </div>
                  ))}
                  {expenses.length === 0 && <p className="text-muted-foreground">No expenses recorded yet.</p>}
              </CardContent>
          </Card>

          {/* Recent Debts/Credits */}
           <Card>
              <CardHeader>
                  <CardTitle>Recent Debts & Credits</CardTitle>
                   <CardDescription>Latest records of money owed.</CardDescription>
              </CardHeader>
              <CardContent>
                   {debtCredits.slice(0, 5).map(dc => (
                      <div key={dc.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                              <p className="font-medium">{dc.person}</p>
                              <p className="text-sm text-muted-foreground">{dc.description || new Date(dc.date).toLocaleDateString()}</p>
                          </div>
                          <p className={`font-medium ${dc.type === 'credit' ? 'text-accent-foreground' : 'text-destructive'}`}>
                              {dc.type === 'credit' ? '+' : '-'} {formatCurrency(dc.amount)}
                          </p>
                      </div>
                  ))}
                   {debtCredits.length === 0 && <p className="text-muted-foreground">No debts or credits recorded yet.</p>}
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
