import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import './script.js';
import config from '../config';
import {
  getProductCategories,
  getProductInventory,
} from './apiServices/inventory/inventoryResources';
import { createSale, getProducts } from './apiServices/sales/salesResources';
import {
  checkAndPromptCreateShop,
  fetchShopDetail,
} from './apiServices/shop/shopResource';
import {
  clearFormInputs,
  formatAmountWithCommas,
  formatAmountWithCommasOnInput,
  formatSaleStatus,
  getAmountForSubmission,
  hideBtnLoader,
  hideGlobalLoader,
  populateBusinessShopDropdown,
  showBtnLoader,
  showGlobalLoader,
} from './helper/helper';
import { closeModal, showToast } from './script';

const userData = config.userData;
const dummyShopId = config.dummyShopId;
let parsedUserData = null;
parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const userId = parsedUserData?.id;
const shopId = parsedUserData?.shopId;

const cartKey = `cart_${userId}`;

let allProducts = [];
let allCategories = [];
let activeCategoryId = null; // null means "All"
let selectedProduct = null;
let totalCartAmount = 0;

const searchSellProdutItem = document.getElementById(
  isAdmin ? 'adminSearchSellProdutItem' : 'searchSellProdutItem'
);

const sellProductCategorySection = document.querySelector(
  isAdmin ? '.adminSellProductCategory-section' : '.sellProductCategory-section'
);

const sellProductName = document.querySelector(
  isAdmin ? '.adminSellProductName' : '.sellProductName'
);
const productInput = document.getElementById(
  isAdmin ? 'adminProductInput' : 'productInput'
);
const autocompleteList = document.getElementById(
  isAdmin ? 'adminAutocompleteList' : 'autocompleteList'
);
const productBoughtPrice = document.getElementById(
  isAdmin ? 'adminProductBoughtPrice' : 'productBoughtPrice'
);
const itemSellingprice = document.getElementById(
  isAdmin ? 'adminItemSellingPrice' : 'itemSellingPrice'
);
const itemQuantityAvailable = document.getElementById(
  isAdmin ? 'adminItemQuantityAvailable' : 'itemQuantityAvailable'
);

const sellProductShopDropdown = document.getElementById(
  'sellProductShopDropdown'
);

const adminSellContainer = document.querySelector('.adminSellContainer');
const staffSellContainer = document.querySelector('.staffSellContainer');

// Initial display of all products & Categories
if (isStaff) {
  displayAllProducts();
  displayAllCategories();
} else {
  //   displayAllProducts();
  //   displayAllCategories();
}

if (isAdmin && adminSellContainer) {
  if (adminSellContainer) adminSellContainer.style.display = 'block';
  if (staffSellContainer) staffSellContainer.innerHTML = '';
  if (staffSellContainer) staffSellContainer.style.display = 'none';

  async function loadShopDropdown() {
    try {
      showGlobalLoader();
      const { enrichedShopData } = await checkAndPromptCreateShop();
      populateBusinessShopDropdown(enrichedShopData, 'sellProductShopDropdown');

      syncDropdownWithCartShop();

      hideGlobalLoader();
    } catch (err) {
      hideGlobalLoader();
      console.error('Failed to load dropdown:', err.message);
    }
  }

  loadShopDropdown();
} else {
  if (adminSellContainer) adminSellContainer.innerHTML = '';
  if (adminSellContainer) adminSellContainer.style.display = 'none';
  if (staffSellContainer) staffSellContainer.style.display = 'block';
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
    const productCategoryData = await getProductCategories(
      isAdmin ? sellProductShopDropdown.value : shopId
    ); // Fetch Categories

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

const adminSellProductSearchSection = document.querySelector(
  '.adminSellProductSearch-section'
);
const adminSellProductCategorySection = document.querySelector(
  '.adminSellProductCategory-section'
);
const adminSellProductName = document.querySelector('.adminSellProductName');
const adminAutocompleteList = document.getElementById('adminAutocompleteList');
// const

document.addEventListener('DOMContentLoaded', () => {
  if (adminSellProductSearchSection)
    adminSellProductSearchSection.style.display = 'none';
  if (adminSellProductCategorySection)
    adminSellProductCategorySection.style.display = 'none';
  if (adminSellProductName) adminSellProductName.style.display = 'none';
  if (adminAutocompleteList) adminAutocompleteList.style.display = 'none';
});

if (isAdmin && sellProductShopDropdown) {
  sellProductShopDropdown?.addEventListener('change', () => {
    const selectedShopId = sellProductShopDropdown.value;

    const adminSellProductSearchSection = document.querySelector(
      '.adminSellProductSearch-section'
    );
    const adminSellProductCategorySection = document.querySelector(
      '.adminSellProductCategory-section'
    );
    const adminSellProductName = document.querySelector(
      '.adminSellProductName'
    );
    const adminAutocompleteList = document.getElementById(
      'adminAutocompleteList'
    );

    if (!selectedShopId) {
      // Hide sections if no shop selected
      if (adminSellProductSearchSection)
        adminSellProductSearchSection.style.display = 'none';
      if (adminSellProductCategorySection)
        adminSellProductCategorySection.style.display = 'none';
      if (adminSellProductName) adminSellProductName.style.display = 'none';
      if (adminAutocompleteList) adminAutocompleteList.style.display = 'none';
      return; // Stop execution if shop is empty
    }

    // Show sections
    if (adminSellProductSearchSection)
      adminSellProductSearchSection.style.display = 'block';
    if (adminSellProductCategorySection)
      adminSellProductCategorySection.style.display = 'flex';
    //  if (adminSellProductName) adminSellProductName.style.display = 'block';
    //  if (adminAutocompleteList) adminAutocompleteList.style.display = 'block';

    // Re-fetch products and categories
    displayAllProducts();
    displayAllCategories();
  });
}

// if (isAdmin && sellProductShopDropdown) {
//   sellProductShopDropdown.addEventListener('change', () => {
//     if (sellProductShopDropdown.value === '') {
//       const adminSellProductSearchSection = document.querySelector(
//         '.adminSellProductSearch-section'
//       );
//       const adminSellProductCategorySection = document.querySelector(
//         '.adminSellProductCategory-section'
//       );

//       console.log('object');

//       if (adminSellProductSearchSection) {
//         adminSellProductSearchSection.style.display = 'none';
//       }
//       if (adminSellProductCategorySection) {
//         adminSellProductCategorySection.style.display = 'none';
//       }
//     }
//     displayAllProducts(); // Re-fetch based on selected shop
//     displayAllCategories(); // Re-fetch based on selected shop

//     //  const allBtn = sellProductCategorySection.querySelector(
//     //    '[data-category-id="all"]'
//     //  );
//     //  if (allBtn) allBtn.click();
//   });
// }

async function displayAllProducts() {
  //   console.log('products; After Sale entry');
  try {
    showGlobalLoader();

    const selectedShopId =
      isAdmin && sellProductShopDropdown
        ? sellProductShopDropdown.value
        : shopId;

    allProducts = await fetchAllProducts(selectedShopId); // Fetch and store all products

    //  console.log(`Total products fetched:`, allProducts);

    updateAutocompleteList(allProducts); // Populate the autocomplete dropdown with all products

    let barcodeTimer;
    // Autocomplete filter on input
    let isClearingInput = false;

    // Your existing input listener
    searchSellProdutItem.addEventListener('input', function () {
      if (isClearingInput) {
        return; // Ignore the event if we are programmatically clearing the input
      }

      const inputValue = this.value.toLowerCase();

      if (inputValue.value === '') {
        sellProductName.style.display = 'none';
        autocompleteList.style.display = 'none';
        return;
      } else if (inputValue.length > 0) {
        sellProductName.style.display = 'block';
        autocompleteList.style.display = 'block';

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
            (product.Product.name?.toLowerCase() || '').includes(inputValue) ||
            (product.Product.description?.toLowerCase() || '').includes(
              inputValue
            ) ||
            product.Product.id?.toString().includes(inputValue) ||
            (product.Product.barcode?.toLowerCase() || '').includes(inputValue)
        );

        //   console.log(filteredProducts);

        updateAutocompleteList(filteredProducts);

        return;
      } else {
        sellProductName.style.display = 'none';
        autocompleteList.style.display = 'none';
        return;
      }
    });

    // New change listener for barcode scanning
    searchSellProdutItem.addEventListener('change', function () {
      const scannedCode = this.value.trim();

      // Check if the input value is a valid barcode
      const matchedProduct = allProducts.find(
        (p) => p.Product.barcode === scannedCode
      );

      if (matchedProduct) {
        // Automatically add the product to the cart
        handleAddToCart(matchedProduct, true);

        // Clear the input field after a successful scan
        this.value = '';

        // Hide the autocomplete list
        autocompleteList.style.display = 'none';
      }
    });
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
    sellProductCategorySection.innerHTML = '';
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

      sellProductName.style.display = 'block';
      autocompleteList.style.display = 'block';

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

    sellProductCategorySection.appendChild(allBtn);

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

        sellProductName.style.display = 'block';
        autocompleteList.style.display = 'block';

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

      sellProductCategorySection.appendChild(categoryBtn);
    });
  } catch (error) {
    console.error('Error displaying products:', error);
  } finally {
    hideGlobalLoader();
  }
}

