import config from '../config';
import './script.js';

import {
  addInventory,
  createProduct,
  createProductCategory,
  deleteCategory,
  deleteProduct,
  getExportStockTakingData,
  getProductCategories,
  getProductDetail,
  getProductInventory,
  getShopInventoryLog,
  updateCategory,
  updateProduct,
  updateProductInventory,
} from './apiServices/inventory/inventoryResources';

import { checkAndPromptCreateShop } from './apiServices/shop/shopResource';

import {
  clearFormInputs,
  formatActionType,
  formatAmountWithCommas,
  formatAmountWithCommasOnInput,
  formatDateTimeReadable,
  generateBarcode,
  generateEAN13,
  generateSKU,
  getAmountForSubmission,
  getBarcodeFormat,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { addPosChargeForm } from './pos';
import { showToast, closeModal, setupModalCloseButtons } from './script';
import { populateShopDropdown } from './staff';

let isSubmitting = false;
let allProducts = [];
let allCategories = [];
let activeCategoryId = null; // null means "All"
let selectedProduct = null;

const deleteProductButton = document.querySelector('.deleteProductButton');

// JS for Adding Products
const addProductName = document.getElementById('addProductName');
const addProductBoughtPrice = document.getElementById('addProductBoughtPrice');
const addProductSellingPrice = document.getElementById(
  'addProductSellingPrice'
);
const addProductQuantity = document.getElementById('addProductQuantity');

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

// const shopId = parsedUserData?.shopId || dummyShopId;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';

const businessName = parsedUserData?.businessName;

const searchSellProdutItem = document.getElementById('searchSellProdutItem');

if (isAdmin) {
  document.addEventListener('DOMContentLoaded', () => {
    getProductCategories();
  });
}

export function openAddCategoryModalBtn() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addProductCategoryContainer = document.querySelector('.addCategory');

  if (addProductCategoryContainer)
    addProductCategoryContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  addProductCategoryForm();
}

export function openAddProductModalBtn() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addProductContainer = document.querySelector('.addProduct');

  if (addProductContainer) addProductContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  createProductForm();
}

export function openAddExistingProductModalBtn() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const addExistingProductContainer = document.querySelector(
    '.addExistingProduct'
  );

  if (addExistingProductContainer)
    addExistingProductContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function openUpdateProductButton() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateProductContainer = document.querySelector('.updateProduct');

  if (updateProductContainer) updateProductContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  //   updateProductForm();
}

// Print/ Download Product Barcode

export function openProductBarcodeImageModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const getBarcodeImageContainer = document.querySelector(
    '.getBarcodeImageContainer'
  );

  if (getBarcodeImageContainer)
    getBarcodeImageContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

// Delete Product

export function openDeleteProductModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const deleteProductContainer = document.querySelector(
    '.deleteProductContainer'
  );

  if (deleteProductContainer) deleteProductContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

// Delete Category

export function openDeleteCategoryModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const deleteCategoryContainer = document.querySelector(
    '.deleteCategoryContainer'
  );

  if (deleteCategoryContainer) deleteCategoryContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

export function openUpdateCategoryButton() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateCategoryContainer = document.querySelector('.updateCategory');

  if (updateCategoryContainer) updateCategoryContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
}

function getInventoryLogFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  return {
    date_from:
      document.getElementById(`inventoryLogDateFrom_${suffix}`)?.value || '',
    date_to:
      document.getElementById(`inventoryLogDateTo_${suffix}`)?.value || '',
  };
}

function resetInventoryLogFilters(role, shopId) {
  const suffix = role === 'admin' ? `${role}_${shopId}` : role;

  document.getElementById(`inventoryLogDateFrom_${suffix}`).value = '';
  document.getElementById(`inventoryLogDateTo_${suffix}`).value = '';
}

function setupInventoryLogFilters({
  shopId,
  currentFiltersByShop,
  renderInventoryLogTableFn,
}) {
  const applyBtn = document.getElementById(
    `applyInventoryLogFiltersBtn_admin_${shopId}`
  );
  const resetBtn = document.getElementById(
    `resetInventoryLogFiltersBtn_${shopId}`
  );

  if (!applyBtn || !resetBtn) return;

  // Apply Filters
  applyBtn.addEventListener('click', () => {
    console.log('clicked');
    const filters = getInventoryLogFilters('admin', shopId);
    currentFiltersByShop[shopId] = filters;

    renderInventoryLogTableFn({
      filters,
      shopId,
      tableBodyId: `#inventoryLogBody-${shopId}`,
      append: false,
    });
  });

  // Reset Filters
  resetBtn.addEventListener('click', () => {
    const role = 'admin';

    resetInventoryLogFilters(role, shopId);
    const filters = getInventoryLogFilters(role, shopId);
    currentFiltersByShop[shopId] = filters;

    renderInventoryLogTableFn({
      filters,
      shopId,
      tableBodyId: `#inventoryLogBody-${shopId}`,
      append: false,
    });
  });
}

// Export StockTaking Data
export function openExportStockTakingDataModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const exportStockTakingDataContainer = document.querySelector(
    '.exportStockTakingData'
  );

  if (exportStockTakingDataContainer)
    exportStockTakingDataContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  exportBusinessDataForm();
}

export function exportBusinessDataForm() {
  const form = document.querySelector('.exportStockTakingDataModal');

  if (!form) return;
}

export function bindExportStockTakingDataFormListener() {
  const form = document.querySelector('.exportStockTakingDataModal');

  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const stockTakingShopDropdown = document.querySelector(
        '#stockTakingShopDropdown'
      ).value;

      const exportStockTakingDataFormatDropdown = document.querySelector(
        '#exportStockTakingDataFormatDropdown'
      ).value;

      const shopId = stockTakingShopDropdown;

      const exportBusinessDetails = {
        format: exportStockTakingDataFormatDropdown,
      };

      // console.log('Sending POS Capital with:', exportBusinessDetails);
      const exportStockTakingDataBtn = document.querySelector(
        '.exportStockTakingDataBtn'
      );

      try {
        showBtnLoader(exportStockTakingDataBtn);
        showGlobalLoader();
        const exportBusinessResponse = await getExportStockTakingData(
          shopId,
          exportStockTakingDataFormatDropdown
        );

        if (exportBusinessResponse) {
          showToast('success', `✅ ${exportBusinessResponse.message}`);
          console.log('StockTaking Exported', exportBusinessResponse);
          closeModal();
        }

        // closeModal(); // close modal after success
      } catch (err) {
        console.error('Error Exporting Stock Taking:', err.message);
        showToast('fail', `❎ ${err.message}`);
      } finally {
        hideBtnLoader(exportStockTakingDataBtn);
        hideGlobalLoader();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Setup for Opening Pos Charges Modal
  setupModalCloseButtons();

  document
    .querySelector('#openAddCategoryModalBtn')
    ?.addEventListener('click', openAddCategoryModalBtn);

  document
    .querySelector('#openAddProductModalBtn')
    ?.addEventListener('click', openAddProductModalBtn);

  document
    .querySelector('#openAddExistingProductModalBtn')
    ?.addEventListener('click', openAddExistingProductModalBtn);

  document
    .querySelector('#openUpdateProductBtn')
    ?.addEventListener('click', openUpdateProductButton);

  document
    .querySelector('.openUpdateCategoryButton')
    ?.addEventListener('click', openUpdateCategoryButton);
});

