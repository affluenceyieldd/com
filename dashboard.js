console.log('Dashboard.js script loaded!');

// Remove the mock data object
// let userData = { ... };

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - Initializing dashboard...');
    await fetchUserData(); // Add this line
    initializeFormListeners();
});

// Add this new function to fetch user data
async function fetchUserData() {
    try {
        console.log('Starting fetchUserData...');
        
        // Get the authenticated user
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        if (userError) {
            console.error('Error getting user:', userError);
            throw userError;
        }
        console.log('Current user:', user);

        // Set up real-time subscription
        await subscribeToProfileChanges();
        console.log('Real-time subscription set up');

        // Get the user's profile
        const { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw profileError;
        }
        console.log('Profile data:', profile);
        console.log('Profile balance:', profile?.balance);

        // Get user's transactions
        const { data: transactions, error: transactionError } = await window.supabaseClient
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (transactionError) {
            console.error('Error fetching transactions:', transactionError);
            throw transactionError;
        }
        console.log('Transactions:', transactions);

        // Update the UI
        const userNameElement = document.getElementById('user-name');
        const fullNameElement = document.getElementById('full-name');
        const emailElement = document.getElementById('email');
        const phoneElement = document.getElementById('phone');
        const balanceElement = document.getElementById('total-balance');

        console.log('UI Elements:', {
            userNameElement: userNameElement?.id,
            fullNameElement: fullNameElement?.id,
            emailElement: emailElement?.id,
            phoneElement: phoneElement?.id,
            balanceElement: balanceElement?.id
        });

        if (userNameElement) userNameElement.textContent = profile.full_name || user.email;
        if (fullNameElement) fullNameElement.value = profile.full_name || '';
        if (emailElement) emailElement.value = user.email;
        if (phoneElement) phoneElement.value = profile.phone || '';
        if (balanceElement) balanceElement.textContent = (profile.balance || 0).toFixed(2);

        // Update transactions list
        updateTransactionList(transactions);
        console.log('Dashboard update complete');

    } catch (error) {
        console.error('Error in fetchUserData:', error);
        showNotification('Error loading user data', 'error');
    }
}

// Update the updateTransactionList function to accept transactions parameter
function updateTransactionList(transactions) {
    const transactionList = document.querySelector('.transaction-list');
    transactionList.innerHTML = transactions.length ? '' :
        '<p class="no-transactions">No transactions yet</p>';

    transactions.forEach(transaction => {
        const transactionEl = document.createElement('div');
        transactionEl.className = `transaction-item ${transaction.type}`;
        transactionEl.innerHTML = `
            <div class="transaction-icon">
                <i class="fas fa-${transaction.type === 'deposit' ? 'plus' : 'minus'}-circle"></i>
            </div>
            <div class="transaction-details">
                <p class="transaction-type">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
                <p class="transaction-amount">${transaction.amount.toFixed(2)} USD (${transaction.crypto.toUpperCase()})</p>
                <p class="transaction-date">${new Date(transaction.created_at).toLocaleString()}</p>
            </div>
        `;
        transactionList.appendChild(transactionEl);
    });
}

function initializeFormListeners() {
    // Profile form submission
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        userData.name = document.getElementById('full-name').value;
        userData.phone = document.getElementById('phone').value;
        showNotification('Profile updated successfully!');
        updateDashboard();
    });

    // Security form submission
    document.getElementById('security-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match!', 'error');
            return;
        }

        showNotification('Password changed successfully!');
        e.target.reset();
    });

    // Deposit form submission
    document.getElementById('deposit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('deposit-amount').value);
        const crypto = document.getElementById('crypto-type').value;

        // Add transaction
        addTransaction('deposit', amount, crypto);
        hideModal('deposit-modal');
        e.target.reset();
    });

    // Withdraw form submission
    document.getElementById('withdraw-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const crypto = document.getElementById('withdraw-crypto').value;
        const address = document.getElementById('withdraw-address').value;

        if (amount > userData.balance) {
            showNotification('Insufficient balance!', 'error');
            return;
        }

        // Add transaction
        addTransaction('withdraw', amount, crypto);
        hideModal('withdraw-modal');
        e.target.reset();
    });
}

