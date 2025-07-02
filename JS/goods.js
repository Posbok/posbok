import config from '../config';
import './script.js';
import {
  addInventory,
  createProduct,
  createProductCategory,
  deleteCategory,
  deleteProduct,
  getProductCategories,
  getProductDetail,
  getProductInventory,
  updateCategory,
  updateProduct,
  updateProductInventory,
} from './apiServices/inventory/inventoryResources';

import { checkAndPromptCreateShop } from './apiServices/shop/shopResource';

import {
  clearFormInputs,
  formatAmountWithCommas,
  formatAmountWithCommasOnInput,
  generateBarcode,
  getAmountForSubmission,
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

export function openUpdateCategoryButton() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateCategoryContainer = document.querySelector('.updateCategory');

  if (updateCategoryContainer) updateCategoryContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');
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
      await deleteCategory(categoryId);
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

        console.log(updateCategoryModalContainer.dataset.categoryId);
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

    //  const deleteBtn = row.querySelector('.deleteShopButton');
    //  deleteBtn.addEventListener('click', async () => {
    //    const shopId = deleteBtn.dataset.shopId;
    //    await deleteShop(shopId);
    //  });

    //  const updateShopBtn = row.querySelector('.editShopButton');
    //  updateShopBtn?.addEventListener('click', async () => {
    //    showGlobalLoader();
    //    const shopId = updateShopBtn.dataset.shopId;

    //    const adminUpdateShopDataContainer = document.querySelector(
    //      '.adminUpdateShopData'
    //    );

    //    if (adminUpdateShopDataContainer) {
    //      // Store shopId in modal container for reference
    //      adminUpdateShopDataContainer.dataset.shopId = shopId;

    //      // Fetch Shop detail
    //      const shopDetail = await fetchShopDetail(shopId);

    //      //   console.log(shopDetail);

    //      // Call function to prefill modal inputs
    //      if (shopDetail?.data) {
    //        hideGlobalLoader();
    //        openUpdateShopModal(); // Show modal after data is ready
    //        setupUpdateShopForm(shopDetail.data);
    //      } else {
    //        hideGlobalLoader();
    //        showToast('fail', '❌ Failed to fetch shop details.');
    //      }
    //    }
    //  });
  });
}