export function addProductCategoryForm() {
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

      const addProductCategoryDetails = {
        name: addCategoryName,
        description: addCategoryDescription,
      };

      // console.log('Add Category Details:', addProductCategoryDetails);

      const addCategorySubmitBtn = document.querySelector(
        '.addCategorySubmitBtn'
      );

      try {
        showBtnLoader(addCategorySubmitBtn);

        const data = await createProductCategory(addProductCategoryDetails);

        if (data) {
          hideBtnLoader(addCategorySubmitBtn);
          closeModal();
        }

        closeModal(); // close modal after success
      } catch (err) {
        console.error('Error Adding Product Category:', err.message);
        hideBtnLoader(addCategorySubmitBtn);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

export function populateCategoryTable(productCategoriesData) {
  const tbody = document.querySelector('.category-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  // Remove static rows and loading

  const categories = productCategoriesData.data;

  if (tbody) tbody.innerHTML = '';

  if (!categories.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="6" class="table-error-text">No Categories found.</td>
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
        <td class="py-1 categoryName">${category.name}</td>
         <td class="py-1 categoryDescription">${category.description}</td>

        <td class="py-1 action-buttons">
          <button class="hero-btn-outline openUpdateCategoryButton" data-category-id="${
            category.id
          }">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>

          <button class="hero-btn-outline deleteCategoryButton" data-category-id="${
            category.id
          }">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

    if (tbody) tbody.appendChild(row);

    const deleteCategoryButton = row.querySelector(`.deleteCategoryButton`);

    deleteCategoryButton.addEventListener('click', async () => {
      const categoryId = deleteCategoryButton.dataset.categoryId;
      // console.log('deleteCategoryButton clicked', categoryId);
      // await deleteCategory(categoryId);
    });

    deleteCategoryButton.addEventListener('click', async () => {
      showGlobalLoader();
      const categoryId = deleteCategoryButton.dataset.categoryId;

      const deleteCategoryContainer = document.querySelector(
        '.deleteCategoryContainer'
      );

      if (deleteCategoryContainer) {
        // Store categoryId in modal container for reference
        deleteCategoryContainer.dataset.categoryId = categoryId;

        // Fetch Shop detail
        const categoryDetail = await getProductCategories(categoryId);

        console.log('categoryDetail', categoryDetail);

        // Call function to prefill modal inputs
        if (categoryDetail?.data) {
          hideGlobalLoader();
          openDeleteCategoryModal(); // Show modal after data is ready
          deleteCategoryForm(categoryDetail.data, categoryId);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch shop details.');
        }
      }
    });

    // Update Product Logic

    const updateCategoryBtn = row.querySelector('.openUpdateCategoryButton');

    updateCategoryBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const categoryId = updateCategoryBtn.dataset.categoryId;

      const updateCategoryModalContainer = document.querySelector(
        '.updateCategoryModal'
      );

      if (updateCategoryModalContainer) {
        // Store categoryId in modal container for reference
        updateCategoryModalContainer.dataset.categoryId = categoryId;

        //   console.log(updateCategoryModalContainer.dataset.categoryId);
        // Fetch staff detail
        const CategoryDetail = await getProductCategories(categoryId);

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

export function populateGoodsShopDropdown(shopList = []) {
  const inventoryShopDropdown = document.getElementById(
    'inventoryShopDropdown'
  );

  const addExistingProductShopDropdown = document.getElementById(
    'addExistingProductShopDropdown'
  );

  const stockTakingShopDropdown = document.getElementById(
    'stockTakingShopDropdown'
  );

  if (inventoryShopDropdown) {
    inventoryShopDropdown.innerHTML = `<option value="">Select a shop</option>`;

    shopList.forEach((shop) => {
      const option = document.createElement('option');
      option.value = shop.id;
      option.textContent = `${shop.shop_name} - ${shop.location}`;
      inventoryShopDropdown.appendChild(option);
    });
  } else {
    return;
  }

  if (addExistingProductShopDropdown) {
    addExistingProductShopDropdown.innerHTML = `<option value="">Select a shop</option>`;

    shopList.forEach((shop) => {
      const option = document.createElement('option');
      option.value = shop.id;
      option.textContent = `${shop.shop_name} - ${shop.location}`;
      addExistingProductShopDropdown.appendChild(option);
    });
  } else {
    return;
  }

  if (stockTakingShopDropdown) {
    stockTakingShopDropdown.innerHTML = `<option value="">Select a shop</option>`;

    shopList.forEach((shop) => {
      const option = document.createElement('option');
      option.value = shop.id;
      option.textContent = `${shop.shop_name} - ${shop.location}`;
      stockTakingShopDropdown.appendChild(option);
    });
  } else {
    return;
  }
}

export function populateCategoriesDropdown(categoriesData = []) {
  const categoryList = categoriesData.data;

  const addProductCategoryDropdown =
    document.getElementById('addProductCategory');
  const updateProductCategoryDropdown = document.getElementById(
    'updateProductCategory'
  );
  if (!addProductCategoryDropdown || !updateProductCategoryDropdown) return;

  // Clear existing options except the default
  addProductCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;
  updateProductCategoryDropdown.innerHTML = `<option value="">Select a Category</option>`;

  categoryList.forEach((category) => {
    const option1 = document.createElement('option');
    option1.value = category.id;
    option1.textContent = `${category.name}`;
    if (addProductCategoryDropdown)
      addProductCategoryDropdown.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = category.id;
    option2.textContent = `${category.name}`;
    if (updateProductCategoryDropdown)
      updateProductCategoryDropdown.appendChild(option2);
  });
}

export function createProductForm() {
  const form = document.querySelector('.addProductModal');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const inventoryShopDropdown = document.querySelector(
        '#inventoryShopDropdown'
      ).value;
      const addProductCategory = document.querySelector(
        '#addProductCategory'
      ).value;
      const addProductName = document.querySelector('#addProductName').value;

      const addProductDescription = document.querySelector(
        '#addProductDescription'
      ).value;

      const addProductSku = document.querySelector('#addProductSku').value;

      const addProductBoughtPrice = document.querySelector(
        '#addProductBoughtPrice'
      ).value;

      const addProductSellingPrice = document.querySelector(
        '#addProductSellingPrice'
      ).value;

      const addProductQuantity = document.querySelector(
        '#addProductQuantity'
      ).value;

      let finalSku_Barcode =
        addProductSku !== '' ? addProductSku : generateSKU(businessName);

      const addProductDetails = {
        categoryId: Number(addProductCategory),
        name: addProductName,
        description: addProductDescription,
        sku: finalSku_Barcode,
        purchasePrice: Number(getAmountForSubmission(addProductBoughtPrice)),
        sellingPrice: Number(getAmountForSubmission(addProductSellingPrice)),
        barcode: finalSku_Barcode,
      };

      const addInventoryDetails = {
        quantity: Number(addProductQuantity),
        productId: Number(addProductQuantity),
      };

      const shopId = Number(inventoryShopDropdown);
      console.log('Adding Products with:', addProductDetails);

      const addProductModalBtn = document.querySelector('.addProductModalBtn');

      try {
        showBtnLoader(addProductModalBtn);
        const productData = await createProduct(shopId, addProductDetails);

        //   if (!productData) {
        //     showToast('fail', productData.message);
        //     return;
        //   }

        //   console.log(productData);

        const productId = productData?.data.id;
        const productSku = productData?.data.sku;

        if (!productId) {
          hideBtnLoader(addProductModalBtn);
          return;
        }

        const addInventoryDetails = {
          quantity: Number(addProductQuantity),
          productId: Number(productId),
        };

        //   console.log('Adding Products with:', addProductDetails);

        try {
          const inventoryData = await addInventory(addInventoryDetails, shopId);

          if (inventoryData) {
            // console.log(inventoryData);

            // console.log('Here?', productId);

            handleBarcodeModeToast({
              mode: 'barcodeMode',
              finalSku_Barcode,
              addProductName,
              addedProductSku: productSku,
            });

            // showToast(
            //   'success',
            //   `✅ ${inventoryData.message} with Product ID: ${productId}`
            // );
            showToast('success', `✅ ${inventoryData.message}`);

            closeModal();
            clearFormInputs();
            await renderProductInventoryTable(shopId);
            const filters = getInventoryLogFilters('admin', shopId);
            await renderInventoryLogTable({
              filters,
              shopId,
              tableBody: `#inventoryLogBody-${shopId}`,
            });
          }
        } catch (inventoryDataErr) {
          showToast(
            'fail',
            `❎ ${inventoryDataErr.message || 'Failed to Add inventory'}`
          );
          console.error(
            'Error During Inventory Adding:',
            inventoryDataErr.message
          );
        }
        hideBtnLoader(addProductModalBtn);
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(addProductModalBtn);

        console.error('Error Creating product:', err);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

function handleBarcodeModeToast({
  mode,
  finalSku_Barcode,
  addProductName,
  addedProductSku,
}) {
  //   console.log(mode, finalSku_Barcode, addProductName, addedProductId);

  const productName = document.getElementById('productName');
  const productSku = document.getElementById('productSku');
  const productBarcode = document.getElementById('productBarcode');
  const barcodeImg = document.getElementById('barcode');
  const actions = document.querySelector('.toast-actions');
  const defaultClose = document.querySelector('.default-close');

  if (mode === 'barcodeMode') {
    // Show barcode elements
    productName.classList.remove('hidden');
    productSku.classList.remove('hidden');
    productBarcode.classList.remove('hidden');
    barcodeImg.classList.remove('hidden');
    actions.style.display = 'flex';
    defaultClose.style.display = 'none';

    // Populate data
    productName.textContent = `Product Name: ${addProductName}` || '';
    productSku.textContent = `SKU: ${addedProductSku}` || '';
    //  productBarcode.textContent = `Product Barcode: ${finalSku_Barcode}` || '';

    // Generate barcode
    const format = getBarcodeFormat(finalSku_Barcode);

    JsBarcode(barcodeImg, finalSku_Barcode, {
      format,
      displayValue: true,
      fontSize: 16,
      width: 2,
      height: 40,
    });

    // Download handler
    actions.querySelector('.download-barcode').onclick = () => {
      const link = document.createElement('a');
      link.href = barcodeImg.src;
      link.download = `${addProductName || 'barcode'}.png`;
      link.click();
    };
  } else {
    // Normal toast
    productName.classList.add('hidden');
    productSku.classList.add('hidden');
    productBarcode.classList.add('hidden');
    barcodeImg.classList.add('hidden');
    actions.style.display = 'none';
    defaultClose.style.display = 'inline-block';
  }
}

//  Add Existing Product
export function bindAddExistingProductFormListener() {
  const form = document.querySelector('.addExistingProductModal');
  if (!form) return;

  const newQtyInput = document.querySelector('#itemNewQuantityAvailable');
  const prevQtyDisplay = document.querySelector(
    '.itemPreviousQuantityAvailable'
  );

  newQtyInput.addEventListener('input', function (e) {
    const prevQty = Number(form.dataset.previousQuantity || 0);
    const newQty = Number(e.target.value);
    if (!form.dataset.previousQuantity) {
      prevQtyDisplay.innerText = 'Select a product first';
      prevQtyDisplay.className =
        'itemPreviousQuantityAvailable quantity-normal';
      return;
    }

    if (!newQty || newQty <= 0) {
      prevQtyDisplay.innerText = prevQty;
      prevQtyDisplay.className =
        'itemPreviousQuantityAvailable quantity-normal';
      return;
    }

    // Show calculation
    prevQtyDisplay.innerText = `${prevQty} + ${newQty} = ${prevQty + newQty}`;
    prevQtyDisplay.className = 'itemPreviousQuantityAvailable quantity-preview';
  });

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // console.log('Form got here');

      const productId = form.dataset.productId;
      const shopId = form.dataset.shopId;
      const prevQty = Number(form.dataset.previousQuantity || 0);
      const prevPurchasePrice = Number(form.dataset.previousPurchasePrice) || 0;
      const prevSellingPrice = Number(form.dataset.previousSellingPrice) || 0;

      if (!productId) {
        showToast('fail', '❎ No Product selected for addExisting.');
        return;
      }

      if (!shopId) {
        showToast('fail', '❎ No shop selected for addExisting.');
        return;
      }

      // Subscripts
      const itemPreviousPurchasePrice = document.querySelector(
        '.itemPreviousPurchasePrice'
      );
      const itemPreviousSellingPrice = document.querySelector(
        '.itemPreviousSellingPrice'
      );
      const itemPreviousQuantityAvailable = document.querySelector(
        '.itemPreviousQuantityAvailable'
      );

      // Inputs

      const itemNewPurchasePrice = document.querySelector(
        '#itemNewPurchasePrice'
      ).value;

      const itemNewSellingPrice = document.querySelector(
        '#itemNewSellingPrice'
      ).value;

      const itemNewQuantityAvailable = document.querySelector(
        '#itemNewQuantityAvailable'
      );

      const updateProductDetails = {
        //   categoryId: updateProductCategory,
        //   name: updateProductName,
        //   description: updateProductDescription,
        purchasePrice:
          itemNewPurchasePrice === '' || Number(itemNewPurchasePrice) < 0
            ? prevPurchasePrice
            : Number(getAmountForSubmission(itemNewPurchasePrice)),

        sellingPrice:
          itemNewSellingPrice === '' || Number(itemNewSellingPrice) < 0
            ? prevSellingPrice
            : Number(getAmountForSubmission(itemNewSellingPrice)),
      };

      const updateInventoryDetails = {
        quantity: Number(prevQty) + Number(itemNewQuantityAvailable.value),
      };

      // console.log(
      //   'Updating Product Detail with:',
      //   updateProductDetails,
      //   updateInventoryDetails,
      //   productId,
      //   shopId
      // );

      const addExistingProductModalBtn = document.querySelector(
        '.addExistingProductModalBtn'
      );

      try {
        showBtnLoader(addExistingProductModalBtn);
        const updatedProductData = await updateProduct(
          productId,
          updateProductDetails,
          shopId
        );

        if (!updatedProductData) {
          console.error('fail', updatedProductData.message);
          return;
        }

        //   console.log('Adding Products with:', addProductDetails);

        try {
          const inventoryData = await updateProductInventory(
            updateInventoryDetails,
            shopId,
            productId
          );

          if (inventoryData) {
            showToast(
              'success',
              `✅ ${inventoryData.message} with SKU: ${updatedProductData.data.sku}`
            );
            closeModal();
            clearFormInputs();
            await renderProductInventoryTable(shopId);
            const filters = getInventoryLogFilters('admin', shopId);
            await renderInventoryLogTable({
              filters,
              shopId,
              tableBody: `#inventoryLogBody-${shopId}`,
            });
          }
        } catch (inventoryDataErr) {
          showToast(
            'fail',
            `❎ ${
              inventoryDataErr.message || 'Failed to Add Existing Inventory'
            }`
          );
          console.error(
            'Error During Adding Existing Inventory:',
            inventoryDataErr.message
          );
        }

        hideBtnLoader(addExistingProductModalBtn);
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(addExistingProductModalBtn);

        console.error('Error During Adding Existing Product:', err);
        showToast(
          'fail',
          `❎ ${err.message} || 'Failed to Add Existing Product'}`
        );
        return;
      }
    });
  }
}

const adminSellProductSearchSection = document.querySelector(
  '.addExistingSellProductSearch-section'
);
const adminSellProductCategorySection = document.querySelector(
  '.addExistingSellProductCategory-section'
);
const adminSellProductName = document.querySelector(
  '.addExistingSellProductName'
);
const adminAutocompleteList = document.getElementById(
  'addExistingAutocompleteList'
);
// const

document.addEventListener('DOMContentLoaded', () => {
  if (adminSellProductSearchSection)
    adminSellProductSearchSection.style.display = 'none';
  if (adminSellProductCategorySection)
    adminSellProductCategorySection.style.display = 'none';
  if (adminSellProductName) adminSellProductName.style.display = 'none';
  if (adminAutocompleteList) adminAutocompleteList.style.display = 'none';
});

const addExistingProductShopDropdown = document.getElementById(
  'addExistingProductShopDropdown'
);

export function addExistingProductForm() {
  const form = document.querySelector('.addExistingProductModal');
  if (!form) return;

  addExistingProductShopDropdown.addEventListener('change', async (e) => {
    //  console.log('Dropdown changed:', e.target.value);

    const form = document.querySelector('.addExistingProductModal');

    const selectedShopId = e.target.value;
    if (!selectedShopId) return;

    form.dataset.shopId = selectedShopId;

    adminSellProductCategorySection.innerHTML = '';
    adminAutocompleteList.innerHTML = '';
    productInput.value = '';
    searchSellProdutItem.value = '';
    allProducts = [];

    adminSellProductSearchSection.style.display = 'block';
    adminSellProductCategorySection.style.display = 'flex';
    adminSellProductName.style.display = 'block';

    await displayAllCategories(selectedShopId);
    await displayAllProducts(selectedShopId);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector('#exportStockTakingModalBtn')
    ?.addEventListener('click', openExportStockTakingDataModal);

  bindExportStockTakingDataFormListener();
  bindAddExistingProductFormListener();
  addExistingProductForm();
});

async function displayAllProducts(selectedShopId) {
  //   console.log('products; After Sale entry');
  try {
    showGlobalLoader();

    allProducts = await fetchAllProducts(selectedShopId); // Fetch and store all products

    //  console.log(`Total products fetched:`, allProducts);

    updateAutocompleteList(allProducts); // Populate the autocomplete dropdown with all products

    // Autocomplete filter on input
    searchSellProdutItem.addEventListener('input', function () {
      const inputValue = searchSellProdutItem.value.toLowerCase();

      // console.log(inputValue);
      if (inputValue.value === '') {
        adminSellProductName.style.display = 'none';
        adminAutocompleteList.style.display = 'none';
        return;
      } else if (inputValue.length > 0) {
        adminSellProductName.style.display = 'block';
        adminAutocompleteList.style.display = 'block';

        let filteredProducts = allProducts;

        // Filter by selected category (if any)
        if (activeCategoryId !== null) {
          filteredProducts = filteredProducts.filter(
            (product) => product.Product.ProductCategory.id === activeCategoryId
          );
        }

        // Further filter by input value - Add Existing Products
        filteredProducts = filteredProducts.filter((item) => {
          const product = item.Product;

          // Skip if product is null or undefined
          if (!product) return false;

          const name = product.name?.toLowerCase() || '';
          const desc = product.description?.toLowerCase() || '';
          const sku = product.sku?.toString()?.toLowerCase() || '';
          const barcode = product.barcode?.toLowerCase() || '';

          return (
            name.includes(inputValue) ||
            desc.includes(inputValue) ||
            sku.includes(inputValue) ||
            barcode.includes(inputValue)
          );
        });

        updateAutocompleteList(filteredProducts);

        console.log(filteredProducts);

        return;
      } else {
        adminSellProductName.style.display = 'none';
        adminAutocompleteList.style.display = 'none';
        return;
      }
    });

    //  searchSellProdutItem.addEventListener('click', function () {
    //    autocompleteList.style.display = 'block';
    //  });
  } catch (error) {
    console.error('Error displaying products:', error);
  } finally {
    hideGlobalLoader();
  }
}

async function displayAllCategories() {
  try {
    showGlobalLoader();

    // Clear old category buttons
    adminSellProductCategorySection.innerHTML = '';
    activeCategoryId = null; // Reset category filter

    allCategories = await fetchAllCategories(); // Fetch and store all Categories

    //  console.log(`Total Categories fetched:`, allCategories);

    const allBtn = document.createElement('button');
    allBtn.classList.add('sellProductCategoryBtn');
    allBtn.type = 'button';
    allBtn.textContent = 'All';
    allBtn.dataset.categoryId = 'all';

    allBtn.addEventListener('click', function () {
      document.querySelectorAll('.sellProductCategoryBtn').forEach((btn) => {
        btn.classList.remove('active');
      });

      allBtn.classList.add('active');
      activeCategoryId = null; // Reset filter to all

      adminSellProductName.style.display = 'block';
      adminAutocompleteList.style.display = 'block';

      let filteredProducts = allProducts;

      const inputValue = searchSellProdutItem.value.toLowerCase().trim();
      if (inputValue.length > 0) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.Product.name.toLowerCase().includes(inputValue) ||
            product.Product.description.toLowerCase().includes(inputValue)
        );
      }

      updateAutocompleteList(filteredProducts);
    });

    adminSellProductCategorySection.appendChild(allBtn);

    allCategories.forEach((category) => {
      const categoryBtn = document.createElement('button');
      categoryBtn.classList.add('sellProductCategoryBtn');
      categoryBtn.type = 'button';
      categoryBtn.textContent = category.name;
      categoryBtn.dataset.categoryId = category.id;

      categoryBtn.addEventListener('click', function () {
        // Remove active class from all other buttons
        document.querySelectorAll('.sellProductCategoryBtn').forEach((btn) => {
          btn.classList.remove('active');
        });

        // Toggle current button as active
        categoryBtn.classList.add('active');
        activeCategoryId = parseInt(categoryBtn.dataset.categoryId);

        adminSellProductName.style.display = 'block';
        adminAutocompleteList.style.display = 'block';

        const categoryId = parseInt(categoryBtn.dataset.categoryId);

        let filteredProducts = allProducts.filter(
          //  (product) => product.Product.ProductCategory.id === categoryId
          (product) => product.Product.ProductCategory.id === activeCategoryId
        );

        const inputValue = searchSellProdutItem.value.toLowerCase().trim();

        if (inputValue.length > 0) {
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.Product.name.toLowerCase().includes(inputValue) ||
              product.Product.description.toLowerCase().includes(inputValue)
          );
        }

        updateAutocompleteList(filteredProducts);
      });

      adminSellProductCategorySection.appendChild(categoryBtn);
    });
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

async function fetchAllCategories() {
  let categories = [];

  try {
    const productCategoryData = await getProductCategories(); // Fetch Categories

    if (productCategoryData) {
      // console.log(`Fetching product categories:`, productCategoryData.data);
      categories = categories.concat(productCategoryData.data); // Add data to all Categories array
    }

    //  console.log('Categories', categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  //   console.log(categories);
  return categories;
}

// Update the autocomplete list with provided products
function updateAutocompleteList(products) {
  adminAutocompleteList.innerHTML = '';

  const itemPreviousPurchasePrice = document.querySelector(
    '.itemPreviousPurchasePrice'
  );
  const itemPreviousSellingPrice = document.querySelector(
    '.itemPreviousSellingPrice'
  );
  const itemPreviousQuantityAvailable = document.querySelector(
    '.itemPreviousQuantityAvailable'
  );

  const productInput = document.getElementById('productInput');
  const form = document.querySelector('.addExistingProductModal');

  if (products.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'Item Not Found';
    listItem.classList.add('autocomplete-list-item');
    adminAutocompleteList.appendChild(listItem);
  } else {
    products.forEach((product) => {
      // console.log(product);
      const listItem = document.createElement('li');
      // listItem.textContent = product.Product.name;
      // listItem.classList.add('autocomplete-list-item');
      listItem.innerHTML = `         
         <li class="autocomplete-list-item">
            <p>${product.Product.name}</p>
            <small>${product.Product.description}</span>
         </li>
         `;

      listItem.addEventListener('click', function () {
        selectedProduct = product.Product; // Store selected product to later get the product ID
        //   console.log(product);
        form.dataset.productId = product.Product.id;
        form.dataset.previousQuantity = product.quantity;
        form.dataset.previousPurchasePrice = product.Product.purchase_price;
        form.dataset.previousSellingPrice = product.Product.selling_price;
        //   form.dataset.shopId = product.Shop.id;

        productInput.value = product.Product.name;
        itemPreviousPurchasePrice.innerText = formatAmountWithCommas(
          product.Product.purchase_price
        );
        itemPreviousSellingPrice.innerText = formatAmountWithCommas(
          product.Product.selling_price
        );
        itemPreviousQuantityAvailable.innerText = product.quantity;

        document.querySelector('#itemNewQuantityAvailable').value = '';

        adminAutocompleteList.style.display = 'none';
      });
      adminAutocompleteList.appendChild(listItem);
    });
  }
}

//  Update Product
export function bindUpdateProductFormListener() {
  const form = document.querySelector('.updateProductModal');
  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const productId = form.dataset.productId;
      const shopId = form.dataset.shopId;

      if (!productId) {
        showToast('fail', '❎ No Product selected for update.');
        return;
      }

      if (!shopId) {
        showToast('fail', '❎ No shop selected for update.');
        return;
      }

      const updateProductCategory = document.querySelector(
        '#updateProductCategory'
      ).value;
      const updateProductName =
        document.querySelector('#updateProductName').value;
      const updateProductDescription = document.querySelector(
        '#updateProductDescription'
      ).value;
      const updateProductSku =
        document.querySelector('#updateProductSku').value;
      const updateProductBoughtPrice = document.querySelector(
        '#updateProductBoughtPrice'
      ).value;
      const updateProductSellingPrice = document.querySelector(
        '#updateProductSellingPrice'
      ).value;
      const updateProductQuantity = document.querySelector(
        '#updateProductQuantity'
      ).value;

      const updateProductDetails = {
        categoryId: updateProductCategory,
        name: updateProductName,
        description: updateProductDescription,
        sku: updateProductSku,
        purchasePrice: Number(getAmountForSubmission(updateProductBoughtPrice)),
        sellingPrice: Number(getAmountForSubmission(updateProductSellingPrice)),
      };

      const updateInventoryDetails = {
        quantity: Number(updateProductQuantity),
      };

      console.log(
        'Updating Product Detail with:',
        updateProductDetails,
        productId
      );

      const updateProductModalBtn = document.querySelector(
        '.updateProductModalBtn'
      );

      try {
        showBtnLoader(updateProductModalBtn);
        const updatedProductData = await updateProduct(
          productId,
          updateProductDetails,
          shopId
        );

        if (!updatedProductData) {
          console.error('fail', updatedProductData.message);
          return;
        }

        //   console.log('Adding Products with:', addProductDetails);

        try {
          const inventoryData = await updateProductInventory(
            updateInventoryDetails,
            shopId,
            productId
          );

          const filters = getInventoryLogFilters('admin', shopId);

          if (inventoryData) {
            showToast(
              'success',
              `✅ ${inventoryData.message} with SKU: ${updatedProductData.data.sku}`
            );
            closeModal();
            clearFormInputs();
            await renderProductInventoryTable(shopId);
            await renderInventoryLogTable({
              filters,
              shopId,
              tableBody: `#inventoryLogBody-${shopId}`,
            });
          }
        } catch (inventoryDataErr) {
          showToast(
            'fail',
            `❎ ${inventoryDataErr.message || 'Failed to Update inventory'}`
          );
          console.error(
            'Error During Inventory Updating:',
            inventoryDataErr.message
          );
        }
        hideBtnLoader(updateProductModalBtn);
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(updateProductModalBtn);

        console.error('Error Updating product:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      }
    });
  }
}

export function updateProductForm(productDetail) {
  console.log('Product Detail:', productDetail);

  const form = document.querySelector('.updateProductModal');
  if (!form) return;

  //   if (!form || form.dataset.bound === 'true') return;
  //   form.dataset.bound = 'true';

  const product = productDetail.data;
  const productCategory = product.ProductCategory;
  const productInventory = product.inventory[0];

  const shopId = productInventory?.Shop.id;
  const productId = product.id;

  form.dataset.productId = productId;
  form.dataset.shopId = shopId;

  // Save user.id in the form for later use

  const { id: inventoryId, product_id, quantity } = productInventory;

  const {
    name: productName,
    description: productDescription,
    purchase_price,
    selling_price,
    sku,
  } = product;

  const { name: categoryName, id: categoryId } = productCategory;

  //   console.log(
  //     inventoryId,
  //     product_id,
  //     quantity,
  //     productName,
  //     productDescription,
  //     purchase_price,
  //     selling_price,
  //     categoryName,
  //     categoryId,
  //     shopId
  //   );

  document.querySelector('#updateProductCategory').value = categoryId || '';
  document.querySelector('#updateProductName').value = productName;
  document.querySelector('#updateProductDescription').value =
    productDescription;
  document.querySelector('#updateProductSku').value = sku;
  document.querySelector('#updateProductBoughtPrice').value =
    formatAmountWithCommas(purchase_price) || '';
  document.querySelector('#updateProductSellingPrice').value =
    formatAmountWithCommas(selling_price) || '';
  document.querySelector('#updateProductQuantity').value = quantity || '';
}

// Prnt/Download Product Barcode
export function getProductBarcodeImageForm(product, shopId) {
  const form = document.querySelector('.deleteProductContainerModal');
  if (!form) return;

  console.log(product);

  form.dataset.shopId = shopId;
  form.dataset.productId = product.id;
  form.dataset.productBarcode = product.barcode;

  const barcode = form.dataset.productBarcode;
  const productId = form.dataset.productId;

  console.log(productId, barcode);

  const barcodeImg = document.getElementById('barcode-image');

  // Generate barcode
  const format = getBarcodeFormat(barcode);

  if (barcodeImg) {
    JsBarcode(barcodeImg, barcode, {
      format,
      displayValue: true,
      fontSize: 16,
      width: 2,
      height: 40,
    });
  } else {
    console.error('Barcode image element not found.');
  }

  document.querySelector('.barcode-product_name').textContent = product.name;
  document.querySelector('.barcode-product_id').textContent = productId;
  document.querySelector('.barcode-product_barcode').textContent = barcode;
}

export function bindGetProductBarcodeFormListener() {
  const form = document.querySelector('.getBarcodeImageContainerModal');
  if (!form) return;

  const downloadBarcodeImageBtn = form.querySelector(
    '.downloadBarcodeImageBtn'
  );
  const closeBarcodeModalBtn = form.querySelector('.closeBarcodeModalBtn');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    closeBarcodeModalBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    const barcodeImg = document.getElementById('barcode-image');

    downloadBarcodeImageBtn?.addEventListener('click', async (e) => {
      e.preventDefault();

      const productName = document.querySelector(
        '.barcode-product_name'
      ).textContent;

      const link = document.createElement('a');
      link.href = barcodeImg.src;
      link.download = `${productName || 'barcode'}.png`;
      link.click();
    });
  }
}

// Delete Product
export function deleteProductForm(product, shopId) {
  const form = document.querySelector('.deleteProductContainerModal');
  if (!form) return;

  form.dataset.shopId = shopId;
  form.dataset.productId = product.id;

  document.getElementById('confirmation-text').textContent = product.name;
}

export function bindDeleteProductFormListener() {
  const form = document.querySelector('.deleteProductContainerModal');
  if (!form) return;

  const deleteProductButton = form.querySelector('.deleteProductButton');
  const cancelButton = form.querySelector('.cancel-close');

  if (!form.dataset.bound) {
    form.dataset.bound = true;

    cancelButton?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    deleteProductButton?.addEventListener('click', async (e) => {
      e.preventDefault();

      const shopId = form.dataset.shopId;
      const productId = form.dataset.productId;

      if (!shopId) {
        showToast('fail', '❎ No shop ID found.');
        return;
      }
      if (!productId) {
        showToast('fail', '❎ No Product ID found.');
        return;
      }

      try {
        showBtnLoader(deleteProductButton);
        await deleteProduct(productId, shopId);
        hideBtnLoader(deleteProductButton);
        closeModal();
        showToast('success', '✅ Product deleted successfully.');
      } catch (err) {
        hideBtnLoader(deleteProductButton);
        showToast('fail', `❎ ${err.message}`);
      }
    });
  }
}

// Delete Category
export function deleteCategoryForm(category, categoryId) {
  const form = document.querySelector('.deleteCategoryContainerModal');
  if (!form) return;

  form.dataset.categoryId = category.id;

  console.log(category);

  category.forEach((cat) => {
    if (cat.id === Number(categoryId)) {
      console.log(cat.name);
      document.getElementById('confirmation-text-2').textContent = cat.name;
    }
  });
}

//  Update Category
export function bindUpdateCategoryFormListener() {
  const form = document.querySelector('.updateCategoryModal');
  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const categoryId = form.dataset.categoryId;

      if (!categoryId) {
        showToast('fail', '❎ No Category selected for update.');
        return;
      }

      const updateCategoryName = document.querySelector(
        '#updateCategoryName'
      ).value;
      const updateCategoryDescription = document.querySelector(
        '#updateCategoryDescription'
      ).value;

      const updateCategoryDetails = {
        name: updateCategoryName,
        description: updateCategoryDescription,
      };

      // console.log(
      //   'Updating Category Detail with:',
      //   updateCategoryDetails,
      //   categoryId
      // );

      const updateCategoryModalBtn = document.querySelector(
        '.updateCategoryModalBtn'
      );

      try {
        showBtnLoader(updateCategoryModalBtn);
        const updatedCategoryData = await updateCategory(
          categoryId,
          updateCategoryDetails
        );

        if (!updatedCategoryData) {
          console.error('fail', updatedCategoryData.message);
          return;
        }

        closeModal();
        hideBtnLoader(updateCategoryModalBtn);
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(updateCategoryModalBtn);

        console.error('Error Updating Category:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      }
    });
  }
}

export function updateCategoryForm(categoryDetail) {
  //   console.log('Category Detail:', CategoryDetail);

  const form = document.querySelector('.updateCategoryModal');
  if (!form) return;

  //   form.dataset.categoryId = categoryId;

  //   if (!form || form.dataset.bound === 'true') return;
  //   form.dataset.bound = 'true';

  //   console.log(categoryDetail.data);

  const categories = categoryDetail.data;

  categories.forEach((category) => {
    //  console.log('category', category.id);
    //  console.log('dataset', form.dataset.categoryId);

    if (category.id === Number(form.dataset.categoryId)) {
      const categoryName = category.name;
      const categoryDescription = category.description;
      const categoryId = category.id;

      document.querySelector('#updateCategoryName').value = categoryName;
      document.querySelector('#updateCategoryDescription').value =
        categoryDescription;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindUpdateCategoryFormListener(); // Only once
});

// function getFilters(role, shopId) {
//   const suffix = role === 'admin' ? `${role}_${shopId}` : role;

//   return {
//     startDate:
//       document.getElementById(`startDateFilter_${suffix}`)?.value || '',
//     endDate: document.getElementById(`endDateFilter_${suffix}`)?.value || '',
//     type: document.getElementById(`typeFilter_${suffix}`)?.value || '',
//     status: document.getElementById(`statusFilter_${suffix}`)?.value || '',
//   };
// }

// function resetFilters(role, shopId) {
//   const suffix = role === 'admin' ? `${role}_${shopId}` : role;

//   document.getElementById(`startDateFilter_${suffix}`).value = '';
//   document.getElementById(`endDateFilter_${suffix}`).value = '';
//   document.getElementById(`typeFilter_${suffix}`).value = '';
//   document.getElementById(`statusFilter_${suffix}`).value = '';
// }

const adminAccordionContainer = document.querySelector(
  '.adminAccordionContainer'
);
const container = document.getElementById('accordionProductInventory');

// export async function populateProductInventoryTable(productInventoryData) {
// if (userData && isAdmin) {

const shopProductMap = {};

if (isAdmin && adminAccordionContainer && container) {
  adminAccordionContainer.style.display = 'block';

  let isLoading = true;

  if (container) {
    isLoading
      ? (container.innerHTML = `<p class="heading-minitext table-loading-text center-text mb-4">Loading Shop Inventory...</p>`)
      : '';
  }

  (async () => {
    if (container.dataset.accordionRendered === 'true') {
      // console.warn('Accordion already rendered. Skipping...');
      return;
    }
    container.dataset.accordionRendered = 'true';
    showGlobalLoader();

    let enrichedShopData = [];
    const currentFiltersByShop = {};

    const { enrichedShopData: loadedShops } = await checkAndPromptCreateShop();

    enrichedShopData = loadedShops;
    if (enrichedShopData.length === 0) {
      container.innerHTML = `<h1 class="heading-text">No shop Available for Product Inventory Display</h1>`;
    }

    container.innerHTML = '';

    enrichedShopData.forEach((shop, index) => {
      const accordion = document.createElement('section');
      //  shopPageTracker[shop.id] = 1;
      const shopId = shop.id;

      // console.log(shop);

      let isLoading = false;

      accordion.className = 'accordion-section';
      accordion.innerHTML = `        <button class="accordion-toggle card heading-text" data-shop-id="${shopId}">
                       <h2 class="heading-subtext">
                          ${shop.shop_name}
                       </h2>
                       <i class="fa-solid icon fa-chevron-down"></i>
                    </button>
                        <div class="accordion-content">
                        ${getAdminInventoryTableHtml(shop)}
                        ${getAdminInventoryLogHtml(shop)}
             
       
        </div>`;
      if (container) container.appendChild(accordion);
      if (container) container.dataset.shopId;

      // console.log(accordion);

      const searchProductInput = document.getElementById(
        `searchProdutInventory_${shopId}`
      );

      searchProductInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const products = shopProductMap[shopId] || [];

        //   console.log(query);

        const filteredProducts = products.filter((item) => {
          const product = item.Product;

          if (!product) return false;

          const name = product.name?.toLowerCase() || '';
          const desc = product.description?.toLowerCase() || '';
          const sku = product.sku?.toString()?.toLowerCase() || '';
          const barcode = product.barcode?.toLowerCase() || '';

          return (
            name.includes(query) ||
            desc.includes(query) ||
            sku.includes(query) ||
            barcode.includes(query)
          );
        });

        renderFilteredProducts(shopId, filteredProducts);

        console.log(filteredProducts);
      });

      setupInventoryLogFilters({
        shopId: shop.id,
        currentFiltersByShop,
        renderInventoryLogTableFn: renderInventoryLogTable,
      });

      // const filters = getFilters('admin', shop.id);
      // currentFiltersByShop[shop.id] = filters;
    });

    container.addEventListener('click', async function (e) {
      const toggleBtn = e.target.closest('.accordion-toggle');
      if (!toggleBtn) return;
      const section = toggleBtn.closest('.accordion-section');
      const content = section.querySelector('.accordion-content');
      const shopId = toggleBtn.dataset.shopId;

      const isActive = section.classList.contains('active');

      // Close all accordion sections
      document.querySelectorAll('.accordion-section').forEach((sec) => {
        sec.classList.remove('active');
      });
      // Re-open only if it wasn't active before
      if (!isActive) {
        section.classList.add('active');
      }
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      // const filters = getFilters('admin', shopId);
      // currentFiltersByShop[shopId] = filters;
      //  shopPageTracker[shopId] = 1;

      // await renderProductInventoryTable(shopId);
      //        const filters = getInventoryLogFilters('admin', shopId);
      //   await renderInventoryLogTable({
      //            filters,
      //            shopId,
      //            tableBody: `#inventoryLogBody-${shopId}`,
      //          });

      const shopInventorySection = document.getElementById(
        `shop-report-${shopId}`
      );

      if (
        shopInventorySection &&
        shopInventorySection.dataset.loaded !== 'true'
      ) {
        await renderProductInventoryTable(shopId);
        const filters = getInventoryLogFilters('admin', shopId);
        await renderInventoryLogTable({
          filters,
          shopId,
          tableBody: `#inventoryLogBody-${shopId}`,
        });

        shopInventorySection.dataset.loaded = 'true';
      }

      // Toggle accordion
      //  section.classList.toggle('active');
      //  if (section.classList.contains('active')) {
      //    icon.style.transform = 'rotate(180deg)';
      //  } else {
      //    icon.style.transform = 'rotate(0deg)';
      //  }
    });
    //   });
  })();
}

function renderFilteredProducts(shopId, productList) {
  const inventoryTableBody = document.querySelector(
    `#inventory-tbody-${shopId}`
  );
  if (!inventoryTableBody) return;

  if (productList.length === 0) {
    inventoryTableBody.innerHTML =
      '<tr class="loading-row"><td colspan="6" class="table-error-text ">No Product matches search Query.</td></tr>';
    return;
  }

  inventoryTableBody.innerHTML = ''; // Clear old

  productList.forEach((productInventory, index) => {
    const {
      id,
      product_id,
      quantity,
      Product: {
        name: productName,
        description,
        sku,
        barcode,
        purchase_price,
        selling_price,
        ProductCategory: { name: categoryName },
      },
    } = productInventory;

    const row = document.createElement('tr');
    row.classList.add('table-body-row');
    row.classList.add(
      quantity < 1
        ? 'finishedStockRow'
        : quantity >= 1 && quantity <= 10
        ? 'nearFinishedStockRow'
        : 'inStockRow'
    );
    row.innerHTML = `
       
                <td class="py-1 productSerialNumber">${index + 1}</td>
                <td class="py-1 productName">${productName}</td>
                <td class="py-1 productDescription">${description}</td>
                <td class="py-1 producCategory">${categoryName}</td>
                <td class="py-1 producCategory">${sku ? sku : 'N/A'}</td>
                <td class="py-1 producCategory">${
                  barcode ? barcode : 'N/A'
                }</td>
                <td class="py-1 productAmountBought">&#x20A6;${formatAmountWithCommas(
                  purchase_price
                )}</td>
                <td class="py-1 productQuantity">${quantity}</td>
                <td class="py-1 productSellingPrice">&#x20A6;${formatAmountWithCommas(
                  selling_price
                )}</td>
                <td class="py-1 action-buttons" style="margin-top:1.1rem">
                  <button
                    class="hero-btn-outline openBarcodeImageBtn"
                    id="openBarcodeImageBtn" data-product-id="${product_id}" data-product-barcode="${barcode}" 
                     style="width: max-content;" >
                    Print Barcode
                  </button>

                  <button
                    class="hero-btn-outline openUpdateProductBtn"
                    id="openUpdateProductBtn" data-product-id="${product_id}"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>

                  <button
                    class="hero-btn-outline deleteProductBtn"
                    id="deleteProductModalBtn" data-product-id="${product_id}"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
    
             `;
    inventoryTableBody.appendChild(row);

    // Handle Print Barcode Logic
    const openBarcodeImageBtn = row.querySelector(`#openBarcodeImageBtn`);

    openBarcodeImageBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const productId = openBarcodeImageBtn.dataset.productId;
      const productBarcode = openBarcodeImageBtn.dataset.productBarcode;

      const getBarcodeImageContainer = document.querySelector(
        '.getBarcodeImageContainer'
      );

      if (getBarcodeImageContainer) {
        // Store productId in modal container for reference
        getBarcodeImageContainer.dataset.productId = productId;
        getBarcodeImageContainer.dataset.productBarcode = productBarcode;

        // Fetch Shop detail
        const productDetail = await getProductDetail(productId);

        //   console.log('productDetail', productDetail);

        // Call function to prefill modal inputs

        if (productDetail?.data) {
          hideGlobalLoader();
          openProductBarcodeImageModal(); // Show modal after data is ready
          getProductBarcodeImageForm(productDetail.data, shopId);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch shop details.');
        }
      }
    });

    // Handle Delete Product Logic
    const deleteProductModalBtn = row.querySelector(`#deleteProductModalBtn`);

    deleteProductModalBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const productId = deleteProductModalBtn.dataset.productId;

      const deleteProductContainer = document.querySelector(
        '.deleteProductContainer'
      );

      if (deleteProductContainer) {
        // Store productId in modal container for reference
        deleteProductContainer.dataset.productId = productId;

        // Fetch Shop detail
        const productDetail = await getProductDetail(productId);

        //   console.log('productDetail', productDetail);

        // Call function to prefill modal inputs
        if (productDetail?.data) {
          hideGlobalLoader();
          openDeleteProductModal(); // Show modal after data is ready
          deleteProductForm(productDetail.data, shopId);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch shop details.');
        }
      }
    });

    // Update Product Logic

    const updateProductBtn = row.querySelector('.openUpdateProductBtn');

    updateProductBtn?.addEventListener('click', async () => {
      showGlobalLoader();
      const productId = updateProductBtn.dataset.productId;

      const updateProductModalContainer = document.querySelector(
        '.updateProductModal'
      );

      if (updateProductModalContainer) {
        // Store productId in modal container for reference
        updateProductModalContainer.dataset.productId = productId;

        // Fetch staff detail
        const ProductDetail = await getProductDetail(productId);

        //  console.log('Product detail received successfully:', ProductDetail);

        // Call function to prefill modal inputs
        if (ProductDetail?.success === true) {
          hideGlobalLoader();
          openUpdateProductButton(); // Show modal after data is ready

          updateProductForm(ProductDetail);
        } else {
          hideGlobalLoader();
          showToast('fail', '❌ Failed to fetch Product details.');
        }
      }
    });
  });
}

