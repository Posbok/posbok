import config from '../config';
import './script.js';

import {
  createStockCategory,
  createStockItem,
  deleteStockItem,
  getStockCategories,
  getStockInventory,
  getStockItems,
  getStockLogs,
  getStockProduct,
  restockProduct,
  updateStockItem,
} from './apiServices/stock/stockResources';
import {
  clearFormInputs,
  formatActionType,
  formatAmountWithCommas,
  formatCurrency,
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
    getStockLogs();
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

  //   console.log(stockItem);

  document.getElementById('confirmation-text').textContent =
    stockItem.product_name;
}

export function openUpdateStockItemModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateStockContainer = document.querySelector('.updateStock');

  if (updateStockContainer) updateStockContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function updateStockItemForm(stockItems, stockItemId) {
  const form = document.querySelector('.updateStockModal');
  if (!form) return;

  const stockItem = stockItems.data;

  form.dataset.stockItemId = stockItem.id;

  const updateStockName = document.querySelector('#updateStockName');

  if (updateStockName) updateStockName.value = stockItem.product_name;

  const updateStockDescription = document.querySelector(
    '#updateStockDescription'
  );

  if (updateStockDescription)
    updateStockDescription.value = stockItem.description;

  const updateStockBoughtPrice = document.querySelector(
    '#updateStockBoughtPrice'
  );

  if (updateStockBoughtPrice)
    updateStockBoughtPrice.value = stockItem.purchase_price;

  const updateStockSellingPrice = document.querySelector(
    '#updateStockSellingPrice'
  );

  if (updateStockSellingPrice)
    updateStockSellingPrice.value = stockItem.selling_price;

  const updateStockQuantity = document.querySelector('#updateStockQuantity');

  if (updateStockQuantity) updateStockQuantity.value = stockItem.quantity;

  const updateStockUnitType = document.querySelector('#updateStockUnitType');
  if (updateStockUnitType) updateStockUnitType.value = stockItem.unit_type;
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
        await getStockLogs();
        showToast('success', '✅ Stock Item deleted successfully.');
        closeModal();
      } catch (err) {
        hideBtnLoader(deleteStockButton);
        console.error(err);
        showToast('fail', `❎ ${err.message}`);
        closeModal();
      } finally {
        hideBtnLoader(deleteStockButton);
        hideGlobalLoader();
        closeModal();
      }
    });
  }
}

