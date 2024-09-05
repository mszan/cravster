import { useState } from "react";
import store from "store";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = store.get(key);
            return item ? item : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                store.set(key, valueToStore);
            }
        } catch (error) {
            console.log(error);
        }
    };
    return [storedValue, setValue] as const;
}
