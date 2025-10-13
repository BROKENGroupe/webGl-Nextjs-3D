// components/onboarding/OnboardingHeader.tsx
import Image from "next/image";

export default function OnboardingHeader() {
  return (
    <div className="absolute top-10 left-16 z-10">
      <Image
        src="/assets/images/insonor.png"
        alt="Logo"
        width={150}
        height={70}
      />
    </div>
  );
}