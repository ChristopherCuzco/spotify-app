import express from 'express';
import cors from 'cors';
import querystring from 'querystring';
import randomstring from 'randomstring';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// const PORT = 3000;

const client_secret = process.env.CLIENT_SECRET;
const client_id = process.env.CLIENT_ID;
const redirect_uri = process.env.REDIRECT_URI;

let clientToken = {
    access_token: null,
    expires_at: 0
};


app.use(cors({
    origin: 'https://spotify-app-alpha-six.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.get('/api', (req, res) => {
    res.json({
        message: "Welcome to the Spotify App API"
    });
});

/// Dashboard Functions

app.get('/api/login', async (req, res) => {
    try {
        const state = randomstring.generate(16);
        const scope = 'user-read-private user-read-email user-top-read';

        const authUrl = 'https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state,
                show_dialog: true
            });

        console.log('Redirecting to:', authUrl); // Debug log
        res.redirect(authUrl);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to initiate login' });
    }
});

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
        });

        if (!response.ok) {
            throw new Error(`Token request failed: ${response.status}`);
        }

        const data = await response.json();
        clientToken = {
            access_token: data.access_token,
            expires_at: Date.now() + (data.expires_in * 1000)
        };

        // Redirect to the dashboard
        const redirectUrl = 'https://spotify-app-alpha-six.vercel.app/dashboard'
 
            
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({ error: 'Failed to get access token' });
    }
});

app.get('/api/me', async (req, res) => {
    const url = 'https://api.spotify.com/v1/me ';

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${clientToken.access_token}`
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
                'Authorization': `Bearer ${clientToken.access_token}`
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
                'Authorization': `Bearer ${clientToken.access_token}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})

/// Home Functions

async function getAccessToken(){
    const url = 'https://accounts.spotify.com/api/token';
    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
        },
        body: querystring.stringify({
            grant_type: 'client_credentials'
        })
    });
    const data = await response.json();
    return data.access_token;
}

app.get('/api/artists', async (req,res) => {
    const url = 'https://api.spotify.com/v1/artists/2kCcBybjl3SAtIcwdWpUe3';
    const token = await getAccessToken();
    try{
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        res.json(data);
    }  catch (error){
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})

app.get('/api/artists/tracks', async (req,res) => {
    const url = 'https://api.spotify.com/v1/artists/2kCcBybjl3SAtIcwdWpUe3/top-tracks?market=US';
    const token = await getAccessToken();
    try{
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`            
                }
        });

        const data = await response.json();
        res.json(data);
    }  catch (error){
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})

app.get('/api/artists/related', async (req,res) => {

    // 5g63iWaMJ2UrkZMkCC8dMi (tracy)
    // 1VKWlHqcqwmU9CGKkJR09R (nedarb)
    // 0LBfcXnrLErD1afLyzB2xA (horse head)
    // 1fsCfvdiomqjKJFR6xI8e4 (cold hart)
    // 1VPmR4DJC1PlOtd0IADAO0 (sb)

    const url = 'https://api.spotify.com/v1/artists?ids=5g63iWaMJ2UrkZMkCC8dMi,1VKWlHqcqwmU9CGKkJR09R,0LBfcXnrLErD1afLyzB2xA,1fsCfvdiomqjKJFR6xI8e4,1VPmR4DJC1PlOtd0IADAO0'
    const token = await getAccessToken();
    try{
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        res.json(data);
    }  catch (error){
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})


app.post('/api/logout', (req,res) =>{
    res.clearCookie('spotify_access_token');
    res.clearCookie('spotify_refresh_token');
    res.status(200).json({ message: 'Logged out successfully' });
});

export default app;

// app.listen(PORT, () => {
//     console.log(`Serve is running on port ${PORT}`);
// })

