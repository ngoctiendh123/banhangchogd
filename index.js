import { db } from "./fire.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

let indexedDBInstance = null;

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    if (indexedDBInstance) return resolve(indexedDBInstance);
    const request = indexedDB.open("GroceryDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }
      // Thêm object store cho doanh thu
      if (!db.objectStoreNames.contains("revenues")) {
        db.createObjectStore("revenues", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      indexedDBInstance = event.target.result;
      resolve(indexedDBInstance);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function getAllProductsFromIndexedDB() {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("products", "readonly");
    const store = tx.objectStore("products");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Lỗi khi lấy sản phẩm từ IndexedDB");
  });
}

// Hàm lấy toàn bộ doanh thu từ IndexedDB (nếu cần)
async function getAllRevenuesFromIndexedDB() {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("revenues", "readonly");
    const store = tx.objectStore("revenues");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Lỗi khi lấy doanh thu từ IndexedDB");
  });
}

// Đồng bộ realtime collection products
function listenToFirebaseProducts() {
  onSnapshot(collection(db, "products"), async snapshot => {
    try {
      const dbInstance = await openIndexedDB();
      const tx = dbInstance.transaction("products", "readwrite");
      const store = tx.objectStore("products");

      snapshot.docChanges().forEach(change => {
        const id = parseInt(change.doc.id);
        const data = change.doc.data();

        if (change.type === "added" || change.type === "modified") {
          store.put({ id, ...data });
        } else if (change.type === "removed") {
          store.delete(id);
        }
      });
    } catch (error) {
      console.error("Lỗi khi đồng bộ realtime products:", error);
    }
  });
}

// Đồng bộ realtime collection revenues
function listenToFirebaseRevenues() {
  onSnapshot(collection(db, "revenues"), async snapshot => {
    try {
      const dbInstance = await openIndexedDB();
      const tx = dbInstance.transaction("revenues", "readwrite");
      const store = tx.objectStore("revenues");

      snapshot.docChanges().forEach(change => {
        const id = change.doc.id;  // id doanh thu thường là string hoặc tự tạo, không phải số
        const data = change.doc.data();

        if (change.type === "added" || change.type === "modified") {
          store.put({ id, ...data });
        } else if (change.type === "removed") {
          store.delete(id);
        }
      });
    } catch (error) {
      console.error("Lỗi khi đồng bộ realtime revenues:", error);
    }
  });
}

// Gọi hàm listen đồng bộ realtime cho cả 2 collection
function startRealtimeSync() {
  listenToFirebaseProducts();
  listenToFirebaseRevenues();
}
function listenToFirebaseChanges() {
  listenToFirebaseProducts();
  listenToFirebaseRevenues();
}
export {
  openIndexedDB,
  getAllProductsFromIndexedDB,
  getAllRevenuesFromIndexedDB,
  listenToFirebaseProducts,
  listenToFirebaseRevenues,
  startRealtimeSync,
  listenToFirebaseChanges
};
