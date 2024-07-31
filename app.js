const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

//Test for github commit

// Set up EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'playlist_manager_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id', connection.threadId);
});

// Routes

// Home Page
app.get('/', (req, res) => {
  res.render('home');
});

// View Playlists
app.get('/playlists', (req, res) => {
  const queryPlaylists = 'SELECT * FROM playlist';
  connection.query(queryPlaylists, (err, playlists) => {
    if (err) {
      console.error('Error fetching playlists:', err);
      res.status(500).send('Error fetching playlists');
      return;
    }
    res.render('playlists', { playlists });
  });
});

// Add Playlist Form
app.get('/addPlaylistForm', (req, res) => {
  res.render('addPlaylist');
});

app.post('/playlists', (req, res) => {
  const { title, description } = req.body;
  const query = 'INSERT INTO playlist (title, description) VALUES (?, ?)';
  connection.query(query, [title, description], (err, result) => {
    if (err) throw err;
    res.redirect('/playlists');
  });
});

// Add Video Form
app.get('/addVideoForm', (req, res) => {
  const queryPlaylists = 'SELECT * FROM playlist';
  connection.query(queryPlaylists, (err, playlists) => {
    if (err) throw err;
    res.render('addVideo', { playlists });
  });
});

app.post('/videos', (req, res) => {
  const { title, url, playlist_id } = req.body;
  const query = 'INSERT INTO video (title, url, playlist_id) VALUES (?, ?, ?)';
  connection.query(query, [title, url, playlist_id], (err, result) => {
    if (err) throw err;
    res.redirect('/playlists/' + playlist_id);
  });
});

// View Playlist Details
app.get('/playlists/:id', (req, res) => {
  const playlistId = req.params.id;
  const queryPlaylist = 'SELECT * FROM playlist WHERE id = ?';
  const queryVideos = 'SELECT * FROM video WHERE playlist_id = ?';
  connection.query(queryPlaylist, [playlistId], (err, playlists) => {
    if (err || playlists.length === 0) {
      console.error('Error fetching playlist details:', err);
      res.status(404).send('Playlist not found');
      return;
    }
    const playlist = playlists[0];
    connection.query(queryVideos, [playlistId], (err, videos) => {
      if (err) {
        console.error('Error fetching playlist videos:', err);
        res.status(500).send('Error fetching playlist videos');
        return;
      }
      res.render('playlist', { playlist, videos });
    });
  });
});

// View Video Details (Redirect to URL)
app.get('/videos/:id', (req, res) => {
  const videoId = req.params.id;
  const queryVideo = 'SELECT * FROM video WHERE id = ?';
  connection.query(queryVideo, [videoId], (err, videos) => {
    if (err || videos.length === 0) {
      console.error('Error fetching video details:', err);
      res.status(404).send('Video not found');
      return;
    }
    const video = videos[0];
    res.redirect(video.url);
  });
});

// Delete Playlist
app.post('/playlists/:id/delete', (req, res) => {
  const playlistId = req.params.id;
  console.log('Deleting playlist with ID:', playlistId);  // Debugging line
  const query = 'DELETE FROM playlist WHERE id = ?';
  connection.query(query, [playlistId], (err, result) => {
    if (err) {
      console.error('Error deleting playlist:', err);
      res.status(500).send('Error deleting playlist');
      return;
    }
    res.redirect('/playlists');
  });
});

// Delete Video
app.post('/videos/:id/delete', (req, res) => {
  const videoId = req.params.id;
  const query = 'DELETE FROM video WHERE id = ?';
  connection.query(query, [videoId], (err, result) => {
    if (err) {
      console.error('Error deleting video:', err);
      res.status(500).send('Error deleting video');
      return;
    }
    res.redirect('back');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
