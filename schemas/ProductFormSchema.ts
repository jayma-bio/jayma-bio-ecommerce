import { z } from "zod";

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(1, "Price is required"),
  discount: z.coerce.number().optional(),
  images: z.object({ url: z.string() }).array(),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  category: z.string().min(1, "Category is required"),
  size: z.string().optional(),
  qty: z.coerce.number().optional(),

  benefits: z
    .array(
      z.object({
        title: z.string().min(1, "Benefit title is required"),
        description: z.string().min(1, "Benefit description is required"),
      })
    )
    .min(1, "At least one benefit is required"),

  more_points: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      descriptions: z
        .array(z.object({ text: z.string().min(1, "Description is required") }))
        .min(1, "At least one description required"),
      bullet_points: z.array(z.string()).optional(),
    })
  ),
});
