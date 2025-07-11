import './script.js';
import {
  deleteShop,
  fetchShopDetail,
  getShopStaff,
  openDeleteShopModal,
  openUpdateShopModal,
  updateShop,
} from './apiServices/shop/shopResource';
import {
  formatServicePermission,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { closeModal, showToast } from './script';

export function populateShopsTable(shopData = []) {
  const tbody = document.querySelector('.shops-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  showGlobalLoader();

  // Remove static rows and loading

  //   console.log(shopData);

  if (tbody) tbody.innerHTML = '';

  if (!shopData.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="6" class="table-error-text">No shops found.</td>
      `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  //   console.log(shopData);

  shopData.forEach((shop, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    //  console.log('shop', shop);

    let staffNames = '—';
    if (Array.isArray(shop.staff)) {
      staffNames = shop.staff
        .map((staff, i) => `${i + 1}. ${staff.first_name} ${staff.last_name}`)
        .join('<br>');
    } else if (shop.staff) {
      staffNames = `${shop.staff.first_name} ${shop.staff.last_name}`;
    }

    if (row)
      row.innerHTML = `
        <td class="py-1 shopSerialNumber">${index + 1}</td>
        <td class="py-1 shopName">${shop.shop_name}</td>
        <td class="py-1 shopLocation">${shop.location}</td>
        <td class="py-1 shopServiceType">${formatServicePermission(
          shop.service_type
        )}</td>
        <td class="py-1 shopManager">${staffNames || '—'}</td>
        <td class="py-1 action-buttons">
          <button class="hero-btn-outline editShopButton" data-shop-id="${
            shop.id
          }">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="hero-btn-outline deleteShopButtonModal" data-shop-id="${
            shop.id
          }">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

    if (tbody) tbody.appendChild(row);

    const deleteShopButtonModal = row.querySelector('.deleteShopButtonModal');

    //  console.log(deleteShopButtonModal);

    deleteShopButtonModal?.addEventListener('click', async () => {
      showGlobalLoader();
      const shopId = deleteShopButtonModal.dataset.shopId;

      const deleteShopContainer = document.querySelector(
        '.deleteShopContainer'
      );

      if (deleteShopContainer) {
        // Store shopId in modal container for reference
        deleteShopContainer.dataset.shopId = shopId;

        // Fetch Shop detail
        const shopDetail = await fetchShopDetail(shopId);

        //   console.log('shopDetail', shopDetail);

        // Call function to prefill modal inputs
        if (shopDetail?.data) {
          hideGlobalLoader();
          openDeleteShopModal(); // Show modal after data is ready
          deleteShopForm(shopDetail.data);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch shop details.');
        }
      }
    });

    const updateShopBtn = row.querySelector('.editShopButton');
    updateShopBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const shopId = updateShopBtn.dataset.shopId;

      const adminUpdateShopDataContainer = document.querySelector(
        '.adminUpdateShopData'
      );

      if (adminUpdateShopDataContainer) {
        // Store shopId in modal container for reference
        adminUpdateShopDataContainer.dataset.shopId = shopId;

        // Fetch Shop detail
        const shopDetail = await fetchShopDetail(shopId);

        // Call function to prefill modal inputs
        if (shopDetail?.data) {
          hideGlobalLoader();
          openUpdateShopModal(); // Show modal after data is ready
          setupUpdateShopForm(shopDetail.data);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch shop details.');
        }
      }
    });
  });
}

// export function setupUpdateShopForm(shop) {
//   const form = document.querySelector('.adminUpdateShopDataModal');

//   if (!form || form.dataset.bound === 'true') return;

//   form.dataset.bound = 'true';

//   document.getElementById('updateShopName').value = shop.shop_name || '';
//   document.getElementById('updateShopAddress').value = shop.location || '';

//   const updateAccessTypeCheckboxes = document.querySelectorAll(
//     'input[name="updateShopAccessType"]'
//   );

//   updateAccessTypeCheckboxes.forEach((checkbox) => (checkbox.checked = false));

//   // Match and check the appropriate checkbox
//   const serviceType = shop.service_type;
//   const matchedCheckbox = [...updateAccessTypeCheckboxes].find(
//     (checkbox) => checkbox.value === serviceType
//   );
//   if (matchedCheckbox) matchedCheckbox.checked = true;

//   if (form) {
//     form.addEventListener('submit', async function (e) {
//       e.preventDefault();

//       const updateShopName = document.getElementById('updateShopName').value;

//       const updateShopAddress =
//         document.getElementById('updateShopAddress').value;

//       //  Access type checkboxes
//       // const updateAccessTypeCheckboxes = document.querySelectorAll(
//       //   'input[name="updateShopAccessType"]:checked'
//       // );
//       // const updateAccessType = Array.from(updateAccessTypeCheckboxes).map(
//       //   (cb) => cb.value
//       // );
//       // const updateAccessTypeValue = updateAccessType[0] || null;

