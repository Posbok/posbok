import config from '../config';
import {
  getProductCategories,
  getProductInventory,
} from './apiServices/inventory/inventoryResources';
import { createSale, getProducts } from './apiServices/sales/salesResources';
import { checkAndPromptCreateShop } from './apiServices/shop/shopResource';
import {
  clearFormInputs,
  formatAmountWithCommas,
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
  try {
    showGlobalLoader();

    const selectedShopId =
      isAdmin && sellProductShopDropdown
        ? sellProductShopDropdown.value
        : shopId;

    allProducts = await fetchAllProducts(selectedShopId); // Fetch and store all products

    //  console.log(`Total products fetched:`, allProducts);

    updateAutocompleteList(allProducts); // Populate the autocomplete dropdown with all products

    // Autocomplete filter on input
    searchSellProdutItem.addEventListener('input', function () {
      const inputValue = searchSellProdutItem.value.toLowerCase();

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
            product.Product.name.toLowerCase().includes(inputValue) ||
            product.Product.description.toLowerCase().includes(inputValue)
        );

        updateAutocompleteList(filteredProducts);

        return;
      } else {
        sellProductName.style.display = 'none';
        autocompleteList.style.display = 'none';
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
// const soldProductRemark = document.getElementById(
//   isAdmin ? '' : 'soldProductRemark'
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
      const remarks = document.getElementById('soldProductRemark').value;

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
          localStorage.removeItem(cartKey);
          updateCartCounter();
          updateCartTotalUI();
          renderQuickSellButton();

          // Close the cart slider if it's open
          cartSlider.classList.remove('open');
          cartSliderOverlay.classList.remove('visible');
          clearFormInputs();
          selectedProduct = null;
          hideGlobalLoader();
        }

        clearFormInputs(); // close modal after success
      } catch (err) {
        console.error('Error Selling Product:', err.message);
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
function handleAddToCart() {
  if (!selectedProduct || !selectedProduct.id) {
    showToast('error', 'Please select a product from the list first.');
    return;
  }

  const itemQuantityAvailable = document.getElementById(
    isAdmin ? 'adminItemQuantityAvailable' : 'itemQuantityAvailable'
  );
  let soldProductNameInput = soldProductName.value;
  let soldProductPriceInput = Number(
    getAmountForSubmission(soldProductPrice.value)
  );
  let soldProductQuantityInput = Number(soldProductQuantity.value);
  let shopId = isAdmin ? sellProductShopDropdown.value : parsedUserData.shopId;

  //   const storedData = JSON.parse(localStorage.getItem(cartKey)) || []; // This is where throws the error

  let storedData = [];

  try {
    storedData = JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch (e) {
    console.error('Failed to parse cart:', e);
    localStorage.removeItem(cartKey);
  }

  if (soldProductQuantityInput <= 0) {
    showToast('info', 'ℹ️ Quantity must be at least one');

    return;
  }

  const selling = parseFloat(soldProductPrice.value.replace(/,/g, ''));
  const purchase = parseFloat(productBoughtPrice.value.replace(/,/g, ''));

  if (selling < purchase) {
    showToast(
      'error',
      `❎ Selling Price (${soldProductPrice.value}) lower than Purchase Price (${productBoughtPrice.value}). Please adjust.`
    );
    return;
  }

  // Ensure shopId consistency
  if (storedData.length > 0 && storedData[0].shopId !== shopId) {
    alert(
      'Cannot add item from a different shop. Clear cart or switch back to original shop.'
    );
    return;
  }

  const existingIndex = storedData.findIndex(
    (item) => item.productId === selectedProduct.id
  );

  const availableQty = Number(itemQuantityAvailable.value);
  let totalDesiredQty = soldProductQuantityInput;

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

    if (existingItem.soldProductPriceInput !== soldProductPriceInput) {
      const confirmUpdate = confirm(
        `This product is already in the cart with a different price.\n\nOld Price: ₦${existingItem.soldProductPriceInput}\nNew Price: ₦${soldProductPriceInput}\n\nDo you want to update the price?`
      );

      if (confirmUpdate) {
        // Update both quantity and price
        existingItem.soldProductQuantityInput += soldProductQuantityInput;
        existingItem.soldProductPriceInput = soldProductPriceInput;
      } else {
        existingItem.soldProductQuantityInput = totalDesiredQty;
      }
    } else {
      existingItem.soldProductQuantityInput = totalDesiredQty;
    }
  } else {
    if (soldProductQuantityInput > availableQty) {
      showToast(
        'info',
        `ℹ️ Quantity exceeds available stock (${availableQty}).`
      );
      return;
    }

    const newItem = {
      productId: selectedProduct.id,
      soldProductNameInput,
      soldProductPriceInput,
      soldProductQuantityInput,
      shopId,
      availableQty, // Store available quantity for reference
    };
    storedData.push(newItem);
  }

  localStorage.setItem(cartKey, JSON.stringify(storedData));
  updateCartCounter();
  updateCartTotalUI();
  renderQuickSellButton();
  showToast(
    'success',
    `✅ ${soldProductNameInput} added to cart successfully!`
  );

  soldProductName.value = '';
  soldProductPrice.value = '';
  soldProductQuantity.value = '';
  if (searchSellProdutItem) searchSellProdutItem.value = '';
  if (productBoughtPrice) productBoughtPrice.value = '';
  if (itemSellingprice) itemSellingprice.value = '';
  if (itemQuantityAvailable) itemQuantityAvailable.value = '';

  if (adminSellProductName) adminSellProductName.style.display = 'none';
  if (adminAutocompleteList) adminAutocompleteList.style.display = 'none';
}

export function addProductToCart() {
  const adminAddToCartForm = document.querySelector(
    isAdmin ? '.adminAddToCartForm' : '.addToCartForm'
  );

  if (!adminAddToCartForm || adminAddToCartForm.dataset.bound === 'true')
    return;

  adminAddToCartForm.dataset.bound = 'true';

  //   const addToCartButton = document.querySelector(
  //     isAdmin ? '.adminAddToCartButton' : '.addToCartButton'
  //   );

  if (adminAddToCartForm) {
    adminAddToCartForm.addEventListener('submit', function (e) {
      showGlobalLoader();
      e.preventDefault();
      handleAddToCart();

      hideGlobalLoader();
    });
  }
}

// Quick sell Logic
const sellNowBtn = document.querySelector(
  isAdmin ? '.adminSellNowBtn' : '.sellNowBtn'
); // Your new button

console.log(sellNowBtn);

const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
// const quickSellMsg = document.querySelector('.quick-sell-msg');

export function renderQuickSellButton() {
  const updatedCart = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (updatedCart.length > 1) {
    sellNowBtn.disabled = true;
    sellNowBtn.style.cursor = 'not-allowed';

    sellNowBtn.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent any action just in case

      // quickSellMsg.textContent = '⚠️ Quick Sell is only available for 1 item.';
      // quickSellMsg.style.display = 'block';

      // Clear any existing timeout
      clearTimeout(sellNowBtn.timeoutId);

      // Hide after 3 seconds
      sellNowBtn.timeoutId = setTimeout(() => {
        quickSellMsg.style.display = 'none';
      }, 3000);
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

  // ✅ If already 1 item in cart, skip add and just open checkout
  if (existingCart.length === 1) {
    openCheckout();
    return;
  }

  // ✅ Try to add item to cart (might fail due to validations inside)
  handleAddToCart();

  // Wait briefly for cart update before checking again
  setTimeout(() => {
    const updatedCart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (!selectedProduct || !selectedProduct.id) {
      showToast('error', '❗Please select a product first.');
      document.querySelector('button[data-category-id="all"]')?.click();
      return;
    }

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

// document.addEventListener('DOMContentLoaded', function () {
//   const cartIcon = document.querySelector('.cartIconDiv');
//   const cartSlider = document.querySelector('.cart-slider-content');
//   const closeCartBtn = document.querySelector('.close-cart-btn');

//   // Debug check
//   console.log('Loaded:', { cartIcon, cartSlider, closeCartBtn });

//   // Open Cart
//   cartIcon?.addEventListener('click', () => {
//     console.log('Cart icon clicked');
//     cartSlider.style.display = 'block';
//   });

//   // Close Cart
//   closeCartBtn?.addEventListener('click', () => {
//     console.log('Close button clicked');
//     cartSlider.style.display = 'none';
//   });
// });

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

// document.addEventListener('DOMContentLoaded', function () {
//   const sliderWrapper = document.querySelector('.slider-wrapper');
//   const proceedToCheckoutBtn = document.querySelector('.proceed-btn');
//   const backToCartBtn = document.getElementById('backToCart');

//   proceedToCheckoutBtn?.addEventListener('click', function (e) {
//     e.preventDefault();
//     const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

//     if (cart.length === 0) {
//       showToast('fail', '❎ Your cart is empty. Please add items to sell.');
//       return;
//     } else {
//       sliderWrapper.style.transform = 'translateX(-50%)';
//     }
//   });

//   backToCartBtn?.addEventListener('click', function () {
//     sliderWrapper.style.transform = 'translateX(0%)';
//   });
// });

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
        <h2 class="unit-price">₦${item.soldProductPriceInput.toLocaleString()}</h2>
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

// document.addEventListener('DOMContentLoaded', () => {
//   updateCartTotalUI(); // this will calculate and update total
//   console.log(totalCartAmount);
// });

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

//  Sync dropdown on load
// function syncDropdownWithCartShop() {
//   const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
//   const dropdown = document.getElementById('sellProductShopDropdown');

//   if (cart.length > 0 && cart[0].shopId) {
//     dropdown.value = cart[0].shopId;
//     currentSelectedShopId = cart[0].shopId;

//     // Fetch products for the already selected shop
//     fetchAllProducts(currentSelectedShopId).then((products) => {
//       allProducts = products;
//     });
//   }
// }

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

// // JS to dispaly Item to be sold
// const sellButtons = document.querySelectorAll('.sellButton');
// const modalProductName = document.querySelector('.SellingItemName');
// const soldItemBoughtPrice = document.getElementById('soldItemBoughtPrice');

// sellButtons.forEach((button, index) => {
//   button.addEventListener('click', function (e) {
//     sellProductContainer.classList.add('active');
//     main.classList.add('blur');
//     sidebar.classList.add('blur');
//     main.classList.add('no-scroll');

//     const tableRow = e.target.closest('.table-body-row');
//     const selectedIndex = index;

//     const selectedItem = storedGoodsData[selectedIndex];

//     if (selectedItem) {
//       const productName = selectedItem.addProductNameInput;
//       const amountBought = formatAmountWithCommas(
//         selectedItem.addProductBoughtPriceInput
//       );

//       modalProductName.textContent = productName;
//       soldItemBoughtPrice.value = amountBought;
//     }
//   });
// });
