document.addEventListener("DOMContentLoaded", function() {
    const baseCurrencySelect = document.getElementById("base-currency");
    const targetCurrencySelect = document.getElementById("target-currency");
    const amountInput = document.getElementById("amount");
    const dateInput = document.getElementById("date");
    const convertedAmountDisplay = document.getElementById("converted-amount");
    const historicalRatesContainer = document.getElementById("historical-rates-container");
    const favoriteCurrencyPairsContainer = document.getElementById("favorite-currency-pairs");

    const apiKey = 'fca_live_tyxofLAcwMk2DQ220bPYcrjzOPjzcAVttTwvnkky';
    const apiUrl = `https://api.freecurrencyapi.com/v1`;

    // Previously, the code was not able to recieve informaiton from the server
    fetch(`${apiUrl}/currencies?apikey=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched currency data:', data);
            populateCurrencyDropdowns(data.data);
        })
        .catch(error => console.error('Error fetching currencies:', error));

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

    function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        if (!baseCurrency || !targetCurrency || isNaN(amount) || amount <= 0) {
            convertedAmountDisplay.textContent = "Invalid input";
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
                convertedAmountDisplay.textContent = "Error fetching conversion rate";
                console.error('Error:', error);
            });
    }

    function viewHistoricalRates() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const date = dateInput.value;

        if (!baseCurrency || !targetCurrency || !date) {
            historicalRatesContainer.textContent = "Please select both currencies and a date";
            return;
        }

        fetch(`${apiUrl}/historical?apikey=${apiKey}&base_currency=${baseCurrency}&date=${date}&currencies=${targetCurrency}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.data[date][targetCurrency];
                historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
            })
            .catch(error => {
                historicalRatesContainer.textContent = "Error fetching historical rates";
                console.error('Error:', error);
            });
    }

    function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        if (!baseCurrency || !targetCurrency) {
            alert("Please select both currencies");
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
                    convertCurrency();
                });
                favoriteCurrencyPairsContainer.appendChild(favoriteItem);
            })
            .catch(error => console.error('Error saving favorite pair:', error));
    }

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
                    convertCurrency();
                });
                favoriteCurrencyPairsContainer.appendChild(favoriteItem);
            });
        })
        .catch(error => console.error('Error loading favorite pairs:', error));

    baseCurrencySelect.addEventListener("change", convertCurrency);
    targetCurrencySelect.addEventListener("change", convertCurrency);
    amountInput.addEventListener("input", convertCurrency);
    document.getElementById("historical-rates").addEventListener("click", viewHistoricalRates);
    document.getElementById("save-favorite").addEventListener("click", saveFavoritePair);
});