import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  linkFormDefaultValues,
  linkFormSchema,
  type LinkFormValues,
} from "@/features/links/schemas/linkSchema";
import {
  LINK_CATEGORY_OPTIONS,
  type ICreateLinkFormValues,
} from "@/features/links/types/linkTypes";

//#region types
type LinkFormProps = {
  mode?: "create" | "edit";
  initialValues?: Partial<ICreateLinkFormValues>;
  submitLabel?: string;
  onSubmit: (values: LinkFormValues) => void | Promise<void>;
  onCancel?: () => void;
};
//#endregion types

//#region component
export function LinkForm({
  mode = "create",
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: LinkFormProps) {
  //#region form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      ...linkFormDefaultValues,
      ...initialValues,
    },
  });
  //#endregion form setup

  //#region effects
  useEffect(() => {
    reset({
      ...linkFormDefaultValues,
      ...initialValues,
    });
  }, [initialValues, reset]);
  //#endregion effects

  //#region handlers
  const handleFormSubmit = async (values: LinkFormValues) => {
    await onSubmit(values);
    if (mode === "create") {
        reset(linkFormDefaultValues);
    }
  };
  //#endregion handlers

  //#region render
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Add link" : "Edit link"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Save a useful resource with a valid URL and clear category.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="link-title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="link-title"
            type="text"
            placeholder="e.g. React docs"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            {...register("title")}
          />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="link-url" className="text-sm font-medium">
            URL
          </label>
          <input
            id="link-url"
            type="text"
            inputMode="url"
            placeholder="e.g. react.dev or https://react.dev"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            {...register("url")}
          />
          {errors.url ? (
            <p className="text-sm text-destructive">{errors.url.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="link-category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="link-category"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            {...register("category")}
          >
            {LINK_CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
          {errors.category ? (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting
              ? mode === "create"
                ? "Adding..."
                : "Saving..."
              : submitLabel ?? (mode === "create" ? "Add link" : "Save changes")}
          </button>

          {mode === "edit" && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-accent"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
  //#endregion render
}
//#endregion component

//#region utils
function formatCategoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
//#endregion utils
