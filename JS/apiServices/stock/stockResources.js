import config from '../../../config';
import { renderProductInventoryTable } from '../../goods.js';
import { hideGlobalLoader, showGlobalLoader } from '../../helper/helper.js';
import { closeModal, showToast } from '../../script.js';
import {
  populateStockCategoriesDropdown,
  populateStockCategoryTable,
} from '../../stock.js';
import { safeFetch } from '../utility/safeFetch.js';

const baseUrl = config.baseUrl;
const userToken = config.token;

export async function createStockCategory(stockCategoryDetails) {
  try {
    console.log('Sending POST request...');

    const fetchedData = await safeFetch(`${baseUrl}/api/stock/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockCategoryDetails),
    });

    console.log('Response received...');

    if (fetchedData) {
      console.log('Stock Category created successfully:', fetchedData);
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
      `${baseUrl}/api/stock/report?include_current=true&include_new=true`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          //  'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response received...');

    if (stockCategoriesData) {
      console.log(stockCategoriesData);
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
