import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
// import { html2pdf } from 'html2pdf.js';
import config from '../../../config';
import {
  clearReceiptDiv,
  formatAmountWithCommas,
  formatSaleStatus,
  hideBtnLoader,
  hideGlobalLoader,
  showBtnLoader,
  showGlobalLoader,
  truncateProductNames,
  truncateProductUnitPrice,
} from '../../helper/helper';
import { openSaleDetailsModal } from '../../reports';
import {
  getProductCategories,
  getProductInventory,
} from '../inventory/inventoryResources';
import { getSaleById, getSalesByProduct } from '../sales/salesResources';
import { closeModal, showToast } from '../../script';
import { fetchShopDetail } from '../shop/shopResource';

const userData = config.userData;
const parsedUserData = userData ? JSON.parse(userData) : null;

// const shopId = parsedUserData?.shopId || dummyShopId;

const isAdmin = parsedUserData?.accountType === 'ADMIN';
const isStaff = parsedUserData?.accountType === 'STAFF';
const staffShopId = parsedUserData?.shopId;
const staffUserId = parsedUserData?.id;
const shopKey = `shop_${staffUserId}`;

let allProducts = [];
let allCategories = [];
let activeCategoryId = null; // null means "All"
let selectedProduct = null;
let totalCartAmount = 0;

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const adminAccordionContainer = document.querySelector(
  '.adminAccordionContainer'
);
const staffContainer = document.querySelector('.staffContainer');

if (isAdmin) {
  adminAccordionContainer.style.display = 'block';
  staffContainer.style.display = 'none';
} else {
  adminAccordionContainer.style.display = 'none';
  staffContainer.style.display = 'block';
}

// Update Product Sales Report - Monthly
export function updateMonthlySalesData(monthlySalesData, shopId) {
  //   console.log(monthlySalesData);
  const totalMonthlySales = document.getElementById(
    `totalMonthlySales_${shopId}`
  );
  const totalMonthlyAmount = document.getElementById(
    `totalMonthlyAmount_${shopId}`
  );
  const totalMonthlyPaid = document.getElementById(
    `totalMonthlyPaid_${shopId}`
  );
  const totalMonthlyBalance = document.getElementById(
    `totalMonthlyBalance_${shopId}`
  );

  if (!monthlySalesData) {
    console.error('monthlySalesData is undefined:', monthlySalesData);
    return;
  }

  const { date, totalAmount, totalBalance, totalPaid, totalSales } =
    monthlySalesData;

  totalMonthlySales.textContent = totalSales;
  totalMonthlyAmount.textContent = `₦${formatAmountWithCommas(totalAmount)}`;
  totalMonthlyPaid.textContent = `₦${formatAmountWithCommas(totalPaid)}`;
  totalMonthlyBalance.textContent = `₦${formatAmountWithCommas(totalBalance)}`;
}

// Update Product Sales Report - daily
export function updateDailySalesData(dailySalesData, shopId) {
  //   console.log(dailySalesData);
  const totalDailySales = document.getElementById(`totalDailySales_${shopId}`);
  const totalDailyAmount = document.getElementById(
    `totalDailyAmount_${shopId}`
  );
  const totalDailyPaid = document.getElementById(`totalDailyPaid_${shopId}`);
  const totalDailyBalance = document.getElementById(
    `totalDailyBalance_${shopId}`
  );

  if (!dailySalesData) {
    console.error('dailySalesData is undefined:', dailySalesData);
    return;
  }

  const { date, totalAmount, totalBalance, totalPaid, totalSales } =
    dailySalesData;

  totalDailySales.textContent = totalSales;
  totalDailyAmount.textContent = `₦${formatAmountWithCommas(totalAmount)}`;
  totalDailyPaid.textContent = `₦${formatAmountWithCommas(totalPaid)}`;
  totalDailyBalance.textContent = `₦${formatAmountWithCommas(totalBalance)}`;
}

