import "./index.css";
import React from "react";
import { useState, useEffect } from "react";

function App() {
  const [profile, setProfile] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [duration, setDuration] = useState("long_term");

  const profileURL = "https://spotify-app-alpha-six.vercel.app/api/me";
  const tracksURL = `https://spotify-app-alpha-six.vercel.app/api/me/top/tracks?time_range=${duration}`;
  const artistsURL = `https://spotify-app-alpha-six.vercel.app/api/me/top/artists?time_range=${duration}`;

  useEffect(() => {

    fetch(profileURL)
      .then((res) => res.json())
      .then((data) => setProfile(data));

    fetch(tracksURL)
      .then((res) => res.json())
      .then((data) => setTopTracks(data.items));

    fetch(artistsURL)
      .then((res) => res.json())
      .then((data) => setTopArtists(data.items));
  }, [duration]);

  const handleLogout = () => {
    window.location.href = "https://spotify-app-alpha-six.vercel.app";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-zinc-900 to-black text-white px-4 py-8">
      {profile && (
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-12">
          <img
            className="rounded-full h-24 w-24 sm:h-32 sm:w-32 border-4 border-zinc-800 shadow-2xl mb-4 sm:mb-6"
            src={profile.images[0]?.url}
            alt="Profile"
          />
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-400 mb-4 text-center">
            {profile.display_name}
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium flex items-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}

      <div className="mb-6 w-full max-w-md">
        <label htmlFor="duration" className="block text-neutral-200 mb-2 text-sm sm:text-base">
          Select Duration:
        </label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full bg-zinc-800 text-white rounded p-2 text-sm sm:text-base"
        >
          <option value="long_term">Past Year</option>
          <option value="medium_term">Last 6 Months</option>
          <option value="short_term">Last 4 Weeks</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row justify-center gap-8 w-full max-w-6xl">
        <div className="flex flex-col w-full">
          <h3 className="text-xl font-bold mb-2 text-neutral-200">
            Top Tracks
          </h3>
          <ul className="flex flex-col space-y-2 p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-sm w-full border border-zinc-800/50 shadow-xl overflow-y-auto max-h-[400px]">
            {topTracks &&
              topTracks.map((track) => (
                <li
                  className="flex items-center space-x-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 backdrop-blur-sm"
                  key={track.id}
                >
                  <img
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-xl ring-1 ring-white/10"
                    src={track.album?.images[1]?.url}
                    alt={track.name}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm sm:text-md text-neutral-200 truncate">
                      {track.name}
                    </span>
                    <span className="text-neutral-400 text-xs sm:text-sm truncate">
                      {track.artists[0]?.name}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        <div className="flex flex-col w-full">
          <h3 className="text-xl font-bold mb-2 text-neutral-200">
            Top Artists
          </h3>
          <ul className="flex flex-col space-y-2 p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-sm w-full border border-zinc-800/50 shadow-xl overflow-y-auto max-h-[400px]">
            {topArtists &&
              topArtists.map((artist) => (
                <li
                  className="flex items-center space-x-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 backdrop-blur-sm"
                  key={artist.id}
                >
                  <img
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-xl ring-1 ring-white/10"
                    src={artist.images[0]?.url}
                    alt={artist.name}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm sm:text-md text-neutral-200 truncate">
                      {artist.name}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
