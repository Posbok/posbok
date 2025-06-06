import config from '../config';
import {
  getProductCategories,
  getProductInventory,
} from './apiServices/inventory/inventoryResources';
import { getProducts } from './apiServices/sales/salesResources';
import { checkAndPromptCreateShop } from './apiServices/shop/shopResource';
import {
  formatAmountWithCommas,
  getAmountForSubmission,
  hideBtnLoader,
  hideGlobalLoader,
  populateBusinessShopDropdown,
  showGlobalLoader,
} from './helper/helper';
import { showToast } from './script';

let allProducts = [];
let allCategories = [];
let activeCategoryId = null; // null means "All"

const userData = config.userData;
const dummyShopId = config.dummyShopId;
let parsedUserData = null;
parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const userId = parsedUserData?.id;
const shopId = parsedUserData?.shopId;

const cartKey = `cart_${userId}`;

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

  console.log('Fetching products for shop:', shopId);

  try {
    const productInventoryData = await getProductInventory(shopId); // Fetch products

    if (productInventoryData) {
      // console.log(`Fetching product inventory:`, productInventoryData.data);
      products = products.concat(productInventoryData.data); // Add data to all products array

      if (adminSellProductSearchSection)
        adminSellProductSearchSection.style.display = 'block';
      if (adminSellProductCategorySection)
        adminSellProductCategorySection.style.display = 'block';
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
  sellProductShopDropdown.addEventListener('change', () => {
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
      adminSellProductCategorySection.style.display = 'block';
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

    console.log(`Total products fetched:`, allProducts);

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
        productInput.value = product.Product.name;
        productBoughtPrice.value = formatAmountWithCommas(
          product.Product.purchase_price
        );
        itemSellingprice.value = formatAmountWithCommas(
          product.Product.selling_price
        );
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
// let checkboxStatus;
// // const balancePaymentInput = document.getElementById('productBalancePrice');

// document.addEventListener('DOMContentLoaded', function () {
//   const completedCheckbox = document.getElementById(
//     isAdmin ? 'adminCompletedCheckbox' : 'completedCheckbox'
//   );
//   const balanceCheckbox = document.getElementById(
//     isAdmin ? 'adminBalanceCheckbox' : 'balanceCheckbox'
//   );
//   const balancePayment = document.querySelector('.balancePayment');
//   const balancePaymentInput = document.getElementById(
//     isAdmin ? 'adminProductBalancePrice' : 'productBalancePrice'
//   );
//   const checkboxes = document.querySelectorAll('input[type="radio"]');

//   function updateStatus() {
//     if (completedCheckbox.checked) {
//       checkboxStatus = 'Completed';
//       balancePayment.style.display = 'none';
//       balancePaymentInput.value = '';
//       balancePaymentInput.disabled = true;
//     } else {
//       checkboxStatus = 'Balance';
//       balancePayment.style.display = 'block';
//       balancePaymentInput.disabled = false;
//     }
//   }

//   updateStatus();

//   checkboxes.forEach((checkbox) => {
//     checkbox.addEventListener('change', function () {
//       checkboxes.forEach((otherCheckbox) => {
//         if (otherCheckbox !== checkbox) {
//           otherCheckbox.checked = false;
//           otherCheckbox.removeAttribute('required');
//         }
//       });

//       if (checkbox === completedCheckbox) {
//         completedCheckbox.checked = true;
//         balancePayment.style.display = 'none';
//         balancePaymentInput.disabled = true;
//         balancePaymentInput.value = '';

//         checkboxStatus = 'Completed';
//       } else {
//         balanceCheckbox.checked = true;
//         balancePayment.style.display = 'block';
//         balancePaymentInput.disabled = false;
//         checkboxStatus = 'Balance';
//       }
//       updateStatus();
//     });
//   });

//   balancePaymentInput.addEventListener('input', function () {
//     const inputValue = balancePaymentInput.value.trim(); // Trim to remove leading/trailing spaces

//     if (
//       inputValue === '-' ||
//       (!isNaN(inputValue) && parseFloat(inputValue) >= 0)
//     ) {
//       balanceCheckbox.checked = true;
//       completedCheckbox.checked = false;
//       completedCheckbox.removeAttribute('required');
//       checkboxStatus = 'Balance';
//     } else {
//       return;

//       // completedCheckbox.checked = true;
//       // balanceCheckbox.checked = false;
//       // checkboxStatus = 'Completed';
//       // balancePayment.style.display = 'none';
//       // balancePaymentInput.disabled = true;

//       balanceCheckbox.checked = false;
//       completedCheckbox.checked = false;
//       checkboxStatus = 'Invalid';
//     }

//     updateStatus();
//   });
// });

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

function handleSellProduct() {
  let soldProductNameInput = soldProductName.value;
  let soldProductPriceInput = Number(soldProductPrice.value);
  let productBalancePriceInput = Number(productBalancePrice.value);
  let soldProductRemarkInput = soldProductRemark.value;
  let id = Math.random();

  if (productBalancePriceInput === 0 || productBalancePriceInput === '') {
    productBalancePriceInput = '-';
  }

  const soldProductFormData = {
    soldProductNameInput,
    soldProductPriceInput,
    productBalancePriceInput,
    soldProductRemarkInput,
    checkboxStatus,
    id,
  };

  const storedData =
    JSON.parse(localStorage.getItem('soldProductFormData')) || [];

  const allData = [soldProductFormData, ...storedData];

  localStorage.setItem('cartKey', JSON.stringify(allData));

  return soldProductFormData;
}

document.addEventListener(
  'DOMContentLoaded',
  updateCartCounter,
  updateCartTotalUI
);

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('addToCartFormData')) || [];
  const counter = document.querySelector('.cart-counter');

  if (counter) {
    counter.textContent = cart.length;
  }
}

function handleAddToCart() {
  let soldProductNameInput = soldProductName.value;
  let soldProductPriceInput = Number(
    getAmountForSubmission(soldProductPrice.value)
  );
  let soldProductQuantityInput = Number(soldProductQuantity.value);
  let shopId = isAdmin ? sellProductShopDropdown.value : parsedUserData.shopId;

  const storedData =
    JSON.parse(localStorage.getItem('addToCartFormData')) || [];

  // Ensure shopId consistency
  if (storedData.length > 0 && storedData[0].shopId !== shopId) {
    alert(
      'Cannot add item from a different shop. Clear cart or switch back to original shop.'
    );
    return;
  }

  const addToCartFormData = {
    soldProductNameInput,
    soldProductPriceInput,
    soldProductQuantityInput,
    shopId,
  };

  const allCartData = [addToCartFormData, ...storedData];

  localStorage.setItem('cartKey', JSON.stringify(allCartData));
  updateCartCounter();
  updateCartTotalUI();

  showToast('success', '✅ Item added to cart successfully!');

  return addToCartFormData;
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

      soldProductName.value = '';
      soldProductPrice.value = '';
      soldProductQuantity.value = '';
      if (searchSellProdutItem) searchSellProdutItem.value = '';
      if (productBoughtPrice) productBoughtPrice.value = '';
      if (itemSellingprice) itemSellingprice.value = '';

      if (adminSellProductName) adminSellProductName.style.display = 'none';
      if (adminAutocompleteList) adminAutocompleteList.style.display = 'none';

      hideGlobalLoader();
    });
  }
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

  // Open Cart Slider
  cartIcon?.addEventListener('click', () => {
    //  cartSlider.style.display = 'block';
    cartSlider.classList.add('open');
    cartSliderOverlay.style.display = 'block';
    sliderWrapper.style.transform = 'translateX(0%)'; // Always reset to Cart View
    renderCartItemsFromStorage();
  });

  cartIcon.click();

  // Close Cart Slider
  closeCartBtn?.addEventListener('click', () => {
    //  cartSlider.style.display = 'none';
    cartSlider.classList.remove('open');
    cartSliderOverlay.style.display = 'none';
  });

  // Proceed to Checkout View
  proceedToCheckoutBtn?.addEventListener('click', () => {
    sliderWrapper.style.transform = 'translateX(-50%)';
  });

  // Go Back to Cart View
  backToCartBtn?.addEventListener('click', () => {
    sliderWrapper.style.transform = 'translateX(0%)';
  });

  cartSliderOverlay.addEventListener('click', () => {
    cartSlider.classList.remove('open');
    cartSliderOverlay.style.display = 'none';
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const sliderWrapper = document.querySelector('.slider-wrapper');
  const proceedToCheckoutBtn = document.querySelector('.proceed-btn');
  const backToCartBtn = document.getElementById('backToCart');

  proceedToCheckoutBtn?.addEventListener('click', function () {
    sliderWrapper.style.transform = 'translateX(-50%)';
  });

  backToCartBtn?.addEventListener('click', function () {
    sliderWrapper.style.transform = 'translateX(0%)';
  });
});

