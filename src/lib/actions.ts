"use server";

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase-server";

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
  interview_date: string | null;
  notes: string | null;
  created_at: string;
  user_id: string;
};

async function requireUser(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getApplications(): Promise<SnakeCaseApplication[]> {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createApplication(
  application: Omit<SnakeCaseApplication, "id" | "created_at" | "user_id">
): Promise<SnakeCaseApplication> {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from("applications")
    .insert([{ ...application, user_id: userId }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateApplication(
  id: string,
  updates: Partial<Omit<SnakeCaseApplication, "id" | "created_at" | "user_id">>
): Promise<SnakeCaseApplication> {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  const userId = await requireUser();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
