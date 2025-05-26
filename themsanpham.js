import { addProduct } from './fire.js';
import { listenToFirebaseChanges } from './index.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToFirebaseChanges();
  const btn = document.getElementById("addProductBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const quantity = document.getElementById("productQuantity").value.trim();
    if (!name || !price || !quantity || isNaN(price) || isNaN(quantity)) {
      return alert("Dữ liệu không hợp lệ.");
    }
    try {
      await addProduct({ name, price: Number(price), quantity: Number(quantity) });
      alert("Thêm sản phẩm thành công!");
    } catch (err) {
      console.error(err);
      alert("Thêm sản phẩm thất bại!");
    }
  });
});