function renderCartItemsFromStorage() {
  const cart = JSON.parse(localStorage.getItem('addToCartFormData')) || [];
  const container = document.querySelector('.cart-items-container');
  updateCartCounter();
  updateCartTotalUI();

  // Clear existing items
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `<p>Your cart is empty.</p>`;
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
      const cart = JSON.parse(localStorage.getItem('addToCartFormData')) || [];
      cart.splice(index, 1);
      localStorage.setItem('addToCartFormData', JSON.stringify(cart));
      renderCartItemsFromStorage(); // re-render
    });
  });

  // Increase quantity
  document.querySelectorAll('.increase-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = JSON.parse(localStorage.getItem('addToCartFormData')) || [];
      cart[index].soldProductQuantityInput += 1;
      localStorage.setItem('addToCartFormData', JSON.stringify(cart));
      renderCartItemsFromStorage(); // re-render
    });
  });

  // Decrease quantity
  document.querySelectorAll('.decrease-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const cart = JSON.parse(localStorage.getItem('addToCartFormData')) || [];
      if (cart[index].soldProductQuantityInput > 1) {
        cart[index].soldProductQuantityInput -= 1;
        localStorage.setItem('addToCartFormData', JSON.stringify(cart));
        renderCartItemsFromStorage(); // re-render
      }
    });
  });
}

