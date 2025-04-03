import express from 'express';
import cors from 'cors';
import querystring from 'querystring';
import randomstring from 'randomstring';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

const client_secret = process.env.CLIENT_ID;
const client_id = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

let access_token = null;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.json({
        message: "Welcome to the Spotify App API"
    })
})

app.get('/api/login', async (req, res) => {
    const state = randomstring.generate(16);
    const scope = 'user-read-private user-read-email user-top-read';

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }))
})

app.get('/api/callback', async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    const url = 'https://accounts.spotify.com/api/token';

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: querystring.stringify({
                code: code,
                redirect_uri: redirect_uri,
                grant_type: "authorization_code",
                client_id: client_id,
                client_secret: client_secret
            })
        })
        const data = await response.json();
        access_token = data.access_token;
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get access token' });
    }
})

app.get('/api/me', async (req, res) => {
    const url = 'https://api.spotify.com/v1/me ';

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})

app.get('/api/me/top/tracks', async (req, res) => {
    const time_range = req.query.time_range || 'long_term';
    const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=5`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})

app.get('/api/me/top/artists', async (req, res) => {
    const time_range = req.query.time_range || 'long_term';
    const url = `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=5`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})



app.listen(PORT, () => {
    console.log(`Serve is running on port ${PORT}`);
})