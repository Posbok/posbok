import config from '../config';
import './script.js';

import {
  createStockCategory,
  getStockCategories,
} from './apiServices/stock/stockResources';
import { hideBtnLoader, showBtnLoader } from './helper/helper';
import { showToast, closeModal, setupModalCloseButtons } from './script';

const userData = config.userData;
const dummyShopId = config.dummyShopId; // Dummy user data for testing

const parsedUserData = userData ? JSON.parse(userData) : null;

// const shopId = parsedUserData?.shopId || dummyShopId;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';

if (isAdmin) {
  document.addEventListener('DOMContentLoaded', () => {
    getStockCategories();
  });
}

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

document.addEventListener('DOMContentLoaded', () => {
  // Setup for Opening Pos Charges Modal
  setupModalCloseButtons();

  document
    .querySelector('#openAddStockCategoryModalBtn')
    ?.addEventListener('click', openAddStockCategoryModalBtn);

  document
    .querySelector('#openAddStockModalBtn')
    ?.addEventListener('click', openAddStockModalBtn);

  document
    .querySelector('#openAddExistingStockModalBtn')
    ?.addEventListener('click', openAddExistingStockModalBtn);

  document
    .querySelector('#openUpdateStockBtn')
    ?.addEventListener('click', openUpdateStockButton);

  document
    .querySelector('.openUpdateCategoryButton')
    ?.addEventListener('click', openUpdateCategoryButton);
});

export function populateStockCategoryTable(stockCategoriesData) {
  const tbody = document.querySelector('stock-category-table tbody');
  const loadingRow = document.querySelector('.loading-row');

  // Remove static rows and loading

  const categories = stockCategoriesData.data;

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
        <td class="py-1 categoryName">${category.name}</td>
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
        const categoryDetail = await getProductCategories(stockCategoryId);

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
    option1.textContent = `${category.name}`;
    if (addStockCategoryDropdown) addStockCategoryDropdown.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = category.id;
    option2.textContent = `${category.name}`;
    if (updateStockCategoryDropdown)
      updateStockCategoryDropdown.appendChild(option2);
  });
}

async function displayAllCategories() {
  try {
    showGlobalLoader();

    // Clear old Stock Category buttons
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
