
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

let db;

async function initDatabase() {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('offline_storage.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      prop_uid TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );
  `);

  return db;
}

export function useOfflineStorage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setReady(true));
  }, []);

  async function saveCollectionLocally(prop_uid, date, status) {
    const database = await initDatabase();
    const id = `${prop_uid}_${date}_${Date.now()}`;

    await database.runAsync(
      'INSERT INTO collections (id, prop_uid, date, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, prop_uid, date, status, new Date().toISOString()]
    );

    return id;
  }

  async function getUnsyncedCollections() {
    const database = await initDatabase();
    const result = await database.getAllAsync('SELECT * FROM collections WHERE synced = 0');
    return result;
  }

  async function markCollectionSynced(id) {
    const database = await initDatabase();
    await database.runAsync('UPDATE collections SET synced = 1 WHERE id = ?', [id]);
  }

  async function addToSyncQueue(action, payload) {
    const database = await initDatabase();
    const id = `${action}_${Date.now()}`;

    await database.runAsync(
      'INSERT INTO sync_queue (id, action, payload, created_at) VALUES (?, ?, ?, ?)',
      [id, action, JSON.stringify(payload), new Date().toISOString()]
    );

    return id;
  }

  async function getSyncQueue() {
    const database = await initDatabase();
    const result = await database.getAllAsync('SELECT * FROM sync_queue WHERE synced = 0');
    return result;
  }

  async function markSyncQueueItemSynced(id) {
    const database = await initDatabase();
    await database.runAsync('UPDATE sync_queue SET synced = 1 WHERE id = ?', [id]);
  }

  async function clearOldData(daysToKeep = 30) {
    const database = await initDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await database.runAsync('DELETE FROM collections WHERE created_at < ? AND synced = 1', [
      cutoffDate.toISOString(),
    ]);
  }

  return {
    ready,
    saveCollectionLocally,
    getUnsyncedCollections,
    markCollectionSynced,
    addToSyncQueue,
    getSyncQueue,
    markSyncQueueItemSynced,
    clearOldData,
  };
}
