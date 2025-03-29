import React from "react";
import { cn } from "../../lib/utils"; // Adjust the path as needed

const Progress = React.forwardRef((props, ref) => {
  const { className, value, max = 100, indicatorColor, ...rest } = props;
  const percentValue = (value / max) * 100;

  return (
    <div
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...rest}
    >
      <div
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - percentValue}%)`,
          backgroundColor: indicatorColor || "hsl(var(--primary))",
        }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
