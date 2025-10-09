// types/onboarding.ts
export interface RegisterAccountResponse {
  id: string;
  name: string;
  email: string;
  image: {
    src: string;
    height: number;
    width: number;
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
  accessToken: string;
  refreshToken: string;
}

export interface OnboardingField {
  label: string;
  name: string;
  type: "text" | "email" | "tel" | "radio" | "select-cards";
  options?: Array<{ label: string; value: string }>;
}

export interface OnboardingStep {
  title: string;
  fields: OnboardingField[];
}

export interface FormData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  isOwner?: string;
  role?: string;
  businessName?: string;
  city?: string;
  password?: string;
}

export interface OnboardingFormData {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  businessName?: string;
  businessType?: string;
  city?: string;
  role?: string;
  isOwner?: string;
  [key: string]: any;
}