// JS to give total Sold Amount - Daily
export function updateTotalSalesAmounts(sales, totalSalesRow, date) {
  const totalSalesAmount = sales.reduce(
    (sum, item) => sum + Number(item.total_amount),
    0
  );

  const totalPaidAmount = sales.reduce(
    (sum, item) => sum + Number(item.amount_paid),
    0
  );

  const totalBalanceAmount = sales.reduce(
    (sum, item) => sum + Number(item.balance),
    0
  );

  // Calculate cost/sold/profit
  let totalCostPrice = 0;
  let totalSoldPrice = 0;

  sales.forEach((transaction) => {
    if (Array.isArray(transaction.SaleItems)) {
      transaction.SaleItems.forEach((item) => {
        const unitCost = Number(item.unit_price) || 0;
        const sellingPrice = Number(item.selling_price) || 0;
        const quantity = Number(item.quantity) || 0;

        totalCostPrice += unitCost * quantity;
        totalSoldPrice += sellingPrice * quantity;
      });
    }
  });

  const totalProfit = totalSoldPrice - totalCostPrice;

  totalSalesRow.innerHTML = `
     <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>${date} SUMMARY:</strong>
     </td>
     <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Sales Amount</strong> = ₦${formatAmountWithCommas(
         totalSalesAmount
       )}
     </td>
     <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Paid Amount</strong> = ₦${formatAmountWithCommas(
         totalPaidAmount
       )}
     </td>
     <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
       <strong>Total Balance Amount</strong> = ₦${formatAmountWithCommas(
         totalBalanceAmount
       )}
     </td>
        <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
      <strong>Total Cost Price</strong> = ₦${formatAmountWithCommas(
        totalCostPrice
      )}
    </td>
        <td colspan="2" class="date-header py-1 px-2 mt-1 mb-1">
      <strong>Total Profit</strong> = ₦${formatAmountWithCommas(totalProfit)}
      </td>
     `;
}