// Update the autocomplete list with provided products
function updateAutocompleteList(products) {
  autocompleteList.innerHTML = '';

  if (products.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'Item Not Found';
    listItem.classList.add('autocomplete-list-item');
    autocompleteList.appendChild(listItem);
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
        productBoughtPrice.value = formatAmountWithCommas(
          product.Product.purchase_price
        );
        itemSellingprice.value = formatAmountWithCommas(
          product.Product.selling_price
        );
        itemQuantityAvailable.value = product.quantity;
        autocompleteList.style.display = 'none';
      });
      autocompleteList.appendChild(listItem);
    });
  }
}

// async function displayAllProducts() {
//   try {
//     const productInventoryData = await getProducts(currentPage, pageSize);

//     const products = productInventoryData.data;

//     autocompleteList.innerHTML = '';
//     products.forEach((product) => {
//       const listItem = document.createElement('li');
//       listItem.textContent = product.name;
//       listItem.classList.add('autocomplete-list-item');

//       listItem.addEventListener('click', function () {
//         searchSellProdutItem.value = product.name;
//         priceInput.value = formatAmountWithCommas(product.amount_to_sell);
//         autocompleteList.style.display = 'none';
//       });

//       autocompleteList.appendChild(listItem);
//     });

//     // Autocompelte filter
//     searchSellProdutItem.addEventListener('click', function () {
//       autocompleteList.style.display = 'block';
//     });

//     searchSellProdutItem.addEventListener('input', function () {
//       const inputValue = searchSellProdutItem.value.toLowerCase();
//       const filteredProducts = products.filter((product) =>
//         product.name.toLowerCase().includes(inputValue)
//       );
//       autocompleteList.innerHTML = '';

//       // Display filtered suggestions
//       if (filteredProducts.length === 0) {
//         const listItem = document.createElement('li');
//         listItem.textContent = 'Item Not Found';
//         listItem.classList.add('autocomplete-list-item');

//         autocompleteList.appendChild(listItem);
//       } else {
//         filteredProducts.forEach((product) => {
//           const listItem = document.createElement('li');
//           listItem.textContent = product.name;
//           listItem.classList.add('autocomplete-list-item');

//           listItem.addEventListener('click', function () {
//             searchSellProdutItem.value = product.name;
//             priceInput.value = formatAmountWithCommas(product.amount_to_sell);
//             autocompleteList.innerHTML = '';
//           });
//           autocompleteList.appendChild(listItem);
//         });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }

// Close the suggestions list when clicking outside
// document.addEventListener('click', function (event) {
//   if (!event.target.matches('#searchSellProdutItem')) {
//     autocompleteList.style.display = 'none';
//   }
// });

// JS for the checkboxes and selling of an item

document.addEventListener('DOMContentLoaded', function () {
  const completedRadio = document.getElementById('completedCheckbox');
  const balanceRadio = document.getElementById('balanceCheckbox');
  const balancePaymentSection = document.querySelector('.balancePayment');
  const balancePaymentInput = document.getElementById('productBalancePrice');
  const radios = document.querySelectorAll('input[name="completedCheckbox"]');

  //   function updateUIBasedOnStatus() {
  //     if (completedRadio.checked) {
  //       balancePaymentSection.style.display = 'none';
  //       balancePaymentInput.value = '';
  //       balancePaymentInput.disabled = true;
  //     } else if (balanceRadio.checked) {
  //       balancePaymentSection.style.display = 'block';
  //       balancePaymentInput.disabled = false;
  //     }
  //   }

  // Default to "Completed" on load
  //   completedRadio.checked = true;
  //   updateUIBasedOnStatus();

  // Listen to radio change
  //   radios.forEach((radio) => {
  //     radio.addEventListener('change', updateUIBasedOnStatus);
  //   });
});

