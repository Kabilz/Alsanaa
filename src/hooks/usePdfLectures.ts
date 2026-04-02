import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PdfLecture {
  id: string;
  teacher_id: string | null;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  pdf_url: string;
  thumbnail_url: string | null;
  subject_id: string | null;
  educational_year_id: string | null;
  department_id: string | null;
  price: number;
  is_free: boolean;
  status: string;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    profiles?: {
      full_name: string | null;
    };
  };
  subject?: {
    name: string;
    name_ar: string;
  };
}

export function usePdfLectures(filters?: { 
  yearId?: string; 
  subjectId?: string; 
  departmentId?: string;
  teacherId?: string;
}) {
  return useQuery({
    queryKey: ["pdfLectures", filters],
    queryFn: async () => {
      let query = supabase
        .from("pdf_lectures")
        .select(`
          *,
          teacher:teachers (
            id,
            profiles (
              full_name
            )
          ),
          subject:subjects (
            name,
            name_ar
          )
        `)
        .order("created_at", { ascending: false });

      if (filters?.yearId) query = query.eq("educational_year_id", filters.yearId);
      if (filters?.subjectId) query = query.eq("subject_id", filters.subjectId);
      if (filters?.departmentId) query = query.eq("department_id", filters.departmentId);
      if (filters?.teacherId) query = query.eq("teacher_id", filters.teacherId);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data as PdfLecture[];
    },
  });
}

export function useCreatePdfLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lecture: Omit<PdfLecture, "id" | "created_at" | "updated_at" | "view_count" | "download_count" | "teacher" | "subject">) => {
      const { data, error } = await supabase
        .from("pdf_lectures")
        .insert(lecture)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfLectures"] });
      toast.success("PDF lecture created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error creating PDF lecture: ${error.message}`);
    },
  });
}

export function useUpdatePdfLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Omit<PdfLecture, "teacher" | "subject">> & { id: string }) => {
      const { data, error } = await supabase
        .from("pdf_lectures")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfLectures"] });
      toast.success("PDF lecture updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error updating PDF lecture: ${error.message}`);
    },
  });
}

export function useDeletePdfLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pdf_lectures")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfLectures"] });
      toast.success("PDF lecture deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error deleting PDF lecture: ${error.message}`);
    },
  });
}
