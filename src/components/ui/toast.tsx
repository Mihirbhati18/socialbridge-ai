"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export type ToastVariant = "default" | "success" | "error" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all animate-slide-up mb-4",
              t.variant === "default" && "border-white/10 bg-card text-foreground",
              t.variant === "success" && "border-success/20 bg-success/10 text-success-foreground",
              t.variant === "error" && "border-destructive/20 bg-destructive/10 text-destructive-foreground",
              t.variant === "info" && "border-secondary/20 bg-secondary/10 text-secondary-foreground"
            )}
          >
            <div className="flex items-start gap-3">
              {t.variant === "success" && <CheckCircle className="h-5 w-5 text-success mt-0.5" />}
              {t.variant === "error" && <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />}
              {t.variant === "info" && <Info className="h-5 w-5 text-secondary mt-0.5" />}
              
              <div className="grid gap-1">
                {t.title && <div className="text-sm font-semibold">{t.title}</div>}
                {t.description && (
                  <div className="text-sm opacity-90">{t.description}</div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => removeToast(t.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
