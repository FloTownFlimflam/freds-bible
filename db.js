// db.js - IndexedDB Offline Storage Engine for Fred's Bible Reference

const DB_NAME = 'FredsBibleDB';
const DB_VERSION = 1;
const STORE_VERSES = 'verses';

/**
 * Initialize IndexedDB instance
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_VERSES)) {
        const store = db.createObjectStore(STORE_VERSES, { keyPath: 'id' });
        store.createIndex('book_chapter', ['book', 'chapter'], { unique: false });
        store.createIndex('text', 'text', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an array of verse objects to local IndexedDB
 * Verse object format: { id: "JHN.3.16", book: "John", chapter: 3, verse: 16, text: "..." }
 */
export async function saveVerses(verses) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VERSES, 'readwrite');
    const store = tx.objectStore(STORE_VERSES);

    verses.forEach((verse) => store.put(verse));

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve verses for a specific book and chapter
 */
export async function getChapterVerses(book, chapter) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VERSES, 'readonly');
    const store = tx.objectStore(STORE_VERSES);
    const index = store.index('book_chapter');
    const request = index.getAll([book, parseInt(chapter, 10)]);

    request.onsuccess = () => {
      const results = request.result || [];
      // Sort numerically by verse number
      results.sort((a, b) => a.verse - b.verse);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Local offline search across all cached verses
 */
export async function searchLocalVerses(query) {
  if (!query || query.trim().length < 2) return [];
  const db = await openDB();
  const cleanQuery = query.toLowerCase().trim();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VERSES, 'readonly');
    const store = tx.objectStore(STORE_VERSES);
    const request = store.openCursor();
    const matches = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.text.toLowerCase().includes(cleanQuery)) {
          matches.push(cursor.value);
        }
        if (matches.length >= 50) {
          // Cap search results at 50 for rapid UI response
          resolve(matches);
          return;
        }
        cursor.continue();
      } else {
        resolve(matches);
      }
    };

    request.onerror = () => reject(request.error);
  });
}