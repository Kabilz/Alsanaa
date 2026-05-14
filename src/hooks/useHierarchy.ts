import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEducationalLevels() {
  return useQuery({
    queryKey: ["educationalLevels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("educational_levels")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useEducationalYears(levelId?: string) {
  return useQuery({
    queryKey: ["educationalYears", levelId],
    queryFn: async () => {
      let query = supabase
        .from("educational_years")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (levelId) {
        query = query.eq("level_id", levelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: levelId !== undefined,
  });
}

export function useSubjects(yearId?: string) {
  return useQuery({
    queryKey: ["subjects", yearId],
    queryFn: async () => {
      let query = supabase
        .from("subjects")
        .select("*")
        .order("name_ar", { ascending: true });
      
      if (yearId) {
        query = query.eq("year_id", yearId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: yearId !== undefined,
  });
}

export function useColleges() {
  return useQuery({
    queryKey: ["colleges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .order("name_ar", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useDepartments(collegeId?: string) {
  return useQuery({
    queryKey: ["departments", collegeId],
    queryFn: async () => {
      let query = supabase
        .from("departments")
        .select("*")
        .order("name_ar", { ascending: true });
      
      if (collegeId) {
        query = query.eq("college_id", collegeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: collegeId !== undefined,
  });
}

// ─── Educational Level Mutations ───────────────────────────────────────────

export interface EducationalLevelPayload {
  name_ar: string;
  name?: string;
  slug: string;
  order_index?: number;
}

export function useCreateEducationalLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EducationalLevelPayload) => {
      const { data, error } = await supabase
        .from("educational_levels")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educationalLevels"] });
      toast.success("تمت إضافة المرحلة الدراسية بنجاح");
    },
    onError: (err: any) => {
      toast.error("فشل إضافة المرحلة: " + err.message);
    },
  });
}

export function useUpdateEducationalLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: EducationalLevelPayload & { id: string }) => {
      const { data, error } = await supabase
        .from("educational_levels")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educationalLevels"] });
      toast.success("تم تحديث المرحلة الدراسية بنجاح");
    },
    onError: (err: any) => {
      toast.error("فشل تحديث المرحلة: " + err.message);
    },
  });
}

export function useDeleteEducationalLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Fetch all years belonging to this level
      const { data: years, error: yearsError } = await supabase
        .from("educational_years")
        .select("id")
        .eq("level_id", id);
      if (yearsError) throw yearsError;

      if (years && years.length > 0) {
        const yearIds = years.map((y) => y.id);

        // 2. Check if any courses reference these years
        const { count: courseCount, error: courseError } = await supabase
          .from("courses")
          .select("id", { count: "exact", head: true })
          .in("educational_year_id", yearIds);
        if (courseError) throw courseError;

        if (courseCount && courseCount > 0) {
          throw new Error(
            `لا يمكن حذف هذه المرحلة لأنها تحتوي على ${courseCount} دورة مرتبطة بها. يرجى حذف الدورات أو نقلها إلى مرحلة أخرى أولاً.`
          );
        }

        // 3. Check if any PDF lectures reference these years
        const { count: pdfCount, error: pdfError } = await supabase
          .from("pdf_lectures")
          .select("id", { count: "exact", head: true })
          .in("educational_year_id", yearIds);
        if (pdfError) throw pdfError;

        if (pdfCount && pdfCount > 0) {
          throw new Error(
            `لا يمكن حذف هذه المرحلة لأنها تحتوي على ${pdfCount} مذكرة PDF مرتبطة بها. يرجى حذف المذكرات أو نقلها إلى مرحلة أخرى أولاً.`
          );
        }
      }

      // 4. Safe to delete — Postgres will cascade to years & subjects
      const { error } = await supabase
        .from("educational_levels")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["educationalLevels"] });
      queryClient.invalidateQueries({ queryKey: ["educationalYears"] });
      toast.success("تم حذف المرحلة الدراسية بنجاح");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "فشل حذف المرحلة");
    },
  });
}

// ─── Educational Year Mutations ────────────────────────────────────────────

export interface EducationalYearPayload {
  level_id: string;
  name_ar: string;
  name?: string;
  slug: string;
  order_index?: number;
}

export function useCreateEducationalYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EducationalYearPayload) => {
      const { data, error } = await supabase
        .from("educational_years")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["educationalYears", variables.level_id] });
      queryClient.invalidateQueries({ queryKey: ["educationalYears"] });
      toast.success("تمت إضافة السنة الدراسية بنجاح");
    },
    onError: (err: any) => {
      toast.error("فشل إضافة السنة: " + err.message);
    },
  });
}

export function useUpdateEducationalYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: EducationalYearPayload & { id: string }) => {
      const { data, error } = await supabase
        .from("educational_years")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["educationalYears", variables.level_id] });
      queryClient.invalidateQueries({ queryKey: ["educationalYears"] });
      toast.success("تم تحديث السنة الدراسية بنجاح");
    },
    onError: (err: any) => {
      toast.error("فشل تحديث السنة: " + err.message);
    },
  });
}

export function useDeleteEducationalYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, levelId }: { id: string, levelId: string }) => {
      // 1. Check if any courses reference this year
      const { count: courseCount, error: courseError } = await supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("educational_year_id", id);
      if (courseError) throw courseError;

      if (courseCount && courseCount > 0) {
        throw new Error(
          `لا يمكن حذف هذه السنة لأنها تحتوي على ${courseCount} دورة مرتبطة بها. يرجى حذف الدورات أو نقلها إلى سنة أخرى أولاً.`
        );
      }

      // 2. Check if any PDF lectures reference this year
      const { count: pdfCount, error: pdfError } = await supabase
        .from("pdf_lectures")
        .select("id", { count: "exact", head: true })
        .eq("educational_year_id", id);
      if (pdfError) throw pdfError;

      if (pdfCount && pdfCount > 0) {
        throw new Error(
          `لا يمكن حذف هذه السنة لأنها تحتوي على ${pdfCount} مذكرة PDF مرتبطة بها. يرجى حذف المذكرات أو نقلها إلى سنة أخرى أولاً.`
        );
      }

      // 3. Delete the year (Postgres will cascade subjects if applicable)
      const { error } = await supabase
        .from("educational_years")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["educationalYears", variables.levelId] });
      queryClient.invalidateQueries({ queryKey: ["educationalYears"] });
      toast.success("تم حذف السنة الدراسية بنجاح");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "فشل حذف السنة");
    },
  });
}
