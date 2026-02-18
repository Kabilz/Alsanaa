import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

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

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", id);
      
      if (error) {
        toast.error("Failed to load quiz");
      } else {
        // Parse options if they are JSON strings, or keep as is if already objects/arrays
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
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
     )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8 max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-8">
                <p>No quiz available for this course yet.</p>
                <Button className="mt-4" onClick={() => navigate(`/courses/${id}`)}>
                    Back to Course
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-8 max-w-2xl mx-auto">
        {showResults ? (
           <Card className="text-center">
             <CardHeader>
               <CardTitle className="text-3xl">Quiz Results</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="mb-6">
                    <p className="text-5xl font-bold mb-2">
                        {Math.round((score / questions.length) * 100)}%
                    </p>
                    <p className="text-muted-foreground">
                        You got {score} out of {questions.length} correct
                    </p>
                </div>
                
                <div className="space-y-4 text-left">
                    {questions.map((q, idx) => {
                        const userAnswer = answers[q.id];
                        const isCorrect = userAnswer === q.correct_answer;
                        return (
                            <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                                <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
                                <div className="flex items-center gap-2">
                                    {isCorrect ? <CheckCircle className="text-green-500 h-5 w-5" /> : <XCircle className="text-red-500 h-5 w-5" />}
                                    <span>Your answer: {q.options[userAnswer]}</span>
                                </div>
                                {!isCorrect && (
                                    <p className="mt-1 text-sm text-muted-foreground">Correct answer: {q.options[q.correct_answer]}</p>
                                )}
                            </div>
                        )
                    })}
                </div>

             </CardContent>
             <CardFooter className="flex justify-center gap-4">
                 <Button variant="outline" onClick={() => navigate(`/courses/${id}`)}>
                   <ArrowLeft className="mr-2 h-4 w-4" />
                   Back to Course
                 </Button>
                 <Button onClick={handleRetry}>Retry Quiz</Button>
             </CardFooter>
           </Card>
        ) : (
          <Card>
            <CardHeader>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</span>
                 <span className="text-sm font-semibold">Score: {score}</span>
               </div>
               <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                  />
               </div>
               <CardTitle className="mt-4 text-xl">
                 {questions[currentQuestionIndex].question}
               </CardTitle>
            </CardHeader>
            <CardContent>
               <RadioGroup value={selectedAnswer?.toString()} onValueChange={handleAnswerSelect}>
                  {questions[currentQuestionIndex].options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent transition-colors">
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-grow cursor-pointer">{option}</Label>
                    </div>
                  ))}
               </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleNext} disabled={selectedAnswer === null}>
                    {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
