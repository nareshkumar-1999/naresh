const USERS_STORAGE_KEY = 'gameProjectUsers';
const HISTORY_STORAGE_KEY = 'gameProjectHistory';
const RESULTS_STORAGE_KEY = 'gameProjectResults';
const GAME_RATES_STORAGE_KEY = 'gameProjectRates';
const GAMES_STORAGE_KEY = 'gameProjectGames';
const NOTIFICATIONS_STORAGE_KEY = 'gameProjectNotifications';
const LOGIN_ATTEMPTS_STORAGE_KEY = 'gameProjectLoginAttempts';

// Initial dummy data to populate localStorage if it's empty
const initialUsers = [
    { id: 999, name: 'Admin', mobile: '8965812465', password: 'Baghel@100', balance: 9999, isAdmin: true, photo: '', accountNumber: '', ifscCode: '', branchName: '', upiId: '', isActive: true },
    { id: 101, name: 'Amit Kumar', mobile: '9876543211', password: 'userpass', balance: 500.00, isAdmin: false, photo: '', accountNumber: '', ifscCode: '', branchName: '', upiId: '', isActive: true },
    { id: 102, name: 'Sunita Sharma', mobile: '9876543212', password: 'userpass', balance: 1250.50, isAdmin: false, photo: '', accountNumber: '', ifscCode: '', branchName: '', upiId: '', isActive: true },
    { id: 103, name: 'Rahul Verma', mobile: '9876543213', password: 'userpass', balance: 0.00, isAdmin: false, photo: '', accountNumber: '', ifscCode: '', branchName: '', upiId: '', isActive: true },
    { id: 104, name: 'Priya Singh', mobile: '9876543214', password: 'userpass', balance: 75.25, isAdmin: false, photo: '', accountNumber: '', ifscCode: '', branchName: '', upiId: '', isActive: true }
];

const initialHistory = [
    { userId: 101, game: 'Color Prediction', result: 'Win', amount: 50, date: '2023-10-27T10:00:00Z' },
    { userId: 102, game: 'Spin Wheel', result: 'Loss', amount: 20, date: '2023-10-27T11:30:00Z' },
    { userId: 101, game: 'Spin Wheel', result: 'Loss', amount: 10, date: '2023-10-28T14:00:00Z' },
    { userId: 101, game: 'Color Prediction', result: 'Win', amount: 100, date: '2023-10-28T15:00:00Z' },
    { userId: 102, game: 'Color Prediction', result: 'Win', amount: 30, date: '2023-10-29T09:00:00Z' },
    // Adding Deposit and Withdrawal History
    { userId: 101, type: 'Deposit', amount: 500, date: '2023-10-26T12:00:00Z', status: 'Success' },
    { userId: 102, type: 'Deposit', amount: 1000, date: '2023-10-27T09:00:00Z', status: 'Success' },
    { userId: 101, type: 'Withdrawal', amount: 200, date: '2023-10-29T11:00:00Z', status: 'Completed' },
];

const initialGames = [
    { id: 1, name: 'Sridevi', openTime: '11:30 AM', closeTime: '12:30 PM' },
    { id: 2, name: 'Time Bazar', openTime: '01:15 PM', closeTime: '02:15 PM' },
    { id: 3, name: 'Madhur Day', openTime: '01:30 PM', closeTime: '02:30 PM' },
    { id: 4, name: 'Milan Day', openTime: '03:15 PM', closeTime: '05:15 PM' },
    { id: 5, name: 'Rajdhani Day', openTime: '04:00 PM', closeTime: '06:00 PM' },
    { id: 6, name: 'Kalyan', openTime: '04:30 PM', closeTime: '06:30 PM' },
    { id: 7, name: 'Sridevi Night', openTime: '07:00 PM', closeTime: '08:00 PM' },
    { id: 8, name: 'Madhur Night', openTime: '08:30 PM', closeTime: '10:30 PM' },
    { id: 9, name: 'Milan Night', openTime: '09:00 PM', closeTime: '11:00 PM' },
    { id: 10, name: 'Kalyan Night', openTime: '09:30 PM', closeTime: '11:30 PM' },
    { id: 11, name: 'Rajdhani Night', openTime: '09:35 PM', closeTime: '11:35 PM' },
    { id: 12, name: 'Main Bazar', openTime: '10:00 PM', closeTime: '12:00 AM' },
];

const initialNotifications = [
    {
        id: 1,
        title: 'Welcome!',
        message: 'This is a Premium Category Application. Please kindly co-operate.',
        date: new Date().toISOString()
    },
    {
        id: 2,
        title: 'Withdrawal Timings',
        message: 'Withdrawal requests will be accepted from 11:00 AM to 4:00 PM. The amount will be credited between 1:00 PM to 5:00 PM. Withdrawals are accepted from Monday to Friday. Withdrawal is not available on Sunday and on bank holidays.',
        date: new Date().toISOString()
    },
    {
        id: 3,
        title: 'How to Play',
        message: 'To play, you pick 3 numbers from 0-9. For example, 5, 3, 6. These are added up (5+3+6=14). The last digit, 4, is used. So your first draw is 5,3,6*4. A second set is drawn the same way. For example, 8,2,8 gives 18, so your second draw is 8,2,8*8. Your final card is (5,3,6*4) X (8,2,8*8).',
        date: new Date(new Date().getTime() - 86400000).toISOString() // Set to yesterday
    }
];

