import config from '../../../config';
import {
  formatAmountWithCommas,
  formatCurrency,
  formatDate,
  formatKey,
  formatTransactionBreakdown,
  formatTransactionType,
} from '../../helper/helper';

import {
  getReportDashboard,
  getStaffOverview,
} from '../business/businessResource';

const userData = config.userData;
const parsedUserData = userData ? JSON.parse(userData) : null;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const staffShopId = parsedUserData?.shopId;
const staffUserId = parsedUserData?.id;
const shopKey = `shop_${staffUserId}`;
const servicePermission = parsedUserData?.servicePermission;

function getReportDashboardFilters() {
  return {
    period: document.getElementById(`reportDashboardPeriod`)?.value || '',
  };
}

if (
  servicePermission === 'POS_TRANSACTIONS' ||
  servicePermission === 'BOTH' ||
  servicePermission === 'INVENTORY_SALES'
) {
  document
    .getElementById('applyReportDashboardPeriodFIlter')
    ?.addEventListener('click', () => {
      loadReportDashboard('90d');
    });

  if (document.body.classList.contains('page-report')) {
    renderStaffPerformanceTable();
    loadReportDashboard('90d');
  }
}

export async function loadReportDashboard(period = '90d') {
  const filters = getReportDashboardFilters(period);
  try {
    // Fetch once
    const result = await getReportDashboard(filters);
    if (!result?.data) throw new Error('Invalid data format');

    console.log(result);
    const {
      financial_summary,
      performance_highlights,
      staff_highlights,
      inventory_activity,
      date_range,
    } = result.data;

    const reportDashboardDateRange = document.querySelectorAll(
      '.reportDashboardDateRange'
    );

    const dateRangeText = `From ${formatDate(date_range.from)} to ${formatDate(
      date_range.to
    )}`;

    if (reportDashboardDateRange) {
      reportDashboardDateRange.forEach((el) => {
        el.textContent = dateRangeText;
      });
    }

    if (
      servicePermission === 'POS_TRANSACTIONS' ||
      servicePermission === 'BOTH'
    ) {
      document
        .querySelector('.financialSummarySection')
        .classList.remove('hidden');
      document
        .querySelector('.performanceHighlightsSection')
        .classList.remove('hidden');
      document
        .querySelector('.staffHighlightSection')
        .classList.remove('hidden');

      // Render each section using the fetched data
      renderFinancialSummary(financial_summary, date_range);
      renderPerformanceHighlights(performance_highlights, date_range);
      renderStaffHighlights(staff_highlights, date_range);
    }

    if (
      servicePermission === 'INVENTORY_SALES' ||
      servicePermission === 'BOTH'
    ) {
      document.querySelector('.inventoryActivity').classList.remove('hidden');
      renderInventoryActivity(inventory_activity, date_range);
    }
  } catch (error) {
    console.error('Error loading report dashboard:', error);
  }
}

let transactionBreakdownChart = null;

