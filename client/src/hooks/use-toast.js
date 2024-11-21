import { useState, useCallback } from "react"

const toastTimeouts = new Map()

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, duration = 3000 }) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    setToasts((currentToasts) => [...currentToasts, { id, title, description }])

    if (duration) {
      const timeout = setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((toast) => toast.id !== id)
        )
        toastTimeouts.delete(id)
      }, duration)
      toastTimeouts.set(id, timeout)
    }

    return id
  }, [])

  const dismiss = useCallback((toastId) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId)
    )
    const timeout = toastTimeouts.get(toastId)
    if (timeout) {
      clearTimeout(timeout)
      toastTimeouts.delete(toastId)
    }
  }, [])

  return { toast, dismiss, toasts }
}