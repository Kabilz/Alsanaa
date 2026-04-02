import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, ArrowRight, BookOpen, RefreshCw, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { t } = useTranslation();

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", id);
      
      if (error) {
        toast.error("فشل تحميل الاختبار");
      } else {
        const parsedQuestions = data?.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        })) || [];
        setQuestions(parsedQuestions);
      }
      setLoading(false);
    };

    fetchQuizzes();
  }, [id]);

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(parseInt(value));
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnswers({ ...answers, [currentQuestion.id]: selectedAnswer });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setAnswers({});
  };

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
            <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
        </div>
     )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navigation />
        <div className="container py-20 max-w-2xl mx-auto text-center animate-fade-in relative z-10">
          <Card className="bg-slate-900/50 border-teal-900/30 backdrop-blur-xl shadow-2xl p-6 sm:p-10 rounded-3xl">
            <CardContent className="pt-8">
               <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                  <BookOpen className="h-10 w-10 text-slate-500" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>لا يوجد اختبار متاح</h3>
               <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">عذرًا، لا يتوفر اختبار تقييمي لهذه الدورة في الوقت الحالي.</p>
               <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 font-bold gap-2 px-8 h-12 text-md" onClick={() => navigate(`/courses/${id}`)}>
                  <ArrowRight className="h-4 w-4" />
                  العودة لمعلومات الدورة
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-teal-900/10 to-transparent" />
         <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      </div>

      <Navigation />

      <main className="container py-8 max-w-3xl mx-auto relative z-10">
        {showResults ? (
           <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur-xl shadow-2xl rounded-3xl animate-slide-up text-center overflow-hidden">
             <CardHeader className="pt-10 pb-6 border-b border-slate-800/50 bg-slate-900/50">
               <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center border border-teal-500/30 shadow-lg shadow-teal-500/10">
                   <Trophy className="h-12 w-12 text-teal-400" />
               </div>
               <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: "'Cairo', sans-serif" }}>
                 النتيجة النهائية
               </CardTitle>
             </CardHeader>

             <CardContent className="pt-8 px-6 sm:px-12">
                <div className="mb-10 p-8 rounded-3xl bg-slate-950/50 border border-slate-800/50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-6xl sm:text-7xl font-black mb-3 text-white flex items-center justify-center gap-1 group-hover:scale-105 transition-transform duration-500">
                        {Math.round((score / questions.length) * 100)}<span className="text-3xl sm:text-4xl text-teal-500">%</span>
                    </p>
                    <p className="text-slate-400 text-lg sm:text-xl font-medium">
                        لقد أجبت بشكل صحيح على <span className="text-teal-400 font-bold">{score}</span> من أصل <span className="text-white font-bold">{questions.length}</span>
                    </p>
                </div>
                
                <div className="space-y-4 text-right">
                    <h4 className="text-white font-bold text-xl mb-4 text-center sm:text-right" style={{ fontFamily: "'Cairo', sans-serif" }}>مراجعة الإجابات:</h4>
                    {questions.map((q, idx) => {
                        const userAnswer = answers[q.id];
                        const isCorrect = userAnswer === q.correct_answer;
                        return (
                            <div key={q.id} className={`p-5 rounded-2xl border transition-colors ${
                                isCorrect 
                                  ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40" 
                                  : "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40"
                              }`}
                            >
                                <p className="font-bold text-slate-200 mb-3 text-lg leading-relaxed">{idx + 1}. {q.question}</p>
                                <div className="flex items-center gap-2 mb-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                                    {isCorrect ? <CheckCircle className="text-emerald-500 h-5 w-5 shrink-0" /> : <XCircle className="text-rose-500 h-5 w-5 shrink-0" />}
                                    <span className="text-slate-300 font-medium leading-relaxed">إجابتك: {q.options[userAnswer]}</span>
                                </div>
                                {!isCorrect && (
                                    <div className="flex items-center gap-2 bg-teal-500/10 p-3 rounded-xl border border-teal-500/20">
                                        <CheckCircle className="text-teal-500 h-5 w-5 shrink-0" />
                                        <span className="text-teal-400 font-semibold leading-relaxed">الإجابة الصحيحة: {q.options[q.correct_answer]}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
             </CardContent>

             <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 py-8 bg-slate-950/30 border-t border-slate-800/50">
                 <Button onClick={handleRetry} className="bg-slate-800 hover:bg-teal-600 text-white font-bold h-12 px-8 rounded-xl w-full sm:w-auto gap-2">
                   <RefreshCw className="w-4 h-4 ml-2" /> إعـادة الاخـتـبـار
                 </Button>
                 <Button className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 h-12 px-8 rounded-xl w-full sm:w-auto gap-2" onClick={() => navigate(`/courses/${id}`)}>
                    العودة لصفحة الدورة <ArrowRight className="h-4 w-4" />
                 </Button>
             </CardFooter>
           </Card>
        ) : (
          <Card className="border-teal-900/40 bg-slate-900/60 backdrop-blur-xl shadow-2xl rounded-3xl animate-fade-in overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-20 pointer-events-none" />
            <CardHeader className="pt-8 pb-4">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-base text-slate-400 font-semibold bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-700/50">
                   السؤال {currentQuestionIndex + 1} <span className="opacity-50">/</span> {questions.length}
                 </span>
                 <span className="text-base font-bold bg-teal-500/10 text-teal-400 px-4 py-1.5 rounded-full border border-teal-500/20 shadow-inner">
                   الرصيد : {score}
                 </span>
               </div>
               
               <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden mb-8 border border-slate-700/50 relative">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-teal-400 to-cyan-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)] rounded-full" 
                    style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                  />
               </div>
               
               <CardTitle className="text-2xl md:text-3xl font-bold text-white leading-relaxed mt-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
                 {questions[currentQuestionIndex].question}
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
               <RadioGroup value={selectedAnswer?.toString()} onValueChange={handleAnswerSelect} className="space-y-4">
                  {questions[currentQuestionIndex].options.map((option, idx) => {
                    const isSelected = selectedAnswer?.toString() === idx.toString();
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-4 border p-4 sm:p-5 rounded-2xl hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm group ${
                          isSelected 
                            ? "bg-teal-500/10 border-teal-500/50 ring-1 ring-teal-500/50 shadow-[0_0_15px_rgba(45,212,191,0.15)]" 
                            : "bg-slate-900/50 border-slate-700"
                        }`}
                        onClick={() => handleAnswerSelect(idx.toString())}
                      >
                        <RadioGroupItem 
                          value={idx.toString()} 
                          id={`option-${idx}`} 
                          className={`w-5 h-5 border-2 ${isSelected ? "border-teal-400 text-teal-400" : "border-slate-500"}`}
                        />
                        <Label 
                          htmlFor={`option-${idx}`} 
                          className={`flex-grow cursor-pointer text-lg ${isSelected ? "text-teal-300 font-bold" : "text-slate-300 font-medium"}`}
                        >
                          {option}
                        </Label>
                      </div>
                    )
                  })}
               </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-end pt-6 border-t border-slate-800/50 bg-slate-950/30 mt-6 p-6">
                <Button 
                  onClick={handleNext} 
                  disabled={selectedAnswer === null}
                  className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-black shadow-lg shadow-teal-500/20 h-14 px-10 text-lg sm:w-auto w-full rounded-xl transition-all disabled:opacity-50 disabled:grayscale"
                >
                    {currentQuestionIndex === questions.length - 1 ? "إنهاء الاختبار" : "السؤال التالي"}
                </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
