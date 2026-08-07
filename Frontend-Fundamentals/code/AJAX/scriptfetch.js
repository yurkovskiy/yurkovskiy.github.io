const btnRate = document.getElementById("btnRate");
const currency = document.getElementById("currency");
const edate = document.getElementById("edate");
const sectionData = document.getElementById("data");
const BASE_URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=";

btnRate.addEventListener("click", async () => {
    const URI = `${BASE_URL}${currency.value}&date=${edate.value.split("-").join("")}&json`;
    const response = await fetch(URI);
    if (response.ok) {
        const data = await response.json(); // XHR.responseText
        sectionData.innerHTML = `<h2>${data[0].rate}</h2>`;
    }
});
