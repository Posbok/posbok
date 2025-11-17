import config from '../../../config';
import {
  populateCategoriesDropdown,
  populateCategoryTable,
  renderProductInventoryTable,
} from '../../goods.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
import { closeModal, showToast } from '../../script.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;

export async function createProductCategory(productCategoryDetails) {
  try {
    //  console.log('Sending POST request...');

    const fetchedData = await safeFetch(`${baseUrl}/api/inventory/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productCategoryDetails),
    });

    //  console.log('Response received...');

    if (fetchedData) {
      // console.log('Product Category created successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);

      // Refresh the table list after successful configuration
      getProductCategories();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error creating Product Category:', error);
    throw error;
  }
}

export async function getProductCategories() {
  const tbody = document.querySelector('.category-table tbody');
  function showLoadingRow() {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Loading Product Categories...</td>
    </tr>
  `;
  }

  showLoadingRow();

  try {
    //  showGlobalLoader();
    //  console.log('Sending getProductCategories request...');

    const productCategoriesData = await safeFetch(
      `${baseUrl}/api/inventory/categories`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (productCategoriesData) {
      // console.log(productCategoriesData);
      // hideGlobalLoader();
    }

    populateCategoryTable(productCategoriesData);
    populateCategoriesDropdown(productCategoriesData);

    return productCategoriesData;
  } catch (error) {
    //  hideGlobalLoader();
    console.log(tbody);
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Error loading Product Categories...</td>
    </tr>
  `;
    console.error('Error receiving Product Categories:', error);
    throw error;
  }
}

// export async function createProduct(productDetails) {
//   try {
//     //  console.log('Sending POST request...');
//     const fetchedData = await safeFetch(`${baseUrl}/api/inventory/products`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${userToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(productDetails),
//     });

//     //  console.log('fetchedData received...');

//     if (fetchedData) {
//       // console.log('Product added successfully:', fetchedData);
//       showToast('success', `✅ ${fetchedData.message}`);

//       // Refresh the table list after successful configuration
//       // getProductCategories();
//     }

//     return fetchedData;
//   } catch (error) {
//     console.error('Error posting product:', error);
//   }
// }

export async function createProduct(shopId, productDetails) {
  try {
    //  console.log('Sending POST request...');
    const fetchedData = await safeFetch(
      `${baseUrl}/api/inventory/shops/${shopId}/products`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productDetails),
      }
    );

    //  console.log('fetchedData received...');

    if (fetchedData) {
      console.log('Product added successfully:', fetchedData);
      // showToast('success', `✅ ${fetchedData.message}`);
      // Refresh the table list after successful configuration
      // getProductCategories();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error posting product:', error);
  }
}

export async function addInventory(inventoryDetails, shopId) {
  try {
    //  console.log('Sending POST request...');
    const fetchedData = await safeFetch(
      `${baseUrl}/api/inventory/shops/${shopId}/inventory`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryDetails),
      }
    );

    //  console.log('fetchedData received...');

    if (fetchedData) {
      // console.log('Product added successfully:', fetchedData);
      // showToast('success', `✅ ${fetchedData.message}`);
      // console.log('this toast is from addInventory');
      // Refresh the table list after successful configuration
      // getProductCategories();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error posting product:', error);
  }
}

export async function getProductInventory(shopId) {
  try {
    //  showGlobalLoader();
    //  console.log('Sending  getProductInventory request...');

    const productInventoryData = await safeFetch(
      `${baseUrl}/api/inventory/shops/${shopId}/inventory`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (productInventoryData) {
      // console.log(productInventoryData);
      hideGlobalLoader();
    }

    //  populateProductInventoryTable(productInventoryData);

    return productInventoryData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving Product Categories:', error);
    throw error;
  }
}

export async function getProductDetail(productId) {
  try {
    //  console.log('Sending POST request...');

    const fethedProductDetail = await safeFetch(
      `${baseUrl}/api/inventory/products/${productId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    //  console.log('Response received...');

    if (!fethedProductDetail) {
      showToast('fail', `✅ ${fethedProductDetail.message}`);
      return;
    }

    //  console.log('Product detail received successfully:', fethedProductDetail);

    return fethedProductDetail;
  } catch (error) {
    console.error('Error Getting Product Detail:', error);
    throw error;
  }
}

export async function deleteProduct(productId, shopId) {
  try {
    //  console.log('Sending POST request...');

    showGlobalLoader();

    const fetchedData = await safeFetch(
      `${baseUrl}/api/inventory/products/${productId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (fetchedData) {
      // console.log('Staff deleted successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);
      await renderProductInventoryTable(shopId); // Refresh list or update UI
      hideGlobalLoader();
    }

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    //  console.error('Error deleting Product', error);
    showToast('error', '❌ Failed to delete Product');
    throw error;
  }
}

export async function deleteCategory(categoryId) {
  try {
    //  console.log('Sending POST request...');

    showGlobalLoader();

    const fetchedData = await safeFetch(
      `${baseUrl}/api/inventory/categories/${categoryId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (fetchedData) {
      // console.log('Staff deleted successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);
      await getProductCategories(); // Refresh list or update UI
      hideGlobalLoader();
    }

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    //  console.error('Error deleting Category', error);
    //  showToast('error', `❌ Failed to delete Category`);
    showToast('error', `❌ ${error.message}`);
    throw error;
  }
}

export async function updateProduct(productId, updateProductDetails, shopId) {
  //   console.log('From API Request:', productId, updateProductDetails, shopId);

  try {
    //  console.log('Sending POST request...', productId);

    const updateProductData = await safeFetch(
      `${baseUrl}/api/inventory/products/${productId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateProductDetails),
      }
    );

    if (updateProductData) {
      console.log('Product info Updated successfully:', updateProductData);
      // showToast('success', `✅ ${updateProductData.message}`);
      await renderProductInventoryTable(shopId); // Refresh list or update UI
    }

    return updateProductData;
  } catch (error) {
    console.error('Error Updating Product Info', error);
    showToast('error', '❌ Failed to Update Product info');
    throw error;
  }
}

export async function updateCategory(categoryId, updateCategoryDetails) {
  //   console.log('From API Request:', categoryId, updateCategoryDetails);

  try {
    //  console.log('Sending POST request...', categoryId);

    const updateCategoryData = await safeFetch(
      `${baseUrl}/api/inventory/categories/${categoryId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateCategoryDetails),
      }
    );

    if (updateCategoryData) {
      // console.log('Categories info Updated successfully:', updateCategoryData);
      showToast('success', `✅ ${updateCategoryData.message}`);
      closeModal();
      await getProductCategories(); // Refresh list or update UI
    }

    return updateCategoryData;
  } catch (error) {
    console.error('Error Updating Categories Info', error);
    showToast('error', '❌ Failed to Update Categories info');
    throw error;
  }
}

export async function updateProductInventory(
  updateInventoryDetails,
  shopId,
  productId
) {
  try {
    //  console.log('Sending POST request...');

    const updateProductData = await safeFetch(
      `${baseUrl}/api/inventory/shops/${shopId}/inventory/${productId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateInventoryDetails),
      }
    );

    if (updateProductData) {
      // console.log('Product info Updated successfully:', updateProductData);
      // showToast('success', `✅ ${updateProductData.message} `);
      // console.log('this toast is from updateProductInventory');
      await renderProductInventoryTable(shopId); // Refresh list or update UI
    }

    return updateProductData;
  } catch (error) {
    console.error('Error Updating Product Info', error);
    showToast('error', '❌ Failed to Update Product info');
    throw error;
  }
}

export async function getShopInventoryLog({ shopId, filters = {} }) {
  try {
    //  showGlobalLoader();
    //  console.log('Sending  getProductInventory request...');
    console.log(filters);

    const queryParams = new URLSearchParams({
      shop_id: shopId,
    });

    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);

    const inventoryLogData = await safeFetch(
      `${baseUrl}/api/reports/shop-inventory-log?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (inventoryLogData) {
      // console.log(inventoryLogData);
      hideGlobalLoader();
    }

    //  populateProductInventoryTable(inventoryLogData);

    return inventoryLogData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving Product Categories:', error);
    throw error;
  }
}

export async function getAllSales({
  shopId,
  page = 1,
  limit = 10,
  filters = {},
}) {
  try {
    const queryParams = new URLSearchParams({
      shopId,
      page,
      limit,
    });

    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);

    showGlobalLoader();
    const posTransactionsData = await safeFetch(
      `${baseUrl}/api/sales?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (posTransactionsData) {
      // showToast('success', `✅ ${posTransactionsData.message}`);
      hideGlobalLoader();
    }

    return posTransactionsData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error receiving POS Transaction:', error);
    throw error;
  }
}
