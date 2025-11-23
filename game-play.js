document.addEventListener('DOMContentLoaded', function() {
    const gameTitle = document.getElementById('game-page-title');
    const gameTime = document.getElementById('game-page-time');
    const gameDate = document.getElementById('game-page-date');
    const bidForm = document.getElementById('bidForm');

    const pattiData = {
        '1': ["128", "137", "146", "236", "245", "290", "380", "470", "489", "560", "678", "579"],
        '2': ["129", "138", "147", "156", "237", "246", "345", "390", "480", "570", "679", "589"],
        '3': ["120", "139", "148", "157", "238", "247", "256", "346", "490", "580", "670", "689"],
        '4': ["130", "149", "158", "167", "239", "248", "257", "347", "356", "590", "680", "789"],
        '5': ["140", "159", "168", "230", "249", "258", "267", "348", "357", "456", "690", "780"],
        '6': ["123", "150", "169", "178", "240", "259", "268", "349", "358", "457", "367", "790"],
        '7': ["124", "160", "179", "250", "269", "278", "340", "359", "368", "458", "467", "890"],
        '8': ["125", "134", "170", "189", "260", "279", "350", "369", "378", "459", "567", "468"],
        '9': ["126", "135", "180", "234", "270", "289", "360", "379", "450", "469", "478", "568"],
        '0': ["127", "136", "145", "190", "235", "280", "370", "479", "460", "569", "389", "578"]
    };

    const doublePattiData = {
        '1': ["100", "119", "155", "227", "335", "344", "399", "588", "669"],
        '2': ["200", "110", "228", "255", "336", "499", "660", "688", "778"],
        '3': ["300", "166", "229", "337", "355", "445", "599", "779", "788"],
        '4': ["400", "112", "220", "266", "338", "446", "455", "699", "770"],
        '5': ["500", "113", "122", "177", "339", "366", "447", "799", "889"],
        '6': ["600", "114", "277", "330", "448", "466", "556", "880", "899"],
        '7': ["700", "115", "133", "188", "223", "377", "449", "557", "566"],
        '8': ["800", "116", "224", "233", "288", "440", "477", "558", "990"],
        '9': ["900", "117", "144", "199", "225", "388", "559", "577", "667"],
        '0': ["550", "668", "244", "299", "226", "488", "677", "118", "334"]
    };

    const triplePattiData = {
        '1': ["111"],
        '2': ["222"],
        '3': ["333"],
        '4': ["444"],
        '5': ["555"],
        '6': ["666"],
        '7': ["777"],
        '8': ["888"],
        '9': ["999"],
        '0': ["000"]
    };

    // Create flat lists of all valid patti numbers for easier validation
    const allSinglePattis = Object.values(pattiData).flat();
    const allDoublePattis = Object.values(doublePattiData).flat();
    const allTriplePattis = Object.values(triplePattiData).flat();
    const allPattis = [...allSinglePattis, ...allDoublePattis, ...allTriplePattis];

    // Get game name and time from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gameName = urlParams.get('game');
    const time = urlParams.get('time');

    if (gameName && time) {
        gameTitle.textContent = gameName;
        gameTime.textContent = time;
    } else {
        gameTitle.textContent = "Unknown Game";
        gameTime.textContent = "Time not available";
    }

    // Display current date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    gameDate.textContent = `📅 ${today.toLocaleDateString('en-US', options)}`;

    // --- Handle Bid Type Button Clicks ---
    const gameDashboard = document.querySelector('.game-dashboard');
    const bidTypeSelect = document.getElementById('bid-type-select');

    const dynamicInputs = {
        singleDigit: document.getElementById('single-digit-input'),
        jodiDigit: document.getElementById('jodi-digit-input'),
        patti: document.getElementById('patti-input'),
        halfSangam: document.getElementById('half-sangam-input'),
        fullSangam: document.getElementById('full-sangam-input')
    };

    // --- Game Timing Logic ---
    function parseTime(timeStr) {
        const [time, period] = timeStr.trim().split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (period.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    const timeMatch = time.match(/Open: (.*?) - Close: (.*)/);
    if (timeMatch) {
        const openTime = parseTime(timeMatch[1]);
        const closeTime = parseTime(timeMatch[2]);
        const now = new Date();

        if (now > closeTime) {
            // Market is fully closed for today
            gameDashboard.innerHTML = `<h2>Today Market is Closed</h2><p>Bidding for ${gameName} will resume tomorrow.</p>`;
        } else if (now > openTime) {
            // Open time has passed, disable open-related bids
            bidTypeSelect.querySelectorAll('option').forEach(option => {
                const bidValue = option.value;
                if (bidValue.includes('-open') || bidValue === 'jodi' || bidValue === 'full-sangam') {
                    option.disabled = true;
                    option.textContent += ' (Closed)';
                }
            });
        }
    }
    // --- End of Game Timing Logic ---

    bidTypeSelect.addEventListener('change', function() {
        const bidValue = this.value;

        // Hide all dynamic inputs
        Object.values(dynamicInputs).forEach(input => input.classList.add('hidden'));

        // Clear all suggestion grids
        document.getElementById('single-digit-suggestions').innerHTML = ''; // Clear single digit suggestions
        document.getElementById('jodi-suggestions').innerHTML = ''; // Clear jodi suggestions
        document.getElementById('patti-suggestions').innerHTML = ''; // Clear suggestions

        // Show the correct input based on bid type
        if (bidValue.includes('single-') && !bidValue.includes('-patti')) {
            dynamicInputs.singleDigit.classList.remove('hidden');
        } else if (bidValue === 'jodi') {
            dynamicInputs.jodiDigit.classList.remove('hidden');
        } else if (bidValue.includes('-patti')) {
            dynamicInputs.patti.classList.remove('hidden');
        } else if (bidValue.includes('half-sangam')) {
            dynamicInputs.halfSangam.classList.remove('hidden');
            const label1 = document.getElementById('half-sangam-label-1');
            const label2 = document.getElementById('half-sangam-label-2');
            if (bidValue === 'half-sangam-open') {
                label1.textContent = 'Enter Open Ank (0-9):';
                label2.textContent = 'Enter Close Patti (e.g., 123):';
            } else { // half-sangam-close
                label1.textContent = 'Enter Open Patti (e.g., 123):';
                label2.textContent = 'Enter Close Ank (0-9):';
            }

        } else if (bidValue === 'full-sangam') {
            dynamicInputs.fullSangam.classList.remove('hidden');
        }
    });

    // --- Input validation for single digit ---
    const singleDigitInput = document.getElementById('single-digit');
    if (singleDigitInput) {
        singleDigitInput.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // --- Input validation for jodi digit ---
    const jodiDigitInput = document.getElementById('jodi-digit');
    if (jodiDigitInput) {
        jodiDigitInput.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // --- Input validation for patti digit ---
    const pattiDigitInput = document.getElementById('patti-digit');
    if (pattiDigitInput) {
        pattiDigitInput.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/[^0-9]/g, '');

            const suggestionsContainer = document.getElementById('patti-suggestions');
            suggestionsContainer.innerHTML = ''; // Clear previous suggestions

            // If it's a single digit, show patti suggestions based on selected bid type
            if (this.value.length === 1) {
                const selectedBidType = bidTypeSelect.value;
                let pattis = [];

                if (selectedBidType.includes('single-patti') && pattiData[this.value]) {
                    pattis = pattiData[this.value];
                } else if (selectedBidType.includes('double-patti') && doublePattiData[this.value]) {
                    pattis = doublePattiData[this.value];
                } else if (selectedBidType.includes('triple-patti') && triplePattiData[this.value]) {
                    pattis = triplePattiData[this.value];
                }

                pattis.forEach(patti => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'patti-suggestion-btn';
                    btn.textContent = patti;
                    btn.dataset.pattiValue = patti;
                    suggestionsContainer.appendChild(btn);
                });
            }
        });
    }

    // --- Handle Patti Suggestion Clicks ---
    const suggestionsContainer = document.getElementById('patti-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('patti-suggestion-btn')) {
                // Set the main patti input value to the selected patti
                const pattiInput = document.getElementById('patti-digit');
                pattiInput.value = event.target.dataset.pattiValue;
                // Clear suggestions after selection
                suggestionsContainer.innerHTML = '';
            }
        });
    }

    // --- Bid Management ---
    const addBidBtn = document.getElementById('add-bid-btn');
    const bidsListContainer = document.getElementById('bids-list-container');
    const bidsListBody = document.getElementById('bids-list');
    const submitAllBidsBtn = document.getElementById('submit-all-bids-btn');
    let currentBids = [];

    addBidBtn.addEventListener('click', function() {
        const bidType = bidTypeSelect.value;
        const amount = document.getElementById('bid-amount').value;
        let bidValue = '';

        if (!bidType) {
            alert('Please select a bid type.');
            return;
        }
        if (!amount || parseFloat(amount) < 10) {
            alert('Please enter a valid amount (minimum 10).');
            return;
        }

        // Get the value from the correct input field
        if (bidType.includes('half-sangam')) {
            const ankInput = document.getElementById('half-sangam-ank');
            const pattiInput = document.getElementById('half-sangam-patti');
            let ank, patti;

            if (bidType === 'half-sangam-open') {
                ank = ankInput.value;
                patti = pattiInput.value;
                if (ank.length !== 1 || !allPattis.includes(patti)) {
                    alert('Please enter a valid 1-digit Open Ank and a valid 3-digit Close Patti.');
                    return;
                }
                bidValue = `${ank} x ${patti}`;
            } else { // half-sangam-close
                patti = ankInput.value; // The first input is patti here
                ank = pattiInput.value; // The second input is ank here
                if (!allPattis.includes(patti) || ank.length !== 1) {
                    alert('Please enter a valid 3-digit Open Patti and a valid 1-digit Close Ank.');
                    return;
                }
                bidValue = `${patti} x ${ank}`;
            }
        } else if (bidType === 'full-sangam') {
            const openPatti = document.getElementById('full-sangam-open').value;
            const closePatti = document.getElementById('full-sangam-close').value;

            if (!allPattis.includes(openPatti) || !allPattis.includes(closePatti)) {
                alert('Please enter valid 3-digit Open and Close Pattis.');
                return;
            }
            bidValue = `${openPatti} x ${closePatti}`;
        } else if (bidType.includes('-patti')) {
            bidValue = document.getElementById('patti-digit').value;
            // --- Patti Validation ---
            if (bidType.includes('single-patti')) {
                if (!allSinglePattis.includes(bidValue)) {
                    alert('Please enter a valid Single Patti number.');
                    return;
                }
            } else if (bidType.includes('double-patti')) {
                if (!allDoublePattis.includes(bidValue)) {
                    alert('Please enter a valid Double Patti number.');
                    return;
                }
            } else if (bidType.includes('triple-patti')) {
                if (!allTriplePattis.includes(bidValue)) {
                    alert('Please enter a valid Triple Patti number.');
                    return;
                }
            }
        } else if (bidType.includes('single-') && !bidType.includes('-patti')) {
            bidValue = document.getElementById('single-digit').value;
        } else if (bidType === 'jodi') {
            bidValue = document.getElementById('jodi-digit').value;
        }

        if (!bidValue) {
            alert('Please enter a bid number.');
            return;
        }

        // Add bid to array and UI
        const bid = {
            id: Date.now(), // For local removal
            transactionId: `M${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`, // Shorter, more unique transaction ID
            type: bidType,
            value: bidValue,
            amount: parseFloat(amount)
        };
        currentBids.push(bid);
        renderBids();

        // Clear inputs for next bid
        document.getElementById('bid-amount').value = '';
        document.getElementById('single-digit').value = '';
        document.getElementById('jodi-digit').value = '';
        document.getElementById('patti-digit').value = '';
        document.getElementById('half-sangam-ank').value = '';
        document.getElementById('half-sangam-patti').value = '';
        document.getElementById('full-sangam-open').value = '';
        document.getElementById('full-sangam-close').value = '';

        // Clear selections
        document.getElementById('patti-suggestions').innerHTML = '';
        document.getElementById('jodi-suggestions').querySelectorAll('.selected').forEach(btn => btn.classList.remove('selected'));
    });

    function renderBids() {
        bidsListBody.innerHTML = '';
        let totalAmount = 0;

        if (currentBids.length > 0) {
            bidsListContainer.classList.remove('hidden');
            currentBids.forEach((bid, index) => {
                totalAmount += bid.amount;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${bid.transactionId}</td>
                    <td>${bid.type}</td>
                    <td>${bid.value}</td>
                    <td>₹${bid.amount.toFixed(2)}</td>
                    <td><button class="remove-bid-btn" data-id="${bid.id}">Remove</button></td>
                `;
                bidsListBody.appendChild(row);
            });
        } else {
            bidsListContainer.classList.add('hidden');
        }

        document.getElementById('total-bid-amount').textContent = `₹${totalAmount.toFixed(2)}`;
    }

    bidsListBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-bid-btn')) {
            const bidId = parseInt(event.target.dataset.id);
            currentBids = currentBids.filter(bid => bid.id !== bidId);
            renderBids();
        }
    });

    submitAllBidsBtn.addEventListener('click', async function() {
        if (currentBids.length === 0) {
            alert('Please add at least one bid to submit.');
            return;
        }

        const totalAmount = currentBids.reduce((sum, bid) => sum + bid.amount, 0);
        const loggedInUserInfo = JSON.parse(sessionStorage.getItem('loggedInUser')); // e.g., { id, name, ... }

        if (!loggedInUserInfo) {
            alert('Error: You are not logged in.');
            window.location.href = 'index.html';
            return;
        }

        this.disabled = true;
        this.textContent = 'Submitting...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/bids/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: loggedInUserInfo.id,
                    bids: currentBids,
                    gameName: gameName // The game name from the top of the script
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.insufficientBalance) {
                    const confirmation = confirm(`${data.msg} Do you want to add funds?`);
                    if (confirmation) {
                        window.location.href = 'add-fund.html';
                    }
                } else {
                    throw new Error(data.msg || 'Failed to submit bids.');
                }
                return; // Stop execution if there was an error
            }

            // --- Success ---
            alert(data.msg);

            // Update user's balance in sessionStorage for immediate UI update
            loggedInUserInfo.balance = data.newBalance;
            sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUserInfo));

            // Clear local bids and re-render the UI
            currentBids = [];
            renderBids();
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        } finally {
            this.disabled = false;
            this.textContent = '🚀 Submit All Bids';
        }
    });

    // Handle bid form submission
    bidForm.addEventListener('submit', e => e.preventDefault()); // Prevent default form submission
});