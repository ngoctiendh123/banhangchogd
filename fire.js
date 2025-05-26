import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCg1SRJw2BRm5501jNXBwaMFlF_NFXgqo",
  authDomain: "quanlinhahang-e9a38.firebaseapp.com",
  projectId: "quanlinhahang-e9a38",
  storageBucket: "quanlinhahang-e9a38.firebasestorage.app",
  messagingSenderId: "334232846720",
  appId: "1:334232846720:web:122dc4ff290d563b078165",
  measurementId: "G-FC4GH2YVBM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };

export async function checkFirebaseConnection() {
  try {
    const colRef = collection(db, "products");
    await getDocs(colRef);
    return { success: true, message: "Kết nối Firebase thành công." };
  } catch (error) {
    return { success: false, message: "Không thể kết nối Firebase: " + error.message };
  }
}

async function getNextProductId() {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);
  let ids = snapshot.docs
    .map(doc => parseInt(doc.id))
    .filter(id => !isNaN(id))
    .sort((a, b) => a - b);

  let nextId = 1;
  for (const id of ids) {
    if (id !== nextId) break;
    nextId++;
  }
  return nextId.toString();
}

export async function addProduct({ name, price, quantity }) {
  if (!name || price == null || quantity == null) throw new Error("Thiếu thông tin sản phẩm.");

  const newId = await getNextProductId();

  await setDoc(doc(db, "products", newId), {
    name: name.trim(),
    price: Number(price),
    quantity: Number(quantity),
    createdAt: serverTimestamp()
  });
}

export async function updateProduct(productId, { name, price, quantity }) {
  if (!productId) throw new Error("Thiếu ID sản phẩm.");
  const productRef = doc(db, "products", productId);
  let updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (price !== undefined) updateData.price = Number(price);
  if (quantity !== undefined) updateData.quantity = Number(quantity);
  await updateDoc(productRef, updateData);
}

export async function deleteProduct(productId) {
  if (!productId) throw new Error("Thiếu ID sản phẩm.");
  await deleteDoc(doc(db, "products", productId));
}

// -----------------------
// Ví dụ sử dụng trong app
// -----------------------

// Kiểm tra kết nối ngay khi load
checkFirebaseConnection().then(result => {
  if (result.success) {
    console.log(result.message);
  } else {
    console.error(result.message);
    alert(result.message);
  }
});

// Ví dụ xử lý sự kiện thêm sản phẩm (bạn tùy chỉnh selector)
export async function addRevenue(totalAmount, cartItems) {
  console.log("addRevenue nhận cartItems:", cartItems);
  console.log("Array.isArray(cartItems):", Array.isArray(cartItems));
  console.log("cartItems.length:", cartItems?.length);

  if (!totalAmount || totalAmount <= 0) throw new Error("Tổng tiền không hợp lệ.");
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) throw new Error("Giỏ hàng trống.");

  const newId = Date.now().toString();

  const revenueData = {
    totalAmount: Number(totalAmount),
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, "revenues", newId), revenueData);
}