//  Update Stock Product
export function bindUpdateProductFormListener() {
  const form = document.querySelector('.updateStockModal');
  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const stockItemId = form.dataset.stockItemId;

      if (!stockItemId) {
        showToast('fail', '❎ No Stock Item selected for update.');
        return;
      }
      const updateStockName = document.querySelector('#updateStockName').value;

      const updateStockDescription = document.querySelector(
        '#updateStockDescription'
      ).value;

      const updateStockBoughtPrice = document.querySelector(
        '#updateStockBoughtPrice'
      ).value;

      const updateStockSellingPrice = document.querySelector(
        '#updateStockSellingPrice'
      ).value;

      const updateStockQuantity = document.querySelector(
        '#updateStockQuantity'
      ).value;

      const updateStockUnitType = document.querySelector(
        '#updateStockUnitType'
      ).value;

      const updateStockItemDetails = {
        product_name: updateStockName,
        quantity: updateStockQuantity,
        unit_type: updateStockUnitType,
        purchase_price: updateStockBoughtPrice,
        description: updateStockDescription,
        selling_price: updateStockSellingPrice,
      };

      // console.log('Updating Stock Item Details with:', updateStockItemDetails);

      const updateStockModalBtn = document.querySelector(
        '.updateStockModalBtn'
      );

      try {
        showBtnLoader(updateStockModalBtn);
        const updatedStockData = await updateStockItem(
          stockItemId,
          updateStockItemDetails
        );

        if (!updatedStockData) {
          console.error('fail', updatedStockData.message);
          return;
        }
        if (updatedStockData) {
          closeModal();
        }

        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(updateStockModalBtn);

        console.error('Error Updating Stock Item:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      } finally {
        hideBtnLoader(updateStockModalBtn);
        hideGlobalLoader();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindDeleteStockItemFormListener();
  bindUpdateProductFormListener();
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

export function openRetockProductModalBtn() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const restockItemContainer = document.querySelector('.restock');

  if (restockItemContainer) restockItemContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  restockProductForm();
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

  document
    .querySelector('#openRetockProductModalBtn')
    ?.addEventListener('click', openRetockProductModalBtn);

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

  //   console.log('Code got here');

  const addStockCategoryDropdown = document.getElementById('addStockCategory');
  //   const updateStockCategoryDropdown = document.getElementById(
  //     'updateStockCategory'
  //   );
  if (!addStockCategoryDropdown) return;
  //   if (!addStockCategoryDropdown || !updateStockCategoryDropdown) return;

  // Clear existing options except the default
  addStockCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;
  //   updateStockCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;

  categoryList.forEach((category) => {
    const option1 = document.createElement('option');
    option1.value = category.id;
    option1.textContent = `${category.category_name}`;
    if (addStockCategoryDropdown) addStockCategoryDropdown.appendChild(option1);

    //  const option2 = document.createElement('option');
    //  option2.value = category.id;
    //  option2.textContent = `${category.category_name}`;
    //  if (updateStockCategoryDropdown)
    //    updateStockCategoryDropdown.appendChild(option2);
  });
}

export function populateStockItemsTable(stockItemsData) {
  const tbody = document.querySelector('.stock-item-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  // Remove static rows and loading

  //   console.log(stockItemsData);

  const stockItems = stockItemsData.stockItems;
  const stockSummary = stockItemsData.summary;

  const { totalItems, totalQuantity, totalValue } = stockSummary;

  const totalItemsText = document.querySelector('.totalItems');
  if (totalItemsText) totalItemsText.textContent = totalItems;

  const totalQuantityText = document.querySelector('.totalQuantity');
  if (totalQuantityText) totalQuantityText.textContent = totalQuantity;

  const totalValueText = document.querySelector('.totalValue');
  if (totalValueText)
    totalValueText.textContent = `₦` + formatAmountWithCommas(totalValue);

  //   console.log('stockItems', stockItems);
  //   console.log('stockSummary', stockSummary);

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
            item.quantity === 0
              ? (item.status = 'Out of Stock')
              : item.quantity >= 1 && item.quantity <= 10
              ? 'Low Stock'
              : 'In Stock'
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

    const updateStockProductBtn = row.querySelector(
      '.openUpdateStockItemButton'
    );

    updateStockProductBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const stockItemId = updateStockProductBtn.dataset.stockItemId;

      const updateStockProductModalContainer =
        document.querySelector('.updateStockModal');

      if (updateStockProductModalContainer) {
        // Store StockItemId in modal container for reference
        updateStockProductModalContainer.dataset.stockItemId = stockItemId;

        //   console.log(updateStockProductModalContainer.dataset.stockItemId);
        // Fetch Stock Product detail
        const stockProductDetail = await getStockProduct(stockItemId);

        //   console.log(
        //     'Stock Item detail received successfully:',
        //     stockProductDetail
        //   );

        // Call function to prefill modal inputs
        if (stockProductDetail?.success === true) {
          showGlobalLoader();
          openUpdateStockItemModal(); // Show modal after data is ready
          updateStockItemForm(stockProductDetail);
          hideGlobalLoader();
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch Category details.');
        }
      }
    });
  });
}

