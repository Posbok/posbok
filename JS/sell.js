import config from '../config';
import {
  getProductCategories,
  getProductInventory,
} from './apiServices/inventory/inventoryResources';
import { getProducts } from './apiServices/sales/salesResources';
import {
  formatAmountWithCommas,
  hideGlobalLoader,
  showGlobalLoader,
} from './helper/helper';

let allProducts = [];
let allCategories = [];
let activeCategoryId = null; // null means "All"

const searchSellProdutItem = document.getElementById('searchSellProdutItem');
const sellProductCategorySection = document.querySelector(
  '.sellProductCategory-section'
);

const userData = config.userData;
const dummyShopId = config.dummyShopId;

let parsedUserData = null;

parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const shopId = parsedUserData?.shopId;

const sellProductName = document.querySelector('.sellProductName');
const productInput = document.getElementById('productInput');
const autocompleteList = document.getElementById('autocompleteList');
const productBoughtPrice = document.getElementById('productBoughtPrice');
const itemSellingprice = document.getElementById('itemSellingPrice');

// Initial display of all products & Categories
displayAllProducts();
displayAllCategories();

async function fetchAllProducts() {
  let products = [];

  try {
    const productInventoryData = await getProductInventory(
      isAdmin ? businessDayShopDropdown.value : shopId
    ); // Fetch products

    if (productInventoryData) {
      // console.log(`Fetching product inventory:`, productInventoryData.data);
      products = products.concat(productInventoryData.data); // Add data to all products array
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
      isAdmin ? businessDayShopDropdown.value : shopId
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

async function displayAllProducts() {
  try {
    showGlobalLoader();
    allProducts = await fetchAllProducts(); // Fetch and store all products

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
let checkboxStatus;
const balancePaymentInput = document.getElementById('productBalancePrice');

document.addEventListener('DOMContentLoaded', function () {
  const completedCheckbox = document.getElementById('completedCheckbox');
  const balanceCheckbox = document.getElementById('balanceCheckbox');
  const balancePayment = document.querySelector('.balancePayment');
  const balancePaymentInput = document.getElementById('productBalancePrice');
  const checkboxes = document.querySelectorAll('input[type="radio"]');

  function updateStatus() {
    if (completedCheckbox.checked) {
      checkboxStatus = 'Completed';
      balancePayment.style.display = 'none';
      balancePaymentInput.value = '';
      balancePaymentInput.disabled = true;
    } else {
      checkboxStatus = 'Balance';
      balancePayment.style.display = 'block';
      balancePaymentInput.disabled = false;
    }
  }

  updateStatus();

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      checkboxes.forEach((otherCheckbox) => {
        if (otherCheckbox !== checkbox) {
          otherCheckbox.checked = false;
          otherCheckbox.removeAttribute('required');
        }
      });

      if (checkbox === completedCheckbox) {
        completedCheckbox.checked = true;
        balancePayment.style.display = 'none';
        balancePaymentInput.disabled = true;
        balancePaymentInput.value = '';

        checkboxStatus = 'Completed';
      } else {
        balanceCheckbox.checked = true;
        balancePayment.style.display = 'block';
        balancePaymentInput.disabled = false;
        checkboxStatus = 'Balance';
      }
      updateStatus();
    });
  });

  balancePaymentInput.addEventListener('input', function () {
    const inputValue = balancePaymentInput.value.trim(); // Trim to remove leading/trailing spaces

    if (
      inputValue === '-' ||
      (!isNaN(inputValue) && parseFloat(inputValue) >= 0)
    ) {
      balanceCheckbox.checked = true;
      completedCheckbox.checked = false;
      completedCheckbox.removeAttribute('required');
      checkboxStatus = 'Balance';
    } else {
      return;

      // completedCheckbox.checked = true;
      // balanceCheckbox.checked = false;
      // checkboxStatus = 'Completed';
      // balancePayment.style.display = 'none';
      // balancePaymentInput.disabled = true;

      balanceCheckbox.checked = false;
      completedCheckbox.checked = false;
      checkboxStatus = 'Invalid';
    }

    updateStatus();
  });
});

// JS for Selling Products and adding to localStorage
const soldProductName = document.getElementById('searchSellProdutItem');
const soldProductPrice = document.getElementById('soldProductPrice');
const productBalancePrice = document.getElementById('productBalancePrice');
const soldProductRemark = document.getElementById('soldProductRemark');

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

  localStorage.setItem('soldProductFormData', JSON.stringify(allData));

  return soldProductFormData;
}

const sellProductForm = document.querySelector('.sell-product-form');

if (sellProductForm) {
  sellProductForm.addEventListener('submit', function (e) {
    const balancePayment = document.querySelector('.balancePayment');
    const balancePaymentInput = document.getElementById('productBalancePrice');

    e.preventDefault();
    handleSellProduct();

    soldProductName.value = '';
    priceInput.value = '';
    soldProductPrice.value = '';
    productBalancePrice.value = '';
    soldProductRemark.value = '';
    completedCheckbox.checked = false;
    balanceCheckbox.checked = false;
    balancePayment.style.display = 'block';
    balancePaymentInput.disabled = false;
  });
}

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
