async function convertCurrency() {
    let amount = document.getElementById("amount").value;
    let fromCurrency = document.getElementById("fromCurrency").value;
    let toCurrency = document.getElementById("toCurrency").value;
    
    if (!amount) {
        document.getElementById("result").innerText = "Please enter an amount";
        return;
    }
    
    try {
        let response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        let data = await response.json();
        let rate = data.rates[toCurrency];
        let convertedAmount = (amount * rate).toFixed(2);
        document.getElementById("result").innerText = `Converted Amount: ${convertedAmount} ${toCurrency}`;
        document.getElementById("lastUpdated").innerText = `Last Updated: ${data.date}`;
        fetchHistoricalRates(fromCurrency, toCurrency);
    } catch (error) {
        document.getElementById("result").innerText = "Error fetching exchange rates";
    }
}

async function loadCurrencies() {
    try {
        let response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        let data = await response.json();
        let currencies = Object.keys(data.rates);
        populateDropdowns(currencies);
        document.getElementById("lastUpdated").innerText = `Last Updated: ${data.date}`;
    } catch (error) {
        console.error("Error loading currencies", error);
    }
}

function populateDropdowns(currencies) {
    let dropdowns = document.querySelectorAll("select");
    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = "";
        currencies.forEach(currency => {
            let option = document.createElement("option");
            option.value = currency;
            option.textContent = currency;
            dropdown.appendChild(option);
        });
    });
}

function filterCurrencies(inputId, dropdownId) {
    let input = document.getElementById(inputId).value.toUpperCase();
    let dropdown = document.getElementById(dropdownId);
    let options = dropdown.getElementsByTagName("option");
    for (let i = 0; i < options.length; i++) {
        let txtValue = options[i].textContent || options[i].innerText;
        options[i].style.display = txtValue.toUpperCase().indexOf(input) > -1 ? "" : "none";
    }
}

async function fetchHistoricalRates(fromCurrency, toCurrency) {
    try {
        let response = await fetch(`https://api.exchangerate-api.com/v4/history/${fromCurrency}`);
        let data = await response.json();
        let labels = Object.keys(data.rates).slice(-10);
        let values = labels.map(date => data.rates[date][toCurrency]);
        updateChart(labels, values, toCurrency);
    } catch (error) {
        console.error("Error fetching historical rates", error);
    }
}

function updateChart(labels, values, currency) {
    let ctx = document.getElementById("rateChart").getContext("2d");
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: `Exchange Rate (${currency})`,
                data: values,
                borderColor: "#28a745",
                fill: false
            }]
        }
    });
}

window.onload = loadCurrencies;
