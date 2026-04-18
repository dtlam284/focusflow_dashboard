import { z } from "zod";
 
//#region schema
export const noteFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(100, "Title must not exceed 100 characters."),
  content: z
    .string()
    .trim()
    .min(1, "Please enter note content.")
    .max(1000, "Content must not exceed 1000 characters."),
  color: z.enum(
    ["default", "blue", "green", "yellow", "rose", "violet"] as const,
    {
      message: "Please select a color.",
    },
  ),
  category: z.enum(
    ["work", "personal", "idea", "learning", "other"] as const,
    {
      message: "Please select a category.",
    },
  ),
});
//#endregion schema

//#region types
export type NoteFormValues = z.infer<typeof noteFormSchema>;
//endregion types
