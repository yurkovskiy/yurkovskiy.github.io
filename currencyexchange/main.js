btnCalc.addEventListener("click", exchageRate, false);

function exchageRate(e) {
    var rates = [];
    var startDate = new Date(sdate.value);
    var endDate = new Date(edate.value);
    const ONEDAY = 24 * 3600 * 1000;
    
    if (endDate < startDate) {
        return;
    }

    var diff = (endDate - startDate) / ONEDAY;
    var currDate;
    let i = 0;
    while(i <= diff) {
        currDate = new Date(startDate.valueOf() + (i * ONEDAY));
        getRateByDate(currency.value, dateToStringNBU(currDate), rates);
        i++;
    }
    
    console.log(rates.length);
    for (let j = 0; j < rates.length; j++) {
        var p = document.createElement(p);
        p.innerText = rates[j];
        result.appendChild(p);
    }
    //return;
}


function getRateByDate(currency, cdate, arr) {
    var XHR = new XMLHttpRequest();
    const BASE_URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=";
    var URI = `${BASE_URL}${currency}&date=${cdate}&json`;
    XHR.open("GET", URI);
    XHR.send();
    XHR.addEventListener("readystatechange", function() {
        if (XHR.readyState === 4 && XHR.status === 200) {
            var data = JSON.parse(XHR.responseText);
            arr.push(data[0].rate);
        }
    },false);
}

function dateToStringNBU(dateObj) {
    function add0(value) {
        return (value.toString().length < 2) ? `0${value}` : value.toString();
    }
    if (dateObj instanceof Date) {
        return `${dateObj.getFullYear()}${add0(dateObj.getMonth() + 1)}${add0(dateObj.getDate())}`;
    }
    return false;
}