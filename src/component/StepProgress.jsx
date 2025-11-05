/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export function StepProgress({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
  isDisabled = false,
}) {
  const [progressWidth, setProgressWidth] = useState(0);
  const [progressLeft, setProgressLeft] = useState(0);
  const stepsContainerRef = useRef(null);

  useEffect(() => {
    if (stepsContainerRef.current) {
      const container = stepsContainerRef.current;
      const stepElements = container.querySelectorAll(".step-button");

      if (stepElements.length >= 2) {
        const firstStep = stepElements[0];
        const lastStep = stepElements[stepElements.length - 1];
        const containerRect = container.getBoundingClientRect();

        // Calculate the left position (from first icon center)
        const firstStepRect = firstStep.getBoundingClientRect();
        const leftPosition =
          firstStepRect.left + firstStepRect.width / 2 - containerRect.left;
        setProgressLeft(leftPosition);

        // Calculate the total width (between first and last icon centers)
        const lastStepRect = lastStep.getBoundingClientRect();
        const totalWidth =
          lastStepRect.left +
          lastStepRect.width / 2 -
          (firstStepRect.left + firstStepRect.width / 2);

        // Calculate progress width based on current step
        const progressPercentage = currentStep / (steps.length - 1);
        setProgressWidth(totalWidth * progressPercentage);
      }
    }
  }, [currentStep, steps.length]);

  // Determine if a step is clickable (completed, current step, or previous step)
  const isStepClickable = (index) => {
    return index <= currentStep || completedSteps.includes(index);
  };

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-8" ref={stepsContainerRef}>
        <div
          className="absolute top-1/3 h-1 -translate-y-1/2 bg-gray-200 rounded-full"
          style={{
            left: `${progressLeft}px`,
            right: `${progressLeft}px`,
          }}
        />
        <div
          className="absolute top-1/3 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500 ease-in-out"
          style={{
            left: `${progressLeft}px`,
            width: `${progressWidth}px`,
          }}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted =
              index < currentStep || completedSteps.includes(index);
            const isCurrent = index === currentStep;
            const isPrevious = index < currentStep;

            // Previous steps are always clickable, future steps need validation
            const isClickable =
              isPrevious || isCurrent || completedSteps.includes(index);

            return (
              <div
                key={step.id}
                className="flex flex-col items-center transition-opacity duration-300"
              >
                <button
                  className={cn(
                    "step-button relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out transform",
                    isClickable
                      ? "hover:scale-110 active:scale-95"
                      : "cursor-not-allowed opacity-70",
                    isCompleted
                      ? "bg-primary text-white"
                      : isCurrent
                      ? "bg-white border-2 border-primary text-primary"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  )}
                  onClick={() =>
                    isClickable && onStepClick && onStepClick(index)
                  }
                  disabled={isDisabled ? true : !isClickable || !onStepClick}
                  aria-label={`Go to ${step.title} step`}
                  title={
                    isClickable
                      ? `Go to ${step.title}`
                      : "Complete previous steps first"
                  }
                >
                  {isCompleted ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </button>

                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors invisible md:visible duration-300",
                    isCompleted || isCurrent ? "text-primary" : "text-gray-400"
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
