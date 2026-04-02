import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuizzes, useCreateQuiz, useDeleteQuiz, useCourse } from "@/hooks/useCourses";
import { Loader2, Plus, Trash2, ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizManagerProps {
  courseId: string;
  onBack: () => void;
}

export function QuizManager({ courseId, onBack }: QuizManagerProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const { data: course } = useCourse(courseId);
  const { data: quizzes, isLoading } = useQuizzes(courseId);
  const createQuiz = useCreateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      return;
    }

    await createQuiz.mutateAsync({
      course_id: courseId,
      question,
      options: filteredOptions,
      correct_answer: correctAnswer,
    });

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" dir="rtl">
      <div className="flex items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-indigo-900/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
            إدارة الاختبارات
          </h2>
          <p className="text-slate-400 text-sm">
            {course?.title || course?.title_ar || "جاري التحميل..."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900/40 border-indigo-900/40 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <CardHeader className="border-b border-slate-800/50 pb-5 bg-slate-900/40 relative z-10">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                إضافة سؤال جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-slate-300 font-semibold text-base">السؤال</Label>
                  <Input
                    id="question"
                    placeholder="أدخل نص السؤال هنا..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-300 font-semibold text-base">خيارات الإجابة</Label>
                  <RadioGroup
                    value={correctAnswer.toString()}
                    onValueChange={(v) => setCorrectAnswer(parseInt(v))}
                    className="space-y-3"
                  >
                    {options.map((option, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${correctAnswer === index ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800/30 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'}`}>
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                          className="border-slate-500 text-indigo-500 focus:ring-indigo-500 shrink-0"
                        />
                        <Input
                          placeholder={`الخيار ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className={`flex-1 bg-transparent border-0 focus-visible:ring-0 px-2 h-auto py-1 shadow-none ${correctAnswer === index ? 'text-indigo-100 placeholder:text-indigo-300/50' : 'text-white placeholder:text-slate-500'}`}
                        />
                        {correctAnswer === index && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>حدد الدائرة بجوار الإجابة الصحيحة.</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={createQuiz.isPending || !question || options.filter(o => o.trim()).length < 2}
                  className="w-full bg-gradient-to-l from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold shadow-lg shadow-indigo-500/20 py-6 text-base"
                >
                  {createQuiz.isPending ? (
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="ml-2 h-5 w-5" />
                  )}
                  إضافة السؤال
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                   <HelpCircle className="w-6 h-6" />
                </div>
                أسئلة الاختبار
                <span className="text-sm font-normal text-slate-400 mr-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  {quizzes?.length || 0} أسئلة
                </span>
              </h3>
            </CardHeader>

            <CardContent className="px-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-2xl">
                      <Skeleton className="h-6 w-3/4 bg-slate-800 mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full bg-slate-800/50 rounded-lg" />
                        <Skeleton className="h-10 w-full bg-slate-800/50 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : quizzes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
                  <div className="w-24 h-24 mb-6 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                    <HelpCircle className="w-12 h-12 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>لا توجد أسئلة بعد</h3>
                  <p className="text-slate-400">قم بإضافة أسئلة لاختبار الدورة من القائمة الجانبية.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes?.map((quiz, index) => (
                    <div
                      key={quiz.id}
                      className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="p-5 border-b border-slate-800/50 bg-slate-900/20 flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <span className="text-indigo-400 font-bold text-lg mt-0.5" style={{ fontFamily: "'Cairo', sans-serif" }}>س{index + 1}:</span>
                          <h4 className="text-lg font-bold text-white leading-relaxed">{quiz.question}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuiz.mutate({ id: quiz.id, courseId })}
                          className="text-rose-400 hover:text-white hover:bg-rose-500 shrink-0"
                          title="حذف السؤال"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-5 bg-slate-900/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {quiz.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium border ${
                                optIndex === quiz.correct_answer
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-slate-800/30 text-slate-300 border-slate-800"
                              }`}
                            >
                              {optIndex === quiz.correct_answer ? (
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                              ) : (
                                <span className="w-5 h-5 shrink-0 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] text-slate-500">{optIndex + 1}</span>
                              )}
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
