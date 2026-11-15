
import { useState, useEffect } from "react";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    setIsLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const response = await fetch(url, {
          method: "GET",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const jsonData = await response.json();

        setData(jsonData);
        setIsLoading(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error);
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [url]);

  return [data, isLoading, error];
}

export default useFetch;
export { useFetch };
