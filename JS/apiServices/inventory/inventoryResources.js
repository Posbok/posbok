import config from '../../../config';
import {
  populateCategoriesDropdown,
  populateCategoryTable,
} from '../../goods.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
import { showToast } from '../../script.js';
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

export async function createProduct(productDetails) {
  try {
    //  console.log('Sending POST request...');
    const fetchedData = await safeFetch(`${baseUrl}/api/inventory/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productDetails),
    });

    //  console.log('fetchedData received...');

    if (fetchedData) {
      // console.log('Product added successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);

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
      showToast('success', `✅ ${fetchedData.message}`);

      // Refresh the table list after successful configuration
      // getProductCategories();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error posting product:', error);
  }
}

export async function getProductInventory(shopId) {
  const tbody = document.querySelector('.product-table tbody');
  //   function showLoadingRow() {
  //     if (tbody)
  //       tbody.innerHTML = `
  //     <tr class="loading-row">
  //       <td colspan="6" class="table-error-text">Loading Product Categories...</td>
  //     </tr>
  //   `;
  //   }

  //   showLoadingRow();

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

// getProductCategories();

// export async function getProducts() {
//   try {
//     //  console.log('Sending GET request...');
//     const response = await fetch(`${baseUrl}/api/products`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${userToken}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     //  console.log('Response received...');

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     //  console.log('Products:', data);
//     return data;
//   } catch (error) {
//     //  console.error('Error fetching products:', error);
//     return [];
//   }
// }

export async function getProducts(page = 1, pageSize = 25) {
  try {
    const response = await safeFetch(
      `${baseUrl}/api/inventory/products?page=1&limit=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Returns both product data and pagination meta
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], meta: { pagination: { pageCount: 1 } } };
  }
}

// export async function addProduct(productData) {
//   try {
//     console.log('Sending POST request...');
//     const response = await fetch(`${baseUrl}/api/products`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${userToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(productData),
//     });

//     console.log('Response received...');

//     if (!response.ok) {
//       // Check if the response status is OK (2xx range)
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Product added successfully:', data);

//     // Return success status and the data
//     return { success: true, data };
//   } catch (error) {
//     console.error('Error posting product:', error);
//     // Return failure status if there's an error
//     return { success: false, error };
//   }
// }

export async function updateProduct(documentId, productData) {
  try {
    //  console.log('Sending PUT request...');
    const response = await fetch(`${baseUrl}/api/products/${documentId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    //  console.log('Response received...');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    //  console.log('Product updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
  }
}

export async function deleteProduct(documentId) {
  try {
    console.log('Sending DELETE request...');
    const response = await fetch(`${baseUrl}/api/products/${documentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response received...');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Product deleted successfully');
    return true; // Return true if deletion was successful
  } catch (error) {
    console.error('Error deleting product:', error);
    return false; // Return false if there was an error
  }
}
