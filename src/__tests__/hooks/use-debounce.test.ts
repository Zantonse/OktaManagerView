import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/lib/hooks/use-debounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should return updated value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    act(() => {
      rerender({ value: 'updated', delay: 500 });
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should not update while within delay period', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 500 },
      }
    );

    expect(result.current).toBe('first');

    act(() => {
      rerender({ value: 'second', delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe('first');

    act(() => {
      rerender({ value: 'third', delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe('first');
  });

  it('should reset timer on value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    act(() => {
      rerender({ value: 'first', delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('initial');

    act(() => {
      rerender({ value: 'second', delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('second');
  });

  it('should update with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    act(() => {
      rerender({ value: 'updated', delay: 300 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');

    act(() => {
      rerender({ value: 'next', delay: 1000 });
    });

    expect(result.current).toBe('updated');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('next');
  });

  it('should cancel pending update on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    act(() => {
      rerender({ value: 'updated', delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // The value should not have updated after unmount
    // (We can't directly check this, but the cleanup should prevent the state update warning)
  });

  it('should handle rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    act(() => {
      rerender({ value: 'change1', delay: 500 });
      vi.advanceTimersByTime(100);

      rerender({ value: 'change2', delay: 500 });
      vi.advanceTimersByTime(100);

      rerender({ value: 'change3', delay: 500 });
      vi.advanceTimersByTime(100);

      rerender({ value: 'change4', delay: 500 });
      vi.advanceTimersByTime(100);

      rerender({ value: 'final', delay: 500 });
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('final');
  });

  it('should handle string values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: '', delay: 300 },
      }
    );

    expect(result.current).toBe('');

    act(() => {
      rerender({ value: 'search', delay: 300 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('search');
  });

  it('should handle number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 200 },
      }
    );

    expect(result.current).toBe(0);

    act(() => {
      rerender({ value: 42, delay: 200 });
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(42);
  });

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: false, delay: 400 },
      }
    );

    expect(result.current).toBe(false);

    act(() => {
      rerender({ value: true, delay: 400 });
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe(true);
  });

  it('should handle object values', () => {
    const initialObj = { name: 'John', age: 30 };
    const updatedObj = { name: 'Jane', age: 25 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 500 },
      }
    );

    expect(result.current).toEqual(initialObj);

    act(() => {
      rerender({ value: updatedObj, delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toEqual(updatedObj);
  });

  it('should handle array values', () => {
    const initialArray = ['item1', 'item2'];
    const updatedArray = ['item1', 'item2', 'item3'];

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialArray, delay: 500 },
      }
    );

    expect(result.current).toEqual(initialArray);

    act(() => {
      rerender({ value: updatedArray, delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toEqual(updatedArray);
  });

  it('should handle null values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial' as string | null, delay: 300 },
      }
    );

    act(() => {
      rerender({ value: null, delay: 300 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBeNull();
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 },
      }
    );

    act(() => {
      rerender({ value: 'updated', delay: 0 });
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle very large delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 60000 }, // 60 seconds
      }
    );

    act(() => {
      rerender({ value: 'updated', delay: 60000 });
    });

    act(() => {
      vi.advanceTimersByTime(30000); // Advance 30 seconds
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(30000); // Advance another 30 seconds
    });

    expect(result.current).toBe('updated');
  });

  it('should maintain separation between multiple hook instances', () => {
    const { result: result1, rerender: rerender1 } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'hook1-initial', delay: 300 },
      }
    );

    const { result: result2, rerender: rerender2 } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'hook2-initial', delay: 500 },
      }
    );

    act(() => {
      rerender1({ value: 'hook1-updated', delay: 300 });
      rerender2({ value: 'hook2-updated', delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result1.current).toBe('hook1-updated');
    expect(result2.current).toBe('hook2-initial');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result2.current).toBe('hook2-updated');
  });

  it('should work with use case: search input debouncing', () => {
    const { result, rerender } = renderHook(
      ({ searchTerm, delay }) => useDebounce(searchTerm, delay),
      {
        initialProps: { searchTerm: '', delay: 500 },
      }
    );

    // User types "a"
    act(() => {
      rerender({ searchTerm: 'a', delay: 500 });
    });
    expect(result.current).toBe('');

    // User types "al"
    act(() => {
      rerender({ searchTerm: 'al', delay: 500 });
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('');

    // User types "ali"
    act(() => {
      rerender({ searchTerm: 'ali', delay: 500 });
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('');

    // User stops typing, wait for delay
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe('ali');
  });
});
