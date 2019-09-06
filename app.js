(function () {
    'use strict';


    let form = document.forms.namedItem('converter'),
        bynValueEl = form.elements.namedItem('bynValue'),
        selectedCurrencyEl = form.elements.namedItem('selectedCurrency'),
        outputEl = form.elements.namedItem('result'),
        currencyData = new Map();
        

    selectedCurrencyEl.addEventListener('change', () => {
        let currencyCode = selectedCurrencyEl.value;
        if (!currencyData.has(currencyCode)) {
            nbApi(
                `Rates/${currencyCode}?ParamMode=2`,
                (err, currency) => {
                    if (!err) {
                        currencyData.set(currencyCode, currency);
                        
                        event.preventDefault();
                        convert();
                    }
                }
            );
        }
    });


    bynValueEl.oninput = function(){
        event.preventDefault();
        convert();
    };


    function convert() {
        let bynValue = bynValueEl.valueAsNumber || 0,
            {Cur_Scale: scale, Cur_OfficialRate: rate} = currencyData.get(selectedCurrencyEl.value);
        let result = bynValue / rate * scale;
        outputEl.textContent = result.toFixed(2);
    }



    nbApi('Currencies', (error, currencies) => {
        if (error) {
            return;
        }
        fillOptions(currencies);
        selectedCurrencyEl.dispatchEvent(new Event('change'));
    });

    function fillOptions(currencies) {
        selectedCurrencyEl.append(currencies.reduce((fragment, currency) => {
            let currencyExpireDate = new Date(currency.Cur_DateEnd);
            if (currencyExpireDate.getTime() >= Date.now()) {
                let option = document.createElement('option');
                option.textContent = currency.Cur_Name;
                option.value = currency.Cur_Abbreviation;
                fragment.append(option);
            }
            return fragment;
        }, document.createDocumentFragment()));
    }


    function nbApi(type, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `http://www.nbrb.by/API/ExRates/${type}`, true);
        xhr.responseType = 'json';
        xhr.onload = () => callback(false, xhr.response);
        xhr.onerror = () => callback(true, null);
        xhr.send();
    }

    


})();
