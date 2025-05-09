
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppData } from '@/contexts/AppDataContext';
import type { Category, Transaction, Budget, ChartData } from '@/lib/types';
import { getIconComponent } from '@/lib/constants';
import { TrendingDown, PiggyBank, ListChecks, CircleDollarSign, Loader2 } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function DashboardPage() {
  const { transactions, categories, budgets } = useAppData();
  const [isLoading, setIsLoading] = useState(true);

  const [totalExpensesMonth, setTotalExpensesMonth] = useState<number>(0);
  const [totalBudgetMonth, setTotalBudgetMonth] = useState<number>(0);
  const [remainingBudgetMonth, setRemainingBudgetMonth] = useState<number>(0);
  const [spendingByCategoryChartData, setSpendingByCategoryChartData] = useState<ChartData[]>([]);
  const [chartConfig, setChartConfig] = useState<any>({});
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState<Array<Budget & { spentAmount: number, progress: number, categoryName: string, IconComponent: React.ElementType }>>([]);


  useEffect(() => {
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const monthlyTransactions = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), { start: currentMonthStart, end: currentMonthEnd })
    );

    const calculatedTotalExpensesMonth = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    setTotalExpensesMonth(calculatedTotalExpensesMonth);
    
    const calculatedTotalBudgetMonth = budgets.reduce((sum, b) => sum + b.amount, 0);
    setTotalBudgetMonth(calculatedTotalBudgetMonth);

    setRemainingBudgetMonth(calculatedTotalBudgetMonth - calculatedTotalExpensesMonth);

    const categoryExpensesMap = new Map<string, number>();
    monthlyTransactions.forEach(t => {
        if (t.categoryId) {
            categoryExpensesMap.set(t.categoryId, (categoryExpensesMap.get(t.categoryId) || 0) + t.amount);
        }
    });

    const calculatedSpendingByCategoryChartData: ChartData[] = Array.from(categoryExpensesMap.entries())
        .map(([categoryId, total]) => {
            const category = categories.find(c => c.id === categoryId);
            return { name: category?.name || 'Uncategorized', value: total };
        })
        .filter(c => c.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    setSpendingByCategoryChartData(calculatedSpendingByCategoryChartData);

    const newChartConfig = calculatedSpendingByCategoryChartData.reduce((config, item, index) => {
      const colorVar = `--chart-${(index % 5) + 1}`;
      config[item.name] = {
        label: item.name,
        color: `hsl(var(${colorVar}))`,
      };
      return config;
    }, {} as any);
    setChartConfig(newChartConfig);

    setRecentTransactions(transactions.slice(0, 5));

    const calculatedMonthlyBudgets = budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const spentAmount = monthlyTransactions
        .filter(t => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const progress = budget.amount > 0 ? Math.min((spentAmount / budget.amount) * 100, 100) : 0;
      const IconComponent = category ? getIconComponent(category.icon) : PiggyBank;
      return {
        ...budget,
        spentAmount,
        progress,
        categoryName: category?.name || 'Uncategorized Budget',
        IconComponent
      };
    });
    setMonthlyBudgets(calculatedMonthlyBudgets);

    setIsLoading(false);
  }, [transactions, categories, budgets]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
            <p className="text-xs text-muted-foreground">Current month&apos;s spending</p>
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
              {totalBudgetMonth > 0 
                ? `${Math.round((totalExpensesMonth / totalBudgetMonth) * 100)}% spent` 
                : 'No budget set'}
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
          <CardContent className="h-[350px] p-2 pr-4">
            {spendingByCategoryChartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart accessibilityLayer data={spendingByCategoryChartData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--muted))'}} />
                  <Bar dataKey="value" radius={4} layout="vertical">
                    {spendingByCategoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color || 'hsl(var(--primary))'} />
                    ))}
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
          {monthlyBudgets.length > 0 ? (
            <div className="space-y-4">
              {monthlyBudgets.map(budget => {
                const { IconComponent, categoryName, spentAmount, amount, progress } = budget;
                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
                        <span className="font-medium">{categoryName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(spentAmount)} / {formatCurrency(amount)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" indicatorClassName={progress > 100 ? "bg-destructive" : "bg-primary"} />
                    {progress > 100 && <p className="text-xs text-destructive mt-1">Overspent by {formatCurrency(spentAmount - amount)}</p>}
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
