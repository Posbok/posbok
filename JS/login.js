import { loginUser } from './apiServices/login';
import { hideBtnLoader, showBtnLoader } from './helper/helper';
import { redirectWithDelay, showToast } from './script';

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // stop page refresh

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userDetails = {
      email,
      password,
    };

    //  console.log('📦 User Details:', userDetails);

    const loginSubmitBtn = document.querySelector('.loginSubmitBtn');

    showBtnLoader(loginSubmitBtn);
    loginUser(userDetails)
      .then((data) => {
        const user = data.data.user;
        const token = data.data.accessToken;

        //   Stores the access token in local storage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userData', JSON.stringify(user));

        const today = new Date().toISOString().split('T')[0]; // e.g., "2025-05-04"
        localStorage.setItem('loginDate', today);

        //   redirectWithDelay('Homepage', 'index.html', 500);
        window.location.href = 'index.html';
        hideBtnLoader(loginSubmitBtn);
      })
      .catch((data) => {
        hideBtnLoader(loginSubmitBtn);
        showToast('fail', `❎ ${data.message}`);
        console.error('❎ Failed to login:', data.message);
      });
  });
}

// // Dummy first login before full page
// localStorage.setItem('isLoggedIn', true);

// const signUpButton = document.getElementById('signUp');
// const signInButton = document.getElementById('signIn');
// const container = document.getElementById('container');

// if (container) {
//   signUpButton.addEventListener('click', () => {
//     container.classList.add('right-panel-active');
//   });

//   signInButton.addEventListener('click', () => {
//     container.classList.remove('right-panel-active');
//   });
// }
// function redirectToIndex() {
//   window.location.href = 'index.html';
// }
