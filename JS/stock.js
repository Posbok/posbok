import config from '../config';
import './script.js';

import {
  createStockCategory,
  createStockItem,
  deleteStockItem,
  getStockCategories,
  getStockInventory,
  getStockItems,
  getStockProduct,
} from './apiServices/stock/stockResources';
import {
  formatAmountWithCommas,
  formatDate,
  formatDateTimeReadable,
  formatUnitType,
  hideBtnLoader,
  hideGlobalLoader,
  populateBusinessShopDropdown,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { showToast, closeModal, setupModalCloseButtons } from './script';
import { checkAndPromptCreateShop } from './apiServices/shop/shopResource.js';
import { openDeleteCategoryModal } from './goods.js';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

// const shopId = parsedUserData?.shopId || dummyShopId;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';

if (isAdmin) {
  document.addEventListener('DOMContentLoaded', () => {
    getStockCategories();
    getStockItems();
  });
}

export function openDeleteStockItemModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const deleteStockContainer = document.querySelector('.deleteStockContainer');

  if (deleteStockContainer) deleteStockContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function deleteStockItemForm(stockItem, stockItemId) {
  const form = document.querySelector('.deleteStockContainerModal');
  if (!form) return;

  form.dataset.stockItemId = stockItem.id;

  console.log(stockItem);

  document.getElementById('confirmation-text').textContent =
    stockItem.product_name;
}

export function bindDeleteStockItemFormListener() {
  const form = document.querySelector('.deleteStockContainerModal');
  if (!form) return;

  const deleteStockButton = form.querySelector('.deleteStockButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteStockButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const stockItemId = form.dataset.stockItemId;

      if (!stockItemId) {
        showToast('fail', '❎ No Sale ID found.');
        return;
      }

      try {
        showBtnLoader(deleteStockButton);
        await deleteStockItem(stockItemId);
        hideBtnLoader(deleteStockButton);
        await getStockItems();
        showToast('success', '✅ Stock Item deleted successfully.');
        closeModal();
      } catch (err) {
        hideBtnLoader(deleteStockButton);
        console.error(err);
        showToast('fail', `❎ ${err.message}`);
        closeModal();
      } finally {
        hideBtnLoader(deleteStockButton);
        closeModal();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindDeleteStockItemFormListener();
});

export function openAddStockCategoryModalBtn() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addStockCategoryContainer = document.querySelector('.addCategory');

  if (addStockCategoryContainer)
    addStockCategoryContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  addStockCategoryForm();
}

export function openAddStockModalBtn() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addStockItemContainer = document.querySelector('.addStock');

  if (addStockItemContainer) addStockItemContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  addStockItemForm();
}

document.addEventListener('DOMContentLoaded', () => {
  // Setup for Opening  Modal
  setupModalCloseButtons();

  document
    .querySelector('#openAddStockCategoryModalBtn')
    ?.addEventListener('click', openAddStockCategoryModalBtn);

  document
    .querySelector('#openAddStockModalBtn')
    ?.addEventListener('click', openAddStockModalBtn);

  //   document
  //     .querySelector('#openAddExistingStockModalBtn')
  //     ?.addEventListener('click', openAddExistingStockModalBtn);

  //   document
  //     .querySelector('#openUpdateStockBtn')
  //     ?.addEventListener('click', openUpdateStockButton);

  //   document
  //     .querySelector('.openUpdateCategoryButton')
  //     ?.addEventListener('click', openUpdateCategoryButton);
});

