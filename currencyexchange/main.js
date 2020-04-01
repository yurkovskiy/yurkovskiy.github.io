btnCalc.addEventListener("click", exchageRate, false);


function exchageRate(e) {
    var XHR = new XMLHttpRequest();
    var BASE_URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=";
    var date = cdate.value.split("-").join("");
    var URI = `${BASE_URL}${currency.value}&date=${date}&json`;
    XHR.open("GET", URI);
    XHR.send();
    // XHR.add  EventListener("readystatechange", function() {
    //     if (XHR.readyState === 4 && XHR.status === 200) {
    //         //console.log(XHR.responseText);
    //         var data = JSON.parse(XHR.responseText);
    //         result.innerHTML = `<h2>${data[0].rate}</h2>`;
    //     }
    // },false);
}




