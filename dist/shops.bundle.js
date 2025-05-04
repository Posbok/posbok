/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./JS/shops.js":
/*!*********************!*\
  !*** ./JS/shops.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   populateShopsTable: () => (/* binding */ populateShopsTable)\n/* harmony export */ });\nfunction populateShopsTable(shopData = []) {\n  const tbody = document.querySelector('.shops-table tbody');\n  const loadingRow = document.querySelector('.loading-row');\n\n  // Remove static rows and loading\n\n  if (tbody) tbody.innerHTML = '';\n  if (!shopData.length) {\n    const emptyRow = document.createElement('tr');\n    emptyRow.innerHTML = `\n       <td colspan=\"6\" class=\"table-error-text\">No shops found.</td>\n     `;\n    if (tbody) tbody.appendChild(emptyRow);\n    return;\n  }\n  shopData.forEach((shop, index) => {\n    const row = document.createElement('tr');\n    row.classList.add('table-body-row');\n    if (row) row.innerHTML = `\n       <td class=\"py-1 shopSerialNumber\">${index + 1}</td>\n       <td class=\"py-1 shopName\">${shop.shop_name}</td>\n       <td class=\"py-1 shopLocation\">${shop.location}</td>\n       <td class=\"py-1 shopServiceType\">${shop.service_type}</td>\n       <td class=\"py-1 shopManager\">${shop.manager_name || '—'}</td>\n       <td class=\"py-1 action-buttons\">\n         <button class=\"hero-btn-outline editShopButton\" data-shop-id=\"${shop.id}\">\n           <i class=\"fa-solid fa-pen-to-square\"></i>\n         </button>\n         <button class=\"hero-btn-outline deleteShopButton\" data-shop-id=\"${shop.id}\">\n           <i class=\"fa-solid fa-trash-can\"></i>\n         </button>\n       </td>\n     `;\n    if (tbody) tbody.appendChild(row);\n  });\n}\n\n//# sourceURL=webpack://posbok/./JS/shops.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./JS/shops.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;