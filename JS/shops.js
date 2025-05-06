import { deleteShop } from './apiServices/shop/shopResource';

export function populateShopsTable(shopData = []) {
  const tbody = document.querySelector('.shops-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  // Remove static rows and loading

  if (tbody) tbody.innerHTML = '';

  if (!shopData.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
       <td colspan="6" class="table-error-text">No shops found.</td>
     `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  shopData.forEach((shop, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    if (row)
      row.innerHTML = `
       <td class="py-1 shopSerialNumber">${index + 1}</td>
       <td class="py-1 shopName">${shop.shop_name}</td>
       <td class="py-1 shopLocation">${shop.location}</td>
       <td class="py-1 shopServiceType">${shop.service_type}</td>
       <td class="py-1 shopManager">${shop.manager_name || '—'}</td>
       <td class="py-1 action-buttons">
         <button class="hero-btn-outline editShopButton" data-shop-id="${
           shop.id
         }">
           <i class="fa-solid fa-pen-to-square"></i>
         </button>
         <button class="hero-btn-outline deleteShopButton" data-shop-id="${
           shop.id
         }">
           <i class="fa-solid fa-trash-can"></i>
         </button>
       </td>
     `;

    if (tbody) tbody.appendChild(row);

    const deleteBtn = row.querySelector('.deleteShopButton');
    deleteBtn.addEventListener('click', async () => {
      const shopId = deleteBtn.dataset.shopId;
      await deleteShop(shopId);
    });
  });
}
