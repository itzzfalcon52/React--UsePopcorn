import { useEffect, useState } from "react";

export function useLocalStorageState(initialState, key) {
  //we also have to pass the key as the user can name anything to the local storage
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );
  return [value, setValue];
}
