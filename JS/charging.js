// const deviceType = document.getElementById('deviceType');
// const deviceOwnerName = document.getElementById('deviceOwnerName');
// const deviceId = document.getElementById('deviceId');
// const alternativeNumber = document.getElementById('alternativeNumber');
// const deviceChargeFee = document.getElementById('deviceChargeFee');
// const deviceStatus = document.getElementById('deviceStatus');

// const chargingForm = document.querySelector('.charging-method-form');

// if (chargingForm) {
//   chargingForm.addEventListener('submit', function (e) {
//     e.preventDefault();
//     handleChargingFormSubmit();

//     deviceType.value = 'Phone';
//     deviceOwnerName.value = '';
//     deviceId.value = '';
//     alternativeNumber.value = '';
//     deviceChargeFee.value = '';
//     deviceStatus.value = 'Collected';
//   });
// }

// function handleChargingFormSubmit() {
//   let selectedDeviceType = deviceType.value;
//   let deviceOwnerNameInput = deviceOwnerName.value;
//   let deviceIdInput = deviceId.value;
//   let alternativeNumberInput = alternativeNumber.value;
//   let deviceChargeFeeInput = Number(deviceChargeFee.value);
//   let selectedDeviceStatus = deviceStatus.value;
//   let id = Math.random();

//   const chargeFormData = {
//     selectedDeviceType,
//     deviceOwnerNameInput,
//     deviceIdInput,
//     alternativeNumberInput,
//     deviceChargeFeeInput,
//     selectedDeviceStatus,
//     id,
//   };

//   const storedData = JSON.parse(localStorage.getItem('chargeFormData')) || [];

//   const allData = [chargeFormData, ...storedData];

//   localStorage.setItem('chargeFormData', JSON.stringify(allData));

//   return chargingForm;
// }

