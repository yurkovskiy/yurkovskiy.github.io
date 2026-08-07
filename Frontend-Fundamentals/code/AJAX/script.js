const btnRate = document.getElementById("btnRate");
const currency = document.getElementById("currency");
const edate = document.getElementById("edate");
const sectionData = document.getElementById("data");
const BASE_URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=";

btnRate.addEventListener("click", () => {
    const URI = `${BASE_URL}${currency.value}&date=${edate.value.split("-").join("")}&json`;
    const XHR = new XMLHttpRequest();
    XHR.open("GET", URI);
    XHR.send();
    XHR.addEventListener("readystatechange", () => {
        if (XHR.readyState === 4) {
            const data = JSON.parse(XHR.responseText)[0];
            sectionData.innerHTML = `<h2>${data.rate}</h2>`;
        }
    });
});