function addTransaction(type, amount, crypto) {
    const transaction = {
        type,
        amount,
        crypto,
        date: new Date().toISOString()
    };

    userData.transactions.unshift(transaction);
    if (type === 'deposit') {
        userData.balance += amount;
    } else {
        userData.balance -= amount;
    }

    updateDashboard();
    showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`);
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Wallet addresses for different cryptocurrencies
const walletAddresses = {
    btc: '16Eu379KUBZu3qZgF6imTV4TogfANZUh8c',
    eth: '0x61a0fd78f04898a975A94712a5236821434bA735',
    usdt: '0x1923587116377B2217DF297F6e9Cf49275B66CC2',
    bnb: '',
    sol: 'UXdFDahMpi5NinT26Kq2Q9rBS8qqzSJrRzRsB1QWnA7',
    ada: '',
    xrp: ''
};

function showPaymentAddress() {
    const selectedCrypto = document.getElementById('payment-crypto').value;
    const amount = parseFloat(document.getElementById('investment-amount').value);
    const currentPage = window.location.pathname.split('/').pop();
    
    let minAmount, maxAmount;
    
    switch(currentPage) {
        case 'buy-plan.html':
            minAmount = 300;
            maxAmount = 5000;
            break;
        case 'buy-standard-plan.html':
            minAmount = 5000;
            maxAmount = 15000;
            break;
        case 'buy-premium-plan.html':
            minAmount = 15000;
            maxAmount = 100000;
            break;
        default:
            minAmount = 300;
            maxAmount = 5000;
    }
    
    if (amount < minAmount || amount > maxAmount) {
        alert(`Please enter an amount between $${minAmount.toLocaleString()} and $${maxAmount.toLocaleString()}`);
        return;
    }

    const walletAddress = walletAddresses[selectedCrypto];
    document.getElementById('plan-wallet-address').textContent = walletAddress;
    document.getElementById('payment-address').style.display = 'block';
}

function copyPlanWalletAddress() {
    const walletAddress = document.getElementById('plan-wallet-address').textContent;
    navigator.clipboard.writeText(walletAddress)
        .then(() => alert('Wallet address copied to clipboard!'))
        .catch(err => console.error('Failed to copy address:', err));
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


// Initialize investment performance chart
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('investmentChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Flexi Plan',
                    data: [75, 150, 225, 300],
                    borderColor: '#4CAF50',
                    tension: 0.4
                },
                {
                    label: 'Standard Plan',
                    data: [150, 300, 450, 600],
                    borderColor: '#2196F3',
                    tension: 0.4
                },
                {
                    label: 'Premium Plan',
                    data: [150, 300, 450, 600],
                    borderColor: '#9C27B0',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Return on Investment (%)',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Return on Investment (%)'
                    }
                }
            }
        }
    });
});

// Add real-time subscription for profile changes
async function subscribeToProfileChanges() {
    try {
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        if (userError) throw userError;

        // Subscribe to changes in the user's profile
        const subscription = window.supabaseClient
            .channel('profile-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Profile change received:', payload);
                    // Update the balance display
                    const balanceElement = document.getElementById('total-balance');
                    if (balanceElement && payload.new) {
                        balanceElement.textContent = (payload.new.balance || 0).toFixed(2);
                    }
                }
            )
            .subscribe();

        // Store subscription for cleanup
        window.profileSubscription = subscription;

        return () => {
            if (window.profileSubscription) {
                window.profileSubscription.unsubscribe();
            }
        };
    } catch (error) {
        console.error('Error setting up profile subscription:', error);
    }
}

// Add cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.profileSubscription) {
        window.profileSubscription.unsubscribe();
    }
});