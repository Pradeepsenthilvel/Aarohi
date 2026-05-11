class GenreNode {
  constructor(genreName) {
    this.name = genreName;
    this.songs = []; // Array of song objects belonging to this exact genre/subgenre
    this.children = {}; // Subgenres
  }
}

class GenreTree {
  constructor() {
    this.root = new GenreNode("All Music");
  }

  // Path could be an array like ["Rock", "Alternative Rock"]
  addSongToGenre(path, song) {
    let current = this.root;
    for (const genre of path) {
      if (!current.children[genre]) {
        current.children[genre] = new GenreNode(genre);
      }
      current = current.children[genre];
    }
    current.songs.push(song);
  }

  // Get all songs in a genre and its subgenres
  getAllSongsInGenre(path) {
    let current = this.root;
    for (const genre of path) {
      if (!current.children[genre]) {
        return []; // Genre not found
      }
      current = current.children[genre];
    }

    return this._collectSongs(current);
  }

  _collectSongs(node) {
    let allSongs = [...node.songs];
    for (const childKey in node.children) {
      allSongs = allSongs.concat(this._collectSongs(node.children[childKey]));
    }
    return allSongs;
  }
}

module.exports = GenreTree;
