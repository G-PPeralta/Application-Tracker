"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApplicationForm } from "@/components/application-form";
import { useApplications } from "@/hooks/use-applications";
import type { ApplicationFormData } from "@/types/application";

export default function NewApplicationPage() {
  const router = useRouter();
  const { add } = useApplications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      await add(data);
      router.push("/applications");
    } catch (err) {
      console.error("Failed to create application:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Application</h1>
      <ApplicationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
