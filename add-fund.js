document.addEventListener('DOMContentLoaded', function() {
    const addFundForm = document.getElementById('addFundForm');
    const amountInput = document.getElementById('amount');
    const currentBalanceSpan = document.getElementById('current-balance');

    const amountEntrySection = document.getElementById('amount-entry-section');
    const qrCodeSection = document.getElementById('qr-code-section');
    const qrCodeContainer = document.getElementById('qrcode');
    const paymentAmountSpan = document.getElementById('payment-amount');
    const paidBtn = document.getElementById('payment-success-btn');
    const cancelBtn = document.getElementById('payment-fail-btn');

    // --- Get user info from sessionStorage ---
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    let currentUserData = null; // To hold the full, fresh user data

    if (!loggedInUser) {
        alert('You must be logged in to add funds.');
        window.location.href = 'index.html';
        return;
    }

    // Fetch and display the latest balance from the server
    fetch(`${API_BASE_URL}/api/users/${loggedInUser.id}`)
        .then(res => res.json())
        .then(user => {
            currentUserData = user;
            currentBalanceSpan.textContent = `₹${currentUserData.balance.toFixed(2)}`;
        })
        .catch(err => {
            console.error("Failed to fetch user balance:", err);
            currentBalanceSpan.textContent = `₹${loggedInUser.balance.toFixed(2)}`; // Fallback
        });

    // --- Handle form submission ---
    addFundForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount < 300) {
            alert('Minimum deposit amount is ₹300.');
            return;
        }

        // Create a shorter, more compliant transaction ID.
        const transactionId = `MTM${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90)}`;
        const upiId = '8965812465@ybl';
        const merchantName = 'MITHUN MATKA';
        const note = `Deposit for ${loggedInUser.name}`;

        // Construct a standard UPI parameter string
        const baseUpiParams = `pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(transactionId)}`;
        const upiString = `upi://pay?${baseUpiParams}`;

        // Clear previous QR code if any
        qrCodeContainer.innerHTML = '';
        new QRCode(qrCodeContainer, {
            text: upiString,
            width: 200,
            height: 200
        });

        paymentAmountSpan.textContent = `₹${amount.toFixed(2)}`;

        // --- Set specific app payment links ---
        document.getElementById('gpay-btn').href = `gpay://upi/pay?${baseUpiParams}`;
        document.getElementById('phonepe-btn').href = `phonepe://pay?${baseUpiParams}`;
        document.getElementById('paytm-btn').href = `paytmmp://pay?${baseUpiParams}`;
        document.getElementById('other-upi-btn').href = `upi://pay?${baseUpiParams}`;


        // Show QR code section and hide amount entry
        amountEntrySection.classList.add('hidden');
        qrCodeSection.classList.remove('hidden');

        // Store details for submission
        paidBtn.dataset.amount = amount;
        paidBtn.dataset.transactionId = transactionId;
    });

    // --- Handle "I Have Paid" button click ---
    paidBtn.addEventListener('click', async function() {
        const amount = parseFloat(this.dataset.amount);
        const transactionId = this.dataset.transactionId;

        this.disabled = true;
        this.textContent = 'Submitting...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/transactions/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: loggedInUser.id, amount, transactionId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg);

            alert(data.msg);
            window.location.href = 'game-history.html'; // Redirect to history to see the pending request
        } catch (error) {
            alert(`Error: ${error.message}`);
            this.disabled = false;
            this.textContent = 'I Have Paid';
        }
    });

    // --- Handle "Cancel" button click ---
    cancelBtn.addEventListener('click', () => {
        window.location.reload(); // Simply reload the page
    });
});