"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationFormData, type ApplicationFormInput, SOURCES, STATUSES } from "@/types/application";

type Props = {
  onSubmit: (data: ApplicationFormData) => void;
  isSubmitting?: boolean;
};

export function ApplicationForm({ onSubmit, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormInput, unknown, ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      status: "Applied",
      techStack: [],
      jobDescription: "",
    },
  });

  const handleFormSubmit = (data: ApplicationFormData) => {
    onSubmit(data);
  };

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 max-w-2xl">
      <div>
        <label htmlFor="companyName" className={labelClass}>Company Name</label>
        <input id="companyName" {...register("companyName")} className={inputClass} />
        {errors.companyName && <p className={errorClass}>{errors.companyName.message}</p>}
      </div>

      <div>
        <label htmlFor="position" className={labelClass}>Position</label>
        <input id="position" {...register("position")} className={inputClass} />
        {errors.position && <p className={errorClass}>{errors.position.message}</p>}
      </div>

      <div>
        <label htmlFor="jobUrl" className={labelClass}>Job URL</label>
        <input id="jobUrl" {...register("jobUrl")} className={inputClass} placeholder="https://..." />
        {errors.jobUrl && <p className={errorClass}>{errors.jobUrl.message}</p>}
      </div>

      <div>
        <label htmlFor="jobDescription" className={labelClass}>Job Description</label>
        <textarea
          id="jobDescription"
          {...register("jobDescription")}
          className={`${inputClass} min-h-[100px]`}
        />
      </div>

      <div>
        <label htmlFor="techStack" className={labelClass}>Tech Stack</label>
        <input
          id="techStack"
          placeholder="React, TypeScript, Node.js"
          className={inputClass}
          onChange={(e) => {
            const value = e.target.value;
            const arr = value.split(",").map((s) => s.trim()).filter(Boolean);
            setValue("techStack", arr);
          }}
        />
        <p className="text-xs text-gray-400 mt-1">Comma-separated values</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="source" className={labelClass}>Source</label>
          <select id="source" {...register("source")} className={inputClass}>
            <option value="">Select source...</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.source && <p className={errorClass}>{errors.source.message}</p>}
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>Status</label>
          <select id="status" {...register("status")} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="appliedAt" className={labelClass}>Applied Date</label>
        <input id="appliedAt" type="date" {...register("appliedAt")} className={inputClass} />
        {errors.appliedAt && <p className={errorClass}>{errors.appliedAt.message}</p>}
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Notes</label>
        <textarea
          id="notes"
          {...register("notes")}
          className={`${inputClass} min-h-[80px]`}
          placeholder="Any additional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 transition-all"
      >
        {isSubmitting ? "Saving..." : "Save Application"}
      </button>
    </form>
  );
}
