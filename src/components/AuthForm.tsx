import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, BookOpen, GraduationCap, Users } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back!");
      } else {
        // Sign up the user
        const { data, error } = await signUp(email, password);
        
        if (error) throw error;
        
        // Update/Create profile with selected role
        if (data?.user) {
          const { error: profileError } = await (supabase
            .from('profiles') as any)
            .upsert({ 
              id: data.user.id,
              role: accountType === 'teacher' ? 'teacher' : 'customer',
              full_name: fullName
            });

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }

          // If teacher, create teacher profile
          if (accountType === 'teacher') {
            const { error: teacherError } = await (supabase
              .from('teachers') as any)
              .insert({ id: data.user.id });
            
            // Ignore duplicate key errors (teacher profile already exists)
            if (teacherError && !teacherError.message.includes('duplicate')) {
              console.error('Error creating teacher profile:', teacherError);
            }
          }
        }

        toast.success("Account created! You can now sign in.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Academy
          </h1>
          <p className="text-gray-400 mt-2">
            {isLogin ? "Welcome back!" : "Start your learning journey"}
          </p>
        </div>

        <Card className="border-teal-900/50 bg-slate-900/50 backdrop-blur shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">
              {isLogin ? "Sign in" : "Create account"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Create an account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-slate-950/50 border-slate-700 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-300">Account Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAccountType("student")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          accountType === "student"
                            ? "border-teal-500 bg-teal-950/50"
                            : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
                        }`}
                      >
                        <Users className={`h-6 w-6 mx-auto mb-2 ${
                          accountType === "student" ? "text-teal-400" : "text-gray-500"
                        }`} />
                        <p className={`font-semibold ${
                          accountType === "student" ? "text-teal-400" : "text-gray-300"
                        }`}>
                          Student
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Learn from courses</p>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setAccountType("teacher")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          accountType === "teacher"
                            ? "border-cyan-500 bg-cyan-950/50"
                            : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
                        }`}
                      >
                        <GraduationCap className={`h-6 w-6 mx-auto mb-2 ${
                          accountType === "teacher" ? "text-cyan-400" : "text-gray-500"
                        }`} />
                        <p className={`font-semibold ${
                          accountType === "teacher" ? "text-cyan-400" : "text-gray-300"
                        }`}>
                          Teacher
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Create & sell courses</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-950/50 border-slate-700 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-slate-950/50 border-slate-700 text-white placeholder:text-gray-500"
                />
                {!isLogin && (
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
