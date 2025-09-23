// authGuard.js
(function () {
  const isLoggedIn = localStorage.getItem('accessToken');

  if (!isLoggedIn) {
    window.location.replace('login.html');
  }
})();
