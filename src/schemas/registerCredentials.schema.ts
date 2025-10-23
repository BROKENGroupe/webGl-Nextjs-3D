import { z } from "zod";

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':",.<>/?\\|`~]).{8,}$/;

export const registerCredentialSchema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(strongPasswordRegex, {
      message:
        "Password must contain uppercase, lowercase, number, and special character.",
    }),
});
export type CreateCredentialSchemaType = z.infer<typeof registerCredentialSchema>;

export async function validateCredentialInput(
  input: CreateCredentialSchemaType,
): Promise<CreateCredentialSchemaType> {
  return registerCredentialSchema.parseAsync(input);
}
