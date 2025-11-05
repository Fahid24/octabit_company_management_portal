import { cn } from "@/utils/cn";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5  text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white ",
        secondary: "border-transparent bg-secondary text-white ",
        destructive: "border-transparent bg-destructive text-destructive-foreground ",
        outline: "text-foreground",
        approve: "bg-green-100 text-green-800 border-green-200",
        reject: "bg-red-100 text-red-800 border-red-200",
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };