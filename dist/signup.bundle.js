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

/***/ "./JS/apiServices/product.js":
/*!***********************************!*\
  !*** ./JS/apiServices/product.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   addProduct: () => (/* binding */ addProduct),\n/* harmony export */   deleteProduct: () => (/* binding */ deleteProduct),\n/* harmony export */   getProducts: () => (/* binding */ getProducts),\n/* harmony export */   updateProduct: () => (/* binding */ updateProduct)\n/* harmony export */ });\n/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../config.js */ \"./config.js\");\n\nconst baseUrl = _config_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].baseUrl;\nconst apiToken = _config_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].token;\n\n// export async function getProducts() {\n//   try {\n//     //  console.log('Sending GET request...');\n//     const response = await fetch(`${baseUrl}/api/products`, {\n//       method: 'GET',\n//       headers: {\n//         Authorization: `Bearer ${apiToken}`,\n//         'Content-Type': 'application/json',\n//       },\n//     });\n\n//     //  console.log('Response received...');\n\n//     if (!response.ok) {\n//       throw new Error(`HTTP error! status: ${response.status}`);\n//     }\n\n//     const data = await response.json();\n//     //  console.log('Products:', data);\n//     return data;\n//   } catch (error) {\n//     //  console.error('Error fetching products:', error);\n//     return [];\n//   }\n// }\n\nasync function getProducts(page = 1, pageSize = 25) {\n  try {\n    const response = await fetch(`${baseUrl}/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true`, {\n      method: 'GET',\n      headers: {\n        Authorization: `Bearer ${apiToken}`,\n        'Content-Type': 'application/json'\n      }\n    });\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const data = await response.json();\n    return data; // Returns both product data and pagination meta\n  } catch (error) {\n    console.error('Error fetching products:', error);\n    return {\n      data: [],\n      meta: {\n        pagination: {\n          pageCount: 1\n        }\n      }\n    };\n  }\n}\nasync function addProduct(productData) {\n  try {\n    console.log('Sending POST request...');\n    const response = await fetch(`${baseUrl}/api/products`, {\n      method: 'POST',\n      headers: {\n        Authorization: `Bearer ${apiToken}`,\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify(productData)\n    });\n    console.log('Response received...');\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const data = await response.json();\n    console.log('Product added successfully:', data);\n    return data;\n  } catch (error) {\n    console.error('Error posting product:', error);\n  }\n}\n\n// export async function addProduct(productData) {\n//   try {\n//     console.log('Sending POST request...');\n//     const response = await fetch(`${baseUrl}/api/products`, {\n//       method: 'POST',\n//       headers: {\n//         Authorization: `Bearer ${apiToken}`,\n//         'Content-Type': 'application/json',\n//       },\n//       body: JSON.stringify(productData),\n//     });\n\n//     console.log('Response received...');\n\n//     if (!response.ok) {\n//       // Check if the response status is OK (2xx range)\n//       throw new Error(`HTTP error! status: ${response.status}`);\n//     }\n\n//     const data = await response.json();\n//     console.log('Product added successfully:', data);\n\n//     // Return success status and the data\n//     return { success: true, data };\n//   } catch (error) {\n//     console.error('Error posting product:', error);\n//     // Return failure status if there's an error\n//     return { success: false, error };\n//   }\n// }\n\nasync function updateProduct(documentId, productData) {\n  try {\n    //  console.log('Sending PUT request...');\n    const response = await fetch(`${baseUrl}/api/products/${documentId}`, {\n      method: 'PUT',\n      headers: {\n        Authorization: `Bearer ${apiToken}`,\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify(productData)\n    });\n    //  console.log('Response received...');\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const data = await response.json();\n    //  console.log('Product updated successfully:', data);\n    return data;\n  } catch (error) {\n    console.error('Error updating product:', error);\n  }\n}\nasync function deleteProduct(documentId) {\n  try {\n    console.log('Sending DELETE request...');\n    const response = await fetch(`${baseUrl}/api/products/${documentId}`, {\n      method: 'DELETE',\n      headers: {\n        Authorization: `Bearer ${apiToken}`,\n        'Content-Type': 'application/json'\n      }\n    });\n    console.log('Response received...');\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    console.log('Product deleted successfully');\n    return true; // Return true if deletion was successful\n  } catch (error) {\n    console.error('Error deleting product:', error);\n    return false; // Return false if there was an error\n  }\n}\n\n//# sourceURL=webpack://arot/./JS/apiServices/product.js?");

/***/ }),

/***/ "./JS/apiServices/registration.js":
/*!****************************************!*\
  !*** ./JS/apiServices/registration.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   registerAdmin: () => (/* binding */ registerAdmin),\n/* harmony export */   registerBusiness: () => (/* binding */ registerBusiness)\n/* harmony export */ });\n/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../config.js */ \"./config.js\");\n\nconst baseUrl = _config_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].baseUrl;\nconst apiToken = _config_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].token;\n\n// Function to register a Business - API\nasync function registerBusiness(businessDetails) {\n  try {\n    console.log('Sending POST request...');\n    const response = await fetch(`${baseUrl}/api/business`, {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify(businessDetails)\n    });\n    console.log('Response received...');\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const data = await response.json();\n    console.log('detail added successfully:', data);\n    return data;\n  } catch (error) {\n    console.error('Error Adding detail:', error);\n  }\n}\n\n// Function to register an Admin - API\nasync function registerAdmin(adminDetails) {\n  try {\n    console.log('Sending POST request...');\n    const response = await fetch(`${baseUrl}/api/business`, {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify(adminDetails)\n    });\n    console.log('Response received...');\n    if (!response.ok) {\n      throw new Error(`HTTP error! status: ${response.status}`);\n    }\n    const data = await response.json();\n    console.log('Admin created successfully:', data);\n    return data;\n  } catch (error) {\n    console.error('Error Adding Admin:', error);\n  }\n}\n\n//# sourceURL=webpack://arot/./JS/apiServices/registration.js?");

/***/ }),

/***/ "./JS/script.js":
/*!**********************!*\
  !*** ./JS/script.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   formatAmountWithCommas: () => (/* binding */ formatAmountWithCommas),\n/* harmony export */   showToast: () => (/* binding */ showToast)\n/* harmony export */ });\n/* harmony import */ var _apiServices_product__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./apiServices/product */ \"./JS/apiServices/product.js\");\n\n\n// Toggle the active class for sideNavs\nconst sideNavs = document.querySelectorAll('.side-nav_item');\nsideNavs.forEach(nav => {\n  nav.addEventListener('click', () => {\n    nav.classList.add('active');\n    sideNavs.forEach(otherNav => {\n      if (otherNav !== nav) {\n        otherNav.classList.remove('active');\n      }\n    });\n  });\n});\n\n// Toast notification\n\n// JavaScript to show toast\nfunction showToast(type, message) {\n  const toast = document.getElementById('toast');\n  toast.textContent = message;\n\n  // Reset class to clear previous toast type\n  toast.className = 'toast';\n\n  // Add the appropriate type (success or fail)\n  toast.classList.add(type);\n  toast.classList.add('show');\n  setTimeout(() => {\n    toast.classList.remove('show');\n  }, 3000);\n}\n\n// function to format amounts with commas\nfunction formatAmountWithCommas(amount) {\n  if (amount === null || amount === undefined) {\n    return amount; // return an empty string if amount is null or undefined\n  }\n  const amountString = amount.toString();\n  return amountString.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');\n}\n\n// JS For Modal\n\nconst main = document.querySelector('.main');\n// const sidebar = document.querySelector('.sidebar');\nconst closeModalButton = document.querySelectorAll('.closeModal');\ncloseModalButton.forEach(closeButton => {\n  closeButton.addEventListener('click', function () {\n    closeModal();\n  });\n});\nfunction closeModal() {\n  const depositPosCapitalContainer = document.querySelector('.depositPosCapital');\n  if (depositPosCapitalContainer) {\n    depositPosCapitalContainer.classList.remove('active');\n  }\n  main.classList.remove('blur');\n  //   sidebar.classList.remove('blur');\n  main.classList.remove('no-scroll');\n}\n\n// JS for Modal\ndocument.addEventListener('DOMContentLoaded', function () {\n  const depositButton = document.querySelector('.deposit-btn');\n  const depositPosCapitalContainer = document.querySelector('.depositPosCapital');\n  if (depositButton && depositPosCapitalContainer) {\n    depositButton.addEventListener('click', function () {\n      depositPosCapitalContainer.classList.add('active');\n      main.classList.add('blur');\n      // sidebar.classList.add('blur');\n      main.classList.add('no-scroll');\n    });\n  }\n});\n\n// JS for Date of Birth Input\n// const dobInput = document.getElementById('dateOfBirth');\n\n// if (dobInput) {\n//   dobInput.addEventListener('click', () => {\n//     if (dobInput.showPicker) {\n//       dobInput.showPicker();\n//     }\n//   });\n// }\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  flatpickr('#dateOfBirth', {\n    dateFormat: 'Y-m-d' // Customize format as needed\n  });\n});\n\n//# sourceURL=webpack://arot/./JS/script.js?");

/***/ }),

/***/ "./JS/signup.js":
/*!**********************!*\
  !*** ./JS/signup.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _apiServices_registration__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./apiServices/registration */ \"./JS/apiServices/registration.js\");\n/* harmony import */ var _script__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./script */ \"./JS/script.js\");\n\n\n\n// Create Business Registration Form\nconst createBusinessForm = document.getElementById('createBusinessForm');\nif (createBusinessForm) {\n  createBusinessForm.addEventListener('submit', function (e) {\n    e.preventDefault(); // stop page refresh\n\n    const businessName = document.getElementById('businessName').value;\n    const businessAddress = document.getElementById('businessAddress').value;\n    const businessPhoneNumber = document.getElementById('businessPhoneNumber').value;\n    const businessState = document.getElementById('businessState').value;\n    const cacRegNo = document.getElementById('cacRegNo').value;\n    const taxId = document.getElementById('taxId').value;\n    const nin = document.getElementById('nin').value;\n    const businessStaffSize = document.getElementById('businessStaffSize').value;\n    const businessTypeCheckboxes = document.querySelectorAll('input[name=\"businessType\"]:checked');\n    const businessType = Array.from(businessTypeCheckboxes).map(cb => cb.value);\n    const businessTypeValue = businessType[0] || null;\n    const versionPreferenceCheckboxes = document.querySelectorAll('input[name=\"versionPreference\"]:checked');\n    const versionPreference = Array.from(versionPreferenceCheckboxes).map(cb => cb.value);\n    const versionPreferenceValue = versionPreference[0] || null;\n    const businessDetails = {\n      businessName,\n      businessAddress,\n      businessPhoneNumber,\n      businessState,\n      cacRegNo,\n      taxId,\n      nin,\n      businessType: businessTypeValue,\n      businessStaffSize,\n      versionPreference: versionPreferenceValue\n    };\n    console.log('📦 Business Details:', businessDetails);\n    (0,_apiServices_registration__WEBPACK_IMPORTED_MODULE_0__.registerBusiness)(businessDetails).then(data => {\n      console.log('✅ Registered successfully:', data);\n    }).catch(err => {\n      console.error('❌ Failed to register:', err);\n    });\n  });\n}\n\n// Create Admin Registration Form\nconst signupForm = document.getElementById('signupForm');\nif (signupForm) {\n  // Password Validation\n  document.getElementById('confirm-password').addEventListener('input', () => {\n    const passwordInput = document.getElementById('password');\n    const confirmPasswordInput = document.getElementById('confirm-password');\n    confirmPasswordInput.addEventListener('input', () => {\n      const pass = passwordInput.value;\n      const confirmVal = confirmPasswordInput.value;\n      const errorText = document.getElementById('password-error');\n      confirmPasswordInput.classList.remove('input-match', 'input-mismatch');\n      if (confirmVal && pass !== confirmVal) {\n        confirmPasswordInput.classList.add('input-mismatch');\n      } else if (confirmVal && pass === confirmVal) {\n        confirmPasswordInput.classList.add('input-match');\n      }\n      if (confirmVal && pass !== confirmVal) {\n        confirmPasswordInput.classList.add('input-mismatch');\n        errorText.style.display = 'block';\n        errorText.style.textAlign = 'left';\n      } else {\n        confirmPasswordInput.classList.remove('input-mismatch');\n        confirmPasswordInput.classList.add('input-match');\n        errorText.style.display = 'none';\n      }\n    });\n  });\n  signupForm.addEventListener('submit', function (e) {\n    e.preventDefault();\n\n    // Password Validation Ctnd\n    const pass = document.getElementById('password').value;\n    const confirmPassword = document.getElementById('confirm-password').value;\n    if (pass !== confirmPassword) {\n      (0,_script__WEBPACK_IMPORTED_MODULE_1__.showToast)('fail', '❌ Passwords do not match.');\n      return;\n    }\n    const firstName = document.getElementById('firstName').value;\n    const lastName = document.getElementById('lastName').value;\n    const residentialAddress = document.getElementById('residentialAddress').value;\n    const dateOfBirth = document.getElementById('dateOfBirth').value;\n    const stateOfOrigin = document.getElementById('stateOfOrigin').value;\n    const lga = document.getElementById('lga').value;\n    const email = document.getElementById('email').value;\n    const phoneNumber = document.getElementById('phoneNumber').value;\n    const password = document.getElementById('password').value;\n    const guarantorName = document.getElementById('phoneNumber').value;\n    const guarantorPhoneNumber = document.getElementById('guarantorPhoneNumber').value;\n    const guarantorAddress = document.getElementById('guarantorAddress').value;\n    const adminDetails = {\n      firstName,\n      lastName,\n      residentialAddress,\n      dateOfBirth,\n      stateOfOrigin,\n      lga,\n      email,\n      phoneNumber,\n      password,\n      guarantor: {\n        name: guarantorName,\n        phoneNumber: guarantorPhoneNumber,\n        address: guarantorAddress\n      },\n      accountType: 'ADMIN',\n      servicePermission: 'BOTH'\n    };\n    console.log('📦 Admin Details:', adminDetails);\n    (0,_apiServices_registration__WEBPACK_IMPORTED_MODULE_0__.registerAdmin)(adminDetails).then(data => {\n      console.log('✅ Registered successfully:', data);\n    }).catch(err => {\n      console.error('❌ Failed to register:', err);\n    });\n  });\n}\n\n//# sourceURL=webpack://arot/./JS/signup.js?");

/***/ }),

/***/ "./config.js":
/*!*******************!*\
  !*** ./config.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nconst config = {\n  baseUrl: 'http://api.posbok.com',\n  token: ''\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (config);\n\n//# sourceURL=webpack://arot/./config.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
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
/******/ 	var __webpack_exports__ = __webpack_require__("./JS/signup.js");
/******/ 	
/******/ })()
;