// JS for Selling Products and adding to localStorage
const soldProductName = document.getElementById(
  isAdmin ? 'adminProductInput' : 'productInput'
);
const soldProductPrice = document.getElementById(
  isAdmin ? 'adminSoldProductPrice' : 'soldProductPrice'
);
const soldProductQuantity = document.getElementById(
  isAdmin ? 'adminSoldProductQuantity' : 'soldProductQuantity'
);

// const productBalancePrice = document.getElementById(
//   isAdmin ? '' : 'productBalancePrice'
// );

// Sell Product Form
export function sellProductForm() {
  const form = document.querySelector('#checkout-form');

  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const customerName = document.getElementById('sellCustomerName').value;
      const customerPhone = document.getElementById('sellCustomerPhone').value;
      const paymentMethod = document.getElementById('paymentTypeOption').value;
      const amountPaid = document.getElementById('amount-paid').value;
      const soldProductMachineFee = document.getElementById(
        'soldProductMachineFee'
      ).value;
      const soldProductTaxFee =
        document.getElementById('soldProductTaxFee').value;
      const remarks =
        document.getElementById('soldProductRemark').value || 'Sold';

      const checkoutSubmitBtn = document.querySelector('.checkoutSubmitBtn');
      const cartSliderOverlay = document.querySelector('.cart-slider-overlay');
      const cartSlider = document.querySelector('.cart-slider-content');

      const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

      if (cart.length === 0) {
        showToast('fail', '❎ Your cart is empty. Please add items to sell.');
        hideBtnLoader(checkoutSubmitBtn);
        return;
      }

      const sellProductDetails = {
        shopId: Number(cart[0]?.shopId),
        customerName,
        customerPhone,
        paymentMethod: paymentMethod.toUpperCase(),
        amountPaid: Number(getAmountForSubmission(amountPaid)),
        machineFee: Number(getAmountForSubmission(soldProductMachineFee)),
        taxFee: Number(getAmountForSubmission(soldProductTaxFee)),
        remarks,
        items: cart.map((item) => ({
          productId: item.productId, // ensure this exists
          quantity: item.soldProductQuantityInput,
          sellingPrice: item.soldProductPriceInput,
        })),
      };

      if (!validateCartBeforeSale()) return;

      try {
        showGlobalLoader();
        showBtnLoader(checkoutSubmitBtn);

        console.log('Submitting Sales Details:', sellProductDetails);
        //   hideBtnLoader(checkoutSubmitBtn);

        const soldData = await createSale(sellProductDetails);

        if (soldData) {
          hideBtnLoader(checkoutSubmitBtn);
          showToast('success', `✅ ${soldData.message}`);
          //  await fetchAllProducts(Number(cart[0]?.shopId));
          //  await fetchAllCategories(Number(cart[0]?.shopId));

          console.log('Sold Items Details', soldData);

          localStorage.removeItem(cartKey);
          updateCartCounter();
          updateCartTotalUI();
          renderQuickSellButton();

          // Close the cart slider if it's open
          cartSlider.classList.remove('open');
          cartSliderOverlay.classList.remove('visible');
          clearFormInputs();
          displayAllProducts();
          displayAllCategories();
          selectedProduct = null;
          hideGlobalLoader();
          updateSalesReceipt(soldData);
        }

        clearFormInputs(); // close modal after success
      } catch (err) {
        console.error('Error Selling Product:', err.message, err);
        hideBtnLoader(checkoutSubmitBtn);
        hideGlobalLoader();
        showToast('fail', `❎ ${err.message}`);
      } finally {
        hideBtnLoader(checkoutSubmitBtn);
        hideGlobalLoader();
      }
    });
  }
}

function validateCartBeforeSale() {
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];

    if (
      !item.availableQty ||
      item.soldProductQuantityInput > item.availableQty
    ) {
      showToast(
        'error',
        `❌ Invalid quantity for ${item.soldProductNameInput}. Maximum allowed is ${item.availableQty}.`
      );
      return false;
    }

    if (
      !item.productId ||
      !item.soldProductPriceInput ||
      !item.soldProductNameInput
    ) {
      showToast(
        'error',
        `❌ Invalid cart item detected. Please remove and re-add it.`
      );
      return false;
    }

    // Optionally: price sanity check
    if (
      item.soldProductPriceInput <= 0 ||
      item.soldProductPriceInput > 1_000_000
    ) {
      showToast(
        'error',
        `❌ Suspicious price for ${item.soldProductNameInput}.`
      );
      return false;
    }
  }

  return true; // Cart is clean
}

sellProductForm();

document.addEventListener(
  'DOMContentLoaded',
  updateCartCounter,
  updateCartTotalUI
);

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const counter = document.querySelector('.cart-counter');

  if (counter) {
    counter.textContent = cart.length;
  }
}

// Handle adding products to the cart

let justScanned = false;

