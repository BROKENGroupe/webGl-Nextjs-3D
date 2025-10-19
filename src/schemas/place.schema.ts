import { z } from "zod";

export const createPlaceSchema = z.object({
  name: z.string().min(3).max(100),
  address: z.string().min(3).max(200),
  description: z.string().min(3).max(1000).optional(),
  categoryId: z.string().min(8),
  image: z.any().optional()
});

export type CreatePlaceSchemaType = z.infer<typeof createPlaceSchema>;

export function formDataToObject(formData: FormData): Record<string, any> {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export async function validatePlaceFormData(
  formData: FormData,
): Promise<CreatePlaceSchemaType> {
  const obj = formDataToObject(formData);
  return createPlaceSchema.parseAsync(obj);
}