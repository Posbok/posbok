import { buildInventoryCategoryButtonsHtml } from './goods';

export function getAdminInventoryLogHtml(shop) {
  return `
     
         <!-- Inventory Log Table HTML starts Here -->
     
   <div id="shop-log-report-${shop.id}" class="reports card" data-loaded="false">

         <div class="reports">
            <div class="reports-method">
               <h2 class="heading-text mb-2">
                  Inventory Log
               </h2>

               <h2 class="filter-heading heading-subtext mb-2">Filter Inventory Log </h2>

               <div class="filter-section mb-2">

                  <div class="pos-method-form_input">
                     <label for="inventoryLogDateFrom_admin_${shop.id}">Start Date:</label>

                     <input type="date" id="inventoryLogDateFrom_admin_${shop.id}">
                  </div>

                  <div class="pos-method-form_input">
                     <label for="inventoryLogDateTo_admin_${shop.id}">End Date:</label>

                     <input type="date" id="inventoryLogDateTo_admin_${shop.id}">
                  </div>

                  <div class="filter-buttons">
                     <button id="applyInventoryLogFiltersBtn_admin_${shop.id}" class="hero-btn-dark">Apply
                        Filters</button>
                     <button id="resetInventoryLogFiltersBtn_${shop.id}" class="hero-btn-outline">Reset</button>
                  </div>

               </div>

               <div class="transaction-breakdown">


                  <div class="reports-table-container mt-4">
                     <table class="reports-table inventoryLog_admin_${shop.id}">
                        <thead>
                           <tr class="table-header-row">
                              <th class="py-1">S/N</th>
                              <th class="py-1">Item Name</th>
                              <th class="py-1">Quantity</th>
                              <th class="py-1">Selling Price</th>
                              <th class="py-1">Action Type</th>
                              <th class="py-1">Performed By</th>
                              <th class="py-1">Date/Time</th>
                           </tr>
                        </thead>

                        <tbody id="inventoryLogBody-${shop.id}">

                        </tbody>

                     </table>
                  </div>

               </div>

            </div>
         </div>
      </div>
         <!-- Inventory Log Table HTML Ends Here -->
   `;
}

export function getAdminInventoryTableHtml(shop, allCategories) {
  const categoryButtonsHtml = buildInventoryCategoryButtonsHtml(
    shop.id,
    allCategories,
  );

  return `
         <div id="shop-report-${shop.id}" class="reports card" data-loaded="false">
         <div class="reports ">
            <div class="reports-method">
               <h2 class="heading-text mb-2">
                  Shop inventory
               </h2>

                           <div class="search-section_${shop.id} mb-4">

                  <div class="inventory-method-form_input ml-1 mr-1">
                     <label for="searchProdutInventory_${shop.id}">Search Products:</label>
                     <input type="search" id="searchProdutInventory_${shop.id}" class="searchProductInput"
                        placeholder="Search Product Name or Description ">
                  </div>
               </div>

             <div class="inventoryCategory-section" id="inventoryCategory-${shop.id}">
        ${categoryButtonsHtml}   <!-- ✅ injected directly -->
      </div>

         </div>

               <div>
                  <h2 class="heading-subtext ">Total Products: <span class="totalProductsCount_${shop.id}">0</span></h2>

                  <h2 class="heading-subtext ">Total Products Cost: <span
                        class="totalProductsCost_${shop.id}">0</span></h2>
                        
                        <h2 class="heading-subtext ">Total Estimated Profits: <span
                        class="totalProductsProfits_${shop.id}">0</span></h2>
                        
                        <h2 class="heading-subtext ">Total Inventory Worth: <span
                              class="totalProductsWorth_${shop.id}">0</span></h2>

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
                           <th class="py-1">SKU</th>
                           <th class="py-1">Barcode</th>
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
         </div>

   `;
}
