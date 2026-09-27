"use client";

import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
  "animate-pulse rounded bg-neutral-200",
  {
    variants: {
      variant: {
        text: "h-4 w-full",
        circular: "rounded-full",
        rectangular: "rounded-lg",
      },
      size: {
        sm: "h-4",
        md: "h-5",
        lg: "h-6",
        xl: "h-8",
      },
      width: {
        full: "w-full",
        half: "w-1/2",
        quarter: "w-1/4",
        threeQuarters: "w-3/4",
      },
    },
    defaultVariants: {
      variant: "text",
      size: "md",
      width: "full",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({
  className,
  variant = "text",
  size = "md",
  width = "full",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={skeletonVariants({ variant, size, width, className })}
      {...props}
    />
  );
}