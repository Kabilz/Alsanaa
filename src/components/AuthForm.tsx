import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success(t('auth.signed_in'));
      } else {
        const { data, error } = await signUp(email, password);
        
        if (error) throw error;
        
        if (data?.user) {
          const { error: profileError } = await (supabase
            .from('profiles') as any)
            .upsert({ 
              id: data.user.id,
              role: 'customer',
              full_name: fullName
            });

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
        }

        toast.success(t('auth.account_created'));
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error("حدث خطأ أثناء المصادقة. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background Decorators */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-teal-900/20 to-transparent" />
         <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -z-10" />
         <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 mb-6 shadow-xl shadow-teal-500/10">
            <BookOpen className="w-10 h-10 text-teal-400" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t('nav.academy')}
          </h1>
          <p className="text-slate-400 text-lg">
            {isLogin ? "الرجاء تسجيل الدخول للمتابعة" : "ابدأ رحلة التعلم الخاصة بك اليوم"}
          </p>
        </div>

        <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur-xl shadow-2xl p-2 sm:p-4 rounded-3xl">
          <CardHeader className="space-y-2 pb-6 text-center">
            <CardTitle className="text-2xl text-white font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              {isLogin ? "مرحباً بعودتك! أَدخِل بياناتك للوصول لحسابك." : "أَدخِل بياناتك لإنشاء حساب والبدء في التعلم."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-4 animate-slide-up">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-300 font-semibold">{t('auth.full_name')}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="أحمد محمد"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-slate-950/80 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 h-12"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-semibold">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ahmed@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="bg-slate-950/80 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 h-12 text-left"
                />
              </div>

              <div className="space-y-2 pb-2">
                <Label htmlFor="password" className="text-slate-300 font-semibold">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  minLength={6}
                  className="bg-slate-950/80 border-slate-700/50 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 h-12 text-left"
                />
                {!isLogin && (
                  <p className="text-xs text-slate-500 mt-2">{t('auth.min_chars')}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 transition-all rounded-xl"
                disabled={loading}
              >
                {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : null}
                {!loading && (isLogin ? "تسجيل الدخول" : "إنشاء حساب")}
                {loading && "جاري المعالجة..."}
              </Button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
              <span className="text-slate-400 ml-2">
                {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
              </span>
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setPassword(""); }}
                className="text-teal-400 hover:text-teal-300 font-bold underline decoration-teal-500/30 underline-offset-4 transition-colors focus:outline-none"
              >
                {isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
