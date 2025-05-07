import { deleteShop, getShopStaff } from './apiServices/shop/shopResource';

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

// export async function populateShopsTable(shopData = []) {
//   console.log('🧾 Populating shops table with:', shopData);

//   const tbody = document.querySelector('.shops-table tbody');
//   const loadingRow = document.querySelector('.loading-row');

//   // Remove static rows and loading

//   if (tbody) tbody.innerHTML = '';

//   if (!shopData.length) {
//     const emptyRow = document.createElement('tr');
//     emptyRow.innerHTML = `
//        <td colspan="6" class="table-error-text">No shops found.</td>
//      `;
//     if (tbody) tbody.appendChild(emptyRow);
//     return;
//   }

//   for (let index = 0; index < shopData.length; index++) {
//     const shop = shopData[index];
//     //  console.log(shop.id);

//     const shopStaffResponse = await getShopStaff(shop.id);
//     const staffList = shopStaffResponse?.data || [];

//     // Join staff full names into a string
//     const staffNames = staffList
//       .map((staff) => `${staff.first_name} ${staff.last_name}`)
//       .join(', ');

//     const row = document.createElement('tr');
//     row.classList.add('table-body-row');

//     if (row)
//       row.innerHTML = `
//        <td class="py-1 shopSerialNumber">${index + 1}</td>
//        <td class="py-1 shopName">${shop.shop_name}</td>
//        <td class="py-1 shopLocation">${shop.location}</td>
//        <td class="py-1 shopServiceType">${shop.service_type}</td>
//        <td class="py-1 shopManager">${staffNames || '—'}</td>
//        <td class="py-1 action-buttons">
//          <button class="hero-btn-outline editShopButton" data-shop-id="${
//            shop.id
//          }">
//            <i class="fa-solid fa-pen-to-square"></i>
//          </button>
//          <button class="hero-btn-outline deleteShopButton" data-shop-id="${
//            shop.id
//          }">
//            <i class="fa-solid fa-trash-can"></i>
//          </button>
//        </td>
//      `;

//     if (tbody) tbody.appendChild(row);

//     const deleteBtn = row.querySelector('.deleteShopButton');

//     deleteBtn.addEventListener('click', async () => {
//       const shopId = deleteBtn.dataset.shopId;
//       await deleteShop(shopId);
//     });
//   }
// }

// export async function populateShopsTable(shopData = []) {
//   console.log('🧾 Populating shops table with:', shopData);

//   const tbody = document.querySelector('.shops-table tbody');
//   const loadingRow = document.querySelector('.loading-row');

//   if (tbody) tbody.innerHTML = ''; // Remove static rows and loading

//   if (!shopData.length) {
//     const emptyRow = document.createElement('tr');
//     emptyRow.innerHTML = `
//         <td colspan="6" class="table-error-text">No shops found.</td>
//       `;
//     if (tbody) tbody.appendChild(emptyRow);
//     return;
//   }

//   // Fetch all staff data for all shops at once and map them
//   const staffPromises = shopData.map((shop) => getShopStaff(shop.id));
//   const staffData = await Promise.all(staffPromises); // Wait for all staff data to be fetched

//   // Create a map of shopId to staff names
//   const staffMap = staffData.reduce((acc, data, index) => {
//     const shopId = shopData[index].id;
//     acc[shopId] =
//       data
//         ?.map((staff) => `${staff.first_name} ${staff.last_name}`)
//         .join(', ') || '—';
//     return acc;
//   }, {});

//   console.log('staffMap:', staffMap);

//   // Populate table with shops and staff
//   shopData.forEach((shop, index) => {
//     const row = document.createElement('tr');
//     row.classList.add('table-body-row');

//     const staffNames = staffMap[shop.id] || '—'; // Get staff names from map

//     row.innerHTML = `
//         <td class="py-1 shopSerialNumber">${index + 1}</td>
//         <td class="py-1 shopName">${shop.shop_name}</td>
//         <td class="py-1 shopLocation">${shop.location}</td>
//         <td class="py-1 shopServiceType">${shop.service_type}</td>
//         <td class="py-1 shopManager">${staffNames}</td>
//         <td class="py-1 action-buttons">
//           <button class="hero-btn-outline editShopButton" data-shop-id="${
//             shop.id
//           }">
//             <i class="fa-solid fa-pen-to-square"></i>
//           </button>
//           <button class="hero-btn-outline deleteShopButton" data-shop-id="${
//             shop.id
//           }">
//             <i class="fa-solid fa-trash-can"></i>
//           </button>
//         </td>
//       `;

//     if (tbody) tbody.appendChild(row);

//     // Add event listener for delete button
//     const deleteBtn = row.querySelector('.deleteShopButton');
//     deleteBtn.addEventListener('click', async () => {
//       const shopId = deleteBtn.dataset.shopId;
//       await deleteShop(shopId);
//     });
//   });
// }
