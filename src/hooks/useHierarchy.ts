import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
