import "./App.css";
import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "dcc92627";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isloading, setIsLoading] = useState(false); //to show a loader whane movies are loading
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null); //we need this to selected the movie when user clicks on a movie
  //const tempQuery = "interstellar";
  function handleSelectedMovie(id) {
    setSelectedID((selectedID) => (id === selectedID ? null : id)); //we do this here bcz we want when a user clicks on the movie again the movie details should close
  }
  function handleCloseMovie() {
    setSelectedID(null);
  }
  function handleAddWatch(movie) {
    setWatched((movies) => {
      return [...movies, movie];
    });
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true); //we set as true to show
          const movie = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
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
      handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      {/* without component composition------><Navigation movies={movies} />*/}
      <Navigation>
        {/*with component composition*/}
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navigation>

      <Main>
        <ListBox>
          {/*here,we use a single box i.e listbox to pass in as chuldren what we need for both boxes*/}
          {/*isloading ? <Loader /> : <MoviesList movies={movies} />*/}
          {!isloading && !error && (
            <MoviesList
              movies={movies}
              handleSelectedMovie={handleSelectedMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
          {isloading && <Loader />}
          {/*here we do 2 lvls of component composition as we actualy need the movies list in main->listbox->movieslist*/}
        </ListBox>
        <ListBox>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              onCloseMovie={handleCloseMovie}
              onAddWatch={handleAddWatch}
              watched={watched}
            />
          ) : (
            <>
              {" "}
              <WatchedSummary watched={watched} />
              <WatchedMovieslist
                watched={watched}
                onDelete={handleDeleteWatched}
              />
            </>
          )}
        </ListBox>
      </Main>
    </>
  );
}

/* -----------without component composition-----------
  function Navigation({ movies }) {
  return (
    <nav className="nav-bar">
      <Logo />

      <Search />
      <NumResults movies={movies} />
    </nav>
  );
} */
function Loader() {
  return <div className="spinner"></div>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔️</span>
      {message}
    </p>
  );
}

function Navigation({ children }) {
  //-------with component composition ---------
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function BtnToggle({ handleFunction, state }) {
  return (
    <button className="btn-toggle" onClick={handleFunction}>
      {state ? "-" : "+"}
    </button>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>; //--------component composition-----------
}
//---------------here,we can see similarities between these two boxes,so what we can do i make a single reusable box using component composition---------------------
/* 
function MoviesListBox({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  function HandleShowList() {
    setIsOpen1((isOpen) => !isOpen);
  }

  return (
    <div className="box">
      <BtnToggle handleFunction={HandleShowList} state={isOpen1} />
      {isOpen1 && children}
      // here we use component composition to avoid prop drilling!!!!
    </div>
  );
}
*/

/* 
function WatchedMoviesBox({ watched }) {
  const [isOpen2, setIsOpen2] = useState(true);
  function HandleShowList() {
    setIsOpen2((isOpen) => !isOpen);
  }
  return (
    <div className="box">
      <BtnToggle handleFunction={HandleShowList} state={isOpen2} />
      <WatchedSummary watched={watched} />
      {isOpen2 && <WatchedMovieslist watched={watched} />}
    </div>
  );
}
*/
//-----------here,with help of component composition,we used a single box for both-------
function ListBox({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  function HandleShowList() {
    setIsOpen((isOpen) => !isOpen);
  }

  return (
    <div className="box">
      <BtnToggle handleFunction={HandleShowList} state={isOpen} />
      {isOpen && children}
      {/* here we use component composition to avoid prop drilling!!!!*/}
    </div>
  );
}

function MoviesList({ movies, handleSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
}
function Movie({ movie, handleSelectedMovie }) {
  return (
    <li onClick={() => handleSelectedMovie(movie.imdbID)}>
      {" "}
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function MovieDetails({ selectedID, onCloseMovie, onAddWatch, watched }) {
  const [movie, setMovie] = useState({}); //we need this piece of state to store the movie details object
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  const isWatched = watched.some(
    (Watchedmovie) => Watchedmovie.imdbID === movie.imdbID
  );
  const watchedUserRating = watched.find(
    (watchedMovie) => watchedMovie.imdbID === selectedID
  )?.userRating;

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", callBack);
      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },

    [onCloseMovie]
  );

  useEffect(
    function () {
      setIsLoading(true);
      async function loadMovieDetails() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&i=${selectedID}`
          );
          const data = await res.json();
          console.log(data);
          setMovie(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
      loadMovieDetails();
    },
    [selectedID]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `MOVIE| ${title}`;

      // Change favicon to movie poster
      if (poster) {
        const favicon =
          document.querySelector("link[rel='icon']") ||
          document.createElement("link");
        favicon.rel = "icon";
        favicon.href = poster; // poster should be a valid image URL (jpg/png)
        document.head.appendChild(favicon);

        return function () {
          document.title = "Usepopcorn 🍿";
          const favicon = document.querySelector("link[rel='icon']");
          if (favicon) {
            favicon.href = "/favicon.ico"; // path in public folder
          }
        };
      }
    },
    [title, poster]
  );
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: +imdbRating,
      runtime: +runtime.split(" ").at(0),
      userRating,
    };
    onAddWatch(newWatchedMovie);
    onCloseMovie(newWatchedMovie);
  }
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {" "}
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${title}`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released}&bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    className="rating"
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p style={{ fontSize: "30px" }}>
                  You already rated this Movie with {watchedUserRating}/10 ⭐️
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Strring:{actors}</p>
            <p>Directed By:{director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieslist({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDelete={onDelete} />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
          <span>X</span>
        </button>
      </div>
    </li>
  );
}
