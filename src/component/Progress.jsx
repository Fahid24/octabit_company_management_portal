import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva } from "class-variance-authority"
import { cn } from "@/utils/cn"

const progressVariants = cva("relative h-2 w-full overflow-hidden rounded-full bg-gray-300", {
  variants: {
    size: {
      sm: "h-1",
      default: "h-2",
      md: "h-3",
      lg: "h-4",
      xl: "h-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const progressIndicatorVariants = cva("h-full w-full flex-1 bg-primary transition-all", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      danger: "bg-red-500",
      info: "bg-blue-500",
      gradient: "bg-gradient-to-r from-blue-500 to-purple-600",
      animated: "bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-pulse",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Progress = React.forwardRef(({
  className,
  value = 0,
  max = 100,
  size,
  variant,
  showValue = false,
  showPercentage = false,
  label,
  indicatorClassName,
  ...props
}, ref) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className="w-full space-y-2">
      {(label || showValue || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          {(showValue || showPercentage) && (
            <span className="text-gray-600">
              {showValue && `${value}/${max}`}
              {showValue && showPercentage && " • "}
              {showPercentage && `${percentage}%`}
            </span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root ref={ref} className={cn(progressVariants({ size, className }))} {...props}>
        <ProgressPrimitive.Indicator
          className={cn(progressIndicatorVariants({ variant }), indicatorClassName)}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress, progressVariants, progressIndicatorVariants }