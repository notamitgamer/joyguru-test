document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav item based on current page URL
  const navItems = document.querySelectorAll('.nav-item');
  const currentPath = window.location.pathname.split('/').pop();
  // what the hack
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPath || (href === 'https://joygurubasanalay.shop' && (currentPath === '' || currentPath === '/'))) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Splash screen script
  const splashScreen = document.getElementById('splashScreen');
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.style.opacity = '0';
      splashScreen.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        splashScreen.style.display = 'none';
      }, 500);
    }, 1500);
  }

  // Internet connection check
  const internetErrorPage = document.getElementById('internetErrorPage');
  const retryButton = document.getElementById('retryButton');

  function updateOnlineStatus() {
    if (navigator.onLine) {
      internetErrorPage.style.display = 'none';
      document.body.classList.remove('modal-active');
    } else {
      internetErrorPage.style.display = 'flex';
      document.body.classList.add('modal-active');
    }
  }

  // Retry button click handler
  retryButton.addEventListener('click', () => {
    if (navigator.onLine) {
      updateOnlineStatus();
    } else {
      // Optionally, you can add some feedback or animation here
      alert('Still no internet connection. Please check your network.');
    }
  });

  // Initial check
  updateOnlineStatus();

  // Listen to online and offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Add account icon click handler to check login
  const navAccount = document.getElementById('nav-account');
  if (navAccount) {
    navAccount.addEventListener('click', (e) => {
      const token = localStorage.getItem('loginToken');
      if (!token) {
        e.preventDefault();
        window.location.href = '/login';
      }
    });
  }
});
