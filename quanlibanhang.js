import { getAllProductsFromIndexedDB, listenToFirebaseChanges } from './index.js';
import { updateProduct, deleteProduct } from './fire.js';

document.addEventListener("DOMContentLoaded", async () => {
  await listenToFirebaseChanges();
  const foods = await getAllProductsFromIndexedDB();
  renderProductList(foods);
  renderCart();
});

function renderProductList(foods) {
  let foodList = document.getElementById("food-list");
  if (!foodList) return;
  foodList.innerHTML = "<h3>📖 Danh sách sản phẩm</h3>";
  foods.forEach(food => {
    let div = document.createElement("div");
    div.classList.add("food-item");
    div.innerHTML = `
      <span>${food.name} - ${food.price} VND</span>
      <div class="food-buttons">
        <button class="edit-food" data-id="${food.id}">✏</button>
        <button class="delete-food" data-id="${food.id}">🗑</button>
        <button class="add-to-cart" data-id="${food.id}" data-name="${food.name}" data-price="${food.price}">🛒</button>
      </div>`;
    foodList.appendChild(div);
  });
  attachEventListeners();
}

function attachEventListeners() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.id, button.dataset.name, button.dataset.price);
    });
  });

  document.querySelectorAll(".edit-food").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const newName = prompt("Nhập tên mới:");
      const newPrice = prompt("Nhập giá mới:");
      if (newName && newPrice) {
        await updateProduct(id, { name: newName, price: parseInt(newPrice) });
        alert("Đã cập nhật sản phẩm");
      }
    });
  });

  document.querySelectorAll(".delete-food").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      if (confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
        await deleteProduct(id);
        alert("Đã xóa sản phẩm");
      }
    });
  });
}

function addToCart(id, name, price) {
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  let existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, name, price: parseInt(price), quantity: 1 });
  localStorage.setItem("cartItems", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  let cartItemsContainer = document.getElementById("cart-items");
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = cart.length === 0 ? "<p>🛒 Giỏ hàng trống!</p>" : "";

  cart.forEach(item => {
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <span>${item.name} - ${item.price} VND (x${item.quantity})</span>
      <button class="decrease-qty" data-id="${item.id}">➖</button>
      <button class="increase-qty" data-id="${item.id}">➕</button>
      <button class="remove-item" data-id="${item.id}">❌</button>`;
    cartItemsContainer.appendChild(div);
  });

  // Gắn sự kiện cho nút giảm số lượng
  cartItemsContainer.querySelectorAll(".decrease-qty").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
      let item = cart.find(i => i.id == id);
      if (item) {
        item.quantity--;
        if (item.quantity <= 0) {
          // Xóa món nếu số lượng <= 0
          cart = cart.filter(i => i.id != id);
        }
        localStorage.setItem("cartItems", JSON.stringify(cart));
        renderCart(); // Cập nhật lại giao diện
      }
    });
  });

  // Gắn sự kiện cho nút tăng số lượng
  cartItemsContainer.querySelectorAll(".increase-qty").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
      let item = cart.find(i => i.id == id);
      if (item) {
        item.quantity++;
        localStorage.setItem("cartItems", JSON.stringify(cart));
        renderCart(); // Cập nhật lại giao diện
      }
    });
  });

  // Gắn sự kiện cho nút xóa món
  cartItemsContainer.querySelectorAll(".remove-item").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
      cart = cart.filter(i => i.id != id);
      localStorage.setItem("cartItems", JSON.stringify(cart));
      renderCart(); // Cập nhật lại giao diện
    });
  });
}
document.getElementById("checkout-btn").addEventListener("click", () => {
  window.location.href = "thanhtoan.html";
});
let foods = []; // Biến toàn cục lưu danh sách sản phẩm ban đầu

document.addEventListener("DOMContentLoaded", async () => {
  await listenToFirebaseChanges();
  foods = await getAllProductsFromIndexedDB();
  renderProductList(foods);
  renderCart();

  // Thêm sự kiện click cho nút tìm kiếm
 

  // Nếu muốn vẫn lọc khi gõ, có thể giữ oninput hoặc thêm sự kiện input:
  // document.getElementById("search-food").addEventListener("input", searchFood);
});

function searchFood() {
  const query = document.getElementById("search-food").value.trim().toLowerCase();
  const filteredFoods = foods.filter(food => food.name.toLowerCase().includes(query));
  renderProductList(filteredFoods);
}

