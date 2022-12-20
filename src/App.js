import "./App.css";
import Axios from "axios";
import { useEffect, useState, useCallback } from "react";

function App() {
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchHistory, setSearchHistory] = useState();

  function searchLyrics() {
    if (artist === "" || song === "") {
      return;
    }
    Axios.get(`https://api.lyrics.ovh/v1/${artist}/${song}`)
      .then((res) => {
        setLyrics(res.data.lyrics);
      })
      .catch((error) => {
        setErrorMessage(error?.response?.data?.error);

        return error;
      });
  }

  const debounce = (func) => {
    let timer;
    return function (...args) {
      const context = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        func.apply(context, args);
      }, 1000);
    };
  };

  const handleArtistChange = (value) => {
    setArtist(value);
  };

  const handleSongChange = (value) => {
    setSong(value);
  };

  useEffect(() => {
    let data = JSON.parse(localStorage.getItem("history"));

    if (data) {
      setSearchHistory(data);
    } else {
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    if (artist !== "" && song !== "") {
      searchLyrics();
      saveToStorage();
    }
  }, [artist, song]);

  const optimizedArtistFn = useCallback(debounce(handleArtistChange), []);
  const optimizedSongAFn = useCallback(debounce(handleSongChange), []);

  const saveToStorage = () => {
    setSearchHistory((arr) => [
      ...arr,
      {
        artist: artist,
        song: song,
      },
    ]);

    localStorage.setItem("history", JSON.stringify(searchHistory));
  };

  return (
    <div className="App">
      <h1>Lyrics Finder</h1>

      <input
        className="inp"
        type="text"
        placeholder="Artist name"
        onChange={(e) => optimizedArtistFn(e.target.value)}
      />
      <input
        className="inp"
        type="text"
        placeholder="Song name"
        onChange={(e) => optimizedSongAFn(e.target.value)}
      />
      <hr />
      <pre>{lyrics}</pre>
      <pre className="error-message">{errorMessage}</pre>
      {searchHistory && searchHistory?.length && <h4>Recent Searches</h4>}
      {searchHistory?.map((item, i) => {
        return (
          <div key={i}>
            {item.artist} / {item.song}
          </div>
        );
      })}
    </div>
  );
}

export default App;