export async function fetchAllProducts(shopId) {
  let products = [];

  //   console.log('Fetching products for shop:', shopId);

  try {
    const productInventoryData = await getProductInventory(shopId); // Fetch products

    if (productInventoryData) {
      // console.log(`Fetching product inventory:`, productInventoryData.data);
      products = products.concat(productInventoryData.data); // Add data to all products array
    }

    //  console.log('Products', products);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return products;
}

export async function fetchAllCategories(shopId) {
  let categories = [];

  try {
    const productCategoryData = await getProductCategories(shopId); // Fetch Categories

    if (productCategoryData) {
      // console.log(`Fetching product categories:`, productCategoryData.data);
      categories = categories.concat(productCategoryData.data); // Add data to all Categories array
    }

    //  console.log('Categories', categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return categories;
}

const autocompleteList = document.getElementById(
  isAdmin ? 'adminAutocompleteList' : 'autocompleteList'
);

export async function displayAllProducts(shopId) {
  const searchSellProdutItem = document.getElementById(
    isAdmin ? `adminSearchSellProdutItem_${shopId}` : 'searchSellProdutItem'
  );
  const autocompleteList = document.getElementById(
    isAdmin ? 'adminAutocompleteList' : 'autocompleteList'
  );
  const sellProductName = document.querySelector(
    isAdmin ? '.adminSellProductName' : '.sellProductName'
  );

  try {
    showGlobalLoader();

    allProducts = await fetchAllProducts(shopId); // Fetch and store all products

    //  console.log(`Total products fetched:`, allProducts);

    updateAutocompleteList(allProducts, shopId); // Populate the autocomplete dropdown with all products

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

        updateAutocompleteList(filteredProducts, shopId);

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

export async function displayAllCategories(shopId) {
  const sellProductCategorySection = document.querySelector(
    `.adminSellProductCategory-section_${shopId}`
  );

  const autocompleteList = document.getElementById(
    isAdmin ? 'adminAutocompleteList' : 'autocompleteList'
  );

  const searchSellProdutItem = document.getElementById(
    isAdmin ? `adminSearchSellProdutItem_${shopId}` : 'searchSellProdutItem'
  );
  const sellProductName = document.querySelector(
    isAdmin ? '.adminSellProductName' : '.sellProductName'
  );

  try {
    showGlobalLoader();

    // Clear old category buttons
    sellProductCategorySection.innerHTML = '';
    activeCategoryId = null; // Reset category filter

    allCategories = await fetchAllCategories(); // Fetch and store all Categories

    //  console.log(`Total Categories fetched:`, allCategories);

    const allBtn = document.createElement('button');
    allBtn.classList.add(`adminSellProductCategoryBtn`);
    allBtn.type = 'button';
    allBtn.textContent = 'All';
    allBtn.dataset.categoryId = 'all';

    allBtn.addEventListener('click', function () {
      console.log('Click reflected here');
      document
        .querySelectorAll('.adminSellProductCategoryBtn')
        .forEach((btn) => {
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

      updateAutocompleteList(filteredProducts, shopId);
    });

    sellProductCategorySection.appendChild(allBtn);

    allCategories.forEach((category) => {
      const categoryBtn = document.createElement('button');
      categoryBtn.classList.add('adminSellProductCategoryBtn');
      categoryBtn.type = 'button';
      categoryBtn.textContent = category.name;
      categoryBtn.dataset.categoryId = category.id;

      categoryBtn.addEventListener('click', function () {
        // Remove active class from all other buttons
        document
          .querySelectorAll('.adminSellProductCategoryBtn')
          .forEach((btn) => {
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

        updateAutocompleteList(filteredProducts, shopId);
      });

      sellProductCategorySection.appendChild(categoryBtn);
    });
  } catch (error) {
    console.error('Error displaying products:', error);
  } finally {
    hideGlobalLoader();
  }
}

function updateAutocompleteList(products, shopId) {
  const autocompleteList = document.getElementById(
    isAdmin ? 'adminAutocompleteList' : 'autocompleteList'
  );
  const productInput = document.getElementById(
    isAdmin ? `adminProductInput_${shopId}` : 'productInput'
  );

  autocompleteList.innerHTML = '';

  if (products.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'Item Not Found';
    listItem.classList.add('autocomplete-list-item');
    autocompleteList.appendChild(listItem);
  } else {
    products.forEach((product) => {
      // console.log(product);
      const listItem = document.createElement('li');
      // listItem.textContent = product.Product.name;
      // listItem.classList.add('autocomplete-list-item');
      listItem.innerHTML = `         
         <li class="autocomplete-list-item">
            <p>${product.Product.name}</p>
            <small>${product.Product.description}</span>
         </li>
         `;

      listItem.addEventListener('click', async function () {
        selectedProduct = product.Product; // Store selected product to later get the product ID

        // console.log(selectedProduct);

        productInput.value = product.Product.name;

        autocompleteList.style.display = 'none';

        const productSalesResponse = await getSalesByProduct(
          selectedProduct.id
        );

        if (!productSalesResponse) {
          hideGlobalLoader();
          showToast(
            'fail',
            `❎ ${
              productSalesResponse.message || 'Error Getting Sales By Product'
            }`
          );
          return;
        }

        const productSalesData = productSalesResponse.data;
        const productSalesList = productSalesData.sales;
        const productSalesSummary = productSalesData.summary;

        updateProductData(productSalesList, productSalesSummary, shopId);
      });
      autocompleteList.appendChild(listItem);
    });
  }
}

// Update Product Sales Report
export function updateProductData(
  productSalesList,
  productSalesSummary,
  shopId
) {
  const totalQty = document.getElementById(`totalQty_${shopId}`);
  const totalRev = document.getElementById(`totalRev_${shopId}`);
  const totalCostContainer = document.getElementById(`totalCost_${shopId}`);
  const totalProfitContainer = document.getElementById(`totalProfit_${shopId}`);
  const tableBody = document.querySelector(
    `#productSalesTable_${shopId} tbody`
  );

  if (!productSalesSummary) {
    console.error('productSalesSummary is undefined:', productSalesSummary);
    return;
  }

  // console.log(productSalesList);
  // console.log(productSalesSummary);
  const {
    productName,
    totalQuantitySold,
    totalRevenue,
    totalCost,
    totalProfit,
  } = productSalesSummary;

  totalQty.textContent = totalQuantitySold;
  totalRev.textContent = `₦${formatAmountWithCommas(totalRevenue)}`;
  totalCostContainer.textContent = `₦${formatAmountWithCommas(totalCost)}`;
  totalProfitContainer.textContent = `₦${formatAmountWithCommas(totalProfit)}`;

  if (tableBody) tableBody.innerHTML = '';

  if (!productSalesList.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="11" class="table-error-text">No Sales on this Product.</td>
      `;
    if (tableBody) tableBody.appendChild(emptyRow);
    return;
  }

  productSalesList.forEach((sale, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');

    const { id, quantity, unit_price, selling_price, business_day } = sale;

    const staffName = `${sale.Sale.Account.first_name} - ${sale.Sale.Account.last_name} `;
    const shopName = sale.Sale.Shop.shop_name;
    const customerName = sale.Sale.customer_name;
    const customerPhone = sale.Sale.customer_phone;
    const totalAmount = sale.Sale.total_amount;
    const amountPaid = sale.Sale.amount_paid;
    const balance = sale.Sale.balance;

    row.dataset.saleId = id;
    if (row)
      row.innerHTML = `
      <tr  class="table-body-row">
        <td  class="py-1">${index + 1}</td>
        <td  class="py-1">${business_day}</td>
        <td  class="py-1">${shopName}</td>
        <td  class="py-1">${staffName}</td>
        <td  class="py-1">${customerName}</td>
        <td  class="py-1">${quantity}</td>
        <td class="py-1">₦${formatAmountWithCommas(unit_price)}</td>
        <td class="py-1">₦${formatAmountWithCommas(selling_price)}</td>
        <td class="py-1">₦${formatAmountWithCommas(totalAmount)}</td>
        <td class="py-1">₦${formatAmountWithCommas(amountPaid)}</td>
        <td class="py-1">₦${formatAmountWithCommas(balance)}</td>
               <td class="py-1 soldItemDetailReport" data-sale-id="${id}"><i class="fa fa-eye"></i></td>
      </tr>
    `;

    row.addEventListener('click', async (e) => {
      updateSalesReceipt(e, row);
    });

    if (tableBody) tableBody.appendChild(row);
  });
}

export async function updateSalesReceipt(e, row) {
  e.preventDefault();
  showGlobalLoader();
  // Finally open the modal
  openSaleDetailsModal();
  const saleId = row.dataset.saleId;

  // Get Sales by ID
  try {
    showGlobalLoader();
    const saleDetails = await getSaleById(saleId);
    const shopDetails = JSON.parse(localStorage.getItem(shopKey)) || [];
    //  console.log('saleDetails when Row', saleDetails);

    if (!shopDetails) {
      console.log('No shopDetails');
      showToast('error', '❎ Cannot get Shop Details');
      closeModal();
      return;
    }

    if (!saleDetails || !saleDetails.data) {
      console.log('No saleDetails');
      showToast('error', '❎  Cannot get Sale Details');
      closeModal();
      return;
    }

    const {
      Account,
      SaleItems,
      Shop,
      receipt_number,
      customer_name,
      customer_phone,
      payment_method,

      total_amount,
      amount_paid,
      balance,
      status,
      business_day,
      sale_time,
    } = saleDetails.data;

    showGlobalLoader();
    const shopData = await fetchShopDetail(Shop.id);
    //  hideGlobalLoader

    // Populate sale summary

    // Top Part Below
    document.getElementById('soldDetailShop').textContent =
      Shop?.shop_name || 'N/A';
    document.getElementById('soldDetailShopAddress').textContent =
      shopData?.data?.location || 'N/A';

    document.getElementById('soldDetailReceiptNumber').textContent =
      receipt_number;
    document.getElementById('soldDetailCustomerName').textContent =
      `${customer_name} - ${customer_phone}` || 'N/A';
    document.getElementById('soldDetailStaffName').textContent =
      `${Account?.first_name} ${Account?.last_name}` || 'N/A';
    document.getElementById('soldDetailDate').textContent = new Date(
      sale_time
    ).toLocaleString('en-US', {
      hour12: true,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    // Bottom Part Below

    document.getElementById('soldDetailPaymentMethod').textContent =
      payment_method || 'N/A';

    document.getElementById(
      'soldDetailTotalAmount'
    ).textContent = `₦${formatAmountWithCommas(total_amount)}`;
    document.getElementById(
      'soldDetailPaidAmount'
    ).textContent = `₦${formatAmountWithCommas(amount_paid)}`;
    document.getElementById(
      'soldDetailBalanceAmount'
    ).textContent = `₦${formatAmountWithCommas(balance)}`;

    document.getElementById('soldDetailStatus').textContent =
      formatSaleStatus(status);

    // Sales Items - Middle Part Below
    const itemsTableBody = document.querySelector('.itemsTable tbody');
    itemsTableBody.innerHTML = ''; // clear previous rows

    SaleItems.forEach((item, index) => {
      const itemRow = document.createElement('tr');
      itemRow.classList.add('table-body-row');
      itemRow.innerHTML = `
             <td class="py-1">${item.Product.name}</td>
                           <td class="py-1">${item.quantity}</td>
                           <td class="py-1">₦${formatAmountWithCommas(
                             item.selling_price
                           )}</td>
                           <td class="py-1">${formatAmountWithCommas(
                             item.quantity * item.selling_price
                           )}</td>
             
                     `;
      itemsTableBody.appendChild(itemRow);
    });

    // Print & Download

    //   Print
    //   const printReceiptBtn =
    //     document.querySelector('.printReceiptBtn');

    //Keep this earlier Print Logic

    //            printReceiptBtn.addEventListener('click', () => {
    //              showBtnLoader(printReceiptBtn);
    //              const receiptContent =
    //                document.querySelector('.pdfHere').innerHTML;

    //              const printWindow = window.open('', '', 'width=300,height=500');
    //              printWindow.document.write(`
    //  <html>
    //    <head>
    //      <title>Print Receipt</title>
    //      <style>
    //        body { font-family: monospace; width: 58mm; font-size: 8px; padding: 5px; }
    //        .center { text-align: center; }
    //        .bold { font-weight: bold; }
    //        .line { border-top: 1px dashed #000; margin: 4px 0; }
    //        table { width: 100%; font-size: 12px; border-collapse: collapse; }
    //        td { padding: 2px 5px; }
    //        .footer { text-align: center; margin-top: 10px; }
    //      </style>
    //    </head>
    //    <body>${receiptContent}</body>
    //  </html>`);
    //              printWindow.document.close();
    //              printWindow.focus();
    //              printWindow.print();
    //              // printWindow.close();
    //              hideBtnLoader(printReceiptBtn);
    //            });

    const printReceiptBtn = document.querySelector('.printReceiptBtn');

    printReceiptBtn.onclick = () => {
      const container = document.getElementById('receiptPrintPDF');

      container.innerHTML = renderReceiptPrintHTML(
        saleDetails.data,
        shopData?.data
      );

      container.style.display = 'block'; // temporarily show

      // const receiptHeightPx = container.scrollHeight;
      const receiptHeightPx = container.getBoundingClientRect().height;
      const heightInMM = receiptHeightPx * 0.264583;
      // const adjustedHeight = Math.floor(heightInMM) - 4;

      // console.log(adjustedHeight);

      const opt = {
        margin: 0,
        filename: `receipt-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        pagebreak: { avoid: 'tr', mode: ['css', 'legacy'] },
        jsPDF: {
          unit: 'mm',
          format: [58, heightInMM], // height can be adjusted dynamically if needed
          orientation: 'portrait',
        },
      };

      html2pdf()
        .set(opt)
        .from(container)
        .save()
        .then(() => {
          container.style.display = 'none';
        });
    };

    //  printReceiptBtn.addEventListener('click', () => {
    //    showBtnLoader(printReceiptBtn);
    //    printReceiptBtn.disabled = true; // Disable the button

    //    const receiptContent = document.querySelector('.pdfHere').innerHTML;

    //    const printWindow = window.open('', '', 'width=300,height=500');
    //    printWindow?.document.write(`
    //                 <html>
    //                     <head>
    //                         <title>Print Receipt</title>
    //                         <style>
    //                             body { font-family: monospace; width: 58mm; font-size: 8px; padding: 5px; }
    //                             .center { text-align: center; }
    //                             .bold { font-weight: bold; }
    //                             .line { border-top: 1px dashed #000; margin: 4px 0; }
    //                             table { width: 100%; font-size: 12px; border-collapse: collapse; }
    //                             td { padding: 2px 5px; }
    //                             .footer { text-align: center; margin-top: 10px; }
    //                         </style>
    //                     </head>
    //                     <body onload="window.print()">
    //                         ${receiptContent}
    //                         <script>
    //                             window.onafterprint = () => {
    //                                 window.close();
    //                             };
    //                         </script>
    //                     </body>
    //                 </html>
    //             `);

    //    printWindow?.document.close();
    //    printWindow?.focus();

    //    const checkClosedInterval = setInterval(() => {
    //      if (printWindow?.closed) {
    //        clearInterval(checkClosedInterval);
    //        hideBtnLoader(printReceiptBtn);
    //        printReceiptBtn.disabled = false; // Re-enable the button
    //      }
    //    }, 500);
    //  });

    //   Download;

    const generatePdfBtn = document.querySelector('.generatePdfBtn');

    generatePdfBtn.onclick = () => {
      showBtnLoader(generatePdfBtn);
      const receiptElement = document.querySelector('.pdfHere');
      if (!receiptElement) {
        showToast('fail', '❎ Receipt content not found.');
        return;
      }

      const opt = {
        margin: 10,
        filename: `receipt-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: 'mm',
          format: 'a4', // adjust height based on content
          orientation: 'portrait',
        },
      };

      html2pdf().set(opt).from(receiptElement).save();
      hideBtnLoader(generatePdfBtn);
    };

    hideGlobalLoader();
    //   openSaleDetailsModal();
  } catch (err) {
    hideGlobalLoader();
    console.error('Error fetching sale details:', err.message);
    showToast('fail', `❎ Failed to load sale details`);
    closeModal();
    clearReceiptDiv();
  } finally {
    hideGlobalLoader();
  }
}

// Display individual Sales Report

export function renderReceiptPrintHTML(saleDetails, shopDetails) {
  console.log('shopDetails', shopDetails);
  console.log('saleDetails', saleDetails);

  return `
    <div style="font-family: monospace; font-size: 10px; width: 58mm; padding: 5px;">
      <h3 style="text-align: center;">${shopDetails?.shop_name || ''}</h3>
      <p style="text-align: center;" class="mb-1">${
        shopDetails?.location || ''
      }</p>
      <hr class="mb-1" />
      <p>Receipt: ${saleDetails.receipt_number}</p>
      <p>Customer: ${saleDetails.customer_name} - ${
    saleDetails.customer_phone
  }</p>
      <p>Staff: ${saleDetails.Account?.first_name} ${
    saleDetails.Account?.last_name
  }</p>
      <p  class="mb-1" >Date: ${new Date(saleDetails.sale_time).toLocaleString(
        'en-US',
        {
          hour12: true,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        }
      )}</p>
      <hr />
<table class="mb-1" style="width: 100%; table-layout: fixed; word-wrap: break-word; font-size: 10px;">
  <thead  class="text-align: left>
    <tr class="text-align: left">
      <th style="width: 40%; text-align: left;">Item</th>
      <th style="width: 10%; text-align: left;">Qty</th>
      <th style="width: 25%; text-align: left;">Price</th>
      <th style="width: 30%; text-align: left;">Total</th>
    </tr>
  </thead>
  <tbody>
    ${saleDetails.SaleItems.map(
      (item) => `
        <tr>
          <td style="word-break: break-word;">${item.Product.name}</td>
          <td>${item.quantity}</td>
          <td><span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
            item.selling_price
          )}</td>
          <td><span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
            item.quantity * item.selling_price
          )}</td>
        </tr>
      `
    ).join('')}
  </tbody>
</table>
      <hr />
      <p>Total:<span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
        saleDetails.total_amount
      )}</p>
      <p>Paid: <span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
        saleDetails.amount_paid
      )}</p>
      <p>Balance:<span style="text-decoration:line-through;">N</span>${formatAmountWithCommas(
        saleDetails.balance
      )}</p>
      <p>Payment Method:${saleDetails.payment_method}</p>
      <p>Status: ${formatSaleStatus(saleDetails.status)}</p>
      <hr />
      <p  class="mb-1" style="text-align: center;">THANK YOU FOR SHOPPING</p>
    </div>
  `;
}

export function updateStaffSalesData(
  staffSalesList,
  staffSalesSummary,
  shopId
) {
  const staffTotalSale = document.getElementById(
    `staffTotal-sales_admin_${shopId}`
  );
  const staffTotalAmount = document.getElementById(
    `staffTotal-amount_admin_${shopId}`
  );
  const staffTotalPaid = document.getElementById(
    `staffTotal-paid_admin_${shopId}`
  );
  const staffTotalBalance = document.getElementById(
    `staffTotal-balance_admin_${shopId}`
  );
  const staffTotalCost = document.getElementById(
    `staffTotal-cost_admin_${shopId}`
  );
  const staffTotalProfit = document.getElementById(
    `staffTotal-profit_admin_${shopId}`
  );

  const tableBody = document.querySelector(
    `#staffSalesTable_admin_${shopId} tbody`
  );

  if (!staffSalesSummary || !staffSalesList) {
    console.error('staffSalesSummary/staffSalesList is undefined:');
    return;
  }

  const { totalSales, totalAmount, totalPaid, totalBalance } =
    staffSalesSummary;

  const totalCostPrice = staffSalesList.reduce((sum, sale) => {
    return (
      sum +
      sale.SaleItems.reduce((itemSum, item) => {
        return itemSum + (item.unit_price || 0) * (item.quantity || 0);
      }, 0)
    );
  }, 0);

  const totalSoldPrice = staffSalesList.reduce((sum, sale) => {
    return (
      sum +
      sale.SaleItems.reduce((itemSum, item) => {
        return itemSum + (item.selling_price || 0) * (item.quantity || 0);
      }, 0)
    );
  }, 0);

  const totalProfit = totalSoldPrice - totalCostPrice;

  staffTotalSale.textContent = totalSales;
  staffTotalAmount.textContent = `₦${formatAmountWithCommas(totalAmount)}`;
  staffTotalPaid.textContent = `₦${formatAmountWithCommas(totalPaid)}`;
  staffTotalBalance.textContent = `₦${formatAmountWithCommas(totalBalance)}`;
  staffTotalCost.textContent = `₦${formatAmountWithCommas(totalCostPrice)}`;
  staffTotalProfit.textContent = `₦${formatAmountWithCommas(totalProfit)}`;

  if (tableBody) tableBody.innerHTML = '';

  if (!staffSalesList.length) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
        <td colspan="11" class="table-error-text">No Sales for this Staff.</td>
      `;
    if (tableBody) tableBody.appendChild(emptyRow);
    return;
  }

  staffSalesList.forEach((sale, index) => {
    const row = document.createElement('tr');
    row.classList.add('table-body-row');
    row.dataset.saleId = sale.id;

    const {
      id,
      business_day,
      customer_name,
      total_amount,
      amount_paid,
      balance,
      status,
    } = sale;

    const shopName = sale.Shop.shop_name;
    const salesItems = sale.SaleItems;

    //  console.log('salesItems', salesItems);

    const productNames = salesItems.map(
      (item) => item.Product?.name || 'Unknown Product'
    );

    const truncatedProductNames = truncateProductNames(productNames, {
      maxItems: 3,
      maxLength: 50,
      separator: ', ',
    });

    const productUnitPrice = salesItems.map(
      (item) => item?.unit_price || 'Unknown Price'
    );

    const truncatedProductUnitPrice = truncateProductUnitPrice(
      productUnitPrice,
      {
        maxItems: 3,
        maxLength: 50,
        separator: ', ',
      }
    );

    if (row)
      row.innerHTML = `
      <tr  class="table-body-row">
        <td  class="py-1">${index + 1}</td>
        <td  class="py-1">${business_day}</td>
        <td  class="py-1">${shopName}</td>
        <td  class="py-1">${truncatedProductNames}</td>
        <td  class="py-1">${formatAmountWithCommas(
          truncatedProductUnitPrice
        )}</td>
        <td class="py-1">₦${formatAmountWithCommas(amount_paid)}</td>
        <td class="py-1">₦${formatAmountWithCommas(total_amount)}</td>
        <td class="py-1">₦${formatAmountWithCommas(balance)}</td>
        <td class="py-1">${formatSaleStatus(status)}</td>
        <td class="py-1 soldItemDetailReport" data-sale-id="${id}"><i class="fa fa-eye"></i></td>
      </tr>
    `;

    row.addEventListener('click', async (e) => {
      updateSalesReceipt(e, row);
    });

    if (tableBody) tableBody.appendChild(row);
  });
}
