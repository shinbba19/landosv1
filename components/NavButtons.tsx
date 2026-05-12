"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  prevStep?: number;
  nextStep?: number;
  onNext?: () => boolean; // return false to block navigation
  nextLabel?: string;
}

export default function NavButtons({ prevStep, nextStep, onNext, nextLabel = "ถัดไป" }: Props) {
  const router = useRouter();

  const handleNext = () => {
    if (onNext && !onNext()) return;
    if (nextStep) router.push(`/step/${nextStep}`);
  };

  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
      {prevStep ? (
        <button onClick={() => router.push(`/step/${prevStep}`)} className="btn-secondary flex items-center gap-2">
          <ChevronLeft size={16} />
          ย้อนกลับ
        </button>
      ) : (
        <div />
      )}
      {nextStep && (
        <button onClick={handleNext} className="btn-primary flex items-center gap-2">
          {nextLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
