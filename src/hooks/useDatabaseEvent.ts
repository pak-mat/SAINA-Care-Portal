import { useEffect } from 'react';

/**
 * A custom hook to listen for local database events dispatched to the window.
 * 
 * @param eventName The name of the event to listen for (e.g., 'db_updated', 'social_db_updated')
 * @param callback The function to execute when the event is triggered
 */
export function useDatabaseEvent(eventName: string, callback: () => void) {
  useEffect(() => {
    window.addEventListener(eventName, callback);
    return () => {
      window.removeEventListener(eventName, callback);
    };
  }, [eventName, callback]);
}
