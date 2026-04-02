import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Course {
  id: string;
  title: string;
  title_ar?: string | null;
  title_en?: string | null;
  description: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  video_url: string | null;
  image_url: string | null;
  price: number;
  teacher_id: string | null;
  educational_year_id?: string | null;
  subject_id?: string | null;
  department_id?: string | null;
  educational_years?: { name: string; name_ar: string; level_id: string | null } | null;
  subjects?: { name: string; name_ar: string } | null;
  departments?: { name: string; name_ar: string; college_id: string | null } | null;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    profiles?: {
      full_name: string | null;
    };
  };
}

export interface Teacher {
  id: string;
  full_name: string | null;
}

export interface Quiz {
  id: string;
  course_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  created_at: string;
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("courses") as any)
        .select(`
          *,
          teacher:teachers (
            id,
            profiles (
              full_name
            )
          ),
          educational_years (name, name_ar, level_id),
          subjects (name, name_ar),
          departments (name, name_ar, college_id)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select(`
          id,
          profiles (
            full_name
          )
        `);
      
      if (error) throw error;
      // Transform data to flat structure
      return data.map((t: any) => ({
        id: t.id,
        full_name: t.profiles?.full_name || "Unknown Teacher",
      })) as Teacher[];
    },
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("courses") as any)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!id,
  });
}

export function useQuizzes(courseId: string) {
  return useQuery({
    queryKey: ["quizzes", courseId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("quizzes") as any)
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data.map((q) => ({
        ...q,
        options: q.options as string[],
      })) as Quiz[];
    },
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (course: { title: string; title_ar?: string; title_en?: string; description: string; description_ar?: string; description_en?: string; video_url?: string; image_url?: string; price?: number; teacher_id?: string; educational_year_id?: string | null; subject_id?: string | null; department_id?: string | null; is_free?: boolean; status?: string }) => {
      const { data, error } = await (supabase
        .from("courses") as any)
        .insert(course)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create course: " + error.message);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...course }: { id: string; title: string; title_ar?: string; title_en?: string; description: string; description_ar?: string; description_en?: string; video_url?: string; image_url?: string; price?: number; teacher_id?: string; educational_year_id?: string | null; subject_id?: string | null; department_id?: string | null; is_free?: boolean; status?: string }) => {
      const { data, error } = await (supabase
        .from("courses") as any)
        .update(course)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", data.id] });
      toast.success("Course updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update course: " + error.message);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("courses") as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete course: " + error.message);
    },
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quiz: { course_id: string; question: string; options: string[]; correct_answer: number }) => {
      const { data, error } = await (supabase
        .from("quizzes") as any)
        .insert(quiz)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", data.course_id] });
      toast.success("Quiz question added!");
    },
    onError: (error) => {
      toast.error("Failed to add quiz: " + error.message);
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await (supabase
        .from("quizzes") as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return courseId;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", courseId] });
      toast.success("Quiz question deleted!");
    },
    onError: (error) => {
      toast.error("Failed to delete quiz: " + error.message);
    },
  });
}
