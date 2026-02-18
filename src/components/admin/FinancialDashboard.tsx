import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  user_id: string | null;
  course_id: string | null;
  amount: number;
  payment_method: string | null;
  payment_service: string | null;
  status: string;
  created_at: string;
  courses_new?: {
    title: string;
    title_ar: string | null;
  } | null;
  profiles?: {
    full_name: string | null;
    full_name_ar: string | null;
  } | null;
}

interface Stats {
  total_revenue: number;
  total_transactions: number;
  pending_transactions: number;
}

export function FinancialDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({ total_revenue: 0, total_transactions: 0, pending_transactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch transactions with related course and user data
    const { data: transactionsData, error: transError } = await supabase
      .from('transactions')
      .select(`
        *,
        courses_new (title, title_ar),
        profiles (full_name, full_name_ar)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (transError) {
      console.error("Error fetching transactions:", transError);
      toast.error("Failed to load transactions");
    } else {
      setTransactions(transactionsData || []);

      // Calculate stats
      const total = transactionsData?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const pending = transactionsData?.filter(t => t.status === 'pending').length || 0;

      setStats({
        total_revenue: total,
        total_transactions: transactionsData?.length || 0,
        pending_transactions: pending
      });
    }

    setLoading(false);
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_transactions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_transactions}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial transactions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {(transaction.courses_new as any)?.title || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {(transaction.profiles as any)?.full_name || 
                           (transaction.profiles as any)?.full_name_ar || 
                           'Unknown'}
                        </TableCell>
                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">
                          {transaction.payment_method || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
