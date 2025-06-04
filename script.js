// Crypto price fetching and display
class CryptoPriceWidget {
    constructor() {
        this.cryptoList = ['bitcoin', 'ethereum', 'binancecoin'];
        this.widget = document.getElementById('crypto-widget');
        this.init();
    }

    async fetchPrices() {
        try {
            const prices = {};
            for (const crypto of this.cryptoList) {
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`);
                const data = await response.json();
                prices[crypto] = data[crypto].usd;
            }
            return prices;
        } catch (error) {
            console.error('Error fetching crypto prices:', error);
            return null;
        }
    }

    createPriceElement(crypto, price) {
        return `
            <div class="crypto-price-card">
                <h3>${crypto.charAt(0).toUpperCase() + crypto.slice(1)}</h3>
                <p>$${price.toLocaleString()}</p>
            </div>
        `;
    }

    async updatePrices() {
        const prices = await this.fetchPrices();
        if (prices) {
            this.widget.innerHTML = Object.entries(prices)
                .map(([crypto, price]) => this.createPriceElement(crypto, price))
                .join('');
        }
    }

    init() {
        this.updatePrices();
        // Update prices every 1 minute
        setInterval(() => this.updatePrices(), 60000);
    }
}

// Initialize the crypto price widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CryptoPriceWidget();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const heroImages = document.querySelectorAll('.hero-background-image');
    let currentImageIndex = 0;

    function changeHeroImage() {
        heroImages[currentImageIndex].classList.remove('active');
        currentImageIndex = (currentImageIndex + 1) % heroImages.length;
        heroImages[currentImageIndex].classList.add('active');
    }

    setInterval(changeHeroImage, 3000); // Change image every 3 seconds
});

// Login form handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                
                // Login successful!
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
                
            } catch (error) {
                console.error('Login error:', error);
                alert('Error logging in: ' + error.message);
            }
        });
    }
});

function showLoginMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `login-message ${type}`;
    messageDiv.textContent = message;

    const container = document.querySelector('.container');
    const form = document.querySelector('.auth-form');
    container.insertBefore(messageDiv, form);

    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Check login status on page load
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname;

    // Only redirect from dashboard to login if not logged in
    // Remove the automatic redirect from login to dashboard
    if (!isLoggedIn && currentPage.includes('dashboard.html')) {
        // If user is not logged in and tries to access dashboard,
        // redirect to login page
        window.location.href = 'login.html';
    }
}

// Add login status check to all pages
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Logout functionality
function handleLogout(e) {
    e.preventDefault(); // Prevent default link behavior
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe'); // Clear remember me status as well
    window.location.href = 'index.html'; // Redirect to index page after logout
}

// Attach logout handler to all logout buttons
document.addEventListener('DOMContentLoaded', () => {
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', handleLogout);
    });
});

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
});


// Function to fetch and update user profile
async function updateUserProfile() {
    try {
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        if (userError) {
            console.error('Auth error:', userError);
            throw userError;
        }
        console.log('Current user:', user);

        // Fetch user profile from profiles table
        const { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile error:', profileError);
            throw profileError;
        }
        console.log('Profile data:', profile);

        // Get the user-name element
        const userNameElement = document.getElementById('user-name');
        console.log('User name element:', userNameElement);
        
        if (userNameElement) {
            // Try to set the name, with multiple fallbacks
            const displayName = profile?.full_name || user?.email || 'User';
            console.log('Setting display name to:', displayName);
            userNameElement.textContent = displayName;
        } else {
            console.error('Could not find user-name element');
        }

        // Update balance if element exists
        const balanceElement = document.getElementById('total-balance');
        if (balanceElement) {
            balanceElement.textContent = profile?.balance?.toFixed(2) || '0.00';
        }

        // Update profile form if on profile page
        const profileForm = document.getElementById('personal-info-form');
        if (profileForm) {
            document.getElementById('full-name').value = profile?.full_name || '';
            document.getElementById('date-of-birth').value = profile?.date_of_birth || '';
            document.getElementById('country').value = profile?.country || '';
            document.getElementById('email').value = user?.email || '';
            document.getElementById('phone').value = profile?.phone || '';
        }
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
    }
}

// Call updateUserProfile when page loads
document.addEventListener('DOMContentLoaded', updateUserProfile);

// Handle profile form submission
document.getElementById('personal-info-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        if (userError) throw userError;

        const formData = {
            id: user.id,
            full_name: document.getElementById('full-name').value,
            date_of_birth: document.getElementById('date-of-birth').value,
            country: document.getElementById('country').value,
            phone: document.getElementById('phone').value,
            updated_at: new Date()
        };

        const { error } = await window.supabaseClient
            .from('profiles')
            .upsert(formData);

        if (error) throw error;
        alert('Profile updated successfully!');
        updateUserProfile();
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error updating profile. Please try again.');
    }
});