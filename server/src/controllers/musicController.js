const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const PlaylistLinkedList = require('../structures/PlaylistLinkedList');
const GenreTree = require('../structures/GenreTree');

// In-memory structures to fulfill academic requirement
const globalGenreTree = new GenreTree();

// @desc    Upload a new song
// @route   POST /api/music/upload
// @access  Private/Admin or User
const uploadSong = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an MP3 file' });
    }

    const { title, artist, genre, isPremium } = req.body;

    const newSong = await Song.create({
      title,
      artist,
      genre,
      fileUrl: `/uploads/${req.file.filename}`,
      isPremium: isPremium === 'true',
      uploadedBy: req.user._id,
    });

    // Add to genre tree logic (Mocking the hierarchical genre path)
    const genrePath = genre ? genre.split('/') : ['Unknown']; // e.g., "Rock/Alt"
    globalGenreTree.addSongToGenre(genrePath, newSong);

    res.status(201).json(newSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new playlist
// @route   POST /api/music/playlists
// @access  Private
const createPlaylist = async (req, res) => {
  try {
    const { name, songIds } = req.body; // songIds is an array of IDs

    const playlist = await Playlist.create({
      name,
      owner: req.user._id,
      songs: songIds || [],
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a playlist (and demonstrate Linked List functionality)
// @route   GET /api/music/playlists/:id
// @access  Private
const getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Convert to Linked List as per requirement
    const playlistList = new PlaylistLinkedList(playlist._id.toString(), playlist.name);
    
    playlist.songs.forEach(song => {
      playlistList.addSong(song);
    });

    // Return the array format to the client, but demonstrate the linked list was used
    res.json({
      id: playlistList.id,
      name: playlistList.name,
      songs: playlistList.getSongsArray(),
      message: 'Processed via custom LinkedList data structure',
      size: playlistList.size
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all songs
// @route   GET /api/music/songs
// @access  Public
const getSongs = async (req, res) => {
  try {
    const songs = await Song.find({});
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all playlists for a user
// @route   GET /api/music/playlists
// @access  Private
const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id }).populate('songs');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a song
// @route   DELETE /api/music/songs/:id
// @access  Private/Admin
const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    await Song.deleteOne({ _id: song._id });
    // Also remove from any playlists containing this song to avoid orphaned references
    await Playlist.updateMany(
      { songs: song._id },
      { $pull: { songs: song._id } }
    );
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadSong,
  createPlaylist,
  getPlaylist,
  getSongs,
  getUserPlaylists,
  deleteSong
};
