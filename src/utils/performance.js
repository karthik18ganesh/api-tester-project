// Performance optimization utilities
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Debounce hook for search inputs and API calls
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events and frequent updates
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Memoized callback for stable references
export const useStableCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// Memoized value for expensive calculations
export const useStableValue = (factory, deps) => {
  return useMemo(factory, deps);
};

// Previous value hook for comparison
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [elementRef, isIntersecting, entry];
};

// Local storage hook with performance optimization
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

// Async operation hook with loading states
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};

// Component performance measurement
export const measurePerformance = (componentName) => {
  if (import.meta.env.DEV) {
    return {
      start: () => performance.mark(`${componentName}-start`),
      end: () => {
        performance.mark(`${componentName}-end`);
        performance.measure(
          `${componentName}-render`,
          `${componentName}-start`,
          `${componentName}-end`
        );
      },
    };
  }
  return { start: () => {}, end: () => {} };
};

// Memory usage optimization for large lists
export const useVirtualization = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight,
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    onScroll: (e) => setScrollTop(e.target.scrollTop),
  };
};

// ===== NEW PHASE 4 PERFORMANCE UTILITIES =====

// Web Vitals monitoring hook
export const useWebVitals = (onMetric) => {
  useEffect(() => {
    const handleMetric = (metric) => {
      // Send metrics to analytics or logging service
      if (onMetric) {
        onMetric(metric);
      }

      // Log in development
      if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric);
      }
    };

    // Register all Web Vitals
    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);
  }, [onMetric]);
};

// Performance profiler hook for component rendering
export const usePerformanceProfiler = (id, metadata = {}) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const mountTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderDuration = currentTime - lastRenderTime.current;
    lastRenderTime.current = currentTime;

    if (import.meta.env.DEV) {
      console.log(`[Profiler] ${id}:`, {
        renderCount: renderCount.current,
        renderDuration: `${renderDuration.toFixed(2)}ms`,
        totalTime: `${(currentTime - mountTime.current).toFixed(2)}ms`,
        metadata,
      });
    }
  });

  return {
    renderCount: renderCount.current,
    totalTime: performance.now() - mountTime.current,
  };
};

// Bundle size tracker (for development)
export const trackBundleSize = () => {
  if (import.meta.env.DEV && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');

    const jsResources = resources.filter((r) => r.name.includes('.js'));
    const cssResources = resources.filter((r) => r.name.includes('.css'));

    const totalJSSize = jsResources.reduce(
      (acc, r) => acc + (r.transferSize || 0),
      0
    );
    const totalCSSSize = cssResources.reduce(
      (acc, r) => acc + (r.transferSize || 0),
      0
    );

    console.log('[Bundle Tracker]', {
      totalJSSize: `${(totalJSSize / 1024).toFixed(2)} KB`,
      totalCSSSize: `${(totalCSSSize / 1024).toFixed(2)} KB`,
      jsFiles: jsResources.length,
      cssFiles: cssResources.length,
      loadTime: `${navigation.loadEventEnd - navigation.loadEventStart}ms`,
    });
  }
};

// Memory usage monitoring
export const useMemoryMonitor = (interval = 10000) => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    if (!('memory' in performance)) return;

    const updateMemoryInfo = () => {
      setMemoryInfo({
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      });
    };

    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
};

// Resource loading optimization
export const useResourcePreloader = () => {
  const preloadedResources = useRef(new Set());

  const preloadResource = useCallback((href, as = 'fetch') => {
    if (preloadedResources.current.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
    preloadedResources.current.add(href);
  }, []);

  const prefetchResource = useCallback((href) => {
    if (preloadedResources.current.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;

    document.head.appendChild(link);
    preloadedResources.current.add(href);
  }, []);

  return { preloadResource, prefetchResource };
};

// Frame rate monitor
export const useFrameRate = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrame;

    const measureFrameRate = () => {
      const currentTime = performance.now();
      frameCount.current++;

      if (currentTime - lastTime.current >= 1000) {
        setFps(
          Math.round(
            (frameCount.current * 1000) / (currentTime - lastTime.current)
          )
        );
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrame = requestAnimationFrame(measureFrameRate);
    };

    animationFrame = requestAnimationFrame(measureFrameRate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return fps;
};

// Critical resource priority hints
export const useResourceHints = () => {
  const addResourceHint = useCallback((href, rel, crossOrigin = false) => {
    const existingHint = document.querySelector(
      `link[href="${href}"][rel="${rel}"]`
    );
    if (existingHint) return;

    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (crossOrigin) link.crossOrigin = 'anonymous';

    document.head.appendChild(link);
  }, []);

  return {
    preconnect: (href) => addResourceHint(href, 'preconnect', true),
    dnsPrefetch: (href) => addResourceHint(href, 'dns-prefetch'),
    preload: (href) => addResourceHint(href, 'preload'),
    prefetch: (href) => addResourceHint(href, 'prefetch'),
  };
};

// Advanced intersection observer for performance
export const useAdvancedIntersection = (options = {}) => {
  const [entries, setEntries] = useState([]);
  const observerRef = useRef();
  const elementsRef = useRef(new Map());

  const observe = useCallback(
    (element, callback) => {
      if (!element) return;

      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver((entries) => {
          setEntries(entries);
          entries.forEach((entry) => {
            const callback = elementsRef.current.get(entry.target);
            if (callback) callback(entry);
          });
        }, options);
      }

      elementsRef.current.set(element, callback);
      observerRef.current.observe(element);

      return () => {
        if (observerRef.current && element) {
          observerRef.current.unobserve(element);
          elementsRef.current.delete(element);
        }
      };
    },
    [options]
  );

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      elementsRef.current.clear();
    }
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { observe, entries, disconnect };
};
