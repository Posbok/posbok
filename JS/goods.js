import config from '../config';
import {
  addInventory,
  createProduct,
  createProductCategory,
  deleteProduct,
  getProductCategories,
  getProductDetail,
  getProductInventory,
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

export function openUpdateProductButton() {
  const main = document.querySelector('.main');
  const sidebar = document.querySelector('.sidebar');
  const updateProductContainer = document.querySelector('.updateProduct');

  if (updateProductContainer) updateProductContainer.classList.add('active');
  if (main) main.classList.add('blur');
  if (sidebar) sidebar.classList.add('blur');

  //   updateProductForm();
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
    .querySelector('#openUpdateProductBtn')
    ?.addEventListener('click', openUpdateProductButton);
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
          <button class="hero-btn-outline editcategoryButton" data-category-id="${
            category.id
          }">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="hero-btn-outline deletecategoryButton" data-category-id="${
            category.id
          }">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

    if (tbody) tbody.appendChild(row);

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
  if (!inventoryShopDropdown) return;

  inventoryShopDropdown.innerHTML = `<option value="">Select a shop</option>`;

  shopList.forEach((shop) => {
    const option = document.createElement('option');
    option.value = shop.id;
    option.textContent = `${shop.shop_name} - ${shop.location}`;
    inventoryShopDropdown.appendChild(option);
  });
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

      // console.log('Adding Products with:', addProductDetails);

      const addProductModalBtn = document.querySelector('.addProductModalBtn');

      try {
        showBtnLoader(addProductModalBtn);
        const productData = await createProduct(addProductDetails);

        //   if (!productData) {
        //     showToast('fail', productData.message);
        //     return;
        //   }

        const productId = productData?.data.id;
        const shopId = Number(inventoryShopDropdown);

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
