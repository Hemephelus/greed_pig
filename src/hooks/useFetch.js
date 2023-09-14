import { useState } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    async function getData() {
      try {
        const response = fetch(url);
        if (!response.ok) {
          throw new Error("Error with data");
        }
        let jsonData = await response.json();
        setData(jsonData);
        setIsLoading(false);
      } catch (e) {
        setError(e);
        setIsLoading(false);
      }
    }

    getData();
  }, [url]);

  return [data, isLoading, error];
}

import { useState, useEffect } from "react";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch(url, {
          method: "GET",
          //   headers: {
          //     'Content-Type': 'application/json'
          //   },
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setData(data);
        setIsLoading(false);
      } catch (error) {
        if (error.name === "AbortError") {
          // Do nothing if request was aborted
        } else {
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
