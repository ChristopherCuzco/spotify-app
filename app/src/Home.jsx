import React from "react";
import { useState, useEffect } from "react";

function Home() {
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [related, setRelated] = useState([]);
  
  // const profileURL = "http://localhost:3000/api/artists";
  // const tracksURL = "http://localhost:3000/api/artists/tracks";
  // const relatedURL = "http://localhost:3000/api/artists/related";

  const profileURL = "https://spotify-app-alpha-six.vercel.app/api/artists";
  const tracksURL = "https://spotify-app-alpha-six.vercel.app/api/artists/tracks";
  const relatedURL = "https://spotify-app-alpha-six.vercel.app/api/artists/related";

  useEffect(() => {
    fetch(profileURL)
      .then((res) => res.json())
      .then((data) => {
        setArtist(data);
      });

    fetch(tracksURL)
      .then((res) => res.json())
      .then((data) => {
        setTracks(data.tracks);
      });

    fetch(relatedURL)
      .then((res) => res.json())
      .then((data) => {
        setRelated(data.artists);
      });
  }, []);

  const handleLogin = () => {
    // window.location.href = "http://localhost:3000/api/login";
    window.location.href = "https://spotify-app-alpha-six.vercel.app/api/login"
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black text-white ">
        {artist && (
          <div className="flex flex-col items-center align-text justify-center mb-12">
            <img
              className="rounded-full h-64 w-64 border-4 border-zinc-800 shadow-2xl mb-6"
              src={artist.images[0]?.url}
              alt="Profile"
            ></img>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-400 mb-4">
              {artist.name}
            </h1>
            <button
              onClick={handleLogin}
              className="px-8 py-3 bg-green-500/90 text-white rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Login with Spotify
            </button>
          </div>
        )}

        <div className="flex flex-row justify-center space-x-8 w-full">
          <div className="flex flex-col w-full max-w-md">
            <h3 className="text-xl font-bold mb-2 text-neutral-200">
              Top Tracks
            </h3>
            <ul className="flex flex-col space-y-2 p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-sm w-full max-w-md border border-zinc-800/50 shadow-xl overflow-y-auto">
              {tracks &&
                tracks.slice(0, 5).map((track) => (
                  <li
                    className="flex items-center space-x-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 backdrop-blur-sm"
                    key={track.id}
                  >
                    <img
                      className="w-16 h-16 rounded-lg shadow-xl ring-1 ring-white/10"
                      src={track.album?.images[0]?.url}
                      alt={track.name}
                    ></img>
                    <div className="flex flex-col">
                      <span className="font-semibold text-md text-neutral-200">
                        {track.name}
                      </span>
                      <span className="text-neutral-400 text-sm">
                        {track.artists[0]?.name}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>

          <div className="flex flex-col w-full max-w-md">
            <h3 className="text-xl font-bold mb-2 text-neutral-200">
              Top Artists
            </h3>
            <ul className="flex flex-col space-y-2 p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-sm w-full max-w-md border border-zinc-800/50 shadow-xl overflow-y-auto">
              {related &&
                related.slice(0, 5).map((artist) => (
                  <li
                    className="flex items-center space-x-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 backdrop-blur-sm"
                    key={artist.id}
                  >
                    <img
                      className="w-16 h-16 rounded-lg shadow-xl ring-1 ring-white/10"
                      src={artist.images[0]?.url}
                      alt={artist.name}
                    ></img>
                    <div className="flex flex-col">
                      <span className="font-semibold text-md text-neutral-200">
                        {artist.name}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