export async function renderFinancialSummary(summary) {
  console.log(summary);

  const totalShopsEl = document.getElementById('totalShops');
  if (totalShopsEl) totalShopsEl.textContent = summary.total_shops;

  const totalCapEl = document.getElementById('totalCapitalDeposits');
  if (totalCapEl)
    totalCapEl.textContent = formatCurrency(summary.total_capital_deposits);

  const totalTxnEl = document.getElementById('totalTransactions');
  if (totalTxnEl) totalTxnEl.textContent = summary.total_transactions;

  const totalTxnAmtEl = document.getElementById('totalTransactionAmount');
  if (totalTxnAmtEl)
    totalTxnAmtEl.textContent = formatCurrency(
      summary.total_transaction_amount
    );

  const adminWithdrawalsEl = document.getElementById('totalAdminWithdrawals');
  if (adminWithdrawalsEl)
    adminWithdrawalsEl.textContent = formatCurrency(
      summary.admin_withdrawals_total
    );

  const breakdown = summary.transaction_breakdown;
  const tableBody = document.getElementById('breakdownTableBody');
  if (tableBody) tableBody.innerHTML = '';

  Object.entries(breakdown).forEach(([key, value]) => {
    if (key !== 'total_transactions') {
      const row = document.createElement('tr');
      row.classList.add('table-body-row');
      row.innerHTML = `<td  class="py-1">${formatTransactionBreakdown(
        key
      )}</td><td  class="py-1">${formatCurrency(value)}</td>`;
      if (tableBody) tableBody.appendChild(row);
    }
  });

  // Apexchart
  const chartEl = document.querySelector('#transactionBreakdownChart');
  if (chartEl) {
    if (transactionBreakdownChart) {
      transactionBreakdownChart.destroy();
    }

    const chartData = Object.entries(breakdown)
      .filter(([key]) => key !== 'total_transactions')
      .map(([key, value]) => ({
        name: formatKey(key),
        data: [value],
      }));

    const options = {
      chart: { type: 'bar', height: 260 },
      series: chartData,
      xaxis: { categories: ['Transactions'] },
      colors: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'],
      dataLabels: {
        enabled: true,
        formatter: (val) => formatCurrency(val),
      },
      tooltip: {
        y: {
          formatter: (val) => `₦${formatAmountWithCommas(val)}`,
        },
      },
    };

    transactionBreakdownChart = new ApexCharts(chartEl, options);
    transactionBreakdownChart.render();
  }
}

let performanceChart = null;

export async function renderPerformanceHighlights(performance) {
  const peak = performance.peak_performance_day;

  const perfPeriodsEl = document.getElementById('totalPerformancePeriods');
  if (perfPeriodsEl)
    perfPeriodsEl.textContent = performance.total_performance_periods;

  const peakDayEl = document.getElementById('peakDay');
  if (peakDayEl) peakDayEl.textContent = formatDate(peak.period);

  const peakDayTxnCountEl = document.getElementById('peakDayTransactionCount');
  if (peakDayTxnCountEl)
    peakDayTxnCountEl.textContent = peak.total_transaction_count;

  const peakDayTxnAmtEl = document.getElementById('peakDayTransactionAmount');
  if (peakDayTxnAmtEl)
    peakDayTxnAmtEl.textContent = formatCurrency(peak.total_transaction_amount);

  const tableBody = document.getElementById('peakDayTableBody');
  if (tableBody) tableBody.innerHTML = '';

  const chartSeries = [];
  const categories = [];

  Object.entries(peak.transactions).forEach(([type, info]) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');
    row.innerHTML = `
      <td  class="py-1">${formatKey(type)}</td>
      <td  class="py-1">${info.count}</td>
      <td  class="py-1">${formatCurrency(info.amount)}</td>
      <td  class="py-1">${formatCurrency(info.average)}</td>
    `;
    if (tableBody) tableBody.appendChild(row);

    categories.push(formatKey(type));
    chartSeries.push(info.amount);
  });

  // ApexChart
  const chartEl = document.querySelector('#peakDayChart');
  if (chartEl) {
    if (performanceChart) {
      performanceChart.destroy();
    }

    performanceChart = new ApexCharts(chartEl, {
      chart: { type: 'bar', height: 260 },
      series: [{ name: 'Amount (₦)', data: chartSeries }],
      xaxis: { categories },
      colors: ['#10b981'],
      dataLabels: {
        enabled: true,
        formatter: (val) => formatCurrency(val),
      },
      tooltip: {
        y: {
          formatter: (val) => `₦${formatAmountWithCommas(val)}`,
        },
      },
    });

    performanceChart.render();
  }
}

let staffSalesChart = null;

