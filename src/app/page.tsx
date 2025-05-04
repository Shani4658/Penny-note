
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, TrendingDown, Landmark, PiggyBank, Wallet, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Expense, DebtCredit } from '@/types'; // Assuming types are defined
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function Home() {
  // --- State for data from localStorage ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debtCredits, setDebtCredits] = useState<DebtCredit[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [budgetInput, setBudgetInput] = useState<string>(''); // For the input field
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // --- Function to Simulate Update After Payment ---
  const simulateUpdateAfterPayment = () => {
    // Simulate getting new data from payment
    const newExpenses = [
      { id: 'new-exp-1', category: 'Groceries', description: 'Weekly shopping', amount: 75.50, date: new Date() },
      { id: 'new-exp-2', category: 'Dining', description: 'Dinner with friends', amount: 45.00, date: new Date() },
    ];
    const newDebtCredits = [
      { id: 'new-dc-1', person: 'Alice', description: 'Loan repayment', amount: 100.00, type: 'credit', date: new Date() },
      { id: 'new-dc-2', person: 'Bob', description: 'Borrowed for movie tickets', amount: 20.00, type: 'debt', date: new Date() },
    ];
    const newBudget = 1500;

    // Update localStorage
    try {
      localStorage.setItem('pennywise_expenses', JSON.stringify([...expenses, ...newExpenses]));
      localStorage.setItem('pennywise_debtcredits', JSON.stringify([...debtCredits, ...newDebtCredits]));
      localStorage.setItem('pennywise_budget', newBudget.toString());
      toast({
        title: 'Updated After Payment',
        description: 'The data was updated.',
      });
    } catch (error) {
      console.error('Failed to save new data to local storage:', error);
      toast({
        title: 'Error Updating Data',
        description: 'Could not update the data.',
        variant: 'destructive',
      });
    }
  };

  // --- Load data from localStorage ---
  useEffect(() => {
    setLoading(true);
    let loadedExpenses: Expense[] = [];
    let loadedDebtCredits: DebtCredit[] = [];
    let loadedBudget: number = 0;

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
      }
    }

    // Load Budget
    const storedBudget = localStorage.getItem('pennywise_budget');
    if (storedBudget) {
        try {
            const parsedBudget = parseFloat(storedBudget);
            if (!isNaN(parsedBudget) && parsedBudget >= 0) {
                loadedBudget = parsedBudget;
            }
        } catch (error) {
            console.error("Failed to parse budget from local storage:", error);
        }
    }

    // Sort data by date descending before setting state
    loadedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
    loadedDebtCredits.sort((a, b) => b.date.getTime() - a.date.getTime());


    setExpenses(loadedExpenses);
    setDebtCredits(loadedDebtCredits);
    setTotalBudget(loadedBudget);
    setBudgetInput(loadedBudget.toString()); // Initialize input field
    setLoading(false);

    // --- Add event listeners to update summary when storage changes ---

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key && (event.key.startsWith('pennywise') )) {
          simulateUpdateAfterPayment();
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
  const netDebtCreditPosition = totalOwedToYou - totalYouOwe;
  const availableBalance = totalBudget - totalExpenses;

  // --- Formatting Function ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // --- Budget Handling ---
  const handleSetBudget = () => {
    const newBudgetValue = parseFloat(budgetInput);
    if (!isNaN(newBudgetValue) && newBudgetValue >= 0) {
        setTotalBudget(newBudgetValue);
        try {
            localStorage.setItem('pennywise_budget', newBudgetValue.toString());
            toast({
                title: 'Budget Updated',
                description: `Total budget set to ${formatCurrency(newBudgetValue)}.`,
            });
        } catch (error) {
            console.error("Failed to save budget to local storage:", error);
             toast({
                title: 'Error Saving Budget',
                description: 'Could not save the budget.',
                variant: 'destructive',
            });
        }
    } else {
      toast({
        title: 'Invalid Budget Amount',
        description: 'Please enter a valid non-negative number for the budget.',
        variant: 'destructive',
      });
       // Reset input to current budget if invalid
       setBudgetInput(totalBudget.toString());
    }
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

       {/* Budget Overview Card */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                 <PiggyBank className="h-6 w-6" />
                 Budget Overview
                 </CardTitle>
                 <CardDescription>Set your total budget and track your spending against it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <Label htmlFor="budget" className="whitespace-nowrap font-medium">Total Budget:</Label>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                            id="budget"
                            type="number"
                            placeholder="Enter total budget"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            onBlur={handleSetBudget} // Optionally save on blur
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSetBudget(); }}
                            className="max-w-[150px]"
                            min="0"
                            step="1"
                        />
                        <Button onClick={handleSetBudget}>Set Budget</Button>
                    </div>
                 </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                     <div className="flex items-center gap-3 p-4 border rounded-lg">
                         <Wallet className="h-6 w-6 text-muted-foreground" />
                         <div>
                            <p className="text-sm text-muted-foreground">Available Balance</p>
                            <p className={`text-xl font-bold ${availableBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                {formatCurrency(availableBalance)}
                            </p>
                         </div>
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Info className="h-4 w-4 text-muted-foreground ml-auto cursor-help" />
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Total Budget minus Total Expenses.</p>
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                     </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                         <DollarSign className="h-6 w-6 text-muted-foreground" />
                         <div>
                            <p className="text-sm text-muted-foreground">Total Spent</p>
                            <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
                         </div>
                          <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Info className="h-4 w-4 text-muted-foreground ml-auto cursor-help" />
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Sum of all recorded expenses.</p>
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                     </div>
                </div>
            </CardContent>
        </Card>

        {/* Update after payment button */}
        <Button id='update-payment-button' onClick={simulateUpdateAfterPayment}>Update after payment</Button>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Changed grid to 3 cols */}

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

        {/* Net Debt/Credit Position Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Debt/Credit</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netDebtCreditPosition >= 0 ? 'text-accent-foreground' : 'text-destructive'}`}>
              {formatCurrency(netDebtCreditPosition)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netDebtCreditPosition >= 0 ? 'Overall debt/credit is positive' : 'Overall debt/credit is negative'}
            </p>
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Info className="h-3 w-3 text-muted-foreground mt-1 cursor-help" />
                 </TooltipTrigger>
                 <TooltipContent>
                   <p>'Owed to You' minus 'You Owe'.</p>
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
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