export function populateStockLogsTable(stockLogsData) {
  const tbody = document.querySelector('.stock-logs-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  //   console.log('stockLogsData', stockLogsData);

  if (tbody) tbody.innerHTML = '';

  if (!stockLogsData.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="10" class="table-error-text">No Stock Logs Actions found.</td>
      `;
    if (tbody) tbody.appendChild(emptyRow);
    return;
  }

  stockLogsData.forEach((stockLog, index) => {
    const { item_name, quantity, action_type, price, created_at } = stockLog;

    const { first_name, last_name } = stockLog.performer;

    console.log(first_name, last_name);

    const row = document.createElement('tr');
    row.classList.add('table-body-row');
    //  row.classList.add(
    //    item.quantity < 1
    //      ? 'finishedStockRow'
    //      : item.quantity >= 1 && item.quantity <= 10
    //      ? 'nearFinishedStockRow'
    //      : 'inStockRow'
    //  );

    //  console.log(item);

    if (row)
      row.innerHTML = `
        <td class="py-1 itemSerialNumber">${index + 1}</td>
        <td class="py-1 itemName">${item_name}</td>
         <td class="py-1 itemQuantity">${quantity}</td>
         <td class="py-1 itemPurchasePrice">₦${formatAmountWithCommas(
           price
         )}</td>
          <td class="py-1 itemActionType">${formatActionType(action_type)}</td>

          <td class="py-1 itemDatePurchases">${`${first_name} ${last_name}`}</td>

          <td class="py-1 itemDatePurchases">${formatDateTimeReadable(
            created_at
          )}</td>

      `;

    //     <td class="py-1 itemStatus">${
    //    item.quantity === 0
    //      ? (item.status = 'Out of Stock')
    //      : item.quantity >= 1 && item.quantity <= 10
    //      ? 'Low Stock'
    //      : 'In Stock'
    //  }</td>

    if (tbody) tbody.appendChild(row);
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
      populateBusinessShopDropdown(enrichedShopData, 'restockShopDropdown');
    } catch (err) {
      hideGlobalLoader();
      console.error('Failed to load dropdown:', err.message);
    } finally {
      hideGlobalLoader();
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

//  Restock Product
export function bindRestockProductFormListener() {
  const form = document.querySelector('.restockModal');
  if (!form) return;

  const restockQtyInput = document.querySelector('#restockQuantityAvailable');
  const prevStockQtyDisplay = document.querySelector(
    '.previousStockQuantityAvailable'
  );

  restockQtyInput.addEventListener('input', function (e) {
    const prevQty = Number(form.dataset.previousQuantity || 0);
    const newQty = Number(e.target.value);
    if (!form.dataset.previousQuantity) {
      prevStockQtyDisplay.innerText = 'Select a product first';
      prevStockQtyDisplay.className =
        'previousStockQuantityAvailable quantity-normal';
      return;
    }

    if (!newQty || newQty <= 0) {
      prevStockQtyDisplay.innerText = prevQty;
      prevStockQtyDisplay.className =
        'previousStockQuantityAvailable quantity-normal';
      return;
    }

    // Show calculation
    prevStockQtyDisplay.innerText = `${prevQty} + ${newQty} = ${
      prevQty + newQty
    }`;
    prevStockQtyDisplay.className =
      'previousStockQuantityAvailable quantity-preview';
  });

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // console.log('Form got here');

      const productId = form.dataset.productId;
      const shopId = form.dataset.shopId;
      const prevQty = Number(form.dataset.previousQuantity || 0);

      if (!productId) {
        showToast('fail', '❎ No Product selected for Restock.');
        return;
      }

      if (!shopId) {
        showToast('fail', '❎ Stock Management Shop not Selected.');
        return;
      }

      // Inputs
      const restockQuantityAvailable = document.querySelector(
        '#restockQuantityAvailable'
      );

      const restockProductDetails = {
        quantity: Number(restockQuantityAvailable.value),
      };

      // console.log(
      //   'Updating Product Detail with:',
      //   restockProductDetails,
      //   productId,
      //   shopId
      // );

      const restockModalBtn = document.querySelector('.restockModalBtn');

      try {
        showBtnLoader(restockModalBtn);
        const restockProductData = await restockProduct(
          restockProductDetails,
          productId
        );

        if (!restockProductData) {
          console.error('fail', restockProductData.message);
          return;
        }

        if (restockProductData) {
          showToast(
            'success',
            restockProductData.message || '✅ Product Restocked Successfully'
          );
          closeModal();
          clearFormInputs();
          //  await getStockItems();
          //  await getStockLogs();
        }

        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(restockModalBtn);

        console.error('Error During Adding Existing Product:', err);
        showToast(
          'fail',
          `❎ ${err.message || 'Failed to Add Existing Product'}`
        );
        return;
      } finally {
        hideBtnLoader(restockModalBtn);
        hideGlobalLoader();
      }
    });
  }
}

const restockSearchSection = document.querySelector('.restockSearch-section');
// const adminSellProductCategorySection = document.querySelector(
//   '.addExistingSellProductCategory-section'
// );
const restockProductNameDiv = document.querySelector('.restockProductNameDiv');
const restockAutocompleteList = document.getElementById(
  'restockAutocompleteList'
);

document.addEventListener('DOMContentLoaded', () => {
  if (restockSearchSection) restockSearchSection.style.display = 'none';
  //   if (adminSellProductCategorySection)
  //     adminSellProductCategorySection.style.display = 'none';
  if (restockProductNameDiv) restockProductNameDiv.style.display = 'none';
  if (restockAutocompleteList) restockAutocompleteList.style.display = 'none';
});

const restockShopDropdown = document.getElementById('restockShopDropdown');

const stockNameInput = document.getElementById('stockNameInput');

export function restockProductForm() {
  const form = document.querySelector('.restockModal');
  if (!form) return;

  restockShopDropdown.addEventListener('change', async (e) => {
    //  console.log('Dropdown changed:', e.target.value);

    const form = document.querySelector('.restockModal');

    const selectedShopId = e.target.value;
    if (!selectedShopId) return;

    form.dataset.shopId = selectedShopId;

    //  adminSellProductCategorySection.innerHTML = '';
    restockAutocompleteList.innerHTML = '';
    stockNameInput.value = '';
    searchStockProdutItem.value = '';
    //  allProducts = [];

    restockSearchSection.style.display = 'block';
    //  adminSellProductCategorySection.style.display = 'flex';
    restockProductNameDiv.style.display = 'block';

    await displayAllStocks(selectedShopId);
  });
}

async function displayAllStocks(selectedShopId) {
  try {
    showGlobalLoader();

    const fetchedStockData = await getStockItems();

    //  console.log(`Total Stocks fetched:`, fetchedStockData);

    const allStocks = fetchedStockData.data.stockItems;

    updateAutocompleteList(allStocks); // Populate the autocomplete dropdown with all products

    // Autocomplete filter on input
    searchStockProdutItem.addEventListener('input', function () {
      const inputValue = searchStockProdutItem.value.toLowerCase();

      // console.log(inputValue);
      if (inputValue.value === '') {
        restockProductNameDiv.style.display = 'none';
        restockAutocompleteList.style.display = 'none';
        return;
      } else if (inputValue.length > 0) {
        restockProductNameDiv.style.display = 'block';
        restockAutocompleteList.style.display = 'block';

        let filteredProducts = allStocks;

        // Filter by selected category (if any)
        //   if (activeCategoryId !== null) {
        //     filteredProducts = filteredProducts.filter(
        //       (product) => product.Product.ProductCategory.id === activeCategoryId
        //     );
        //   }

        // Further filter by input value - Add Existing Products
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.product_name.toLowerCase().includes(inputValue) ||
            product.description.toLowerCase().includes(inputValue) ||
            product.id.toString().includes(inputValue)

          // || product.Product.barcode.toLowerCase().includes(inputValue)
        );

        updateAutocompleteList(filteredProducts);

        //   console.log(filteredProducts);

        return;
      } else {
        restockProductNameDiv.style.display = 'none';
        restockAutocompleteList.style.display = 'none';
        return;
      }
    });

    //  searchStockProdutItem.addEventListener('click', function () {
    //    autocompleteList.style.display = 'block';
    //  });
  } catch (error) {
    console.error('Error displaying products:', error);
  } finally {
    hideGlobalLoader();
  }
}

async function fetchAllProducts(shopId) {
  let products = [];

  //   console.log('Fetching products for shop:', shopId);

  try {
    const productInventoryData = await getProductInventory(shopId); // Fetch products

    if (productInventoryData) {
      // console.log(`Fetching product inventory:`, productInventoryData.data);
      products = products.concat(productInventoryData.data); // Add data to all products array

      if (adminSellProductSearchSection)
        adminSellProductSearchSection.style.display = 'block';
      if (adminSellProductCategorySection)
        adminSellProductCategorySection.style.display = 'flex';
    }

    //  console.log('Products', products);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  //   console.log(products);
  return products;
}

// Update the autocomplete list with provided stocks
function updateAutocompleteList(stocks) {
  //   console.log(`updateAutocompleteList Stocks:`, stocks);

  restockAutocompleteList.innerHTML = '';

  const restockQuantityAvailable = document.querySelector(
    '.restockQuantityAvailable'
  );
  const previousQuantityAvailable = document.querySelector(
    '.previousStockQuantityAvailable'
  );

  const stockNameInput = document.getElementById('stockNameInput');
  const form = document.querySelector('.restockModal');

  if (stocks.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'Item Not Found';
    listItem.classList.add('autocomplete-list-item');
    restockAutocompleteList.appendChild(listItem);
  } else {
    stocks.forEach((product) => {
      const {
        product_name,
        id: productId,
        quantity,
        description,
        unit_type,
      } = product;

      // console.log(productId);

      const listItem = document.createElement('li');
      // listItem.textContent = product.Product.name;
      // listItem.classList.add('autocomplete-list-item');
      listItem.innerHTML = `         
         <li class="autocomplete-list-item">
            <p>${`${product_name} (${formatUnitType(unit_type)})`}</p>
            <small>${description}</span>
         </li>
         `;

      listItem.addEventListener('click', function () {
        //   console.log('Selected product:', product); //   console.log(product);

        form.dataset.productId = productId;
        form.dataset.previousQuantity = quantity;

        //   form.dataset.shopId = product.Shop.id;

        stockNameInput.value = product_name;

        previousQuantityAvailable.innerText = quantity;

        document.querySelector('#restockQuantityAvailable').value = '';

        restockAutocompleteList.style.display = 'none';
      });
      restockAutocompleteList.appendChild(listItem);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindRestockProductFormListener();
  restockProductForm();
});

async function fetchAllStock() {
  try {
    const stockInventoryData = await getStockInventory(); // Fetch stocks

    if (stockInventoryData) {
      console.log(`Fetching stock inventory:`, stockInventoryData.data);
      return stockInventoryData.data;
    }

    //  console.log('stockInventoryData', stockInventoryData);
  } catch (error) {
    console.error('Error fetching stock Inventory Data:', error);
    throw error;
  }
}

//   {
//       "id": 35,
//       "business_id": 96,
//       "item_name": "Carton Of Apple Charger",
//       "quantity": 3,
//       "price": 12000,
//       "action_type": "restocked",
//       "performed_by": 85,
//       "created_at": "2025-10-27T20:22:03.000Z",
//       "performer": {
//           "id": 85,
//           "first_name": "Praises",
//           "last_name": "Amaiyo",
//           "email": "development@example.com"
//       }
//   },
