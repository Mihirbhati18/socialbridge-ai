export interface QueuedIssue {
  id?: number;
  data: any;
  timestamp: number;
}

export const initDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('ConcordOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('issueQueue')) {
        db.createObjectStore('issueQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const addToQueue = async (issueData: any) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['issueQueue'], 'readwrite');
    const store = transaction.objectStore('issueQueue');
    const request = store.add({
      data: issueData,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getQueue = async (): Promise<QueuedIssue[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['issueQueue'], 'readonly');
    const store = transaction.objectStore('issueQueue');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const removeFromQueue = async (id: number) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['issueQueue'], 'readwrite');
    const store = transaction.objectStore('issueQueue');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
