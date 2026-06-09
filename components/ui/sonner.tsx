"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" style={{ color: '#10B981' }} />,
        info:    <InfoIcon className="size-4" style={{ color: '#DDDDDD' }} />,
        warning: <TriangleAlertIcon className="size-4" style={{ color: '#F59E0B' }} />,
        error:   <OctagonXIcon className="size-4" style={{ color: '#EF4444' }} />,
        loading: <Loader2Icon className="size-4 animate-spin" style={{ color: '#DDDDDD' }} />,
      }}
      toastOptions={{
        style: {
          background: '#0D0D0D',
          border: '1px solid rgba(255,255,255,0.09)',
          color: '#FFFFFF',
          borderRadius: '12px',
          fontSize: '13px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        },
        classNames: {
          title:       'font-medium',
          description: 'opacity-60 text-xs',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