function handleAddToCart(productOverride = null, autoMode = false) {
  //   console.log(productOverride, autoMode);
  //   if (autoMode === true) {
  //     console.log('🚀 Auto mode triggered');
  //   } else {
  //     console.log('📝 Manual mode triggered');
  //   }

  //   const product = productOverride || selectedProduct;

  let product;

  if (autoMode) {
    justScanned = true; // mark as scanned
    setTimeout(() => (justScanned = false), 200);

    product = productOverride.Product;

    //  console.log('autoMode product:', product);
    if (!product || !product.id) {
      console.error('Barcode matched a record with invalid product data.');
      return;
    }
  } else {
    product = selectedProduct;
    //  console.log('manualMode product:', product);
    if (!product || !product.id) {
      showToast('error', 'Please select a product from the list first.');
      return;
    }
  }

  let soldProductNameInput;
  let soldProductPriceInput;
  let soldProductQuantityInput;

  // AutoMode → barcode scan adds 1
  if (autoMode) {
    soldProductNameInput = product.name;
    soldProductPriceInput = Number(product.selling_price);
    soldProductQuantityInput = 1;
  } else {
    soldProductNameInput = soldProductName.value;
    soldProductPriceInput = Number(
      getAmountForSubmission(soldProductPrice.value)
    );
    soldProductQuantityInput = Number(soldProductQuantity.value) || 1;
  }

  // Safe parse of storedData
  let storedData = [];
  try {
    storedData = JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch (e) {
    console.error('Failed to parse cart:', e);
    localStorage.removeItem(cartKey);
  }

  // Quantity safeguard
  if (soldProductQuantityInput <= 0) soldProductQuantityInput = 1;

  // Fallback for empty selling price (only in manual mode)
  if (!autoMode && (soldProductPriceInput <= 0 || !soldProductPriceInput)) {
    soldProductPriceInput = getAmountForSubmission(itemSellingprice.value);
  }

  // ✅ Selling vs purchase check should also respect autoMode
  let selling, purchase;
  if (autoMode) {
    selling = Number(product.selling_price);
    purchase = Number(product.purchase_price);
  } else {
    selling = parseFloat(soldProductPrice.value.replace(/,/g, ''));
    purchase = parseFloat(productBoughtPrice.value.replace(/,/g, ''));
  }

  if (selling < purchase) {
    showToast(
      'error',
      `❎ Selling price is too low. Please enter a valid amount.`
    );
    return;
  }

  // Shop guard
  const shopId = isAdmin
    ? sellProductShopDropdown.value
    : parsedUserData.shopId;
  if (storedData.length > 0 && storedData[0].shopId !== shopId) {
    alert(
      'Cannot add item from a different shop. Clear cart or switch back to original shop.'
    );
    return;
  }

  // Check if product already in cart
  const existingIndex = storedData.findIndex(
    (item) => item.productId === product.id
  );
  let availableQty;

  if (autoMode) {
    availableQty = Number(productOverride.quantity);
  } else {
    availableQty = Number(itemQuantityAvailable.value || 0);
  }

  //   console.log('Available quantity:', availableQty);

  let totalDesiredQty = soldProductQuantityInput;

  //   console.log('Adding product id:', product.id);
  //   console.log(
  //     'Cart contents ids:',
  //     storedData.map((i) => i.productId)
  //   );

  if (existingIndex !== -1) {
    const existingItem = storedData[existingIndex];
    totalDesiredQty += existingItem.soldProductQuantityInput;

    if (totalDesiredQty > availableQty) {
      showToast(
        'info',
        `ℹ️ Total quantity in cart (${totalDesiredQty}) exceeds available stock (${availableQty}).`
      );
      return;
    }

    // Handle price mismatch
    if (!autoMode) {
      // Handle price mismatch only in manual mode
      if (
        Number(existingItem.soldProductPriceInput) !==
        Number(soldProductPriceInput)
      ) {
        const confirmUpdate = confirm(
          `This product is already in the cart with a different price.\n\nOld Price: ₦${existingItem.soldProductPriceInput}\nNew Price: ₦${soldProductPriceInput}\n\nDo you want to update the price?`
        );

        if (confirmUpdate) {
          existingItem.soldProductQuantityInput += soldProductQuantityInput;
          existingItem.soldProductPriceInput = soldProductPriceInput;
        } else {
          existingItem.soldProductQuantityInput = totalDesiredQty;
        }
      } else {
        existingItem.soldProductQuantityInput = totalDesiredQty;
      }
    } else {
      // Auto mode → skip price check, just update quantity
      existingItem.soldProductQuantityInput = totalDesiredQty;
    }
  } else {
    // New item
    if (soldProductQuantityInput > availableQty) {
      showToast(
        'info',
        `ℹ️ Quantity exceeds available stock (${availableQty}).`
      );
      return;
    }

    const newItem = {
      productId: product.id, // ✅ use product.id instead of selectedProduct.id
      soldProductNameInput,
      soldProductPriceInput,
      soldProductQuantityInput,
      shopId,
      availableQty,
      purchasePrice: purchase,
    };
    storedData.push(newItem);
  }

  // Save back
  localStorage.setItem(cartKey, JSON.stringify(storedData));
  updateCartCounter();
  updateCartTotalUI();
  renderQuickSellButton();
  showToast(
    'success',
    `✅ ${soldProductNameInput} added to cart successfully!`
  );

  // Reset inputs
  soldProductName.value = '';
  soldProductPrice.value = '';
  soldProductQuantity.value = '';
  if (searchSellProdutItem) searchSellProdutItem.value = '';
  if (productBoughtPrice) productBoughtPrice.value = '';
  if (itemSellingprice) itemSellingprice.value = '';
  if (itemQuantityAvailable) itemQuantityAvailable.value = '';

  if (adminSellProductName) adminSellProductName.style.display = 'none';
  if (adminAutocompleteList) adminAutocompleteList.style.display = 'none';
  hideGlobalLoader();
}

export function addProductToCart() {
  const adminAddToCartForm = document.querySelector(
    isAdmin ? '.adminAddToCartForm' : '.addToCartForm'
  );

  if (!adminAddToCartForm || adminAddToCartForm.dataset.bound === 'true')
    return;

  adminAddToCartForm.dataset.bound = 'true';

  if (adminAddToCartForm) {
    adminAddToCartForm.addEventListener('submit', function (e) {
      showGlobalLoader();
      e.preventDefault();

      if (justScanned) {
        //   console.log('⏩ Skipping manual add because auto mode just ran');
        hideGlobalLoader();
        return;
      }

      handleAddToCart();
      updateCartCounter();
      updateCartTotalUI();
      renderQuickSellButton();

      hideGlobalLoader();
    });
  }
}

// Quick sell Logic
const sellNowBtn = document.querySelector(
  isAdmin ? '.adminSellNowBtn' : '.sellNowBtn'
); // Your new button

const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
// const quickSellMsg = document.querySelector('.quick-sell-msg');

export function renderQuickSellButton() {
  const updatedCart = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (updatedCart.length >= 1) {
    sellNowBtn.disabled = true;
    sellNowBtn.style.cursor = 'not-allowed';

    sellNowBtn.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent any action just in case

      // quickSellMsg.textContent = '⚠️ Quick Sell is only available for 1 item.';
      // quickSellMsg.style.display = 'block';

      // Clear any existing timeout
      clearTimeout(sellNowBtn.timeoutId);

      // Hide after 3 seconds
      // sellNowBtn.timeoutId = setTimeout(() => {
      //   quickSellMsg.style.display = 'none';
      // }, 3000);
    });
  } else {
    sellNowBtn.disabled = false;
    sellNowBtn.style.cursor = 'pointer';
    //  quickSellMsg.style.display = 'none';

    sellNowBtn.onclick = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderQuickSellButton();
});

// renderQuickSellButton(); // Initial render

// if (cart.length > 1) {
//   sellNowBtn.setAttribute('aria-disabled', 'true');
//   sellNowBtn.style.pointerEvents = 'none';
//   sellNowBtn.disabled = true;
//   sellNowBtn.style.cursor = 'not-allowed';
// }

// sellNowBtn?.addEventListener('click', () => {
//   const cartSliderOverlay = document.querySelector('.cart-slider-overlay');
//   const cartSlider = document.querySelector('.cart-slider-content');
//   const sliderWrapper = document.querySelector('.slider-wrapper');
//   // Add to cart first
//   handleAddToCart(); // ensure this respects validations