export function populateStockCategoryTable(stockCategoriesData) {
  const tbody = document.querySelector('.stock-category-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  // Remove static rows and loading

  const categories = stockCategoriesData.data;
  //   console.log(categories);

  if (tbody) tbody.innerHTML = '';

  if (!categories.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="6" class="table-error-text">No Stock Categories found.</td>
      `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  categories.forEach((category, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    if (row)
      row.innerHTML = `
        <td class="py-1 categorySerialNumber">${index + 1}</td>
        <td class="py-1 categoryName">${category.category_name}</td>
         <td class="py-1 categoryDescription">${category.description}</td>

        <td class="py-1 action-buttons">
          <button class="hero-btn-outline openUpdateCategoryButton" data-stock-category-id="${
            category.id
          }">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>

          <button class="hero-btn-outline deleteCategoryButton" data-stock-category-id="${
            category.id
          }">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

    if (tbody) tbody.appendChild(row);

    const deleteCategoryButton = row.querySelector(`.deleteCategoryButton`);

    deleteCategoryButton.addEventListener('click', async () => {
      const stockCategoryId = deleteCategoryButton.dataset.stockCategoryId;
      // console.log('deleteCategoryButton clicked', stockCategoryId);
      // await deleteCategory(stockCategoryId);
    });

    deleteCategoryButton.addEventListener('click', async () => {
      showGlobalLoader();
      const stockCategoryId = deleteCategoryButton.dataset.stockCategoryId;

      const deleteCategoryContainer = document.querySelector(
        '.deleteCategoryContainer'
      );

      if (deleteCategoryContainer) {
        // Store stockCategoryId in modal container for reference
        deleteCategoryContainer.dataset.stockCategoryId = stockCategoryId;

        // Fetch Shop detail
        const categoryDetail = await getStockCategories(stockCategoryId);

        console.log('categoryDetail', categoryDetail);

        // Call function to prefill modal inputs
        if (categoryDetail?.data) {
          hideGlobalLoader();
          openDeleteCategoryModal(); // Show modal after data is ready
          deleteCategoryForm(categoryDetail.data, stockCategoryId);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch shop details.');
        }
      }
    });

    // Update Stock Category Logic

    const updateStockCategoryBtn = row.querySelector(
      '.openUpdateStockCategoryButton'
    );

    updateStockCategoryBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const stockCategoryId = updateStockCategoryBtn.dataset.stockCategoryId;

      const updateStockCategoryModalContainer = document.querySelector(
        '.updateStockCategoryModal'
      );

      if (updateStockCategoryModalContainer) {
        // Store StockCategoryId in modal container for reference
        updateStockCategoryModalContainer.dataset.stockCategoryId =
          stockCategoryId;

        //   console.log(updateCategoryModalContainer.dataset.stockCategoryId);
        // Fetch staff detail
        const CategoryDetail = await getProductCategories(stockCategoryId);

        //  console.log('Category detail received successfully:', CategoryDetail);

        // Call function to prefill modal inputs
        if (CategoryDetail?.success === true) {
          hideGlobalLoader();
          openUpdateCategoryButton(); // Show modal after data is ready

          updateCategoryForm(CategoryDetail);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch Category details.');
        }
      }
    });
  });
}

export function populateStockCategoriesDropdown(categoriesData = []) {
  const categoryList = categoriesData.data;

  const addStockCategoryDropdown = document.getElementById('addStockCategory');
  const updateStockCategoryDropdown = document.getElementById(
    'updateStockCategory'
  );
  if (!addStockCategoryDropdown || !updateStockCategoryDropdown) return;

  // Clear existing options except the default
  addStockCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;
  updateStockCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;

  categoryList.forEach((category) => {
    const option1 = document.createElement('option');
    option1.value = category.id;
    option1.textContent = `${category.category_name}`;
    if (addStockCategoryDropdown) addStockCategoryDropdown.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = category.id;
    option2.textContent = `${category.category_name}`;
    if (updateStockCategoryDropdown)
      updateStockCategoryDropdown.appendChild(option2);
  });
}

