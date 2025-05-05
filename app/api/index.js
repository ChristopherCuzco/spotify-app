import express from 'express';
import cors from 'cors';
import querystring from 'querystring';
import randomstring from 'randomstring';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
// const PORT = 3000;

const client_secret = process.env.CLIENT_SECRET;
const client_id = process.env.CLIENT_ID;
const redirect_uri = process.env.REDIRECT_URI;

app.use(cors({
    origin: 'https://spotify-app-alpha-six.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const tokenSchema = new mongoose.Schema({
    userId: String,
    access_token: String,
    refresh_token: String,
    expires_at: Number
}, { collection: 'spotify_tokens' });

const Token = mongoose.model('Token', tokenSchema);

async function getValidToken(userId) {
    try {
        let token = await Token.findOne({ userId });

        if (!token) {
            throw new Error('No token found for user');
        }

        // If token is expired, refresh it
        if (Date.now() >= token.expires_at) {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: querystring.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: token.refresh_token,
                    client_id: client_id,
                    client_secret: client_secret
                })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            token.access_token = data.access_token;
            token.expires_at = Date.now() + (data.expires_in * 1000);
            await token.save();

            return token.access_token;
        }

        return token.access_token;
    } catch (error) {
        console.error('Error in getValidToken:', error);
        throw error;
    }
}

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
            const errorText = await response.text();
            console.error('Token request failed:', response.status, errorText);
            throw new Error(`Token request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        // Get user info from Spotify
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });


        console.log(userResponse);

        if (!userResponse.ok) {
            throw new Error('Failed to get user info');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Save token to MongoDB with userId
        await Token.findOneAndUpdate(
            { userId },
            {
                userId,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: Date.now() + (data.expires_in * 1000)
            },
            { upsert: true, new: true }
        );

        // Redirect to the dashboard with userId
        res.redirect(`https://spotify-app-alpha-six.vercel.app/dashboard?userId=${userId}`);
    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({ error: 'Failed to get access token' });
    }
});

app.get('/api/me', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const access_token = await getValidToken(userId);
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.get('/api/me/top/tracks', async (req, res) => {
    const time_range = req.query.time_range || 'long_term';
    const userId = req.query.userId;
    const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=5`;

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const access_token = await getValidToken(userId);
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Tracks fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch tracks' });
    }
});

app.get('/api/me/top/artists', async (req, res) => {
    const time_range = req.query.time_range || 'long_term';
    const userId = req.query.userId;
    const url = `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=5`;

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const access_token = await getValidToken(userId);
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Artists fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch artists' });
    }
});

/// Home Functions

async function getAccessToken() {
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

app.get('/api/artists', async (req, res) => {
    const url = 'https://api.spotify.com/v1/artists/2kCcBybjl3SAtIcwdWpUe3';
    const token = await getAccessToken();
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})

app.get('/api/artists/tracks', async (req, res) => {
    const url = 'https://api.spotify.com/v1/artists/2kCcBybjl3SAtIcwdWpUe3/top-tracks?market=US';
    const token = await getAccessToken();
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})

app.get('/api/artists/related', async (req, res) => {

    // 5g63iWaMJ2UrkZMkCC8dMi (tracy)
    // 1VKWlHqcqwmU9CGKkJR09R (nedarb)
    // 0LBfcXnrLErD1afLyzB2xA (horse head)
    // 1fsCfvdiomqjKJFR6xI8e4 (cold hart)
    // 1VPmR4DJC1PlOtd0IADAO0 (sb)

    const url = 'https://api.spotify.com/v1/artists?ids=5g63iWaMJ2UrkZMkCC8dMi,1VKWlHqcqwmU9CGKkJR09R,0LBfcXnrLErD1afLyzB2xA,1fsCfvdiomqjKJFR6xI8e4,1VPmR4DJC1PlOtd0IADAO0'
    const token = await getAccessToken();
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
})

app.post('/api/logout', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        await Token.deleteOne({ userId });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

export default app;

// app.listen(PORT, () => {
//     console.log(`Serve is running on port ${PORT}`);
// })

