import './index.css';
import React from 'react';
import { useState, useEffect } from 'react';

function App() {
  const [profile, setProfile] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [duration, setDuration] = useState('long_term');

  const profileURL = 'http://localhost:3000/api/me'
  const tracksURL = `http://localhost:3000/api/me/top/tracks?time_range=${duration}`
  const artistsURL = `http://localhost:3000/api/me/top/artists?time_range=${duration}`;

  useEffect(() => {
    fetch(profileURL).then(res => res.json()).then(data => setProfile(data));

    fetch(tracksURL).then(res => res.json()).then(data => setTopTracks(data.items));

    fetch(artistsURL).then(res => res.json()).then(data => setTopArtists(data.items));
  }, [duration]);

  return (
    <>
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black text-white p-4'>

        {profile && (
          <div className='flex flex-col items-center align-text justify-center mb-12'>
            <img className="rounded-full h-64 w-64 border-4 border-zinc-800 shadow-2xl mb-6"
              src={profile.images[0]?.url}
              alt='Profile'>
            </img>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-400">
              {profile.display_name}
            </h1>
          </div>
        )}


        <div className="mb-4">
          <label htmlFor="duration" className="mr-2 text-neutral-200">Select Duration:</label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="bg-zinc-800 text-white rounded p-2"
          >
            <option value="long_term">Past Year</option>
            <option value="medium_term">Last 6 Months</option>
            <option value="short_term">Last 4 Weeks</option>
          </select>
        </div>

        <div className='flex flex-row justify-center space-x-8 w-full'>

          <div className='flex flex-col w-full max-w-md'>
            <h3 className="text-xl font-bold mb-2 text-neutral-200">Top Tracks</h3>
            <ul className='flex flex-col space-y-2 p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-sm w-full max-w-md border border-zinc-800/50 shadow-xl overflow-y-auto'>
              {topTracks && topTracks.map(track => (
                <li className='flex items-center space-x-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 backdrop-blur-sm'
                  key={track.id}>
                  <img className='w-16 h-16 rounded-lg shadow-xl ring-1 ring-white/10'
                    src={track.album?.images[1]?.url} alt={track.name}>
                  </img>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-md text-neutral-200'>{track.name}</span>
                    <span className='text-neutral-400 text-sm'>{track.artists[0]?.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>


          <div className='flex flex-col w-full max-w-md'>
            <h3 className="text-xl font-bold mb-2 text-neutral-200">Top Artists</h3>
            <ul className='flex flex-col space-y-2 p-4 rounded-2xl bg-zinc-900/50 backdrop-blur-sm w-full max-w-md border border-zinc-800/50 shadow-xl overflow-y-auto'>
              {topArtists && topArtists.map(artist => (
                <li className='flex items-center space-x-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all duration-300 backdrop-blur-sm'
                  key={artist.id}>
                  <img className='w-16 h-16 rounded-lg shadow-xl ring-1 ring-white/10'
                    src={artist.images[0]?.url} alt={artist.name}>
                  </img>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-md text-neutral-200'>{artist.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div >
    </>
  )
}

export default App
