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
});
