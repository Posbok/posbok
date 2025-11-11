import config from '../../../config';
import { renderProductInventoryTable } from '../../goods.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
import { closeModal, showToast } from '../../script.js';
import {
  populateStockCategoriesDropdown,
  populateStockCategoryTable,
  populateStockItemsDropdown,
  populateStockItemsTable,
  populateStockLogsTable,
} from '../../stock.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;

export async function createStockCategory(stockCategoryDetails) {
  try {
    //  console.log('Sending POST request...');

    const fetchedData = await safeFetch(`${baseUrl}/api/stock/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockCategoryDetails),
    });

    //  console.log('Response received...');

    if (fetchedData) {
      // console.log('Stock Category created successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);

      // Refresh the table list after successful configuration
      getStockCategories();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error creating Stock Category:', error);
    throw error;
  }
}

export async function getStockCategories() {
  const tbody = document.querySelector('.stock-category-table tbody');
  function showLoadingRow() {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Loading Stock Categories...</td>
    </tr>
  `;
  }

  showLoadingRow();

  try {
    //  showGlobalLoader();
    //  console.log('Sending getStockCategories request...');

    const stockCategoriesData = await safeFetch(
      `${baseUrl}/api/stock/categories`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (stockCategoriesData) {
      // console.log(stockCategoriesData);
      // hideGlobalLoader();
    }

    populateStockCategoryTable(stockCategoriesData);
    populateStockCategoriesDropdown(stockCategoriesData);

    return stockCategoriesData;
  } catch (error) {
    //  hideGlobalLoader();
    //  console.log(tbody);
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="6" class="table-error-text">Error loading Stock Categories...</td>
    </tr>
  `;
    console.error('Error receiving Stock Categories:', error);
    throw error;
  }
}

export async function createStockItem(stockItemDetails) {
  try {
    //  console.log('Sending POST request...');

    const fetchedData = await safeFetch(`${baseUrl}/api/stock/add`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockItemDetails),
    });

    //  console.log('Response received...');

    if (fetchedData) {
      // console.log('Stock Item created successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);

      // Refresh the table list after successful configuration
      getStockItems();
      getStockLogs();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error creating Stock Item:', error);
    throw error;
  }
}

export async function getStockItems() {
  const tbody = document.querySelector('.stock-item-table tbody');
  function showLoadingRow() {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="10" class="table-error-text">Loading Stock Items...</td>
    </tr>
  `;
  }

  showLoadingRow();

  try {
    //  showGlobalLoader();
    //  console.log('Sending getStockItems request...');

    const stockItemsData = await safeFetch(`${baseUrl}/api/stock/report`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
        //  'Content-Type': 'application/json',
      },
    });

    //  console.log('Response received...');

    if (stockItemsData) {
      // console.log(stockItemsData);
      // hideGlobalLoader();
    }

    populateStockItemsTable(stockItemsData.data);
    //  populateStockItemsDropdown(stockItemsData.data);

    return stockItemsData;
  } catch (error) {
    //  hideGlobalLoader();
    //  console.log(tbody);
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="10" class="table-error-text">Error loading Stock Items...</td>
    </tr>
  `;
    console.error('Error receiving Stock Items:', error);
    throw error;
  }
}

export async function getStockLogs() {
  const tbody = document.querySelector('.stock-logs-table tbody');
  function showLoadingRow() {
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="10" class="table-error-text">Loading Stock Logs...</td>
    </tr>
  `;
  }

  showLoadingRow();

  try {
    //  showGlobalLoader();
    //  console.log('Sending getStockItems request...');

    const stockLogsData = await safeFetch(
      // `${baseUrl}/api/stock/logs/inventory`,
      `${baseUrl}/api/reports/inventory-log`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (stockLogsData) {
      console.log('Stock Inventory Logs data', stockLogsData);
      // hideGlobalLoader();
    }

    populateStockLogsTable(stockLogsData.data);
    //  populateStockItemsDropdown(stockLogsData.data);

    return stockLogsData;
  } catch (error) {
    //  hideGlobalLoader();
    //  console.log(tbody);
    if (tbody)
      tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="10" class="table-error-text">Error loading Stock Logs...</td>
    </tr>
  `;
    console.error('Error receiving Stock Logs:', error);
    throw error;
  }
}

export async function getStockProduct(stockItemId) {
  //   showLoadingRow();

  try {
    //  console.log('Sending getStockItems request...');

    const stockItemData = await safeFetch(
      `${baseUrl}/api/stock/${stockItemId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    //  console.log('Response received...');

    if (stockItemData) {
      // console.log(stockItemData);
      // hideGlobalLoader();
    }

    return stockItemData;
  } catch (error) {
    //   hideGlobalLoader();
    //  console.log(tbody);
    console.error('Error receiving Stock Item Detail:', error);
    throw error;
  }
}

export async function deleteStockItem(stockItemId) {
  try {
    //  console.log('Sending POST request...');

    showGlobalLoader();

    const fetchedData = await safeFetch(`${baseUrl}/api/stock/${stockItemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (fetchedData) {
      console.log('Stock item  deleted successfully:', fetchedData);
      // showToast('success', `✅ ${fetchedData.message}`);
      // await renderStock itemTable();
      // hideGlobalLoader();
    }

    return fetchedData;
  } catch (error) {
    hideGlobalLoader();
    console.error('Error deleting Stock item ', error);
    //  showToast('error', '❌ Failed to delete Stock item ');
    throw error;
  }
}

export async function updateStockItem(stockItemId, updateStockItemDetails) {
  try {
    //  console.log('Sending PUT request...');

    const fetchedData = await safeFetch(
      `${baseUrl}/api/stock/${stockItemId}}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateStockItemDetails),
      }
    );

    //  console.log('Response received...');

    if (fetchedData) {
      // console.log('Stock Item Updated successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);

      // Refresh the table list after successful configuration
      getStockItems();
      getStockLogs();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error Updating Stock Item:', error);
    throw error;
  }
}

export async function restockProduct(restockProductDetails, productId) {
  try {
    //  console.log('Sending PUT request...');

    const fetchedData = await safeFetch(
      `${baseUrl}/api/stock/${productId}/restock`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restockProductDetails),
      }
    );

    //  console.log('Response received...');

    if (fetchedData) {
      // console.log('Stock Item Updated successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);

      // Refresh the table list after successful configuration
      getStockItems();
      getStockLogs();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error Restocking Product:', error);
    throw error;
  }
}

export async function moveStockItem(moveStockItemDetails) {
  try {
    //  console.log('Sending PUT request...');

    const fetchedData = await safeFetch(
      `${baseUrl}/api/stock/move-to-inventory`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moveStockItemDetails),
      }
    );

    //  console.log('Response received...');

    if (fetchedData) {
      // console.log('Stock Item Moved successfully:', fetchedData);
      showToast('success', `✅ ${fetchedData.message}`);

      // Refresh the table list after successful configuration
      getStockItems();
      getStockLogs();
    }

    return fetchedData;
  } catch (error) {
    console.error('Error Moving Stock Item:', error);
    throw error;
  }
}