function getCartFromLocalStorage() {
  return JSON.parse(localStorage.getItem('addToCartFormData')) || [];
}

function calculateTotal() {
  const cart = getCartFromLocalStorage();
  let total = 0;

  cart.forEach((item) => {
    total += item.soldProductPriceInput * item.soldProductQuantityInput;
  });

  return total;
}

function updateCartTotalUI() {
  const total = calculateTotal();
  const totalFormatted = `₦${total.toLocaleString()}`;

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
}

let currentSelectedShopId = ''; // Track previously selected shop

//  Sync dropdown on load
// function syncDropdownWithCartShop() {
//   const cart = JSON.parse(localStorage.getItem('addToCartFormData')) || [];
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
  const cart = JSON.parse(localStorage.getItem('addToCartFormData')) || [];
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
      console.log('code got here'); // or whatever your product render function is
    });
  }
}

// Run sync function immediately after DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//   syncDropdownWithCartShop();
// });

document
  .getElementById('sellProductShopDropdown')
  .addEventListener('change', async function (e) {
    const selectedShopId = e.target.value;
    const cart = JSON.parse(localStorage.getItem('addToCartFormData')) || [];

    if (!selectedShopId) return;

    if (cart.length > 0) {
      const cartShopId = cart[0].shopId;

      if (selectedShopId && selectedShopId !== cartShopId) {
        const confirmed = confirm(
          'Switching shop will clear your current cart. Do you want to proceed?'
        );

        if (confirmed) {
          localStorage.removeItem('addToCartFormData');
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
