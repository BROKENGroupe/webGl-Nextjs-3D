import { z } from "zod";

export const loginCredentialSchema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});
export type CreateCredentialSchemaType = z.infer<typeof loginCredentialSchema>;

export async function validateCredentialInput(
  input: CreateCredentialSchemaType,
): Promise<CreateCredentialSchemaType> {
  return loginCredentialSchema.parseAsync(input);
}