//   const updatedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
//   if (!selectedProduct || !selectedProduct.id) {
//     showToast('error', '❗Please select a product first.');
//     document.querySelector('button[data-category-id="all"]')?.click();
//     return;
//   }

//   if (updatedCart.length !== 1) {
//     showToast('error', '❗Quick sell requires exactly 1 item.');
//     return;
//   }

//   if (updatedCart.length > 0 && updatedCart.length < 2) {
//     // Open slider
//     cartSlider.classList.add('open');
//     cartSliderOverlay.classList.add('visible');

//     // Jump to checkout view
//     sliderWrapper.style.transform = 'translateX(-50%)';

//     renderCartItemsFromStorage(); // optional: if you want to show cart summary in checkout
//   }
//   // Wait briefly to let localStorage/cart update`;
//   setTimeout(() => {
//     const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
//     const cartSliderOverlay = document.querySelector('.cart-slider-overlay');
//     const cartSlider = document.querySelector('.cart-slider-content');
//     const sliderWrapper = document.querySelector('.slider-wrapper');

//     let soldProductQuantityInput = Number(soldProductQuantity.value);
//     let soldProductPriceInput = Number(soldProductPrice.value);

//     //  if (soldProductQuantityInput <= 0 || soldProductQuantityInput === '') {
//     //    showToast('info', 'ℹ️ Qeeeeeeeeeuantity must be at least one');

//     //    return;
//     //  }

//     //  soldProductName;
//     //  soldProductPrice;
//     //  soldProductQuantity;

//     if (cart.length > 0 && cart.length < 2) {
//       // Open slider
//       cartSlider.classList.add('open');
//       cartSliderOverlay.classList.add('visible');

//       // Jump to checkout view
//       sliderWrapper.style.transform = 'translateX(-50%)';

//       renderCartItemsFromStorage(); // optional: if you want to show cart summary in checkout
//     }
//     //  else {
//     //    sellNowBtn.disabled = true; // Disable button to prevent multiple clicks
//     //  }
//   }, 100); // Adjust timing if needed
// });

sellNowBtn?.addEventListener('click', () => {
  const cartSliderOverlay = document.querySelector('.cart-slider-overlay');
  const cartSlider = document.querySelector('.cart-slider-content');
  const sliderWrapper = document.querySelector('.slider-wrapper');

  const existingCart = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (!selectedProduct || !selectedProduct.id) {
    showToast('error', '❗Please select a product first.');
    document.querySelector('button[data-category-id="all"]')?.click();
    return;
  }

  // ✅ If already 1 item in cart, skip add and just open checkout
  if (existingCart.length === 1) {
    openCheckout();
    return;
  }

  const selling = parseFloat(soldProductPrice.value.replace(/,/g, ''));
  const purchase = parseFloat(productBoughtPrice.value.replace(/,/g, ''));

  if (selling < purchase) {
    showToast(
      'error',
      `❎ Selling price is too low. Please enter a valid amount.`
    );
    return;
  }

  handleAddToCart();
  //   addProductToCart();

  // Wait briefly for cart update before checking again
  setTimeout(() => {
    const updatedCart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (updatedCart.length !== 1) {
      showToast('error', '❗Quick sell requires exactly 1 item.');
      return;
    }

    // ✅ If everything passed
    openCheckout();
  }, 100);
});

function openCheckout() {
  const cartSliderOverlay = document.querySelector('.cart-slider-overlay');
  const cartSlider = document.querySelector('.cart-slider-content');
  const sliderWrapper = document.querySelector('.slider-wrapper');

  cartSlider.classList.add('open');
  cartSliderOverlay.classList.add('visible');
  sliderWrapper.style.transform = 'translateX(-50%)';
  renderCartItemsFromStorage();
}

document.addEventListener('DOMContentLoaded', () => {
  addProductToCart();
});

document.addEventListener('DOMContentLoaded', function () {
  const cartIcon = document.querySelector('.cartIconDiv');
  const cartSliderOverlay = document.querySelector('.cart-slider-overlay');
  const cartSlider = document.querySelector('.cart-slider-content');
  const closeCartBtn = document.querySelector('.close-cart-btn');

  const sliderWrapper = document.querySelector('.slider-wrapper');
  const proceedToCheckoutBtn = document.querySelector('.proceed-btn');
  const backToCartBtn = document.getElementById('backToCart');

  //   cartIcon.click();

  // Open Cart Slider
  cartIcon?.addEventListener('click', () => {
    cartSlider.classList.add('open');
    cartSliderOverlay.classList.add('visible');
    sliderWrapper.style.transform = 'translateX(0%)'; // Always reset to Cart View
    renderCartItemsFromStorage();
  });

  // Close Cart Slider
  closeCartBtn?.addEventListener('click', () => {
    cartSlider.classList.remove('open');
    cartSliderOverlay.classList.remove('visible');
  });

  // Proceed to Checkout View
  proceedToCheckoutBtn?.addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (cart.length === 0) {
      showToast('fail', '❎ Your cart is empty. Please add items to sell.');
      return;
    }

    sliderWrapper.style.transform = 'translateX(-50%)';
  });

  // Go Back to Cart View
  backToCartBtn?.addEventListener('click', () => {
    sliderWrapper.style.transform = 'translateX(0%)';
  });

  cartSliderOverlay.addEventListener('click', () => {
    cartSlider.classList.remove('open');
    cartSliderOverlay.classList.remove('visible');
  });
});

function renderCartItemsFromStorage() {
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const container = document.querySelector('.cart-items-container');
  updateCartCounter();
  updateCartTotalUI();
  renderQuickSellButton();

  // Clear existing items
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `<h1>Your cart is empty.</h1>`;
    return;
  }

  cart.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('cart-item');

    itemDiv.innerHTML = `
      <div class="item-header">
        <h2 class="item-name">${item.soldProductNameInput}</h2>
        <button class="remove-item-btn" data-index="${index}">&times;</button>
      </div>
      <div class="item-details">
        <div class="naira-input-container">
        <input 
  type="text" 
  class="unit-price-input" 
  data-index="${index}" 
  value="${item.soldProductPriceInput.toLocaleString()}" 
  min="1"
/>     <span class="naira">&#x20A6;</span>
                  </div>
        <div class="quantity-control">
          <button class="decrease-btn" data-index="${index}">-</button>
             <span >${item.soldProductQuantityInput}</span>
             <button class="increase-btn" data-index="${index}">+</button>
          </div>
           <h2 class="sum-total">₦${(
             item.soldProductPriceInput * item.soldProductQuantityInput
           ).toLocaleString()}</h2>
      </div>`;

    container.appendChild(itemDiv);
  });

  attachCartListeners(); // attach logic for +, -, remove
}

