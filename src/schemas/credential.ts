import { z } from "zod";

// const schema = z.object({
//   email: z.string().email({ message: "Your email is invalid." }),
//   password: z.string().min(4),
// });

export const createCredentialSchema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
});
export type CreateCredentialSchemaType = z.infer<typeof createCredentialSchema>;

export async function validateCredentialInput(
  input: CreateCredentialSchemaType,
): Promise<CreateCredentialSchemaType> {
  return createCredentialSchema.parseAsync(input);
}