export function populateGoodsShopDropdown(shopList = []) {
  const inventoryShopDropdown = document.getElementById(
    'inventoryShopDropdown'
  );

  const addExistingProductShopDropdown = document.getElementById(
    'addExistingProductShopDropdown'
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

      const addProductBoughtPrice = document.querySelector(
        '#addProductBoughtPrice'
      ).value;

      const addProductSellingPrice = document.querySelector(
        '#addProductSellingPrice'
      ).value;

      const addProductQuantity = document.querySelector(
        '#addProductQuantity'
      ).value;

      const addProductDetails = {
        categoryId: addProductCategory,
        name: addProductName,
        description: addProductDescription,
        purchasePrice: Number(getAmountForSubmission(addProductBoughtPrice)),
        sellingPrice: Number(getAmountForSubmission(addProductSellingPrice)),
        barcode: generateBarcode(),
      };

      const addInventoryDetails = {
        quantity: Number(addProductQuantity),
        productId: Number(addProductQuantity),
      };

      const shopId = Number(inventoryShopDropdown);
      // console.log('Adding Products with:', addProductDetails);

      const addProductModalBtn = document.querySelector('.addProductModalBtn');

      try {
        showBtnLoader(addProductModalBtn);
        const productData = await createProduct(shopId, addProductDetails);

        //   if (!productData) {
        //     showToast('fail', productData.message);
        //     return;
        //   }

        console.log(productData);

        const productId = productData?.data.id;

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
            showToast('success', `✅ ${inventoryData.message}`);
            closeModal();
            clearFormInputs();
            await renderProductInventoryTable(shopId);
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

//  Add Existing Product
export function bindAddExistingProductFormListener() {
  const form = document.querySelector('.addExistingProductModal');
  if (!form) return;

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const productId = form.dataset.productId;
      const shopId = form.dataset.shopId;

      if (!productId) {
        showToast('fail', '❎ No Product selected for addExisting.');
        return;
      }

      if (!shopId) {
        showToast('fail', '❎ No shop selected for addExisting.');
        return;
      }

      const addExistingProductCategory = document.querySelector(
        '#addExistingProductCategory'
      ).value;
      const addExistingProductName = document.querySelector(
        '#addExistingProductName'
      ).value;
      const addExistingProductDescription = document.querySelector(
        '#addExistingProductDescription'
      ).value;
      const addExistingProductBoughtPrice = document.querySelector(
        '#addExistingProductBoughtPrice'
      ).value;
      const addExistingProductSellingPrice = document.querySelector(
        '#addExistingProductSellingPrice'
      ).value;
      const addExistingProductQuantity = document.querySelector(
        '#addExistingProductQuantity'
      ).value;

      const addExistingProductDetails = {
        categoryId: addExistingProductCategory,
        name: addExistingProductName,
        description: addExistingProductDescription,
        purchasePrice: Number(
          getAmountForSubmission(addExistingProductBoughtPrice)
        ),
        sellingPrice: Number(
          getAmountForSubmission(addExistingProductSellingPrice)
        ),
      };

      const addExistingInventoryDetails = {
        quantity: Number(addExistingProductQuantity),
      };

      // console.log(
      //   'Updating Product Detail with:',
      //   addExistingProductDetails,
      //   productId
      // );

      const addExistingProductModalBtn = document.querySelector(
        '.addExistingProductModalBtn'
      );

      try {
        showBtnLoader(addExistingProductModalBtn);
        const addExistingdProductData = await addExistingProduct(
          productId,
          addExistingProductDetails,
          shopId
        );

        if (!addExistingdProductData) {
          console.error('fail', addExistingdProductData.message);
          return;
        }

        //   console.log('Adding Products with:', addProductDetails);

        try {
          const inventoryData = await addExistingProductInventory(
            addExistingInventoryDetails,
            shopId,
            productId
          );

          if (inventoryData) {
            showToast('success', `✅ ${inventoryData.message}`);
            closeModal();
            clearFormInputs();
            await renderProductInventoryTable(shopId);
          }
        } catch (inventoryDataErr) {
          showToast(
            'fail',
            `❎ ${
              inventoryDataErr.message || 'Failed to addExisting inventory'
            }`
          );
          console.error(
            'Error During Inventory Updating:',
            inventoryDataErr.message
          );
        }
        hideBtnLoader(addExistingProductModalBtn);
        //   hideGlobalLoader();
      } catch (err) {
        hideBtnLoader(addExistingProductModalBtn);

        console.error('Error Updating product:', err);
        showToast('fail', `❎ ${err.message}`);
        return;
      }
    });
  }
}

const adminSellProductSearchSection = document.querySelector(
  '.sellProductSearch-section'
);
const adminSellProductCategorySection = document.querySelector(
  '.sellProductCategory-section'
);
const adminSellProductName = document.querySelector('.sellProductName');
const adminAutocompleteList = document.getElementById('autocompleteList');
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

console.log('Loaded at:', new Date().toISOString());

// let isShopDropdownChangeBound = false;

// export function addExistingProductForm() {
//   //   console.log('Product Detail:', productDetail);

//   const form = document.querySelector('.addExistingProductModal');
//   if (!form || isShopDropdownChangeBound) return;

//   isShopDropdownChangeBound = true;

//   addExistingProductShopDropdown.addEventListener('change', async (e) => {
//     console.log('Dropdown changed:', e.target.value);
//     const selectedShopId = e.target.value;

//     if (!selectedShopId) {
//       // hideSections();
//       return;
//     }

//     // Clear UI
//     adminSellProductCategorySection.innerHTML = '';
//     adminAutocompleteList.innerHTML = '';
//     productInput.value = '';
//     searchSellProdutItem.value = '';
//     allProducts = []; // reset

//     // Show UI
//     adminSellProductSearchSection.style.display = 'block';
//     adminSellProductCategorySection.style.display = 'flex';
//     adminSellProductName.style.display = 'block';

//     // Now fetch categories and products AFTER shop selection
//     await displayAllProducts(selectedShopId);
//     await displayAllCategories();
//   });
// }

// document.addEventListener('DOMContentLoaded', () => {
//   bindAddExistingProductFormListener();
//   addExistingProductForm(); // <== This was missing
// });

let isShopDropdownBound = false;

