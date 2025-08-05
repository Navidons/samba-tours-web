/**
 * Utility functions to handle production environment issues safely
 */

/**
 * Safely check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * Safely check if we're in a server environment
 */
export const isServer = typeof window === 'undefined'

/**
 * Safely execute a function only in browser environment
 */
export const safeBrowserExecute = <T>(fn: () => T, fallback?: T): T | undefined => {
  if (isBrowser) {
    try {
      return fn()
    } catch (error) {
      console.warn('Browser execution failed:', error)
      return fallback
    }
  }
  return fallback
}

/**
 * Safely execute a function only in server environment
 */
export const safeServerExecute = <T>(fn: () => T, fallback?: T): T | undefined => {
  if (isServer) {
    try {
      return fn()
    } catch (error) {
      console.warn('Server execution failed:', error)
      return fallback
    }
  }
  return fallback
}

/**
 * Safely import a module only in server environment
 */
export const safeServerImport = async <T>(moduleName: string): Promise<T | null> => {
  if (isServer) {
    try {
      const module = await import(moduleName)
      return module.default || module
    } catch (error) {
      console.warn(`Failed to import ${moduleName}:`, error)
      return null
    }
  }
  return null
}

/**
 * Safely access localStorage
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    return safeBrowserExecute(() => localStorage.getItem(key), null)
  },
  setItem: (key: string, value: string): void => {
    safeBrowserExecute(() => localStorage.setItem(key, value))
  },
  removeItem: (key: string): void => {
    safeBrowserExecute(() => localStorage.removeItem(key))
  }
}

/**
 * Safely access sessionStorage
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    return safeBrowserExecute(() => sessionStorage.getItem(key), null)
  },
  setItem: (key: string, value: string): void => {
    safeBrowserExecute(() => sessionStorage.setItem(key, value))
  },
  removeItem: (key: string): void => {
    safeBrowserExecute(() => sessionStorage.removeItem(key))
  }
}

/**
 * Safely access document object
 */
export const safeDocument = {
  getElementById: (id: string): HTMLElement | null => {
    return safeBrowserExecute(() => document.getElementById(id), null)
  },
  querySelector: (selector: string): Element | null => {
    return safeBrowserExecute(() => document.querySelector(selector), null)
  },
  addEventListener: (type: string, listener: EventListener): void => {
    safeBrowserExecute(() => document.addEventListener(type, listener))
  },
  removeEventListener: (type: string, listener: EventListener): void => {
    safeBrowserExecute(() => document.removeEventListener(type, listener))
  }
}

/**
 * Safely access window object
 */
export const safeWindow = {
  scrollTo: (x: number, y: number): void => {
    safeBrowserExecute(() => window.scrollTo(x, y))
  },
  scrollY: (): number => {
    return safeBrowserExecute(() => window.scrollY, 0)
  },
  innerHeight: (): number => {
    return safeBrowserExecute(() => window.innerHeight, 0)
  },
  innerWidth: (): number => {
    return safeBrowserExecute(() => window.innerWidth, 0)
  }
} 