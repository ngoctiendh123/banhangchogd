// Giả lập dữ liệu giỏ hàng hoặc lấy từ localStorage
import { addRevenue } from './fire.js';

let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// Tính tổng tiền
function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Render giỏ hàng
function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!cartItemsContainer || !cartTotalElement) return;

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = "<p>🛒 Giỏ hàng trống!</p>";
    cartTotalElement.textContent = "Tổng tiền: 0 VND";
    checkoutBtn.disabled = true;
    return;
  }

  cartItemsContainer.innerHTML = "";
  cartItems.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <span>${item.name} - ${item.price.toLocaleString()} VND (x${item.quantity})</span>
     
    `;
    cartItemsContainer.appendChild(div);
  });

  const total = calculateTotal(cartItems);
  cartTotalElement.textContent = `Tổng tiền: ${total.toLocaleString()} VND`;
  checkoutBtn.disabled = total === 0;

  addCartEventListeners();
}

// Thêm sự kiện cho nút tăng giảm và xóa món
function addCartEventListeners() {
  document.querySelectorAll(".increase-qty").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      const item = cartItems.find(i => i.id === id);
      if (item) {
        item.quantity++;
        saveAndRender();
      }
    };
  });

  document.querySelectorAll(".decrease-qty").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      const item = cartItems.find(i => i.id === id);
      if (item && item.quantity > 1) {
        item.quantity--;
      } else if (item && item.quantity === 1) {
        if (confirm(`Bạn có muốn xóa ${item.name} khỏi giỏ hàng không?`)) {
          cartItems = cartItems.filter(i => i.id !== id);
        }
      }
      saveAndRender();
    };
  });

  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      cartItems = cartItems.filter(i => i.id !== id);
      saveAndRender();
    };
  });
}

function saveAndRender() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  renderCart();
}

// Tạo mã QR với thư viện qrcode (https://github.com/soldair/node-qrcode)
function generateQRCode(total) {
  const qrCodeContainer = document.getElementById("qr-code");
  const paymentInfo = document.getElementById("payment-info");

  if (total <= 0) {
    qrCodeContainer.innerHTML = "<p>Không có đơn hàng để thanh toán.</p>";
    paymentInfo.textContent = "";
    return;
  }

  // URL QR code VietQR của bạn với tham số amount là tổng tiền
  const qrUrl = `https://img.vietqr.io/image/MbBank-0060112236868-compact.jpg?amount=${total}`;

  qrCodeContainer.innerHTML = `<img src="${qrUrl}" alt="Mã QR thanh toán" style="width:250px; height:250px; border-radius: 8px;">`;

  paymentInfo.textContent = `Số tiền cần thanh toán: ${total.toLocaleString()} VND`;
}


// Xử lý nút thanh toán
document.getElementById("checkout-btn").addEventListener("click", async () => {
  try {
    const total = calculateTotal(cartItems);

    await addRevenue(total, cartItems); // ✅ Gửi lên Firebase

    alert("Cảm ơn bạn đã thanh toán! Đơn hàng của bạn đã được ghi nhận.");

    // Xóa giỏ hàng và làm sạch giao diện
    cartItems = [];
    saveAndRender();
    generateQRCode(0);
    localStorage.removeItem("cartItems");

  } catch (error) {
    console.error("Lỗi khi lưu doanh thu:", error);
    alert("Có lỗi xảy ra khi ghi nhận đơn hàng. Vui lòng thử lại.");
  }
});

// Khi trang tải xong
window.addEventListener("DOMContentLoaded", () => {
  renderCart();
  const total = calculateTotal(cartItems);
  generateQRCode(total);
});