export function addExistingProductForm() {
  if (isShopDropdownBound) return;
  isShopDropdownBound = true;

  const form = document.querySelector('.addExistingProductModal');
  if (!form) return;

  addExistingProductShopDropdown.addEventListener('change', async (e) => {
    console.log('Dropdown changed:', e.target.value);

    const selectedShopId = e.target.value;
    if (!selectedShopId) return;

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

let isInitialized = false;

function initializeGoodsPage() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('✅ Initializing goods.js logic');

  bindAddExistingProductFormListener();
  addExistingProductForm();
}

document.addEventListener('DOMContentLoaded', initializeGoodsPage);

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

        // Further filter by input value
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.Product.name.toLowerCase().includes(inputValue) ||
            product.Product.description.toLowerCase().includes(inputValue)
        );

        updateAutocompleteList(filteredProducts);

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

    console.log(`Total Categories fetched:`, allCategories);

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
  const itemQuantityAvailable = document.getElementById(
    'itemQuantityAvailable'
  );
  const productInput = document.getElementById('productInput');

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

        productInput.value = product.Product.name;
        itemQuantityAvailable.value = product.quantity;
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
        purchasePrice: Number(getAmountForSubmission(updateProductBoughtPrice)),
        sellingPrice: Number(getAmountForSubmission(updateProductSellingPrice)),
      };

      const updateInventoryDetails = {
        quantity: Number(updateProductQuantity),
      };

      // console.log(
      //   'Updating Product Detail with:',
      //   updateProductDetails,
      //   productId
      // );

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

          if (inventoryData) {
            showToast('success', `✅ ${inventoryData.message}`);
            closeModal();
            clearFormInputs();
            await renderProductInventoryTable(shopId);
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
  //   console.log('Product Detail:', productDetail);

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
  document.querySelector('#updateProductBoughtPrice').value =
    formatAmountWithCommas(purchase_price) || '';
  document.querySelector('#updateProductSellingPrice').value =
    formatAmountWithCommas(selling_price) || '';
  document.querySelector('#updateProductQuantity').value = quantity || '';
}

document.addEventListener('DOMContentLoaded', () => {
  bindUpdateProductFormListener(); // Only once
});

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
    console.log('category', category.id);
    console.log('dataset', form.dataset.categoryId);

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

      accordion.className = 'accordion-section';
      accordion.innerHTML = `        <button class="accordion-toggle card heading-text" data-shop-id="${shopId}">
                       <h2 class="heading-subtext">
                          ${shop.shop_name}
                       </h2>
                       <i class="fa-solid icon fa-chevron-down"></i>
                    </button>
                        <div class="accordion-content">
           <div id="shop-report-${shop.id}" class="reports card" data-loaded="false">
                      <div class="reports ">
                          <div class="reports-method">
                             <h2 class="heading-text mb-2">
                               Shop inventory
                             </h2>

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

        const filteredProducts = products.filter((item) => {
          const product = item.Product;
          return (
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
          );
        });

        renderFilteredProducts(shopId, filteredProducts);
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

      const shopInventorySection = document.getElementById(
        `shop-report-${shopId}`
      );

      if (
        shopInventorySection &&
        shopInventorySection.dataset.loaded !== 'true'
      ) {
        await renderProductInventoryTable(shopId);
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
        purchase_price,
        selling_price,
        ProductCategory: { name: categoryName },
      },
    } = productInventory;

    const row = document.createElement('tr');
    row.classList.add('table-body-row');
    row.innerHTML = `
       
                <td class="py-1 productSerialNumber">${index + 1}</td>
                <td class="py-1 productName">${productName}</td>
                <td class="py-1 productDescription">${description}</td>
                <td class="py-1 producCategory">${categoryName}</td>
                <td class="py-1 productAmountBought">&#x20A6;${formatAmountWithCommas(
                  purchase_price
                )}</td>
                <td class="py-1 productQuantity">${quantity}</td>
                <td class="py-1 productSellingPrice">&#x20A6;${formatAmountWithCommas(
                  selling_price
                )}</td>
                <td class="py-1 action-buttons">
                  <button
                    class="hero-btn-outline openUpdateProductBtn"
                    id="openUpdateProductBtn" data-product-id="${product_id}"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    class="hero-btn-outline deleteProductBtn"
                    id="deleteProductBtn" data-product-id="${product_id}"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
    
             `;
    inventoryTableBody.appendChild(row);

    const deleteProductBtn = row.querySelector(`.deleteProductBtn`);

    deleteProductBtn.addEventListener('click', async () => {
      const productId = deleteProductBtn.dataset.productId;
      //   console.log('deleteProductBtn clicked', productId);
      await deleteProduct(productId, shopId);
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

    if (productInventories.length === 0) {
      const searchSection = document.querySelector(`.search-section_${shopId}`);

      searchSection.style.display = 'none';

      inventoryTableBody.innerHTML =
        '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Product Inventory Available.</td></tr>';
      return;
    }

    inventoryTableBody.innerHTML = '';
    productInventories.map((productInventory, index) => {
      const { id, product_id, quantity } = productInventory;
      const {
        name: productName,
        description,
        purchase_price,
        selling_price,
      } = productInventory.Product;
      const { name: categoryName } = productInventory.Product.ProductCategory;

      const row = document.createElement('tr');
      row.classList.add('table-body-row');
      row.innerHTML = `
       
                <td class="py-1 productSerialNumber">${index + 1}</td>
                <td class="py-1 productName">${productName}</td>
                <td class="py-1 productDescription">${description}</td>
                <td class="py-1 producCategory">${categoryName}</td>
                <td class="py-1 productAmountBought">&#x20A6;${formatAmountWithCommas(
                  purchase_price
                )}</td>
                <td class="py-1 productQuantity">${quantity}</td>
                <td class="py-1 productSellingPrice">&#x20A6;${formatAmountWithCommas(
                  selling_price
                )}</td>
                <td class="py-1 action-buttons">
                  <button
                    class="hero-btn-outline openUpdateProductBtn"
                    id="openUpdateProductBtn" data-product-id="${product_id}"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    class="hero-btn-outline deleteProductBtn"
                    id="deleteProductBtn" data-product-id="${product_id}"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
    
             `;
      inventoryTableBody.appendChild(row);

      const deleteProductBtn = row.querySelector(`.deleteProductBtn`);

      deleteProductBtn.addEventListener('click', async () => {
        const productId = deleteProductBtn.dataset.productId;
        //   console.log('deleteProductBtn clicked', productId);
        await deleteProduct(productId, shopId);
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

// export function populateProductInventoryTable(productInventoryData) {
//   const tbody = document.querySelector('.category-table tbody');
//   const loadingRow = document.querySelector('.loading-row');

//   // Remove static rows and loading

//   const productInventory = productInventoryData.data;

//   if (tbody) tbody.innerHTML = '';

//   if (!productInventory.length) {
//     const emptyRow = document.createElement('tr');
//     emptyRow.innerHTML = `
//         <td colspan="6" class="table-error-text">No Products found.</td>
//       `;
//     if (tbody) tbody.appendChild(emptyRow);
//     return;
//   }

