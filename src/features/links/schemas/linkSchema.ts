import { z } from "zod";

import { LINK_CATEGORY_OPTIONS, type ICreateLinkFormValues, } from "@/features/links/types/linkTypes";
import { normalizeUrl } from "@/features/links/utils/normalizeUrl";

//#region schema
export const linkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters"),

  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .transform((value) => normalizeUrl(value))
    .refine((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid URL"),

  category: z.enum(LINK_CATEGORY_OPTIONS),
});
//#endregion schema

//#region types
export type LinkFormValues = z.infer<typeof linkFormSchema>;

export const linkFormDefaultValues: ICreateLinkFormValues = {
  title: "",
  url: "",
  category: "docs",
};
//#endregion types
