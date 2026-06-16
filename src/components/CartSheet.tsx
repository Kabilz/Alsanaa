import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  Loader2,
  Smartphone,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function CartSheet() {
  const { items, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (user && isOpen) {
      fetchWalletBalance();
    }
  }, [user, isOpen]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();
    if (data) {
      setWalletBalance((data as any).wallet_balance || 0);
    }
  };

  // ─── Shared: complete purchase in DB after payment ───────────────────────
  const completePurchase = async () => {
    if (!user) return;

    // Check for already-purchased courses
    const courseIds = items.map((item) => item.id);
    const { data: existingPurchases, error: checkError } = await supabase
      .from("course_purchases")
      .select("course_id")
      .eq("user_id", user.id)
      .in("course_id", courseIds);

    if (checkError) throw new Error("فشل في التحقق من المشتريات السابقة");
    if (existingPurchases && existingPurchases.length > 0) {
      throw new Error("لقد قمت بشراء بعض هذه الدورات مسبقاً. يرجى إزالتها من السلة.");
    }

      // Deduct from wallet
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: walletBalance - totalPrice } as any)
        .eq("id", user.id);
      if (updateError) throw new Error("فشل في خصم الرصيد");

    // Insert purchases
    const purchases = items.map((item) => ({
      user_id: user.id,
      course_id: item.id,
      price_paid: item.price,
    }));
    const { error: insertPurchasesError } = await supabase
      .from("course_purchases")
      .insert(purchases as any);

    if (insertPurchasesError) {
      // Rollback wallet if needed
      await supabase
        .from("profiles")
        .update({ wallet_balance: walletBalance } as any)
        .eq("id", user.id);
      throw new Error("فشل في تسجيل عملية الشراء");
    }

    // Record transactions
    const transactions = items.map((item) => ({
      user_id: user.id,
      course_id: item.id,
      amount: item.price,
      payment_method: "wallet",
      status: "completed",
    }));

    const { data: txResults, error: transactionError } = await supabase
      .from("transactions")
      .insert(transactions as any)
      .select("id, course_id");

    if (transactionError) {
      console.error("Transaction record error:", transactionError);
    }

    // Credit teacher earnings
    for (const item of items) {
      if (item.price <= 0) continue;
      try {
        const matchingTx = txResults?.find((tx: any) => tx.course_id === item.id);
        await (supabase.rpc as any)("credit_teacher_earning", {
          p_course_id: item.id,
          p_pdf_id: null,
          p_transaction_id: matchingTx?.id || null,
          p_price_paid: item.price,
        });
      } catch (err) {
        console.error("Teacher earnings error:", item.id, err);
      }
    }
  };

  // ─── Wallet checkout ──────────────────────────────────────────────────────
  const handleWalletCheckout = async () => {
    if (!user) {
      toast.error("الرجاء تسجيل الدخول لإتمام الشراء");
      setIsOpen(false);
      navigate("/login");
      return;
    }
    if (totalPrice > walletBalance) {
      toast.error(
        `رصيد المحفظة غير كافٍ. تحتاج إلى ${(totalPrice - walletBalance).toFixed(2)} د.ل إضافية.`
      );
      return;
    }

    setIsCheckingOut(true);
    try {
      await completePurchase();
      toast.success("تم شراء الدورات بنجاح!");
      clearCart();
      setIsOpen(false);
      navigate("/courses");
    } catch (error: any) {
      toast.error(error.message || "فشل في إتمام الشراء.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-teal-400 hover:bg-slate-800">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[320px] sm:max-w-md bg-slate-900 border-l border-teal-900/50 flex flex-col pt-12 z-[100]" dir="rtl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
            <ShoppingCart className="h-5 w-5 text-teal-400" />
            سلة المشتريات
          </SheetTitle>
        </SheetHeader>

        {totalItems === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <ShoppingCart className="h-16 w-16 text-slate-700" />
            <p>سلة المشتريات فارغة</p>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="mt-4 border-teal-900/50 text-teal-400 hover:bg-teal-950/30">
              تصفح الدورات
            </Button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="h-16 w-16 sm:w-20 rounded-md overflow-hidden bg-slate-800 shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-teal-900/40 to-cyan-900/40" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div>
                        <h4 className="text-sm font-medium text-white line-clamp-1">{item.title}</h4>
                        {item.teacher_name && <p className="text-xs text-slate-400 mt-1">{item.teacher_name}</p>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-teal-400">{item.price.toFixed(2)} د.ل</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Summary + Checkout */}
            <div className="border-t border-slate-800 pt-4 mt-auto space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-slate-300">
                <span>الإجمالي</span>
                <span className="text-xl font-bold text-white">{totalPrice.toFixed(2)} د.ل</span>
              </div>

              {/* ── Wallet method ── */}
              {user ? (
                <div className="flex items-center justify-between text-sm bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center text-slate-300">
                    <CreditCard className="w-5 h-5 ml-2 text-teal-400" />
                    رصيد المحفظة
                  </div>
                  <span className={`font-bold pl-2 ${walletBalance >= totalPrice ? "text-white" : "text-red-400"}`}>
                    {walletBalance.toFixed(2)} د.ل
                  </span>
                </div>
              ) : (
                <div className="text-sm text-amber-400 bg-amber-500/10 p-2 rounded text-center">
                  يرجى تسجيل الدخول لإتمام الشراء
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/20"
                size="lg"
                disabled={isCheckingOut || (user ? walletBalance < totalPrice : false)}
                onClick={handleWalletCheckout}
              >
                {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <CreditCard className="h-5 w-5 ml-2" />}
                إتمام الشراء بالرصيد
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