//   productInventory.forEach((product, index) => {
//     const row = document.createElement('tr');
//     row.classList.add('table-body-row');

//     //  console.log('product', product);

//     if (row)
//       row.innerHTML = `
//         <td class="py-1 productSerialNumber">${index + 1}</td>
//         <td class="py-1 productName">${product.name}</td>
//          <td class="py-1 productDescription">${product.description}</td>

//         <td class="py-1 action-buttons">
//           <button class="hero-btn-outline editproductButton" data-product-id="${
//             product.id
//           }">
//             <i class="fa-solid fa-pen-to-square"></i>
//           </button>
//           <button class="hero-btn-outline deleteproductButton" data-product-id="${
//             product.id
//           }">
//             <i class="fa-solid fa-trash-can"></i>
//           </button>
//         </td>
//       `;

//     if (tbody) tbody.appendChild(row);

//     //  const deleteBtn = row.querySelector('.deleteShopButton');
//     //  deleteBtn.addEventListener('click', async () => {
//     //    const shopId = deleteBtn.dataset.shopId;
//     //    await deleteShop(shopId);
//     //  });

//     //  const updateShopBtn = row.querySelector('.editShopButton');
//     //  updateShopBtn?.addEventListener('click', async () => {
//     //    showGlobalLoader();
//     //    const shopId = updateShopBtn.dataset.shopId;

//     //    const adminUpdateShopDataContainer = document.querySelector(
//     //      '.adminUpdateShopData'
//     //    );

//     //    if (adminUpdateShopDataContainer) {
//     //      // Store shopId in modal container for reference
//     //      adminUpdateShopDataContainer.dataset.shopId = shopId;

//     //      // Fetch Shop detail
//     //      const shopDetail = await fetchShopDetail(shopId);

//     //      //   console.log(shopDetail);

//     //      // Call function to prefill modal inputs
//     //      if (shopDetail?.data) {
//     //        hideGlobalLoader();
//     //        openUpdateShopModal(); // Show modal after data is ready
//     //        setupUpdateShopForm(shopDetail.data);
//     //      } else {
//     //        hideGlobalLoader();
//     //        showToast('fail', '❌ Failed to fetch shop details.');
//     //      }
//     //    }
//     //  });
//   });
// }
