class PlaylistNode {
  constructor(song) {
    this.song = song; // { id, title, artist, fileUrl }
    this.next = null;
    this.prev = null;
  }
}

class PlaylistLinkedList {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  addSong(song) {
    const newNode = new PlaylistNode(song);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.size++;
    return this;
  }

  removeSong(songId) {
    let current = this.head;
    while (current) {
      if (current.song.id === songId) {
        if (current.prev) current.prev.next = current.next;
        if (current.next) current.next.prev = current.prev;
        if (current === this.head) this.head = current.next;
        if (current === this.tail) this.tail = current.prev;
        this.size--;
        return true; // Successfully removed
      }
      current = current.next;
    }
    return false; // Not found
  }

  getSongsArray() {
    const songs = [];
    let current = this.head;
    while (current) {
      songs.push(current.song);
      current = current.next;
    }
    return songs;
  }
}

module.exports = PlaylistLinkedList;