// Backup render
// function renderCartItemsFromStorage() {
//   const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
//   const container = document.querySelector('.cart-items-container');
//   updateCartCounter();
//   updateCartTotalUI();
//   renderQuickSellButton();

//   // Clear existing items
//   container.innerHTML = '';

//   if (cart.length === 0) {
//     container.innerHTML = `<h1>Your cart is empty.</h1>`;
//     return;
//   }

//   cart.forEach((item, index) => {
//     const itemDiv = document.createElement('div');
//     itemDiv.classList.add('cart-item');

//     itemDiv.innerHTML = `
//       <div class="item-header">
//         <h2 class="item-name">${item.soldProductNameInput}</h2>
//         <button class="remove-item-btn" data-index="${index}">&times;</button>
//       </div>
//       <div class="item-details">
//         <h2 class="unit-price">₦${item.soldProductPriceInput.toLocaleString()}</h2>
//         <div class="quantity-control">
//           <button class="decrease-btn" data-index="${index}">-</button>
//              <span >${item.soldProductQuantityInput}</span>
//              <button class="increase-btn" data-index="${index}">+</button>
//           </div>
//            <h2 class="sum-total">₦${(
//              item.soldProductPriceInput * item.soldProductQuantityInput
//            ).toLocaleString()}</h2>
//       </div>`;

//     container.appendChild(itemDiv);
//   });

//   attachCartListeners(); // attach logic for +, -, remove
// }

function attachCartListeners() {
  // Remove item
  document.querySelectorAll('.remove-item-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
      cart.splice(index, 1);
      localStorage.setItem(cartKey, JSON.stringify(cart));
      renderCartItemsFromStorage(); // re-render
    });
  });

  // Increase quantity
  document.querySelectorAll('.increase-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

      const item = cart[index];
      if (item.soldProductQuantityInput >= item.availableQty) {
        showToast(
          'info',
          `ℹ️ Cannot exceed available stock (${item.availableQty}).`
        );
        return;
      }

      item.soldProductQuantityInput += 1;

      localStorage.setItem(cartKey, JSON.stringify(cart));
      renderCartItemsFromStorage(); // re-render
    });
  });

  // Decrease quantity
  document.querySelectorAll('.decrease-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
      if (cart[index].soldProductQuantityInput > 1) {
        cart[index].soldProductQuantityInput -= 1;
        localStorage.setItem(cartKey, JSON.stringify(cart));
        renderCartItemsFromStorage(); // re-render
      }
    });
  });

  // Update price listener
  document.querySelectorAll('.unit-price-input').forEach((input) => {
    // 1. INPUT listener (for comma formatting on type) - This is correct from before
    input.addEventListener('input', function () {
      formatAmountWithCommasOnInput(input);
    });

    // 2. CHANGE listener (for saving to storage) - Apply corrections here
    input.addEventListener('change', (e) => {
      // --- STEP 1: Get the current input value (e.g., "1,000") ---
      const inputValueWithCommas = e.target.value;

      // --- STEP 2: Clean the commas (e.g., "1000") ---
      // getAmountForSubmission returns the comma-free string.
      const cleanedPriceString = getAmountForSubmission(inputValueWithCommas);

      // --- STEP 3: Convert the string to a floating-point number (e.g., 1000) ---
      // This is crucial if you want to store a number, not a string.
      const newPrice = parseFloat(cleanedPriceString);

      const index = e.target.dataset.index;

      // --- STEP 4: Validation ---
      if (isNaN(newPrice) || newPrice <= 0) {
        showToast('error', '❎ Invalid price entered.');
        renderCartItemsFromStorage(); // reset UI
        return;
      }
      // If you want to check for non-integer inputs, add logic here.

      // --- STEP 5: Store the numeric value ---
      const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

      if (newPrice < cart[index].purchasePrice) {
        showToast(
          'error',
          `Seling price cannot be lower than purchase price (₦${cart[
            index
          ].purchasePrice.toLocaleString()}).`
        );
        renderCartItemsFromStorage(); // reset UI
        return;
      }

      cart[index].soldProductPriceInput = newPrice; // Storing the clean NUMBER

      localStorage.setItem(cartKey, JSON.stringify(cart));
      renderCartItemsFromStorage(); // re-render to refresh totals
    });
  });
}

function getCartFromLocalStorage() {
  return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function calculateTotal() {
  const cart = getCartFromLocalStorage();
  let total = 0;

  cart.forEach((item) => {
    total += item.soldProductPriceInput * item.soldProductQuantityInput;
  });
  //   updateCartTotalUI();
  totalCartAmount = total; // Update global variable
  return total;
}

function updateCartTotalUI() {
  const total = calculateTotal();
  const totalFormatted = `₦${total.toLocaleString()}`;
  totalCartAmount = total; // Update global variable with raw amount

  // Option 1: Inject into footer
  const totalEl = document.querySelector('.cart-total');
  if (totalEl) {
    totalEl.innerHTML = `<strong>Total:</strong> ${totalFormatted}`;
  }

  // Option 2: Inject into button text
  const proceedBtn = document.querySelector('.proceed-btn');
  if (proceedBtn) {
    proceedBtn.textContent = `Proceed to Checkout (${totalFormatted})`;
  }

  // ALSO update the Amount Paid input field if it exists:
  const amountPaidInput = document.getElementById('amount-paid');
  if (amountPaidInput) {
    amountPaidInput.value = formatAmountWithCommas(total); // use raw number
  }
}

let currentSelectedShopId = ''; // Track previously selected shop

function syncDropdownWithCartShop() {
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const dropdown = document.getElementById('sellProductShopDropdown');

  if (cart.length > 0 && cart[0].shopId) {
    const cartShopId = cart[0].shopId;

    // Set the value of the dropdown
    dropdown.value = cartShopId;
    currentSelectedShopId = cartShopId;

    // Optional: fetch products for that shop
    fetchAllProducts(cartShopId).then((products) => {
      allProducts = products;
      displayAllProducts();
      displayAllCategories();
    });
  }
}

// Run sync function immediately after DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//   syncDropdownWithCartShop();
// });

document
  .getElementById('sellProductShopDropdown')
  ?.addEventListener('change', async function (e) {
    const selectedShopId = e.target.value;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (!selectedShopId) return;

    if (cart.length > 0) {
      const cartShopId = cart[0].shopId;

      if (selectedShopId && selectedShopId !== cartShopId) {
        const confirmed = confirm(
          'Switching shop will clear your current cart. Do you want to proceed?'
        );

        if (confirmed) {
          localStorage.removeItem(cartKey);
          currentSelectedShopId = selectedShopId;
          allProducts = await fetchAllProducts(selectedShopId); // ✅ fetch new shop's products
          displayAllProducts(); // ✅ re-render product UI
        } else {
          // Revert to the previous selection
          e.target.value = cartShopId;
          currentSelectedShopId = cartShopId;
          allProducts = await fetchAllProducts(cartShopId); // ✅ fetch original shop's products
          displayAllProducts(); // ✅ re-render product UI
        }
      } else {
        // Same shop, proceed
        currentSelectedShopId = selectedShopId;
        allProducts = await fetchAllProducts(selectedShopId);
        displayAllProducts();
      }
    } else {
      // No cart yet, so we’re free to fetch products for selected shop
      currentSelectedShopId = selectedShopId;
      allProducts = await fetchAllProducts(selectedShopId); // ✅ fetch
      displayAllProducts(); // ✅ render
    }
  });

// Open Sale Detail Modal
export function openSaleDetailsModal() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const saleDetailsContainer = document.querySelector('.saleDetails');

  if (saleDetailsContainer) saleDetailsContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  saleDetailModalForm();
}

