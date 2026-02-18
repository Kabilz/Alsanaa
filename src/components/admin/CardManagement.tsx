import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Download } from "lucide-react";
import { toast } from "sonner";

interface PrepaidCard {
  id: string;
  serial_number: string;
  secret_code: string;
  value: number;
  status: string;
  used_by_user_id: string | null;
  used_at: string | null;
  created_at: string;
}

export function CardManagement() {
  const [cards, setCards] = useState<PrepaidCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [cardValue, setCardValue] = useState("10");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prepaid_cards')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching cards:", error);
      toast.error("Failed to load cards");
    } else {
      setCards(data || []);
    }
    setLoading(false);
  };

  const generateCards = async () => {
    setGenerating(true);
    const qty = parseInt(quantity);
    const value = parseFloat(cardValue);

    if (isNaN(qty) || qty < 1 || qty > 100) {
      toast.error("Invalid quantity (1-100)");
      setGenerating(false);
      return;
    }

    if (isNaN(value) || value < 1) {
      toast.error("Invalid card value");
      setGenerating(false);
      return;
    }

    const newCards = [];
    for (let i = 0; i < qty; i++) {
      const serial = `AC-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const secret = Math.random().toString(36).substring(2, 15).toUpperCase();
      
      newCards.push({
        serial_number: serial,
        secret_code: secret,
        value: value,
        status: 'active'
      });
    }

    const { error } = await supabase
      .from('prepaid_cards')
      .insert(newCards);

    if (error) {
      console.error("Error generating cards:", error);
      toast.error("Failed to generate cards");
    } else {
      toast.success(`Successfully generated ${qty} card(s)`);
      setOpenDialog(false);
      fetchCards();
    }

    setGenerating(false);
  };

  const exportToCSV = () => {
    const csv = [
      ['Serial Number', 'Secret Code', 'Value', 'Status', 'Created Date'].join(','),
      ...cards.map(card => [
        card.serial_number,
        card.secret_code,
        card.value,
        card.status,
        new Date(card.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `cards_${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Cards exported to CSV");
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'used': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prepaid Card Management</CardTitle>
            <CardDescription>Generate and manage prepaid cards for course purchases</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} disabled={cards.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Cards
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Prepaid Cards</DialogTitle>
                  <DialogDescription>
                    Create new prepaid cards with specified value
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="value">Card Value ($)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={cardValue}
                      onChange={(e) => setCardValue(e.target.value)}
                      placeholder="10.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity (1-100)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={generateCards} disabled={generating}>
                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
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
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Secret Code</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No cards generated yet
                    </TableCell>
                  </TableRow>
                ) : (
                  cards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-mono">{card.serial_number}</TableCell>
                      <TableCell className="font-mono">{card.secret_code}</TableCell>
                      <TableCell>${card.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(card.status)}>
                          {card.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(card.created_at).toLocaleDateString()}
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
  );
}
