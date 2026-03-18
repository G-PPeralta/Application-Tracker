import { supabase } from "./supabase";

type SnakeCaseApplication = {
  id: string;
  company_name: string;
  position: string;
  job_description: string;
  tech_stack: string[];
  applied_at: string;
  job_url: string;
  source: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export async function fetchApplications(): Promise<SnakeCaseApplication[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function insertApplication(
  application: Omit<SnakeCaseApplication, "id" | "created_at">
): Promise<SnakeCaseApplication> {
  const { data, error } = await supabase
    .from("applications")
    .insert([application])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateApplication(
  id: string,
  updates: Partial<Omit<SnakeCaseApplication, "id" | "created_at">>
): Promise<SnakeCaseApplication> {
  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
