import { OnboardingField } from "../../types/onboarding";


interface TextInputProps {
  field: OnboardingField;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({ field, value, onChange }: TextInputProps) {
  return (
    <input
      id={field.name}
      name={field.name}
      type={field.type}
      value={value || ""}
      onChange={onChange}
      className="w-full border border-neutral-300 rounded-lg px-4 py-4 bg-white text-neutral-900 text-base outline-none focus:border-black focus:ring-1 focus:ring-black transition"
    />
  );
}