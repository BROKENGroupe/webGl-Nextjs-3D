import { z } from "zod";

export const createPlaceSchema = z.object({
  name: z.string().min(3).max(100),
  address: z.string().min(3).max(200),
  description: z.string().min(3).max(1000).optional(),
  categoryId: z.string().min(8),
  status: z.boolean(),
});

export type CreatePlaceSchemaType = z.infer<typeof createPlaceSchema>;

export async function validatePlaceInput(
  input: CreatePlaceSchemaType,
): Promise<CreatePlaceSchemaType> {
  return createPlaceSchema.parseAsync(input);
}