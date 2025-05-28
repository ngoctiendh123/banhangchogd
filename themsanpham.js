import { addProduct } from './fire.js';
import { listenToFirebaseChanges } from './index.js';

document.addEventListener("DOMContentLoaded", () => {
  listenToFirebaseChanges();
  const btn = document.getElementById("addProductBtn");
  if (!btn) return;
  btn.addEventListener("click", async (event) => {
    // Ngăn form tự reload nếu button nằm trong form
    event.preventDefault();
    
    const nameInput = document.getElementById("productName");
    const priceInput = document.getElementById("productPrice");
    
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    
    if (!name || !price || isNaN(price)) {
      return alert("Dữ liệu không hợp lệ.");
    }
    
    try {
      await addProduct({ name, price: Number(price) });
      alert("Thêm sản phẩm thành công!");
      
      // Sau khi thêm, có thể reset input:
      nameInput.value = "";
      priceInput.value = "";
    } catch (err) {
      console.error(err);
      alert("Thêm sản phẩm thất bại!");
    }
  });
});
