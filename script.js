document.addEventListener("DOMContentLoaded", function() {
    const baseCurrencySelect = document.getElementById("base-currency");
    const targetCurrencySelect = document.getElementById("target-currency");
    const amountInput = document.getElementById("amount");
    const convertedAmountDisplay = document.getElementById("converted-amount");
    const historicalRatesContainer = document.getElementById("historical-rates-container");
    const favoriteCurrencyPairsContainer = document.getElementById("favorite-currency-pairs");
    const quotaInfo = document.getElementById("quota-info");

    const apiKey = 'fca_live_tyxofLAcwMk2DQ220bPYcrjzOPjzcAVttTwvnkky';
    const apiUrl = `https://api.freecurrencyapi.com/v1/`;

    const quotaData = {
        "account_id": 335143114354331650,
        "quotas": {
            "month": {
                "total": 5000,
                "used": 7,
                "remaining": 4993
            },
            "grace": {
                "total": 0,
                "used": 0,
                "remaining": 0
            }
        }
    };

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

    function displayQuotaInfo(data) {
        quotaInfo.innerHTML = `
            <h2>Account Quotas</h2>
            <p>Account ID: ${data.account_id}</p>
            <p>Monthly Quota: ${data.quotas.month.total}</p>
            <p>Used: ${data.quotas.month.used}</p>
            <p>Remaining: ${data.quotas.month.remaining}</p>
            <p>Grace Quota: ${data.quotas.grace.total}</p>
        `;
    }

    populateCurrencyDropdowns(currencyData);
    displayQuotaInfo(quotaData);

    function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        if (!baseCurrency || !targetCurrency || isNaN(amount) || amount <= 0) {
            convertedAmountDisplay.textContent = "Invalid input";
            return;
        }

        fetch(`${apiUrl}/latest?apikey=${apiKey}&base_currency=${targetCurrency}`, {
            method: 'GET',
            headers: { 'apikey': apiKey }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                convertedAmountDisplay.textContent = `${amount} ${baseCurrency} = ${data.result.toFixed(2)} ${targetCurrency}`;
            } else {
                convertedAmountDisplay.textContent = "Conversion error";
            }
        })
        .catch(error => {
            convertedAmountDisplay.textContent = "Error fetching conversion rate";
            console.error('Error:', error);
        });
    }

    document.getElementById("base-currency").addEventListener("change", convertCurrency);
    document.getElementById("target-currency").addEventListener("change", convertCurrency);
    document.getElementById("amount").addEventListener("input", convertCurrency);

    function viewHistoricalRates() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        if (!baseCurrency || !targetCurrency) {
            historicalRatesContainer.textContent = "Please select both currencies";
            return;
        }

        const date = '2023-01-01';

        fetch(`${apiUrl}${date}?symbols=${targetCurrency}&base=${baseCurrency}`, {
            method: 'GET',
            headers: { 'apikey': apiKey }
        })
        .then(response => response.json())
        .then(data => {
            
            if (data.success) {
                historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${data.rates[targetCurrency]} ${targetCurrency}`;
            } else {
                historicalRatesContainer.textContent = "Error fetching historical rates";
            }
        })
        .catch(error => {
            historicalRatesContainer.textContent = "Error fetching historical rates";
            console.error('Error:', error);
        });
    }

    document.getElementById("historical-rates").addEventListener("click", viewHistoricalRates);

    function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;

        if (!baseCurrency || !targetCurrency) {
            alert("Please select both currencies");
            return;
        }

        const favoritePair = `${baseCurrency}/${targetCurrency}`;

        const favoriteItem = document.createElement("div");
        favoriteItem.textContent = favoritePair;
        favoriteItem.className = "favorite-item";
        favoriteItem.addEventListener("click", () => {
            baseCurrencySelect.value = baseCurrency;
            targetCurrencySelect.value = targetCurrency;
            convertCurrency();
        });

        favoriteCurrencyPairsContainer.appendChild(favoriteItem);

        fetch('http://localhost:3000/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base: baseCurrency, target: targetCurrency })
        })
        .then(response => response.json())
        .then(data => console.log('Favorite pair saved:', data))
        .catch(error => console.error('Error saving favorite pair:', error));
    }

    document.getElementById("save-favorite").addEventListener("click", saveFavoritePair);

    fetch('http://localhost:3000/api/favorites')
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
});