staffSelectedReport.addEventListener('change', async function (e) {
  const selectedValue = e.target.value;
  console.log('Selected report:', selectedValue);

  const staffPosReportDiv = document.querySelector(`.staffPosReportDiv`);
  const staffAdminWithdrawalsSection = document.querySelector(
    `.staffAdminWithdrawalReportDiv`
  );

  const staffSalesTransactiionSection =
    document.querySelector(`.staffSalesReportDiv`);

  //  console.log(staffPosReportDiv);
  //  console.log(staffAdminWithdrawalsSection);
  //  console.log(staffSalesTransactiionSection);

  if (staffPosReportDiv) staffPosReportDiv.classList.add('hidden');
  if (staffAdminWithdrawalsSection)
    staffAdminWithdrawalsSection.classList.add('hidden');
  if (staffSalesTransactiionSection)
    staffSalesTransactiionSection.classList.add('hidden');

  // POS Loadmore Button
  const loadMoreButton = document.getElementById('loadMoreButton_staff');
  // Sales loadmore Button
  const loadMoreSalesButton = document.getElementById(
    'loadMoreSalesButton_staff'
  );

  // POS Transactions
  if (selectedValue === `pos_report`) {
    if (staffPosReportDiv) staffPosReportDiv.classList.remove('hidden');
    if (staffAdminWithdrawalsSection)
      staffAdminWithdrawalsSection.classList.remove('hidden');

    if (staffSalesTransactiionSection)
      staffSalesTransactiionSection.classList.add('hidden');
    if (
      servicePermission === 'POS_TRANSACTIONS' ||
      servicePermission === 'BOTH'
    ) {
      // const staffPosReportDiv = document.querySelector('.staffPosReportDiv');
      //   staffPosReportDiv.style.display = 'block';
      //   staffAdminWithdrawalsSection.style.display = 'block';

      // Pos Filer Logic
      document
        .getElementById('applyFiltersBtn_staff')
        ?.addEventListener('click', () => {
          const filters = getFilters('staff');
          renderStaffPosTable(1, pageSize, filters, 'staff');
        });

      document
        .getElementById('resetFiltersBtn_staff')
        ?.addEventListener('click', () => {
          const role = 'staff';
          resetFilters(role);
          const filters = getFilters(role);
          const tableSelector = '.posTableDisplay_staff tbody';
          renderStaffPosTable(1, pageSize, filters, 'staff');
        });

      loadMoreButton.style.display = 'none';

      loadMoreButton.addEventListener('click', () => {
        const role = 'staff';
        currentPage += 1;
        const filters = getFilters(role);

        //  const tableBodyId = '.posTableDisplay_staff tbody';

        renderStaffPosTable(currentPage, pageSize, filters, role);
      });

      async function renderStaffPosTable(
        page = 1,
        pageSize,
        filters = {},
        role = 'staff'
      ) {
        const posTableBody = document.querySelector(
          `.posTableDisplay_${role} tbody`
        );

        if (!posTableBody) {
          console.error('Error: Table body not found');
          return;
        }

        try {
          let loadingRow = document.querySelector('.loading-row');
          if (!loadingRow) {
            loadingRow = document.createElement('tr');
            loadingRow.className = 'loading-row';
            loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading transactions...</td>`;
            posTableBody.appendChild(loadingRow);
          }

          loadMoreButton.style.display = 'none';

          // Build query with filters
          const queryParams = new URLSearchParams({
            shopId: shopId,
            page,
            limit: pageSize,
          });

          if (filters.startDate)
            queryParams.append('startDate', filters.startDate);
          if (filters.endDate) queryParams.append('endDate', filters.endDate);
          if (filters.type) queryParams.append('type', filters.type);
          if (filters.status) queryParams.append('status', filters.status);

          const result = await getPosTransactions({
            shopId,
            page,
            limit: pageSize,
            filters,
          });

          //   console.log(result);

          if (!result) throw new Error(result.message || 'Failed to fetch');

          const posTransactions = result.data.transactions;
          totalPages = result.data.totalPages;
          totalItems = result.data.totalItems;
          currentPage = result.data.currentPage;

          // Only reset array if starting from page 1
          if (page === 1) {
            allPosTransactions = [];
          }

          if (posTransactions.length === 0 && currentPage === 1) {
            posTableBody.innerHTML =
              '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Transactions Available.</td></tr>';
            return;
          }

          posTransactions.forEach((transaction) => {
            if (!allPosTransactions.some((t) => t.id === transaction.id)) {
              allPosTransactions.push(transaction);
            }
          });

          // Clear the table body and render all accumulated transactions
          posTableBody.innerHTML = '';

          const groupedByDate = {};

          allPosTransactions.forEach((tx) => {
            const dateObj = new Date(tx.business_day);
            const dateKey = dateObj.toLocaleDateString('en-UK', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }); // "May 11, 2025"

            if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
            groupedByDate[dateKey].push(tx);
          });

          //  console.log(groupedByDate);

          Object.entries(groupedByDate).forEach(([date, transactions]) => {
            let serialNumber = 1;
            // Insert group row (header for the date)
            const groupRow = document.createElement('tr');
            groupRow.className = 'date-group-row table-body-row ';

            groupRow.innerHTML = `
      <td colspan="12" class="date-header py-1 mt-1 mb-1">
        <strong>${date}</strong>     </td>

     `;
            posTableBody.appendChild(groupRow);

            //       groupRow.innerHTML = `
            //     <td colspan="11" class="date-header py-1 mt-1 mb-1">
            //       <strong>${date}</strong> — Total: ₦${formatAmountWithCommas(dailyTotal)}
            //     </td>
            //   `;

            console.log(transactions);

            transactions.forEach((posTransaction) => {
              // console.log(posTransaction);
              const {
                transaction_type,
                amount,
                chargePaymentMethod,
                customer_name,
                customer_phone,
                payment_method,
                status,
                receipt_id,
                remarks,
                business_day,
                transaction_time,
                pos_charge_amount,
                transfer_fee,
                tax_fee,
                machine_fee,
                transaction_ref,
                deleted_at,
                deleted_by,
              } = posTransaction;

              const row = document.createElement('tr');
              row.classList.add(
                `${
                  deleted_at || deleted_by
                    ? 'deletedTransationRow'
                    : 'posTransactionRow'
                }`
              );
              row.classList.add('table-body-row');
              row.innerHTML = `
    <td class="py-1">${serialNumber++}.</td>
               <td class="py-1">${business_day}</td>
               <td class="py-1 posTransTypeReport">${formatTransactionType(
                 transaction_type
               )}</td>
              <td class="py-1 posPaymentMethodReport">${payment_method}</td>
               <td class="py-1 posCustomerInfo">${`${
                 customer_phone === '' ? '-' : customer_phone
               }`}</td>
               <td class="py-1 posAmountReport">&#x20A6;${formatAmountWithCommas(
                 amount
               )}</td>
               <td class="py-1 posChargesReport">&#x20A6;${formatAmountWithCommas(
                 pos_charge_amount
               )}</td>
               <td class="py-1 posFeePaymentMethodReport">${chargePaymentMethod}</td>
               <td class="py-1 posMachineFeeReport">&#x20A6;${formatAmountWithCommas(
                 machine_fee
               )}</td>
               <td class="py-1 posTransferFeeReport">&#x20A6;${formatAmountWithCommas(
                 transfer_fee
               )}</td>
               <td class="py-1 posTaxFeeReport">&#x20A6;${formatAmountWithCommas(
                 tax_fee
               )}</td>
               <td class="py-1 posPaymentMethodRef">${transaction_ref}</td> 
               <td class="py-1 posPaymentMethodRemark">${remarks}</td>
               <td class="py-1 posPaymentMethodReceiptId">${receipt_id}</td>
     `;
              posTableBody.appendChild(row);
            });

            // Insert total row (Footer for Daily Totals))
            const totalRow = document.createElement('tr');
            totalRow.className = 'total-row table-body-row ';

            // const dailyTotal = transactions.reduce(
            //   (sum, t) => sum + Number(t.amount),
            //   0
            // );

            // Update total amounts for each day startinf wth partial totals and ending the day with final Total.
            updateTotalPosAmounts(transactions, totalRow, date);

            posTableBody.appendChild(totalRow);
          });

          // Handle Load More button visibility
          if (currentPage >= totalPages) {
            loadMoreButton.style.display = 'none';
          } else {
            loadMoreButton.style.display = 'block';
          }
        } catch (error) {
          console.error('Error rendering transactions:', error);
          posTableBody.innerHTML =
            '<tr><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
        }
      }

      async function renderStaffAdminWithdrawalTable(
        page = 1,
        pageSize,
        filters = {},
        role = 'staff'
      ) {
        const adminWithdrawalsTableBody = document.querySelector(
          `.adminWithdrawalTableDisplay_${role} tbody`
        );

        if (!adminWithdrawalsTableBody) {
          console.error('Admin Withdrawal Error: Table body not found');
          return;
        }

        try {
          let loadingRow = document.querySelector('.loading-row');
          if (!loadingRow) {
            loadingRow = document.createElement('tr');
            loadingRow.className = 'loading-row';
            loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading transactions...</td>`;
            adminWithdrawalsTableBody.appendChild(loadingRow);
          }

          loadMoreButton.style.display = 'none';

          // Build query with filters
          const queryParams = new URLSearchParams({
            shopId: shopId,
            page,
            limit: pageSize,
          });

          if (filters.startDate)
            queryParams.append('startDate', filters.startDate);
          if (filters.endDate) queryParams.append('endDate', filters.endDate);
          if (filters.type) queryParams.append('type', filters.type);
          if (filters.status) queryParams.append('status', filters.status);

          const result = await getAdminWithdrawals({
            shopId,
            page,
            filters,
          });

          console.log('getAdminWithdrawals result', result);

          if (!result)
            throw new Error(
              result.message || 'Failed to fetch Admin Withdrawals'
            );

          const adminWithdrawals = result.data.withdrawals;
          totalPages = result.data.pagination.totalPages;
          totalItems = result.data.pagination.totalItems;
          currentPage = result.data.pagination.currentPage;
          itemsPerPage = result.data.pagination.itemsPerPage;

          // Only reset array if starting from page 1
          if (page === 1) {
            allAdminWithdrawals = [];
          }

          if (adminWithdrawals.length === 0 && currentPage === 1) {
            adminWithdrawalsTableBody.innerHTML =
              '<tr class="loading-row"><td colspan="12" class="table-error-text ">No Admin Withdrawals Data Available.</td></tr>';
            return;
          }

          adminWithdrawals.forEach((transaction) => {
            if (!allAdminWithdrawals.some((t) => t.id === transaction.id)) {
              allAdminWithdrawals.push(transaction);
            }
          });

          // Clear the table body and render all accumulated transactions
          adminWithdrawalsTableBody.innerHTML = '';

          allAdminWithdrawals.forEach((posTransaction, index) => {
            //  console.log(posTransaction);
            const {
              business_id,
              shop_id,
              withdrawal_source,
              amount,
              transfer_fee,
              business_day,
              created_by,
              created_at,
              creator,
            } = posTransaction;

            const creatorName = `${creator.first_name} ${creator.last_name}`;

            const row = document.createElement('tr');
            row.classList.add('table-body-row');

            row.innerHTML = `
                <td class="py-1">${index + 1}</td>
                <td class="py-1">${creatorName}</td>
                <td class="py-1">${formatAdminWithdrawalType(
                  withdrawal_source
                )}</td>
                <td class="py-1">₦${formatAmountWithCommas(amount)}</td>
                <td class="py-1">${business_day}</td>
                <td class="py-1">${formatDateTimeReadable(created_at)}</td>
                        
             `;

            adminWithdrawalsTableBody.appendChild(row);
          });

          // Handle Load More button visibility
          if (currentPage >= totalPages) {
            loadMoreButton.style.display = 'none';
          } else {
            loadMoreButton.style.display = 'block';
          }
        } catch (error) {
          console.error('Error rendering transactions:', error);
          adminWithdrawalsTableBody.innerHTML =
            '<tr><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
        }
      }

      renderStaffAdminWithdrawalTable();
      renderStaffPosTable();
    }
  }

  // Sales Transactions
  if (selectedValue === `sales_report`) {
    if (staffSalesTransactiionSection)
      staffSalesTransactiionSection.classList.remove('hidden');

    if (staffPosReportDiv) staffPosReportDiv.classList.add('hidden');
    if (staffAdminWithdrawalsSection)
      staffAdminWithdrawalsSection.classList.add('hidden');

    if (
      servicePermission === 'INVENTORY_SALES' ||
      servicePermission === 'BOTH'
    ) {
      const staffSalesReportDiv = document.querySelector(
        '.staffSalesReportDiv'
      );

      //   staffSalesReportDiv.style.display = 'block';

      //Sales Filter logic
      document
        .getElementById('applySalesFiltersBtn_staff')
        ?.addEventListener('click', () => {
          const filters = getSalesFilters('staff');
          renderStaffSalesTable(1, pageSize, filters, 'staff');
          console.log('filters:', filters);
        });

      document
        .getElementById('resetSalesFiltersBtn_staff')
        ?.addEventListener('click', () => {
          const role = 'staff';
          resetSalesFilters(role);
          const filters = getSalesFilters(role);
          const tableSelector = '.posTableDisplay_staff tbody';
          renderStaffSalesTable(1, pageSize, filters, 'staff');
        });

      loadMoreSalesButton.style.display = 'none';

      loadMoreSalesButton.addEventListener('click', () => {
        const role = 'staff';
        currentPage += 1;
        const filters = getSalesFilters(role);

        //  const tableBodyId = '.posTableDisplay_staff tbody';

        renderStaffSalesTable(currentPage, pageSize, filters, role);
      });

      async function renderStaffSalesTable(
        page = 1,
        pageSize,
        filters = {},
        role = 'staff'
      ) {
        //  console.log('🧪 Applied Filters:', filters);

        updatePartialPaymentForm(renderStaffSalesTable, [
          1,
          pageSize,
          filters,
          'staff',
        ]);

        const salesTableBody = document.querySelector(
          `.soldTableDisplay_${role} tbody`
        );

        if (!salesTableBody) {
          console.error('Error: Table body not found');
          return;
        }

        try {
          let loadingRow = document.querySelector('.loading-row');
          if (!loadingRow) {
            loadingRow = document.createElement('tr');
            loadingRow.className = 'loading-row';
            loadingRow.innerHTML = `<td colspan="11" class="table-loading-text">Loading transactions...</td>`;
            salesTableBody.appendChild(loadingRow);
          }

          loadMoreButton.style.display = 'none';

          // Build query with filters
          // const queryParams = new URLSearchParams({
          //   shopId: shopId,
          //   page,
          //   limit: pageSize,
          // });

          // if (filters.startDate) queryParams.append('startDate', filters.startDate);
          // if (filters.endDate) queryParams.append('endDate', filters.endDate);
          // if (filters.paymentMethod)
          //   queryParams.append('paymentMethod', filters.paymentMethod);
          // if (filters.status) queryParams.append('status', filters.status);

          const result = await getAllSales({
            shopId,
            page,
            limit: pageSize,
            filters,
          });

          //  console.log(result);

          if (!result) throw new Error(result.message || 'Failed to fetch');

          const salesReports = result.data.sales;
          totalPages = result.data.totalPages;
          totalItems = result.data.totalItems;
          currentPage = result.data.currentPage;

          // Only reset array if starting from page 1
          if (page === 1) {
            allSalesReport = [];
          }

          if (salesReports.length === 0 && currentPage === 1) {
            salesTableBody.innerHTML =
              '<tr class="loading-row"><td colspan="11" class="table-error-text ">No Sales Report Available.</td></tr>';
            return;
          }

          salesReports.forEach((sale) => {
            if (!allSalesReport.some((s) => s.id === sale.id)) {
              allSalesReport.push(sale);
            }
          });

          // Clear the table body and render all accumulated sales
          salesTableBody.innerHTML = '';

          const groupedByDate = {};

          //   console.log(allSalesReport);
          // --- SALES ITEM FETCH & TRUNCATE: Start ---
          // Prepare an array of promises for fetching sale details for *all* sales in allSalesReport
          const salesWithDetailsPromises = allSalesReport.map(
            async (saleSummary) => {
              try {
                const saleDetailsResult = await getSaleById(saleSummary.id);
                if (saleDetailsResult && saleDetailsResult.success) {
                  return {
                    ...saleSummary,
                    SaleItems: saleDetailsResult.data.SaleItems,
                  };
                }
                return { ...saleSummary, SaleItems: [] }; // Return summary with empty SaleItems if fetch fails
              } catch (detailError) {
                console.error(
                  `Error fetching details for sale ID ${saleSummary.id}:`,
                  detailError
                );
                return { ...saleSummary, SaleItems: [] }; // Handle error, return empty SaleItems
              }
            }
          );

          // Wait for all sale details to be fetched in parallel
          const enrichedSalesTransactions = await Promise.all(
            salesWithDetailsPromises
          );

          // Now, iterate over the enriched data to group by date and render
          enrichedSalesTransactions.forEach((sl) => {
            const dateObj = new Date(sl.business_day);
            const dateKey = dateObj.toLocaleDateString('en-UK', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
            groupedByDate[dateKey].push(sl);
          });
          // --- SALES ITEM FETCH & TRUNCATE: End ---

          //  console.log(groupedByDate);

          Object.entries(groupedByDate).forEach(([date, sales]) => {
            let serialNumber = 1;
            // Insert group row (header for the date)
            const groupRow = document.createElement('tr');
            groupRow.className = 'date-group-row table-body-row ';

            groupRow.innerHTML = `
      <td colspan="11" class="date-header py-1 mt-1 mb-1">
        <strong>${date}</strong>     </td>

     `;
            salesTableBody.appendChild(groupRow);

            //       groupRow.innerHTML = `
            //     <td colspan="11" class="date-header py-1 mt-1 mb-1">
            //       <strong>${date}</strong> — Total: ₦${formatAmountWithCommas(dailyTotal)}
            //     </td>
            //   `;

            sales.forEach((salesTransaction) => {
              const {
                id,
                receipt_number,
                amount_paid,
                total_amount,
                balance,
                machine_fee,
                tax_fee,
                customer_name,
                customer_phone,
                payment_method,
                business_day,
                status,
                SaleItems,
              } = salesTransaction;

              const { first_name, last_name } = salesTransaction.Account;

              // --- Truncate Item Names ---
              const productNames = SaleItems.map(
                (item) => item.Product?.name || 'Unknown Product'
              ); // Added null check for Product.name
              const truncatedProductNames = truncateProductNames(productNames, {
                maxItems: 3,
                maxLength: 50,
                separator: ', ',
              });

              const row = document.createElement('tr');
              row.classList.add('table-body-row');

              row.dataset.saleId = id; // Store sale ID for detail view
              row.innerHTML = `
                <td class="py-1">${serialNumber++}.</td>
               <td class="py-1 soldItemReceiptReport">${receipt_number}</td>
               <td class="py-1 soldItemNameReport">${truncatedProductNames}</td>
                <td class="py-1 soldItemStaffNameReport">${first_name} ${last_name}</td>
                 <td class="py-1 soldItemTotalAmountReport">&#x20A6;${formatAmountWithCommas(
                   total_amount
                 )}</td>
                 <td class="py-1 soldItemPaidAmountReport">&#x20A6;${formatAmountWithCommas(
                   amount_paid
                 )}</td>
                  <td class="py-1 soldItemBalanceAmountReport">&#x20A6;${formatAmountWithCommas(
                    balance
                  )}</td>
                  <td class="py-1 soldItemDateReport">${payment_method}</td>
                   <td class="py-1 soldItemMachineFeeAmountReport">&#x20A6;${formatAmountWithCommas(
                     machine_fee
                   )}</td>
                   <td class="py-1 soldItemTaxFeeAmountReport">&#x20A6;${formatAmountWithCommas(
                     tax_fee
                   )}</td>
                  <td class="py-1 soldItemDateReport">${business_day}</td>
                   <td class="py-1 soldItemStatusReport">${formatSaleStatus(
                     status
                   )}</td>
                    <td class="py-1 soldItemDetailReport" data-sale-id="${id}"><i class="fa fa-eye"></i></td>
     `;

              row.addEventListener('click', async (e) => {
                updateSalesReceipt(e, row);
              });

              salesTableBody.appendChild(row);
            });

            // Insert total row (Footer for Daily Totals))
            const totalSalesRow = document.createElement('tr');
            totalSalesRow.className = 'totalSales-row table-body-row ';

            // const dailyTotal = transactions.reduce(
            //   (sum, t) => sum + Number(t.amount),
            //   0
            // );

            // Update total amounts for each day startinf wth partial totals and ending the day with final Total.
            updateTotalSalesAmounts(sales, totalSalesRow, date);

            salesTableBody.appendChild(totalSalesRow);
          });

          // Handle Load More button visibility
          if (currentPage >= totalPages) {
            loadMoreSalesButton.style.display = 'none';
          } else {
            loadMoreSalesButton.style.display = 'block';
          }
        } catch (error) {
          console.error('Error rendering transactions:', error);
          salesTableBody.innerHTML =
            '<tr><td colspan="6" class="table-error-text">Error loading transactions.</td></tr>';
        }
      }

      renderStaffSalesTable();
    }
  }
});