export async function renderProductInventoryTable(shopId) {
  const inventoryTableBody = document.querySelector(
    `#inventory-tbody-${shopId}`
  );

  if (!inventoryTableBody) {
    console.error('Error: Table body not found');
    return;
  }
  try {
    let loadingRow = document.querySelector('.loading-row');
    if (!loadingRow) {
      loadingRow = document.createElement('tr');
      loadingRow.className = 'loading-row';
      loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading Product Inventory...</td>`;
      inventoryTableBody.appendChild(loadingRow);
    }
    const result = await getProductInventory(shopId);
    if (!result) throw new Error('Failed to fetch Product Inventory');

    const productInventories = result.data;

    shopProductMap[shopId] = productInventories;

    console.log(productInventories);

    const totalProductsCountElement = document.querySelector(
      `.totalProductsCount_${shopId}`
    );
    const totalProductsWorthElement = document.querySelector(
      `.totalProductsWorth_${shopId}`
    );
    const totalProductsProfitsElement = document.querySelector(
      `.totalProductsProfits_${shopId}`
    );

    const totalProductsCount = productInventories?.length || 0;

    const totalProductsWorth = productInventories?.reduce(
      (acc, item) => acc + item.Product.purchase_price * item.quantity,
      0
    );

    const totalProductSellingPrice = productInventories?.reduce(
      (acc, item) => acc + item.Product.selling_price * item.quantity,
      0
    );

    const totalProductProfits = totalProductSellingPrice - totalProductsWorth;

    totalProductsCountElement.textContent = totalProductsCount;
    totalProductsWorthElement.textContent =
      `₦` + formatAmountWithCommas(totalProductsWorth);
    totalProductsProfitsElement.textContent =
      `₦` + formatAmountWithCommas(totalProductProfits);

    //  console.log(totalProductProfits, totalProductsWorth, totalProductsCount);

    if (productInventories.length === 0) {
      const searchSection = document.querySelector(`.search-section_${shopId}`);

      searchSection.style.display = 'none';

      inventoryTableBody.innerHTML =
        '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Product Inventory Available.</td></tr>';
      return;
    }

    inventoryTableBody.innerHTML = '';
    productInventories.map((productInventory, index) => {
      // console.log(productInventory);
      const { id, product_id, quantity } = productInventory;
      const {
        name: productName,
        description,
        barcode,
        purchase_price,
        selling_price,
        sku,
      } = productInventory.Product;
      const categoryName =
        productInventory?.Product?.ProductCategory?.name || 'Uncategorized';

      const row = document.createElement('tr');
      row.classList.add('table-body-row');
      row.classList.add(
        quantity < 1
          ? 'finishedStockRow'
          : quantity >= 1 && quantity <= 10
          ? 'nearFinishedStockRow'
          : 'inStockRow'
      );
      row.innerHTML = `
       
                <td class="py-1 productSerialNumber">${index + 1}</td>
                <td class="py-1 productName">${productName}</td>
                <td class="py-1 productDescription">${description}</td>
                <td class="py-1 producCategory">${categoryName}</td>
           <td class="py-1 producCategory">${sku ? sku : 'N/A'}</td>
                <td class="py-1 producCategory">${
                  barcode ? barcode : 'N/A'
                }</td>
                <td class="py-1 productAmountBought">&#x20A6;${formatAmountWithCommas(
                  purchase_price
                )}</td>
                <td class="py-1 productQuantity">${quantity}</td>
                <td class="py-1 productSellingPrice">&#x20A6;${formatAmountWithCommas(
                  selling_price
                )}</td>
                <td class="py-1 action-buttons" style="margin-top:1.1rem">
                  <button
                    class="hero-btn-outline openBarcodeImageBtn"
                    id="openBarcodeImageBtn" data-product-id="${product_id}" data-product-barcode="${barcode}" 
                 style="width: max-content;" >
                    Print Barcode
                  </button>

                  <button
                    class="hero-btn-outline openUpdateProductBtn"
                    id="openUpdateProductBtn" data-product-id="${product_id}"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>

                  <button
                    class="hero-btn-outline deleteProductBtn"
                    id="deleteProductModalBtn" data-product-id="${product_id}"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
    
             `;
      inventoryTableBody.appendChild(row);

      // const deleteProductBtn = row.querySelector(`.deleteProductBtn`);

      // deleteProductBtn.addEventListener('click', async () => {
      //   const productId = deleteProductBtn.dataset.productId;
      //   //   console.log('deleteProductBtn clicked', productId);
      //   await deleteProduct(productId, shopId);
      // });

      // Handle Print Barcode Logic

      const openBarcodeImageBtn = row.querySelector(`#openBarcodeImageBtn`);

      openBarcodeImageBtn?.addEventListener('click', async () => {
        showGlobalLoader();
        const productId = openBarcodeImageBtn.dataset.productId;
        const productBarcode = openBarcodeImageBtn.dataset.productBarcode;

        const getBarcodeImageContainer = document.querySelector(
          '.getBarcodeImageContainer'
        );

        if (getBarcodeImageContainer) {
          // Store productId in modal container for reference
          getBarcodeImageContainer.dataset.productId = productId;
          getBarcodeImageContainer.dataset.productBarcode = productBarcode;

          // Fetch Shop detail
          const productDetail = await getProductDetail(productId);

          //   console.log('productDetail', productDetail);

          // Call function to prefill modal inputs

          if (productDetail?.data) {
            hideGlobalLoader();
            openProductBarcodeImageModal(); // Show modal after data is ready
            getProductBarcodeImageForm(productDetail.data, shopId);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch shop details.');
          }
        }
      });

      const deleteProductModalBtn = row.querySelector(`#deleteProductModalBtn`);

      deleteProductModalBtn?.addEventListener('click', async () => {
        showGlobalLoader();
        const productId = deleteProductModalBtn.dataset.productId;

        const deleteProductContainer = document.querySelector(
          '.deleteProductContainer'
        );

        if (deleteProductContainer) {
          // Store productId in modal container for reference
          deleteProductContainer.dataset.productId = productId;

          // Fetch Shop detail
          const productDetail = await getProductDetail(productId);

          //   console.log('productDetail', productDetail);

          // Call function to prefill modal inputs
          if (productDetail?.data) {
            hideGlobalLoader();
            openDeleteProductModal(); // Show modal after data is ready
            deleteProductForm(productDetail.data, shopId);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch shop details.');
          }
        }
      });

      // Update Product Logic

      const updateProductBtn = row.querySelector('.openUpdateProductBtn');

      updateProductBtn?.addEventListener('click', async () => {
        showGlobalLoader();
        const productId = updateProductBtn.dataset.productId;

        const updateProductModalContainer = document.querySelector(
          '.updateProductModal'
        );

        if (updateProductModalContainer) {
          // Store productId in modal container for reference
          updateProductModalContainer.dataset.productId = productId;

          // Fetch staff detail
          const ProductDetail = await getProductDetail(productId);

          //  console.log('Product detail received successfully:', ProductDetail);

          // Call function to prefill modal inputs
          if (ProductDetail?.success === true) {
            hideGlobalLoader();
            openUpdateProductButton(); // Show modal after data is ready

            updateProductForm(ProductDetail);
          } else {
            hideGlobalLoader();
            showToast('fail', '❌ Failed to fetch Product details.');
          }
        }
      });

      return { productName, description };
    });
  } catch (error) {
    console.error('Error rendering Product Inventory:', error);
    inventoryTableBody.innerHTML =
      '<tr><td colspan="6" class="table-error-text">Error loading Product Inventory.</td></tr>';
  }
}

