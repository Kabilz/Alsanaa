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

// ─── Payment Method ────────────────────────────────────────────────────────────
type PaymentMethod = "wallet" | "edfali";

// ─── Edfali flow steps ────────────────────────────────────────────────────────
type EdfaliStep = "phone" | "pin" | "done";

export function CartSheet() {
  const { items, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // ── Payment method state ───────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");

  // ── Edfali two-step state ──────────────────────────────────────────────────
  const [edfaliStep, setEdfaliStep] = useState<EdfaliStep>("phone");
  const [customerPhone, setCustomerPhone] = useState("");
  const [smsPin, setSmsPin] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [edfaliLoading, setEdfaliLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchWalletBalance();
    }
  }, [user, isOpen]);

  // Reset Edfali state when sheet closes or method changes
  useEffect(() => {
    if (!isOpen) {
      setEdfaliStep("phone");
      setCustomerPhone("");
      setSmsPin("");
      setSessionId("");
      setEdfaliLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (paymentMethod === "wallet") {
      setEdfaliStep("phone");
      setCustomerPhone("");
      setSmsPin("");
      setSessionId("");
    }
  }, [paymentMethod]);

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
  const completePurchase = async (method: PaymentMethod) => {
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

    if (method === "wallet") {
      // Deduct from wallet
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: walletBalance - totalPrice } as any)
        .eq("id", user.id);
      if (updateError) throw new Error("فشل في خصم الرصيد");
    }

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
      if (method === "wallet") {
        await supabase
          .from("profiles")
          .update({ wallet_balance: walletBalance } as any)
          .eq("id", user.id);
      }
      throw new Error("فشل في تسجيل عملية الشراء");
    }

    // Record transactions
    const transactions = items.map((item) => ({
      user_id: user.id,
      course_id: item.id,
      amount: item.price,
      payment_method: method === "edfali" ? "edfali" : "wallet",
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
      await completePurchase("wallet");
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

  // ─── Edfali Step 1: initiate ──────────────────────────────────────────────
  const handleEdfaliInit = async () => {
    if (!user) {
      toast.error("الرجاء تسجيل الدخول أولاً");
      navigate("/login");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("يرجى إدخال رقم هاتفك");
      return;
    }

    setEdfaliLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("edfali-init", {
        body: { customerPhone: customerPhone.trim(), amount: totalPrice },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setSessionId(data.sessionId);
      setEdfaliStep("pin");
      toast.success("تم إرسال رمز التأكيد إلى هاتفك عبر الرسائل القصيرة");
    } catch (err: any) {
      toast.error(err.message || "فشل إرسال طلب الدفع");
    } finally {
      setEdfaliLoading(false);
    }
  };

  // ─── Edfali Step 2: confirm ───────────────────────────────────────────────
  const handleEdfaliConfirm = async () => {
    if (!smsPin.trim() || smsPin.trim().length !== 4) {
      toast.error("يرجى إدخال رمز التأكيد المكون من 4 أرقام");
      return;
    }

    setEdfaliLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("edfali-confirm", {
        body: { customerPhone: customerPhone.trim(), smsPin: smsPin.trim(), sessionId },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.ok) throw new Error("فشل تأكيد الدفع");

      // Payment confirmed — complete purchase in DB
      await completePurchase("edfali");
      setEdfaliStep("done");
      toast.success("تمت عملية الدفع بنجاح! 🎉");
      clearCart();
      setTimeout(() => {
        setIsOpen(false);
        navigate("/courses");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "فشل تأكيد الدفع");
    } finally {
      setEdfaliLoading(false);
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

              {/* Payment method selector */}
              {user && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("wallet")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      paymentMethod === "wallet"
                        ? "border-teal-500 bg-teal-500/10 text-teal-400"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Wallet className="h-5 w-5" />
                    المحفظة
                  </button>
                  <button
                    onClick={() => setPaymentMethod("edfali")}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      paymentMethod === "edfali"
                        ? "border-amber-500 bg-amber-500/10 text-amber-400"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                    ادفع لي
                  </button>
                </div>
              )}

              {/* ── Wallet method ── */}
              {paymentMethod === "wallet" && (
                <>
                  {user ? (
                    <div className="flex items-center justify-between text-sm bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center text-slate-300">
                        <CreditCard className="w-5 h-5 ml-2 text-indigo-400" />
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
                    إتمام الشراء بالمحفظة
                  </Button>
                </>
              )}

              {/* ── Edfali method ── */}
              {paymentMethod === "edfali" && user && (
                <div className="space-y-3">
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${edfaliStep !== "phone" ? "bg-amber-500 text-slate-900" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"}`}>1</div>
                    <div className={`flex-1 h-px ${edfaliStep === "pin" || edfaliStep === "done" ? "bg-amber-500" : "bg-slate-700"}`} />
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${edfaliStep === "done" ? "bg-amber-500 text-slate-900" : edfaliStep === "pin" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-slate-800 text-slate-600 border border-slate-700"}`}>2</div>
                    <div className={`flex-1 h-px ${edfaliStep === "done" ? "bg-amber-500" : "bg-slate-700"}`} />
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${edfaliStep === "done" ? "bg-green-500 text-white" : "bg-slate-800 text-slate-600 border border-slate-700"}`}>✓</div>
                  </div>

                  {/* Step 1: Enter phone */}
                  {edfaliStep === "phone" && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                        <Smartphone className="h-4 w-4" />
                        أدخل رقم هاتفك
                      </div>
                      <p className="text-xs text-slate-400">
                        أدخل رقم هاتفك المسجل في ادفع لي. سيصلك رمز تأكيد عبر SMS.
                      </p>
                      <Input
                        type="tel"
                        placeholder="09XXXXXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-right"
                        dir="ltr"
                        maxLength={13}
                        disabled={edfaliLoading}
                      />
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold shadow-lg shadow-amber-500/20"
                        onClick={handleEdfaliInit}
                        disabled={edfaliLoading || !customerPhone.trim()}
                      >
                        {edfaliLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        ) : (
                          <Smartphone className="h-4 w-4 ml-2" />
                        )}
                        {edfaliLoading ? "جاري الإرسال..." : `إرسال رمز التأكيد • ${totalPrice.toFixed(2)} د.ل`}
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Enter SMS PIN */}
                  {edfaliStep === "pin" && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                        <KeyRound className="h-4 w-4" />
                        أدخل رمز التأكيد
                      </div>
                      <p className="text-xs text-slate-400">
                        تم إرسال رمز مكون من 4 أرقام إلى <span className="text-white font-medium">{customerPhone}</span>
                      </p>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="XXXX"
                        value={smsPin}
                        onChange={(e) => setSmsPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-center tracking-[0.5em] text-xl font-bold"
                        maxLength={4}
                        disabled={edfaliLoading}
                        dir="ltr"
                      />
                      <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold shadow-lg shadow-amber-500/20"
                        onClick={handleEdfaliConfirm}
                        disabled={edfaliLoading || smsPin.length !== 4}
                      >
                        {edfaliLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                        )}
                        {edfaliLoading ? "جاري التأكيد..." : "تأكيد الدفع"}
                      </Button>
                      <button
                        onClick={() => { setEdfaliStep("phone"); setSmsPin(""); setSessionId(""); }}
                        className="w-full text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 pt-1"
                        disabled={edfaliLoading}
                      >
                        <ArrowLeft className="h-3 w-3" />
                        تغيير رقم الهاتف
                      </button>
                    </div>
                  )}

                  {/* Step 3: Done */}
                  {edfaliStep === "done" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 flex flex-col items-center gap-3">
                      <CheckCircle2 className="h-12 w-12 text-green-400" />
                      <p className="text-green-400 font-bold text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        تمت عملية الدفع بنجاح!
                      </p>
                      <p className="text-xs text-slate-400 text-center">جاري تحويلك إلى صفحة الدورات...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
