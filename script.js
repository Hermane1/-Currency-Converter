document.addEventListener("DOMContentLoaded", function() {
    // Get references to DOM elements
    const baseCurrencySelect = document.getElementById("base-currency");
    const targetCurrencySelect = document.getElementById("target-currency");
    const amountInput = document.getElementById("amount");
    const dateInput = document.getElementById("date");
    const convertedAmountDisplay = document.getElementById("converted-amount");
    const historicalRatesContainer = document.getElementById("historical-rates-container");
    const favoriteCurrencyPairsContainer = document.getElementById("favorite-currency-pairs");

    // API key and base URL for the currency API
    const apiKey = 'fca_live_tyxofLAcwMk2DQ220bPYcrjzOPjzcAVttTwvnkky';
    const apiUrl = `https://api.freecurrencyapi.com/v1`;

    // Fetch available currencies and populate dropdowns
    fetch(`${apiUrl}/currencies?apikey=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched currency data:', data);
            populateCurrencyDropdowns(data.data); // Populate dropdowns with fetched data
        })
        .catch(error => console.error('Error fetching currencies:', error));

    // Function to populate currency dropdowns
    function populateCurrencyDropdowns(data) {
        for (const currencyCode in data) {
            const currency = data[currencyCode];
            const option = document.createElement("option");
            option.value = currencyCode;
            option.textContent = `${currencyCode} - ${currency.name}`;
            baseCurrencySelect.appendChild(option.cloneNode(true));
            targetCurrencySelect.appendChild(option.cloneNode(true));
        }
    }

    // Function to convert currency based on selected values
    function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        if (!baseCurrency || !targetCurrency || isNaN(amount) || amount <= 0) {
            convertedAmountDisplay.textContent = "Invalid input"; // Display error message for invalid input
            return;
        }

        fetch(`${apiUrl}/latest?apikey=${apiKey}&base_currency=${baseCurrency}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.data[targetCurrency];
                const convertedAmount = amount * rate;
                convertedAmountDisplay.textContent = `${amount} ${baseCurrency} = ${convertedAmount.toFixed(2)} ${targetCurrency}`;
            })
            .catch(error => {
                convertedAmountDisplay.textContent = "Error fetching conversion rate"; // Display error message for API fetch failure
                console.error('Error:', error);
            });
    }

    // Function to view historical exchange rates
    function viewHistoricalRates() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const date = dateInput.value;

        if (!baseCurrency || !targetCurrency || !date) {
            historicalRatesContainer.textContent = "Please select both currencies and a date"; // Display error message for missing inputs
            return;
        }

        fetch(`${apiUrl}/historical?apikey=${apiKey}&base_currency=${baseCurrency}&date=${date}&currencies=${targetCurrency}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.data[date][targetCurrency];
                historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
            })
            .catch(error => {
                historicalRatesContainer.textContent = "Error fetching historical rates"; // Display error message for API fetch failure
                console.error('Error:', error);
            });
    }

    // Function to save a favorite currency pair
    function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        if (!baseCurrency || !targetCurrency) {
            alert("Please select both currencies"); // Alert for missing currency selections
            return;
        }

        const favoritePair = `${baseCurrency}/${targetCurrency}`;

        fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base: baseCurrency, target: targetCurrency })
        })
            .then(response => response.json())
            .then(data => {
                const favoriteItem = document.createElement("div");
                favoriteItem.textContent = favoritePair;
                favoriteItem.className = "favorite-item";
                favoriteItem.addEventListener("click", () => {
                    baseCurrencySelect.value = baseCurrency;
                    targetCurrencySelect.value = targetCurrency;
                    convertCurrency(); // Convert currency when favorite pair is clicked
                });
                favoriteCurrencyPairsContainer.appendChild(favoriteItem);
            })
            .catch(error => console.error('Error saving favorite pair:', error));
    }

    // Fetch and display saved favorite currency pairs
    fetch('/api/favorites')
        .then(response => response.json())
        .then(favorites => {
            favorites.forEach(pair => {
                const favoriteItem = document.createElement("div");
                favoriteItem.textContent = `${pair.base}/${pair.target}`;
                favoriteItem.className = "favorite-item";
                favoriteItem.addEventListener("click", () => {
                    baseCurrencySelect.value = pair.base;
                    targetCurrencySelect.value = pair.target;
                    convertCurrency(); // Convert currency when favorite pair is clicked
                });
                favoriteCurrencyPairsContainer.appendChild(favoriteItem);
            });
        })
        .catch(error => console.error('Error loading favorite pairs:', error));

    // Event listeners for user actions
    baseCurrencySelect.addEventListener("change", convertCurrency); // Convert currency when base currency is changed
    targetCurrencySelect.addEventListener("change", convertCurrency); // Convert currency when target currency is changed
    amountInput.addEventListener("input", convertCurrency); // Convert currency when amount is changed
    document.getElementById("historical-rates").addEventListener("click", viewHistoricalRates); // View historical rates on button click
    document.getElementById("save-favorite").addEventListener("click", saveFavoritePair); // Save favorite pair on button click
});
