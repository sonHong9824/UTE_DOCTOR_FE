import * as React from "react"

import { cn } from "@/lib/utils"

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLElement> {}

const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn("space-y-2 border-b-2 pb-6 md:pb-10", className)}
      {...props}
    />
  )
)
PageHeader.displayName = "PageHeader"

export interface PageHeaderTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const PageHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  PageHeaderTitleProps
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "text-3xl font-bold leading-tight tracking-tighter md:text-4xl",
      className
    )}
    {...props}
  />
))
PageHeaderTitle.displayName = "PageHeaderTitle"

export interface PageHeaderDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const PageHeaderDescription = React.forwardRef<
  HTMLParagraphElement,
  PageHeaderDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-lg text-muted-foreground", className)}
    {...props}
  />
))
PageHeaderDescription.displayName = "PageHeaderDescription"

export { PageHeader, PageHeaderDescription, PageHeaderTitle }

