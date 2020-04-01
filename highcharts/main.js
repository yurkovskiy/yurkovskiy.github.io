var dates = ["23/03", "24/03", "25/03", "26/03"];
var rates = [27.7386, 28.11, 27.7728, 27.9552];


Highcharts.chart('chart', {
    chart: {
        type: 'spline'
    },
    title: {
        text: 'UAH/USD Exchange Rate'
    },
    subtitle: {
        text: 'Source: bank.gov.ua'
    },
    xAxis: {
        categories: dates
    },
    yAxis: {
        title: {
            text: 'rate UAH'
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{
        name: 'UAH/USD',
        data: rates
    }]
});