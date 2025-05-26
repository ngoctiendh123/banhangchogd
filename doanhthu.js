async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("GroceryDB", 1);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = () => {
      reject("Không thể mở IndexedDB");
    };
  });
}

async function getAllRevenuesFromIndexedDB() {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("revenues", "readonly");
    const store = tx.objectStore("revenues");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Lỗi khi đọc doanh thu từ IndexedDB");
  });
}

function formatCurrency(amount) {
  return Number(amount).toLocaleString('vi-VN') + ' VND';
}

function formatTime(ts) {
  const date = new Date(ts?.seconds ? ts.seconds * 1000 : ts);
  return date.toLocaleString('vi-VN');
}

async function renderRevenues() {
  const list = document.getElementById("revenue-list");
  const orderCountEl = document.getElementById("order-count");
  const totalRevenueEl = document.getElementById("total-revenue");

  try {
    const revenues = await getAllRevenuesFromIndexedDB();
    let total = 0;
    list.innerHTML = "";

    revenues.forEach(revenue => {
      total += revenue.totalAmount;

      const div = document.createElement("div");
      div.className = "revenue-entry";
      div.innerHTML = `
        <h3>Đơn hàng #${revenue.id || '---'}</h3>
        <p><strong>Thời gian:</strong> ${formatTime(revenue.createdAt)}</p>
        <p><strong>Tổng tiền:</strong> ${formatCurrency(revenue.totalAmount)}</p>
        <p><strong>Sản phẩm:</strong></p>
        <ul>
          ${revenue.items.map(item => `<li>${item.name} - SL: ${item.quantity} - Giá: ${formatCurrency(item.price)}</li>`).join("")}
        </ul>
      `;
      list.appendChild(div);
    });

    orderCountEl.textContent = revenues.length;
    totalRevenueEl.textContent = formatCurrency(total);
  } catch (err) {
    console.error(err);
    list.innerHTML = "<p>Lỗi khi tải doanh thu.</p>";
  }
}

window.addEventListener("DOMContentLoaded", renderRevenues);
