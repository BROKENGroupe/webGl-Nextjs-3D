import { z } from "zod";

export const createCredentialSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
});
export type CreateCredentialSchemaType = z.infer<typeof createCredentialSchema>;

export async function validateCredentialInput(
  input: CreateCredentialSchemaType,
): Promise<CreateCredentialSchemaType> {
  return createCredentialSchema.parseAsync(input);
}