//       const checkedRadio = document.querySelector(
//         'input[name="updateShopAccessType"]:checked'
//       );
//       const updateAccessTypeValue = checkedRadio ? checkedRadio.value : null;

//       const shopUpdatedDetails = {
//         shopName: updateShopName,
//         location: updateShopAddress,
//         serviceType: updateAccessTypeValue,
//       };

//       // console.log('📦 shop New Details:', shopUpdatedDetails);

//       try {
//         const data = await updateShop(shop.id, shopUpdatedDetails);

//         if (data) {
//           closeModal();
//         }
//       } catch (err) {
//         // err.message will contain the "Email already in use"
//         showToast('fail', `❎ ${err.message}`);
//       }
//     });
//   }
// }

export function setupUpdateShopForm(shop) {
  const form = document.querySelector('.adminUpdateShopDataModal');
  if (!form) return;

  form.dataset.shopId = shop.id; // Store the ID to use during submission

  document.getElementById('updateShopName').value = shop.shop_name || '';
  document.getElementById('updateShopAddress').value = shop.location || '';

  const updateAccessTypeCheckboxes = document.querySelectorAll(
    'input[name="updateShopAccessType"]'
  );
  updateAccessTypeCheckboxes.forEach((checkbox) => {
    checkbox.checked = checkbox.value === shop.service_type;
  });
}

export function initUpdateShopFormListener() {
  const form = document.querySelector('.adminUpdateShopDataModal');

  if (!form || form.dataset.listenerBound === 'true') return;

  form.dataset.listenerBound = 'true'; // Prevent re-binding

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const updateShopName = document.getElementById('updateShopName').value;
    const updateShopAddress =
      document.getElementById('updateShopAddress').value;
    const checkedRadio = document.querySelector(
      'input[name="updateShopAccessType"]:checked'
    );
    const updateAccessTypeValue = checkedRadio ? checkedRadio.value : null;

    const shopUpdatedDetails = {
      shopName: updateShopName,
      location: updateShopAddress,
      serviceType: updateAccessTypeValue,
    };

    const shopId = form.dataset.shopId;

    const updateShopSubmitBtn = document.querySelector('.updateShopBtn');

    try {
      showBtnLoader(updateShopSubmitBtn);

      const data = await updateShop(shopId, shopUpdatedDetails);

      if (data) {
        hideBtnLoader(updateShopSubmitBtn);
        closeModal();
        form.reset();
      }
    } catch (err) {
      showToast('fail', `❎ ${err.message}`);
      hideBtnLoader(updateShopSubmitBtn);
    }
  });
}

export function deleteShopForm(shop) {
  const form = document.querySelector('.deleteShopContainerModal');
  if (!form) return;

  form.dataset.shopId = shop.id;

  document.getElementById('confirmation-text').textContent = shop.shop_name;
}

export function bindDeleteShopFormListener() {
  const form = document.querySelector('.deleteShopContainerModal');
  if (!form) return;

  const deleteShopButton = form.querySelector('.deleteShopButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteShopButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const shopId = form.dataset.shopId;
      if (!shopId) {
        showToast('fail', '❎ No shop ID found.');
        return;
      }

      try {
        showBtnLoader(deleteShopButton);
        await deleteShop(shopId);
        hideBtnLoader(deleteShopButton);
        closeModal();
        showToast('success', '✅ Shop deleted successfully.');
      } catch (err) {
        hideBtnLoader(deleteShopButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// import { initUpdateShopFormListener } from './path/to/your/module.js';

document.addEventListener('DOMContentLoaded', () => {
  initUpdateShopFormListener();
  bindDeleteShopFormListener();
});

// export function populateShopDropdown(shopList = [], preselectedShopId = '') {
//   const dropdown = document.getElementById('shopDropdown');
//   if (!dropdown) return;

//   dropdown.addEventListener('change', function () {
//     const selectedShopId = dropdown.value;
//     //  console.log('Selected shop ID:', selectedShopId);
//     // Perform any action you want with the selected shop ID
//     // already using another method already but i am still keeping this here.
//   });

//   // Clear existing options except the default
//   dropdown.innerHTML = `<option value="">Select a shop</option>`;

//   shopList.forEach((shop) => {
//     const option = document.createElement('option');
//     option.value = shop.id;
//     option.textContent = `${shop.shop_name} - ${shop.location}`; // or `${shop.shop_name} - ${shop.location}` if you want more details

//     if (shop.id === preselectedShopId) {
//       option.selected = true;
//     }

//     dropdown.appendChild(option);
//   });
// }
