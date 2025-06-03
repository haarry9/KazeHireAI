import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Content */}
      <div className="relative z-50 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className, children }: DialogContentProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-xl border border-gray-200 max-h-[90vh] flex flex-col",
      className
    )}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      {children}
    </div>
  );
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-lg font-semibold text-gray-900">
      {children}
    </h2>
  );
}

interface DialogCloseProps {
  onClick: () => void;
}

export function DialogClose({ onClick }: DialogCloseProps) {
  return (
    <button
      onClick={onClick}
      className="text-gray-400 hover:text-gray-600 transition-colors"
    >
      <X className="h-5 w-5" />
    </button>
  );
} 