const initialGameRates = {
    'Single Digit': 95,
    'Jodi Digit': 950,
    'Single Pana': 1400,
    'Double Pana': 2800,
    'Triple Pana': 7000,
    'Half Sangam': 13000,
    'Full Sangam': 150000
};

// --- Security Enhancement: Simple Obfuscation ---
// We will encode data before storing it in localStorage to make it harder to read/tamper with.
function encodeData(data) {
    return btoa(JSON.stringify(data));
}

function decodeData(encodedData) {
    return JSON.parse(atob(encodedData));
}

// Function to initialize and get all users from localStorage
function getUsers() {
    let usersData = localStorage.getItem(USERS_STORAGE_KEY);
    let users;
    // If no users are in localStorage, populate with initial data
    if (!usersData) {
        localStorage.setItem(USERS_STORAGE_KEY, encodeData(initialUsers));
        users = initialUsers;
    } else {
        try {
            users = decodeData(usersData);
        } catch (e) {
            // If decoding fails (e.g., old unencoded data), reset with initial data
            localStorage.setItem(USERS_STORAGE_KEY, encodeData(initialUsers));
            users = initialUsers;
        }
    }
    // Backward compatibility: ensure all users have an 'isActive' property
    users.forEach(user => {
        if (user.isActive === undefined) {
            user.isActive = true;
        }
    });
    return users;
}

// Function to save all users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, encodeData(users));
}

// Function to initialize and get all game history from localStorage
function getGameHistory() {
    let historyData = localStorage.getItem(HISTORY_STORAGE_KEY);
    let history;
    if (!historyData) {
        localStorage.setItem(HISTORY_STORAGE_KEY, encodeData(initialHistory));
        history = initialHistory;
    } else {
        try {
            history = decodeData(historyData);
        } catch (e) {
            localStorage.setItem(HISTORY_STORAGE_KEY, encodeData(initialHistory));
            history = initialHistory;
        }
    }
    return history;
}

// Function to save all game history to localStorage
function saveGameHistory(history) {
    localStorage.setItem(HISTORY_STORAGE_KEY, encodeData(history));
}

// Function to initialize and get all game results from localStorage
function getGameResults() {
    let resultsData = localStorage.getItem(RESULTS_STORAGE_KEY);
    let results;
    if (!resultsData) {
        results = {};
    } else {
        try {
            results = decodeData(resultsData);
        } catch (e) {
            results = {};
        }
    }
    return results;
}

// Function to save all game results to localStorage
function saveGameResults(results) {
    localStorage.setItem(RESULTS_STORAGE_KEY, encodeData(results));
}

// Function to initialize and get game rates from localStorage
function getGameRates() {
    let ratesData = localStorage.getItem(GAME_RATES_STORAGE_KEY);
    let rates;
    if (!ratesData) {
        localStorage.setItem(GAME_RATES_STORAGE_KEY, encodeData(initialGameRates));
        rates = initialGameRates;
    } else {
        try {
            rates = decodeData(ratesData);
        } catch (e) {
            localStorage.setItem(GAME_RATES_STORAGE_KEY, encodeData(initialGameRates));
            rates = initialGameRates;
        }
    }
    return rates;
}

// Function to save game rates to localStorage
function saveGameRates(rates) {
    localStorage.setItem(GAME_RATES_STORAGE_KEY, encodeData(rates));
}

// Function to initialize and get all games from localStorage
function getGames() {
    let gamesData = localStorage.getItem(GAMES_STORAGE_KEY);
    let games;
    if (!gamesData) {
        localStorage.setItem(GAMES_STORAGE_KEY, encodeData(initialGames));
        games = initialGames;
    } else {
        try {
            games = decodeData(gamesData);
        } catch (e) {
            localStorage.setItem(GAMES_STORAGE_KEY, encodeData(initialGames));
            games = initialGames;
        }
    }
    return games;
}

// Function to save all games to localStorage
function saveGames(games) {
    localStorage.setItem(GAMES_STORAGE_KEY, encodeData(games));
}

// Function to initialize and get notifications from localStorage
function getNotifications() {
    let notificationsData = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    let notifications;
    if (!notificationsData) {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, encodeData(initialNotifications));
        notifications = initialNotifications;
    } else {
        try {
            notifications = decodeData(notificationsData);
        } catch (e) {
            localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, encodeData(initialNotifications));
            notifications = initialNotifications;
        }
    }
    return notifications;
}

// Function to save notifications to localStorage
function saveNotifications(notifications) {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, encodeData(notifications));
}

// --- Functions for Login Attempt Tracking ---
function getLoginAttempts() {
    const attemptsData = localStorage.getItem(LOGIN_ATTEMPTS_STORAGE_KEY);
    if (!attemptsData) {
        return {};
    }
    try {
        return decodeData(attemptsData);
    } catch (e) {
        return {}; // Return empty object if decoding fails
    }
}
function saveLoginAttempts(attempts) {
    localStorage.setItem(LOGIN_ATTEMPTS_STORAGE_KEY, encodeData(attempts));
}