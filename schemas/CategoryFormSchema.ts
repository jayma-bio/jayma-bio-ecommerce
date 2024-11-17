import { z } from "zod";

export const CategoryFormSchema = z.object({
  banner: z.string().min(1, {
    message: "Please provide a banner",
  }),
  name: z.string().min(1),
  description: z.string().min(1,{
    message: "Please provide a description",
  }),
  billboardId: z.string().min(1),
  categoryDesc: z.array(
    z.object({
      video: z.string().url().min(1, {
        message: "Please provide a valid URL",
      }),
      desc: z.string().min(1, {
        message: "Please provide a description",
      }),
    })
  ),
});