export async function renderInventoryLogTable({ filters, shopId }) {
  const inventoryLogTableBody = document.querySelector(
    `#inventoryLogBody-${shopId}`
  );

  if (!inventoryLogTableBody) {
    console.error('Error: Table body not found');
    return;
  }
  try {
    let loadingRow = document.querySelector('.loading-row');
    if (!loadingRow) {
      loadingRow = document.createElement('tr');
      loadingRow.className = 'loading-row';
      loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading Shop Inventory Logs...</td>`;
      inventoryLogTableBody.appendChild(loadingRow);
    }

    const queryParams = new URLSearchParams({
      shopId: shopId,
    });

    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);

    const result = await getShopInventoryLog({ shopId, filters });
    if (!result) throw new Error('Failed to fetch Shop Inventory Log');

    const shopInventoryLogs = result?.data?.logs;

    //  shopProductMap[shopId] = shopInventoryLogs;

    console.log(shopInventoryLogs);

    if (shopInventoryLogs.length === 0) {
      const searchSection = document.querySelector(`.search-section_${shopId}`);

      searchSection.style.display = 'none';

      inventoryLogTableBody.innerHTML =
        '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Shop Inventory Logs Available.</td></tr>';
      return;
    }

    inventoryLogTableBody.innerHTML = '';
    shopInventoryLogs.forEach((shopInventoryLog, index) => {
      // console.log(shopInventoryLog);

      const {
        id,
        product_id,
        quantity,
        item_name,
        price,
        action_type,
        performed_by,
        created_at,
      } = shopInventoryLog;

      const performerName = shopInventoryLog.performer
        ? `${shopInventoryLog.performer.first_name} ${shopInventoryLog.performer.last_name}`
        : 'Unknown';

      const row = document.createElement('tr');
      row.classList.add('table-body-row');
      // row.classList.add(
      //   quantity < 1
      //     ? 'finishedStockRow'
      //     : quantity >= 1 && quantity <= 10
      //     ? 'nearFinishedStockRow'
      //     : 'inStockRow'
      // );
      row.innerHTML = `
       
                <td class="py-1 productSerialNumber">${index + 1}</td>
                <td class="py-1 productName">${item_name}</td>
                <td class="py-1 productDescription">${quantity}</td>
                <td class="py-1 producCategory">&#x20A6;${formatAmountWithCommas(
                  price
                )}</td>
                <td class="py-1 producCategory">${formatActionType(
                  action_type
                )}</td>
                <td class="py-1 producCategory">${performerName}</td>
                <td class="py-1 productAmountBought">${formatDateTimeReadable(
                  created_at
                )}</td>
              
    
             `;
      inventoryLogTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error rendering  Inventory Log:', error);
    inventoryLogTableBody.innerHTML =
      '<tr><td colspan="6" class="table-error-text">Error Loading Inventory Log.</td></tr>';
  }
}

export function getAdminInventoryTableHtml(shop) {
  return `
         <div id="shop-report-${shop.id}" class="reports card" data-loaded="false">
         <div class="reports ">
            <div class="reports-method">
               <h2 class="heading-text mb-2">
                  Shop inventory
               </h2>

               <div>
                  <h2 class="heading-subtext ">Total Products: <span class="totalProductsCount_${shop.id}">0</span></h2>

                  <h2 class="heading-subtext ">Total Products Worth: <span
                        class="totalProductsWorth_${shop.id}">0</span></h2>

                  <h2 class="heading-subtext ">Total Estimated Profits: <span
                        class="totalProductsProfits_${shop.id}">0</span></h2>

               </div>

               <div class="search-section_${shop.id} mb-2">

                  <div class="inventory-method-form_input ml-1 mr-1">
                     <label for="searchProdutInventory_${shop.id}">Search Products:</label>
                     <input type="search" id="searchProdutInventory_${shop.id}" class="searchProductInput"
                        placeholder="Search Product Name or Description ">
                  </div>
               </div>

               <div class="table-header">
                  <!-- <h2 class="heading-subtext"> inventory </h2> -->
               </div>

               <div class="reports-table-container">
                  <table class="reports-table inventoryTableDisplay_admin_${shop.id}">
                     <thead>
                        <tr class="table-header-row">
                           <th class="py-1">S/N</th>
                           <th class="py-1">Product Name</th>
                           <th class="py-1">Product Description</th>
                           <th class="py-1">Product Category</th>
                           <th class="py-1">SKU</th>
                           <th class="py-1">Barcode</th>
                           <th class="py-1">Buying Price</th>
                           <th class="py-1">Quantity</th>
                           <th class="py-1">Selling Price</th>
                           <th class="py-1">Action</th>
                        </tr>
                     </thead>
                     <tbody id="inventory-tbody-${shop.id}">
                     </tbody>
                  </table>

               </div>
            </div>
         </div>
      </div>

   `;
}

export function getAdminInventoryLogHtml(shop) {
  return `
     
         <!-- Inventory Log Table HTML starts Here -->
     
   <div id="shop-report-${shop.id}" class="reports card" data-loaded="false">

         <div class="reports">
            <div class="reports-method">
               <h2 class="heading-text mb-2">
                  Inventory Log
               </h2>

               <h2 class="filter-heading heading-subtext mb-2">Filter Inventory Log </h2>

               <div class="filter-section mb-2">

                  <div class="pos-method-form_input">
                     <label for="inventoryLogDateFrom_admin_${shop.id}">Start Date:</label>

                     <input type="date" id="inventoryLogDateFrom_admin_${shop.id}">
                  </div>

                  <div class="pos-method-form_input">
                     <label for="inventoryLogDateTo_admin_${shop.id}">End Date:</label>

                     <input type="date" id="inventoryLogDateTo_admin_${shop.id}">
                  </div>

                  <div class="filter-buttons">
                     <button id="applyInventoryLogFiltersBtn_admin_${shop.id}" class="hero-btn-dark">Apply
                        Filters</button>
                     <button id="resetInventoryLogFiltersBtn_${shop.id}" class="hero-btn-outline">Reset</button>
                  </div>

               </div>

               <div class="transaction-breakdown">


                  <div class="reports-table-container mt-4">
                     <table class="reports-table inventoryLog_admin_${shop.id}">
                        <thead>
                           <tr class="table-header-row">
                              <th class="py-1">S/N</th>
                              <th class="py-1">Item Name</th>
                              <th class="py-1">Quantity</th>
                              <th class="py-1">Selling Price</th>
                              <th class="py-1">Action Type</th>
                              <th class="py-1">Performed By</th>
                              <th class="py-1">Date/Time</th>
                           </tr>
                        </thead>

                        <tbody id="inventoryLogBody-${shop.id}">

                        </tbody>

                     </table>
                  </div>

               </div>

            </div>
         </div>
      </div>
         <!-- Inventory Log Table HTML Ends Here -->
   `;
}