export function saleDetailModalForm() {
  //   const form = document.querySelector('.soldDetailModal');
  const form = isAdmin
    ? document.querySelector('.adminSoldDetailModal')
    : document.querySelector('.soldDetailModal');
  if (!form) return;
}

// Display individual Sales Report

async function updateSalesReceipt(soldData) {
  //   console.log(soldData);

  showGlobalLoader();
  // Finally open the modal
  openSaleDetailsModal();
  //   const saleId = row.dataset.saleId;

  //   Get Sales by ID
  try {
    showGlobalLoader();
    // const saleDetails = await getSaleById(saleId);
    const saleDetails = soldData;
    //  const shopDetails = JSON.parse(localStorage.getItem(shopKey)) || [];
    //  console.log('saleDetails when Row', saleDetails);

    //  if (!shopDetails) {
    //    console.log('No shopDetails');
    //    showToast('error', '❎ Cannot get Shop Details');
    //    closeModal();
    //    return;
    //  }

    if (!saleDetails || !saleDetails.data) {
      // console.log('No saleDetails');
      showToast('error', '❎  Cannot get Sale Details');
      closeModal();
      return;
    }

    const {
      Account,
      SaleItems,
      Shop,
      receipt_number,
      customer_name,
      customer_phone,
      payment_method,
      machineFee,
      taxFee,
      total_amount,
      amount_paid,
      balance,
      status,
      business_day,
      sale_time,
    } = saleDetails.data;

    showGlobalLoader();
    const shopData = await fetchShopDetail(Shop.id);
    //  hideGlobalLoader

    // Populate sale summary

    // Top Part Below
    document.getElementById('soldDetailShop').textContent =
      Shop?.shop_name || 'N/A';
    document.getElementById('soldDetailShopAddress').textContent =
      shopData?.data?.location || 'N/A';

    document.getElementById('soldDetailReceiptNumber').textContent =
      receipt_number;
    document.getElementById('soldDetailCustomerName').textContent =
      `${customer_name} - ${customer_phone}` || 'N/A';
    document.getElementById('soldDetailStaffName').textContent =
      `${Account?.first_name} ${Account?.last_name}` || 'N/A';
    document.getElementById('soldDetailDate').textContent = new Date(
      sale_time
    ).toLocaleString('en-UK', {
      hour12: true,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    // Bottom Part Below

    document.getElementById('soldDetailPaymentMethod').textContent =
      payment_method || 'N/A';

    document.getElementById(
      'soldDetailTotalAmount'
    ).textContent = `₦${formatAmountWithCommas(total_amount)}`;
    document.getElementById(
      'soldDetailPaidAmount'
    ).textContent = `₦${formatAmountWithCommas(amount_paid)}`;
    document.getElementById(
      'soldDetailBalanceAmount'
    ).textContent = `₦${formatAmountWithCommas(balance)}`;

    document.getElementById('soldDetailStatus').textContent =
      formatSaleStatus(status);

    // Sales Items - Middle Part Below
    const itemsTableBody = document.querySelector('.itemsTable tbody');
    itemsTableBody.innerHTML = ''; // clear previous rows

    SaleItems.forEach((item, index) => {
      const itemRow = document.createElement('tr');
      itemRow.classList.add('table-body-row');
      itemRow.innerHTML = `
               <td class="py-1">${item.Product.name}</td>
                             <td class="py-1">${item.quantity}</td>
                             <td class="py-1">₦${formatAmountWithCommas(
                               item.selling_price
                             )}</td>
                             <td class="py-1">${formatAmountWithCommas(
                               item.quantity * item.selling_price
                             )}</td>

                       `;
      itemsTableBody.appendChild(itemRow);
    });

    // Print & Download

    //   Print
    //   const printReceiptBtn =
    //     document.querySelector('.printReceiptBtn');

    //Keep this earlier Print Logic

    //            printReceiptBtn.addEventListener('click', () => {
    //              showBtnLoader(printReceiptBtn);
    //              const receiptContent =
    //                document.querySelector('.pdfHere').innerHTML;

    //              const printWindow = window.open('', '', 'width=300,height=500');
    //              printWindow.document.write(`
    //  <html>
    //    <head>
    //      <title>Print Receipt</title>
    //      <style>
    //        body { font-family: monospace; width: 58mm; font-size: 8px; padding: 5px; }
    //        .center { text-align: center; }
    //        .bold { font-weight: bold; }
    //        .line { border-top: 1px dashed #000; margin: 4px 0; }
    //        table { width: 100%; font-size: 12px; border-collapse: collapse; }
    //        td { padding: 2px 5px; }
    //        .footer { text-align: center; margin-top: 10px; }
    //      </style>
    //    </head>
    //    <body>${receiptContent}</body>
    //  </html>`);
    //              printWindow.document.close();
    //              printWindow.focus();
    //              printWindow.print();
    //              // printWindow.close();
    //              hideBtnLoader(printReceiptBtn);
    //            });

    const printReceiptBtn = document.querySelector('.printReceiptBtn');

    printReceiptBtn.onclick = () => {
      const container = document.getElementById('receiptPrintPDF');

      container.innerHTML = renderReceiptPrintHTML(
        saleDetails.data,
        shopData?.data
      );

      container.style.display = 'block'; // temporarily show

      // const receiptHeightPx = container.scrollHeight;
      const receiptHeightPx = container.getBoundingClientRect().height;
      const heightInMM = receiptHeightPx * 0.264583;
      // const adjustedHeight = Math.floor(heightInMM) - 4;

      const opt = {
        margin: 0,
        filename: `receipt-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        pagebreak: { avoid: 'tr', mode: ['css', 'legacy'] },
        jsPDF: {
          unit: 'mm',
          format: [58, heightInMM], // height can be adjusted dynamically if needed
          orientation: 'portrait',
        },
      };

      html2pdf()
        .set(opt)
        .from(container)
        .save()
        .then(() => {
          container.style.display = 'none';
        });
    };

    //  printReceiptBtn.addEventListener('click', () => {
    //    showBtnLoader(printReceiptBtn);
    //    printReceiptBtn.disabled = true; // Disable the button

    //    const receiptContent = document.querySelector('.pdfHere').innerHTML;

    //    const printWindow = window.open('', '', 'width=300,height=500');
    //    printWindow?.document.write(`
    //                 <html>
    //                     <head>
    //                         <title>Print Receipt</title>
    //                         <style>
    //                             body { font-family: monospace; width: 58mm; font-size: 8px; padding: 5px; }
    //                             .center { text-align: center; }
    //                             .bold { font-weight: bold; }
    //                             .line { border-top: 1px dashed #000; margin: 4px 0; }
    //                             table { width: 100%; font-size: 12px; border-collapse: collapse; }
    //                             td { padding: 2px 5px; }
    //                             .footer { text-align: center; margin-top: 10px; }
    //                         </style>
    //                     </head>
    //                     <body onload="window.print()">
    //                         ${receiptContent}
    //                         <script>
    //                             window.onafterprint = () => {
    //                                 window.close();
    //                             };
    //                         </script>
    //                     </body>
    //                 </html>
    //             `);

    //    printWindow?.document.close();
    //    printWindow?.focus();

    //    const checkClosedInterval = setInterval(() => {
    //      if (printWindow?.closed) {
    //        clearInterval(checkClosedInterval);
    //        hideBtnLoader(printReceiptBtn);
    //        printReceiptBtn.disabled = false; // Re-enable the button
    //      }
    //    }, 500);
    //  });

    //   Download;

    const generatePdfBtn = document.querySelector('.generatePdfBtn');

    generatePdfBtn.onclick = () => {
      showBtnLoader(generatePdfBtn);
      const receiptElement = document.querySelector('.pdfHere');
      if (!receiptElement) {
        showToast('fail', '❎ Receipt content not found.');
        return;
      }

      const opt = {
        margin: 10,
        filename: `receipt-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: 'mm',
          format: 'a4', // adjust height based on content
          orientation: 'portrait',
        },
      };

      html2pdf().set(opt).from(receiptElement).save();
      hideBtnLoader(generatePdfBtn);
    };

    hideGlobalLoader();
    //   openSaleDetailsModal();
  } catch (err) {
    hideGlobalLoader();
    console.error('Error fetching sale details:', err.message);
    showToast('fail', `❎ Failed to load sale details`);
    closeModal();
    clearReceiptDiv();
  } finally {
    hideGlobalLoader();
  }
}

function clearReceiptDiv() {
  // Top Part Below
  document.getElementById('soldDetailShop').textContent = '';
  document.getElementById('soldDetailShopAddress').textContent = '';

  document.getElementById('soldDetailReceiptNumber').textContent = '';
  document.getElementById('soldDetailCustomerName').textContent = '';
  document.getElementById('soldDetailStaffName').textContent = '';
  document.getElementById('soldDetailDate').textContent = '';

  // Bottom Part Below

  document.getElementById('soldDetailPaymentMethod').textContent = '';

  document.getElementById('soldDetailTotalAmount').textContent = '';
  document.getElementById('soldDetailPaidAmount').textContent = '';
  document.getElementById('soldDetailBalanceAmount').textContent = '';

  document.getElementById('soldDetailStatus').textContent = '';

  // Sales Items - Middle Part Below
  const itemsTableBody = document.querySelector('.itemsTable tbody');
  itemsTableBody.innerHTML = ''; // clear previous rows
}

function renderReceiptPrintHTML(saleDetails, shopDetails) {
  //   console.log('shopDetails', shopDetails);

  return `
    <div style="font-family: monospace; font-size: 10px; width: 58mm; padding: 5px;">
      <h3 style="text-align: center;">${shopDetails?.shop_name || ''}</h3>
      <p style="text-align: center;" class="mb-1">${
        shopDetails?.location || ''
      }</p>
      <hr class="mb-1" />
      <p>Receipt: ${saleDetails.receipt_number}</p>
      <p>Customer: ${saleDetails.customer_name} - ${
    saleDetails.customer_phone
  }</p>
      <p>Staff: ${saleDetails.Account?.first_name} ${
    saleDetails.Account?.last_name
  }</p>
      <p  class="mb-1" >Date: ${new Date(saleDetails.sale_time).toLocaleString(
        'en-UK',
        {
          hour12: true,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        }
      )}</p>
      <hr />
<table class="mb-1" style="width: 100%; table-layout: fixed; word-wrap: break-word; font-size: 10px;">
  <thead  class="text-align: left>
    <tr class="text-align: left">
      <th style="width: 40%; text-align: left;">Item</th>
      <th style="width: 10%; text-align: left;">Qty</th>
      <th style="width: 25%; text-align: left;">Price</th>
      <th style="width: 30%; text-align: left;">Total</th>
    </tr>
  </thead>
  <tbody>
    ${saleDetails.SaleItems.map(
      (item) => `
        <tr>
          <td style="word-break: break-word;">${item.Product.name}</td>
          <td>${item.quantity}</td>
          <td><span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
            item.selling_price
          )}</td>
          <td><span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
            item.quantity * item.selling_price
          )}</td>
        </tr>
      `
    ).join('')}
  </tbody>
</table>
      <hr />
      <p>Total:<span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
        saleDetails.total_amount
      )}</p>
      <p>Paid:<span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
        saleDetails.amount_paid
      )}</p>
      <p>Balance:<span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
        saleDetails.balance
      )}</p>
      <p>Payment Method:${saleDetails.payment_method}</p>
      <p>Status: ${formatSaleStatus(saleDetails.status)}</p>
      <hr />
      <p  class="mb-1" style="text-align: center;">THANK YOU FOR SHOPPING</p>
    </div>
  `;
}
