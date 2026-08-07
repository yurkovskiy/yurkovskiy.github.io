(function () {
  'use strict';

  var form = document.getElementById('rate-form');
  var startInput = document.getElementById('start-date');
  var endInput = document.getElementById('end-date');
  var currencySelect = document.getElementById('currency');
  var fetchBtn = document.getElementById('fetch-btn');
  var errorBox = document.getElementById('error-box');
  var readoutBody = document.getElementById('readout-body');
  var chartStatus = document.getElementById('chart-status');
  var chartCanvas = document.getElementById('rate-chart');

  var chartInstance = null;

  // ---------- defaults: last 14 days ----------
  (function setDefaultDates() {
    var today = new Date();
    var twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    endInput.value = toInputDate(today);
    startInput.value = toInputDate(twoWeeksAgo);
  })();

  function toInputDate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  // "YYYY-MM-DD" -> "YYYYMMDD" as required by the NBU archive endpoint
  function toNbuDate(inputDateValue) {
    return inputDateValue.replace(/-/g, '');
  }

  // "DD.MM.YYYY" -> Date object, for sorting/labels
  function parseNbuDate(str) {
    var parts = str.split('.');
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  // ---------- live clock ----------
  var clockEl = document.getElementById('clock');
  function tickClock() {
    var now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-GB');
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ---------- form submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideError();

    var startVal = startInput.value;
    var endVal = endInput.value;
    var currency = currencySelect.value;

    if (!startVal || !endVal) {
      showError('Please choose both a start and an end date.');
      return;
    }
    if (startVal > endVal) {
      showError('Start date must be before end date.');
      return;
    }

    fetchRates(toNbuDate(startVal), toNbuDate(endVal), currency);
  });

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function setLoading(isLoading) {
    fetchBtn.disabled = isLoading;
    fetchBtn.querySelector('.btn-label').textContent = isLoading ? 'Fetching…' : 'Fetch rates';
    chartStatus.hidden = false;
    chartStatus.textContent = 'Loading data from NBU…';
  }

  // ---------- AJAX request to the NBU exchange archive ----------
  function fetchRates(startDate, endDate, valcode) {
    setLoading(true);

    var url = 'https://bank.gov.ua/NBU_Exchange/exchange_site' +
      '?start=' + startDate +
      '&end=' + endDate +
      '&valcode=' + valcode +
      '&sort=exchangedate&order=desc&json';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function () {
      fetchBtn.disabled = false;
      fetchBtn.querySelector('.btn-label').textContent = 'Fetch rates';

      if (xhr.status >= 200 && xhr.status < 300) {
        var data = xhr.response;
        if (!data || !data.length) {
          chartStatus.hidden = false;
          chartStatus.textContent = 'No data returned for that range.';
          resetReadout();
          return;
        }
        handleData(data, valcode);
      } else {
        showError('NBU API responded with status ' + xhr.status + '.');
        chartStatus.hidden = false;
        chartStatus.textContent = 'Request failed.';
      }
    };

    xhr.onerror = function () {
      fetchBtn.disabled = false;
      fetchBtn.querySelector('.btn-label').textContent = 'Fetch rates';
      showError('Network error — the NBU API may be unreachable from the browser (CORS), or you are offline.');
      chartStatus.hidden = false;
      chartStatus.textContent = 'Request failed.';
    };

    xhr.send();
  }

  function normalizeRate(record) {
    // some currencies report a per-unit rate; normalize to rate-per-1
    if (record.units && record.units > 1 && record.rate_per_unit) {
      return record.rate_per_unit;
    }
    return record.rate;
  }

  function handleData(data, valcode) {
    // sort chronologically ascending for the chart regardless of API order
    var sorted = data.slice().sort(function (a, b) {
      return parseNbuDate(a.exchangedate) - parseNbuDate(b.exchangedate);
    });

    var labels = sorted.map(function (r) {
      return r.exchangedate;
    });
    var rates = sorted.map(normalizeRate);

    chartStatus.hidden = true;
    renderChart(labels, rates, valcode.toUpperCase());
    renderReadout(sorted[sorted.length - 1], sorted.length > 1 ? sorted[sorted.length - 2] : null, valcode.toUpperCase());
  }

  function renderReadout(latest, previous, valcode) {
    var latestRate = normalizeRate(latest);
    var deltaHtml = '';

    if (previous) {
      var prevRate = normalizeRate(previous);
      var diff = latestRate - prevRate;
      var pct = (diff / prevRate) * 100;
      var direction = diff > 0.0001 ? 'up' : diff < -0.0001 ? 'down' : 'flat';
      var arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '·';
      deltaHtml =
        '<div class="readout-delta ' + direction + '">' +
        arrow + ' ' + (diff >= 0 ? '+' : '') + diff.toFixed(4) +
        ' (' + (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%) vs previous</div>';
    }

    readoutBody.innerHTML =
      '<div class="readout-rate">' + latestRate.toFixed(4) +
      '<span class="unit">UAH / 1 ' + valcode + '</span></div>' +
      deltaHtml +
      '<div class="readout-date">as of ' + latest.exchangedate + '</div>';
  }

  function resetReadout() {
    readoutBody.innerHTML = '<div class="readout-empty">No data for this range</div>';
  }

  function renderChart(labels, rates, valcode) {
    var ctx = chartCanvas.getContext('2d');

    if (chartInstance) {
      chartInstance.destroy();
    }

    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    var muted = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
    var border = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    var text = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'UAH per 1 ' + valcode,
          data: rates,
          borderColor: accent,
          backgroundColor: 'rgba(255, 197, 66, 0.08)',
          pointBackgroundColor: accent,
          pointRadius: labels.length > 40 ? 0 : 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: true,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#141B26',
            borderColor: border,
            borderWidth: 1,
            titleColor: text,
            bodyColor: text,
            titleFont: { family: 'IBM Plex Mono', size: 11 },
            bodyFont: { family: 'IBM Plex Mono', size: 12 },
            callbacks: {
              label: function (item) {
                return item.parsed.y.toFixed(4) + ' UAH';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: border },
            ticks: { color: muted, font: { family: 'IBM Plex Mono', size: 10 }, maxRotation: 0, autoSkip: true }
          },
          y: {
            grid: { color: border },
            ticks: { color: muted, font: { family: 'IBM Plex Mono', size: 10 } }
          }
        }
      }
    });
  }
})();
