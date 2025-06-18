import * as React from "react"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DrawerContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DrawerHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface DrawerBodyProps {
  className?: string;
  children: React.ReactNode;
}

interface DrawerTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface DrawerDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Drawer Content */}
      <div className="ml-auto relative z-50">
        {children}
      </div>
    </div>
  );
}

export function DrawerContent({ className, children }: DrawerContentProps) {
  return (
    <div className={cn(
      "h-full w-screen max-w-[75vw] bg-white shadow-xl border-l border-gray-200 flex flex-col animate-slide-in",
      className
    )}>
      {children}
    </div>
  );
}

export function DrawerHeader({ className, children }: DrawerHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6 border-b", className)}>
      {children}
    </div>
  );
}

export function DrawerBody({ className, children }: DrawerBodyProps) {
  return (
    <div className={cn("p-6 overflow-y-auto flex-1", className)}>
      {children}
    </div>
  );
}

export function DrawerTitle({ className, children }: DrawerTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h2>
  );
}

export function DrawerDescription({ className, children }: DrawerDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-600", className)}>
      {children}
    </p>
  );
} 