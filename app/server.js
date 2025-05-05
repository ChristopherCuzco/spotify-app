// ... existing imports and setup ...

// Add this with your other routes
app.post('/api/logout', (req, res) => {
  // Clear the session cookie
  res.clearCookie('spotify_access_token');
  res.clearCookie('spotify_refresh_token');
  
  // Send success response
  res.status(200).json({ message: 'Logged out successfully' });
});

// ... rest of your server code ... 