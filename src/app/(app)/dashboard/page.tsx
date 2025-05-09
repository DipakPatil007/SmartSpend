"use client";

import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppData } from '@/contexts/AppDataContext';
import type { Category, Transaction, Budget, ChartData } from '@/lib/types';
import { getIconComponent } from '@/lib/constants';
import { TrendingUp, TrendingDown, PiggyBank, ListChecks, CircleDollarSign } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function DashboardPage() {
  const { transactions, categories, budgets } = useAppData();

  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const monthlyTransactions = transactions.filter(t => 
    isWithinInterval(parseISO(t.date), { start: currentMonthStart, end: currentMonthEnd })
  );

  const totalExpensesMonth = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const totalBudgetMonth = budgets.reduce((sum, b) => sum + b.amount, 0);
  const remainingBudgetMonth = totalBudgetMonth - totalExpensesMonth;

  const spendingByCategoryChartData: ChartData[] = categories.map(category => {
    const categoryExpenses = monthlyTransactions
      .filter(t => t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: category.name, value: categoryExpenses };
  }).filter(c => c.value > 0)
  .sort((a, b) => b.value - a.value) // Sort by value descending
  .slice(0, 5); // Top 5 categories

  const chartConfig = spendingByCategoryChartData.reduce((config, item) => {
    // Use a simple color generation or predefined palette for dynamic items
    // For now, let's use a placeholder color from CSS vars
    const colorVar = `--chart-${(spendingByCategoryChartData.indexOf(item) % 5) + 1}`;
    config[item.name] = {
      label: item.name,
      color: `hsl(var(${colorVar}))`,
    };
    return config;
  }, {} as any);


  const recentTransactions = transactions.slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" description="Your financial overview for this month." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (Month)</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpensesMonth)}</div>
            <p className="text-xs text-muted-foreground">Compared to last month (N/A)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget (Month)</CardTitle>
            <PiggyBank className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgetMonth)}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudgetMonth > 0 ? `${Math.round((totalExpensesMonth / totalBudgetMonth) * 100)}% spent` : 'No budget set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget (Month)</CardTitle>
            <CircleDollarSign className={`h-5 w-5 ${remainingBudgetMonth >= 0 ? 'text-accent' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudgetMonth >= 0 ? 'text-accent-foreground' : 'text-destructive-foreground'}`}>
              {formatCurrency(remainingBudgetMonth)}
            </div>
            {totalBudgetMonth > 0 && (
              <Progress value={(totalExpensesMonth / totalBudgetMonth) * 100} className="mt-2 h-2" indicatorClassName={remainingBudgetMonth < 0 ? "bg-destructive" : "bg-primary"}/>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Spending by Category (Month)</CardTitle>
            <CardDescription>Top 5 spending categories this month.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] p-2">
            {spendingByCategoryChartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart accessibilityLayer data={spendingByCategoryChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={4}>
                     {/* Removed individual fill - relies on ChartContainer config or default recharts behavior */}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No spending data for this month.</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your last 5 transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map(transaction => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  const Icon = category ? getIconComponent(category.icon) : ListChecks;
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium truncate max-w-xs">{transaction.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                          {category?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground py-10">No transactions yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Budget Goals Progress</CardTitle>
          <CardDescription>Overview of your current budget goals for the month.</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map(budget => {
                const category = categories.find(c => c.id === budget.categoryId);
                const spentAmount = monthlyTransactions
                  .filter(t => t.categoryId === budget.categoryId)
                  .reduce((sum, t) => sum + t.amount, 0);
                const progress = budget.amount > 0 ? Math.min((spentAmount / budget.amount) * 100, 100) : 0;
                const Icon = category ? getIconComponent(category.icon) : PiggyBank;

                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5 text-primary" />}
                        <span className="font-medium">{category?.name || 'Uncategorized Budget'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(spentAmount)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" indicatorClassName={progress > 100 ? "bg-destructive" : "bg-primary"} />
                    {progress > 100 && <p className="text-xs text-destructive mt-1">Overspent by {formatCurrency(spentAmount - budget.amount)}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
             <div className="flex items-center justify-center h-full text-muted-foreground py-10">No budgets set for this month.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