export async function renderStaffHighlights(highlight) {
  const top = highlight.top_performer;

  const activeStaffElement = document.getElementById('activeStaffCount');
  const topNameElement = document.getElementById('topPerformerName');
  const topEmailElement = document.getElementById('topPerformerEmail');

  if (activeStaffElement)
    activeStaffElement.textContent = highlight.active_staff;
  if (topNameElement) topNameElement.textContent = top.staff.name;
  if (topEmailElement) topEmailElement.textContent = top.staff.email;

  // Transactions Table
  const txnBody = document.getElementById('txnSummaryTable');
  if (txnBody)
    txnBody.innerHTML = `
    <tr class="table-body-row">
      <td class="py-1">${top.transactions.total_count}</td>
      <td class="py-1">${formatCurrency(top.transactions.total_amount)}</td>
      <td class="py-1">${formatCurrency(
        top.transactions.average_per_transaction
      )}</td>
    </tr>
  `;

  // Render transaction by type chart
  const txnChartEl = document.getElementById('txnTypeChart');
  const txnTypes = Object.keys(top.transactions.by_type || {});
  const txnCounts = Object.values(top.transactions.by_type || {});

  if (txnChartEl) {
    if (staffSalesChart) {
      staffSalesChart.destroy();
    }

    staffSalesChart = new ApexCharts(txnChartEl, {
      chart: { type: 'donut', height: 240 },
      labels: txnTypes.map(formatKey),
      series: txnCounts,
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
      legend: { position: 'bottom' },
    });

    staffSalesChart.render();
  }

  // Sales (only if user has SALES/BOTH)
  const salesBox = document.getElementById('salesBox');
  if (servicePermission === 'INVENTORY_SALES' || servicePermission === 'BOTH') {
    const s = top.sales;
    const salesSummaryTable = document.getElementById('salesSummaryTable');

    if (salesSummaryTable)
      salesSummaryTable.innerHTML = `
<tr class="table-body-row">
        <td class="py-1">${s.total_sales}</td>
        <td class="py-1">${formatCurrency(s.total_sales_amount)}</td>
        <td class="py-1">${formatCurrency(s.profit)}</td>
        <td class="py-1">${s.profit_margin}%</td>
      </tr>
    `;
  } else {
    salesBox.style.display = 'none';
  }
}

export async function renderInventoryActivity(inventory) {
  try {
    if (!inventory) {
      console.warn('No inventory data found');
      return;
    }

    const { total_inventory_actions, recent_actions } = inventory;

    console.log(inventory);

    // Update total count
    const totalCountElement = document.querySelector(
      '.total_inventory_actions'
    );
    if (totalCountElement)
      totalCountElement.textContent = total_inventory_actions ?? 0;

    const inventorySummaryTableBody = document.getElementById(
      'inventorySummaryTableBody'
    );
    if (!inventorySummaryTableBody) return;

    // Clear old rows
    inventorySummaryTableBody.innerHTML = '';

    // ✅ Check if there are any recent actions
    const entries = Object.entries(recent_actions || {});

    if (entries.length === 0) {
      // 🟡 Show fallback message row
      const row = document.createElement('tr');
      row.className = 'table-body-row';
      row.innerHTML = `
        <td colspan="4" class="table-error-text text-center py-2">
          No Inventory Activity Available
        </td>
      `;
      inventorySummaryTableBody.appendChild(row);
      return;
    }

    // ✅ Build table rows dynamically
    for (const [action, details] of entries) {
      const row = document.createElement('tr');
      row.className = 'table-body-row';
      row.innerHTML = `
        <td class="py-1">${action.toUpperCase()}</td>
        <td class="py-1">${details?.count ?? 0}</td>
        <td class="py-1">${details?.total_quantity ?? 0}</td>
        <td class="py-1">₦${formatAmountWithCommas(
          details?.total_value ?? 0
        )}</td>
      `;
      inventorySummaryTableBody.appendChild(row);
    }
  } catch (error) {
    console.error('Error rendering inventory activity:', error);
  }
}

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
