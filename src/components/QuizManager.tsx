import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuizzes, useCreateQuiz, useDeleteQuiz, useCourse } from "@/hooks/useCourses";
import { Loader2, Plus, Trash2, ArrowLeft, CheckCircle2, HelpCircle } from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Quiz Manager
          </h2>
          <p className="text-muted-foreground">
            {course?.title || "Loading..."}
          </p>
        </div>
      </div>

      {/* Add new question form */}
      <Card className="border-border/50 gradient-card">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Enter your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-4">
              <Label>Answer Options</Label>
              <RadioGroup
                value={correctAnswer.toString()}
                onValueChange={(v) => setCorrectAnswer(parseInt(v))}
              >
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className="border-border"
                    />
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 bg-secondary/50 border-border"
                    />
                    {correctAnswer === index && option && (
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    )}
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Select the radio button next to the correct answer
              </p>
            </div>

            <Button
              type="submit"
              disabled={createQuiz.isPending}
              className="w-full gradient-primary text-primary-foreground font-semibold hover:opacity-90"
            >
              {createQuiz.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Question
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Quiz Questions ({quizzes?.length || 0})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="border-border/50 gradient-card">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 bg-secondary mb-4" />
                  <Skeleton className="h-4 w-1/2 bg-secondary" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quizzes?.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quiz questions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes?.map((quiz, index) => (
              <Card
                key={quiz.id}
                className="border-border/50 gradient-card animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base font-medium">
                        Q{index + 1}: {quiz.question}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        deleteQuiz.mutate({ id: quiz.id, courseId })
                      }
                      className="hover:bg-destructive/10 hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-2">
                    {quiz.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                          optIndex === quiz.correct_answer
                            ? "bg-success/10 text-success border border-success/30"
                            : "bg-secondary/30 text-muted-foreground"
                        }`}
                      >
                        {optIndex === quiz.correct_answer && (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        )}
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
