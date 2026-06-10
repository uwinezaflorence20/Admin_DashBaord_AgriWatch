'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, type, icon: Icon, rightIcon: RightIcon, onClickRightIcon, ...props }, ref) => {
  return (
    <div className="relative w-full group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Icon size={20} />
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-10",
          RightIcon && "pr-10",
          className
        )}
        ref={ref}
        {...props}
      />
      {RightIcon && (
        <div 
          onClick={onClickRightIcon}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer transition-colors z-10"
        >
          <RightIcon size={20} />
        </div>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