export function populateStockItemsTable(stockItemsData) {
  const tbody = document.querySelector('.stock-item-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  // Remove static rows and loading

  const stockItems = stockItemsData.stockItems;

  //   console.log('stockItems', stockItems);

  if (tbody) tbody.innerHTML = '';

  if (!stockItems.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="10" class="table-error-text">No Stock Items found.</td>
      `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  stockItems.forEach((item, index) => {
    const stockCategory = item.StockCategory;
    //  console.log('stockCategory:', stockCategory);

    const row = document.createElement('tr');
    row.classList.add('table-body-row');
    row.classList.add(
      item.quantity < 1
        ? 'finishedStockRow'
        : item.quantity >= 1 && item.quantity <= 10
        ? 'nearFinishedStockRow'
        : 'inStockRow'
    );

    //  console.log(item);

    if (row)
      row.innerHTML = `
        <td class="py-1 itemSerialNumber">${index + 1}</td>
        <td class="py-1 itemName">${item.product_name}</td>
         <td class="py-1 itemDescription">${item.description}</td>
         <td class="py-1 itemCategory">${stockCategory.category_name}</td>
         <td class="py-1 itemPurchasePrice">₦${formatAmountWithCommas(
           item.purchase_price
         )}</td>
         <td class="py-1 itemSellingPrice">₦${formatAmountWithCommas(
           item.selling_price
         )}</td>
          <td class="py-1 itemQuantity">${item.quantity}</td>
          <td class="py-1 itemUnitType">${formatUnitType(item.unit_type)}</td>
          <td class="py-1 itemStatus">${
            item.quantity === 0 ? (item.status = 'Finished') : 'In Stock'
          }</td>
          <td class="py-1 itemDatePurchases">${formatDate(
            item.date_purchased
          )}</td>

   
     <td class="py-1 action-buttons">
       <button
         class="hero-btn-outline openUpdateStockItemButton"
         data-stock-item-id="${item.id}"
       >
         <i class="fa-solid fa-pen-to-square"></i>
       </button>

       <button
         class="hero-btn-outline deleteStockItemButton"
         data-stock-item-id="${item.id}"
       >
         <i class="fa-solid fa-trash-can"></i>
       </button>
     </td>
      `;

    if (tbody) tbody.appendChild(row);

    const deleteStockItemButton = row.querySelector(`.deleteStockItemButton`);

    //  deleteStockItemButton.addEventListener('click', async () => {
    //    const stockCategoryId = deleteStockItemButton.dataset.stockCategoryId;
    //    // console.log('deleteStockItemButton clicked', stockCategoryId);
    //    // await deleteCategory(stockCategoryId);
    //  });

    deleteStockItemButton.addEventListener('click', async () => {
      showGlobalLoader();
      const stockItemId = deleteStockItemButton.dataset.stockItemId;

      const deleteStockContainer = document.querySelector(
        '.deleteStockContainer'
      );

      if (deleteStockContainer) {
        // Store stockItemId in modal container for reference
        deleteStockContainer.dataset.stockItemId = stockItemId;

        // Fetch Stock Product detail
        const stockItemDetail = await getStockProduct(stockItemId);

        console.log('stockItemDetail', stockItemDetail);

        // Call function to prefill modal inputs
        if (stockItemDetail?.data) {
          hideGlobalLoader();
          openDeleteStockItemModal(); // Show modal after data is ready
          deleteStockItemForm(stockItemDetail.data, stockItemId);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch Stock Product details.');
        }
      }
    });

    // Update Stock Category Logic

    const updateStockCategoryBtn = row.querySelector(
      '.openUpdateStockItemButton'
    );

    updateStockCategoryBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const stockItemId = updateStockCategoryBtn.dataset.stockItemId;

      const updateStockCategoryModalContainer = document.querySelector(
        '.updateStockCategoryModal'
      );

      if (updateStockCategoryModalContainer) {
        // Store StockItemId in modal container for reference
        updateStockCategoryModalContainer.dataset.stockItemId = stockItemId;

        //   console.log(updateCategoryModalContainer.dataset.stockItemId);
        // Fetch staff detail
        const CategoryDetail = await getProductCategories(stockItemId);

        //  console.log('Category detail received successfully:', CategoryDetail);

        // Call function to prefill modal inputs
        if (CategoryDetail?.success === true) {
          hideGlobalLoader();
          openUpdateCategoryButton(); // Show modal after data is ready

          updateCategoryForm(CategoryDetail);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch Category details.');
        }
      }
    });
  });
}

// export function populateStockItemsDropdown(categoriesData = []) {
//   const categoryList = categoriesData.data;

//   const addStockCategoryDropdown = document.getElementById('addStockCategory');
//   const updateStockCategoryDropdown = document.getElementById(
//     'updateStockCategory'
//   );
//   if (!addStockCategoryDropdown || !updateStockCategoryDropdown) return;

//   // Clear existing options except the default
//   addStockCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;
//   updateStockCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;

//   categoryList.forEach((category) => {
//     const option1 = document.createElement('option');
//     option1.value = category.id;
//     option1.textContent = `${category.category_name}`;
//     if (addStockCategoryDropdown) addStockCategoryDropdown.appendChild(option1);

//     const option2 = document.createElement('option');
//     option2.value = category.id;
//     option2.textContent = `${category.category_name}`;
//     if (updateStockCategoryDropdown)
//       updateStockCategoryDropdown.appendChild(option2);
//   });
// }

// Load Shop Dropsown for Admin

if (isAdmin) {
  async function loadShopDropdown() {
    try {
      showGlobalLoader();
      const { enrichedShopData } = await checkAndPromptCreateShop();
      populateBusinessShopDropdown(
        enrichedShopData,
        'stockinventoryShopDropdown'
      );

      hideGlobalLoader();
    } catch (err) {
      hideGlobalLoader();
      console.error('Failed to load dropdown:', err.message);
    }
  }

  loadShopDropdown();
}

export function addStockCategoryForm() {
  const form = document.querySelector('.addCategoryModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const addCategoryName = document.querySelector('#addCategoryName').value;

      const addCategoryDescription = document.querySelector(
        '#addCategoryDescription'
      ).value;

      const addStockCategoryDetails = {
        category_name: addCategoryName,
        description: addCategoryDescription,
      };

      console.log('Add Category Details:', addStockCategoryDetails);

      const addStockCategorySubmitBtn = document.querySelector(
        '.addStockCategorySubmitBtn'
      );

      try {
        showBtnLoader(addStockCategorySubmitBtn);

        const data = await createStockCategory(addStockCategoryDetails);

        if (data) {
          hideBtnLoader(addStockCategorySubmitBtn);
          closeModal();
        }

        closeModal(); // close modal after success
      } catch (err) {
        console.error('Error Adding Stock Category:', err.message);
        hideBtnLoader(addStockCategorySubmitBtn);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function addStockItemForm() {
  const form = document.querySelector('.addStockModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const stockinventoryShopDropdown = document.querySelector(
        '#stockinventoryShopDropdown'
      ).value;
      const addStockCategory =
        document.querySelector('#addStockCategory').value;
      const addStockName = document.querySelector('#addStockName').value;

      const addStockDescription = document.querySelector(
        '#addStockDescription'
      ).value;

      const addStockBoughtPrice = document.querySelector(
        '#addStockBoughtPrice'
      ).value;

      const addStockSellingPrice = document.querySelector(
        '#addStockSellingPrice'
      ).value;

      const addStockQuantity =
        document.querySelector('#addStockQuantity').value;

      const addStockDatePurchased = document.querySelector(
        '#addStockDatePurchased'
      ).value;

      const addStockUnitType =
        document.querySelector('#addStockUnitType').value;

      const addStockItemDetails = {
        product_name: addStockName,
        quantity: addStockQuantity,
        unit_type: addStockUnitType,
        purchase_price: addStockBoughtPrice,
        date_purchased: addStockDatePurchased,
        category_id: Number(addStockCategory),
        description: addStockDescription,
        shop_id: Number(stockinventoryShopDropdown),
        selling_price: addStockSellingPrice,
      };

      console.log('Add Stock Item Details:', addStockItemDetails);

      const addStockItemSubmitBtn = document.querySelector(
        '.addStockItemSubmitBtn'
      );

      try {
        showBtnLoader(addStockItemSubmitBtn);

        const stockItemData = await createStockItem(addStockItemDetails);

        if (stockItemData) {
          console.log('stockItemData', stockItemData);
          hideBtnLoader(addStockItemSubmitBtn);
          closeModal();
        }

        closeModal(); // close modal after success
      } catch (err) {
        console.error('Error Adding Stock Item:', err.message);
        hideBtnLoader(addStockItemSubmitBtn);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// async function fetchAllStock() {
//   try {
//     const stockInventoryData = await getStockInventory(); // Fetch stocks

//     if (stockInventoryData) {
//       console.log(`Fetching stock inventory:`, stockInventoryData.data);
//       return stockInventoryData.data;
//     }

//     //  console.log('stockInventoryData', stockInventoryData);
//   } catch (error) {
//     console.error('Error fetching stock Inventory Data:', error);
//     throw error;
//   }
// }
