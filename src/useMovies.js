import { useEffect, useState } from "react";
const key = "dcc92627";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isloading, setIsLoading] = useState(false); //to show a loader whane movies are loading
  const [error, setError] = useState("");
  useEffect(
    function () {
      callback?.();
      const controller = new AbortController(); //to abort the api
      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true); //we set as true to show
          const movie = await fetch(
            `https://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!movie.ok)
            throw new Error(
              "uh-oh something went wrong please try again later..😔"
            );
          const movieData = await movie.json();
          if (movieData.Response === "False") {
            throw new Error(" no movie found with that name😔");
          }
          setMovies(movieData.Search || []); // handle undefined safely
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false); //after every data is loaded we set it back to false
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      // handleCloseMovie(); instead of this ,we specify callback in start of useeffect
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query, callback]
  );
  return { movies, isloading, error };
}
