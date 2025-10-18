import config from '../../../config';
import {
  formatAmountWithCommas,
  formatTransactionType,
} from '../../helper/helper';

import { getStaffOverview } from '../business/businessResource';

const userData = config.userData;
const parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const staffShopId = parsedUserData?.shopId;
const staffUserId = parsedUserData?.id;
const shopKey = `shop_${staffUserId}`;
const servicePermission = parsedUserData?.servicePermission;

export async function renderStaffPerformanceTable() {
  const staffOverviewTable = document.querySelector(
    '.staffOverviewTable tbody'
  );

  //   if (!staffOverviewTable) {
  //     console.error('Table body not found');
  //     //  return;
  //   }

  const tableHead = document.querySelector('.staffOverviewTable thead tr');
  if (tableHead)
    tableHead.innerHTML = `
  <th>S/N</th>
  <th>Staff Name</th>
  ${
    servicePermission === 'POS_TRANSACTIONS' || servicePermission === 'BOTH'
      ? `
        <th>Total Txns</th>
        <th>Total Amount (₦)</th>
        <th>Avg/Txn (₦)</th>
        <th>Transaction Type</th>
      `
      : ''
  }
  ${
    servicePermission === 'INVENTORY_SALES' || servicePermission === 'BOTH'
      ? `
        <th>Total Sales</th>
        <th>Sales Amount (₦)</th>
        <th>Total Cost (₦)</th>
        <th>Profit (₦)</th>
        <th>Profit Margin</th>
      `
      : ''
  }
`;

  try {
    if (staffOverviewTable)
      staffOverviewTable.innerHTML = `<tr><td colspan="12" class="table-loading-text">Loading Staff Overview Report...</td></tr>`;

    const result = await getStaffOverview();
    if (!result?.data?.overview?.length) {
      staffOverviewTable.innerHTML = `<tr><td colspan="12" class="table-error-text">No Staff Overview Available</td></tr>`;
      return;
    }

    const staffOverviewData = result.data.overview;
    if (staffOverviewTable) staffOverviewTable.innerHTML = '';
    let serialNumber = 1;

    staffOverviewData.forEach((staffOverview) => {
      const { staff, transactions, sales } = staffOverview;
      const { name } = staff;

      const byTypeHTML = renderByType(transactions.by_type);

      function renderByType(byType) {
        if (!byType || Object.keys(byType).length === 0) return '—'; // handle empty

        // Convert object entries to an array and map
        return Object.entries(byType)
          .map(([key, value]) => `${formatTransactionType(key)}: ${value}`)
          .join('<br>');
      }

      const row = document.createElement('tr');
      row.classList.add('table-body-row');

      // Render POS section
      let posColumns = '';
      if (
        servicePermission === 'POS_TRANSACTIONS' ||
        servicePermission === 'BOTH'
      ) {
        posColumns = `
          <td class="py-1">${transactions.total_count}</td>
          <td class="py-1">₦${formatAmountWithCommas(
            transactions.total_amount
          )}</td>
          <td class="py-1">${formatAmountWithCommas(
            transactions.average_per_transaction
          )}</td>
          <td class="py-1">${byTypeHTML}</td>
        `;
      }

      // Render Sales section
      let salesColumns = '';
      if (
        servicePermission === 'INVENTORY_SALES' ||
        servicePermission === 'BOTH'
      ) {
        salesColumns = `
          <td class="py-1">${sales.total_sales}</td>
          <td class="py-1">₦${formatAmountWithCommas(
            sales.total_sales_amount
          )}</td>
          <td class="py-1">₦${formatAmountWithCommas(sales.total_cost)}</td>
          <td class="py-1">₦${formatAmountWithCommas(sales.profit)}</td>
          <td class="py-1">${sales.profit_margin}%</td>
        `;
      }

      row.innerHTML = `
        <td class="py-1">${serialNumber++}</td>
        <td class="py-1">${name}</td>
        ${posColumns}
        ${salesColumns}
      `;

      if (staffOverviewTable) staffOverviewTable.appendChild(row);
    });
  } catch (error) {
    console.error('Error rendering staff performance:', error);
    if (staffOverviewTable)
      staffOverviewTable.innerHTML =
        '<tr><td colspan="12" class="table-error-text">Error loading staff overview.</td></tr>';
  }
}

renderStaffPerformanceTable();

// export async function renderStaffPerformanceTable() {
//   if (
//     servicePermission === 'POS_TRANSACTIONS' ||
//     servicePermission === 'BOTH'
//   ) {
//     const staffOverviewTable = document.querySelector('.staffOverviewTable');

//     const staffOverviewTableBody = staffOverviewTable.querySelector('tbody');

//     if (!staffOverviewTableBody) {
//       console.error('Error: Table body not found');
//       return;
//     }

//     try {
//       let loadingRow = document.querySelector('.loading-row');
//       // console.log('loading', loadingRow);
//       if (!loadingRow) {
//         loadingRow = document.createElement('tr');
//         loadingRow.className = 'loading-row';
//         loadingRow.innerHTML = `<td colspan="8" class="table-loading-text">Loading Report...</td>`;
//         staffOverviewTableBody.appendChild(loadingRow);
//       }

//       const result = await getStaffOverview();

//       if (!result) throw new Error(result.message || 'Failed to fetch');

//       const staffOverviewData = result.data.overview;
//       staffOverviewTableBody.innerHTML = '';

//       console.log('staffOverviewData:', staffOverviewData);

//       if (!staffOverviewData.length) {
//         staffOverviewTableBody.innerHTML =
//           '<tr class="loading-row"><td colspan="8" class="table-error-text ">No Staff Overview Available.</td></tr>';
//         return;
//       }

//       let serialNumber = 1;

//       staffOverviewData.forEach((staffOverview) => {
//         const { staff, transactions, sales } = staffOverview;
//         const { total_count, total_amount, average_per_transaction, by_type } =
//           transactions;

//         const {
//           total_sales,
//           total_sales_amount,
//           profit,
//           profit_margin,
//           total_cost,
//         } = sales;

//         const { name } = staff;

//         function renderByType(byType) {
//           if (!byType || Object.keys(byType).length === 0) return '—'; // handle empty

//           // Convert object entries to an array and map
//           return Object.entries(byType)
//             .map(([key, value]) => `${formatTransactionType(key)}: ${value}`)
//             .join('<br>');
//         }

//         const byTypeHTML = renderByType(by_type);

//         const row = document.createElement('tr');
//         row.classList.add('table-body-row');
//         row.innerHTML = `
//       <tr>
//         <td class="py-1">${serialNumber++}</td>
//         <td class="py-1">${name}</td>
//         <td class="py-1">${total_count}</td>
//         <td class="py-1">₦${formatAmountWithCommas(total_amount)}</td>
//         <td class="py-1">${formatAmountWithCommas(average_per_transaction)}</td>
//         <td class="py-1">${byTypeHTML}</td>
//         <td class="py-1">${total_sales}</td>
//         <td class="py-1">₦${formatAmountWithCommas(total_sales_amount)}</td>
//         <td class="py-1">₦${formatAmountWithCommas(total_cost)}</td>
//         <td class="py-1">₦${formatAmountWithCommas(profit)}</td>
//         <td class="py-1">${profit_margin}%</td>
//       </tr>
//     `;
//         staffOverviewTableBody.appendChild(row);
//       });
//     } catch (error) {
//       console.error('Error rendering transactions:', error);
//       staffOverviewTableBody.innerHTML =
//         '<tr><td colspan="12" class="table-error-text">Error loading transactions.</td></tr>';
//     }
//   }
// }
