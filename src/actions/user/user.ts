import { registerOnboarding } from "@/services/userService";

export async function registerOnboardingAction(form: any): Promise<any> {
  return await registerOnboarding(form);
}