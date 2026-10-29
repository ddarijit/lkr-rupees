/**
 * RupeeShift - LKR ⇄ INR Converter Logic
 * Real-time bidirectional currency conversion between Sri Lankan Rupee & Indian Rupee.
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const DEFAULT_INR_TO_LKR_RATE = 3.62; // Fallback rate (1 INR ≈ 3.62 LKR)
  const STORAGE_KEYS = {
    THEME: 'rupeeshift_theme',
    SAVED_RATE: 'rupeeshift_rate',
    LAST_UPDATED: 'rupeeshift_rate_time',
    CUSTOM_RATE: 'rupeeshift_custom_rate',
    FEE: 'rupeeshift_fee'
  };

  const CURRENCIES = {
    LKR: {
      code: 'LKR',
      name: 'Sri Lankan Rupee',
      flag: '🇱🇰',
      symbol: 'Rs.',
      presets: [500, 1000, 2500, 5000, 10000, 50000, 100000]
    },
    INR: {
      code: 'INR',
      name: 'Indian Rupee',
      flag: '🇮🇳',
      symbol: '₹',
      presets: [100, 500, 1000, 2000, 5000, 10000, 25000]
    }
  };

  // --- State ---
  let state = {
    sourceCurrency: 'LKR',
    targetCurrency: 'INR',
    inrToLkrRate: parseFloat(localStorage.getItem(STORAGE_KEYS.SAVED_RATE)) || DEFAULT_INR_TO_LKR_RATE,
    customRate: parseFloat(localStorage.getItem(STORAGE_KEYS.CUSTOM_RATE)) || null,
    feePercentage: parseFloat(localStorage.getItem(STORAGE_KEYS.FEE)) || 0,
    isLiveRate: false,
    lastUpdatedTime: localStorage.getItem(STORAGE_KEYS.LAST_UPDATED) || null,
    sourceRawValue: '1000',
    activeDirection: 'source' // 'source' or 'target'
  };

  // --- DOM Elements ---
  const el = {
    // Header
    statusText: document.getElementById('statusText'),
    rateStatusPill: document.getElementById('rateStatusPill'),
    statusDot: document.querySelector('.status-dot'),
    refreshBtn: document.getElementById('refreshBtn'),
    spinTarget: document.querySelector('.spin-target'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // Source panel
    sourceFlag: document.getElementById('sourceFlag'),
    sourceCode: document.getElementById('sourceCode'),
    sourceName: document.getElementById('sourceName'),
    sourceSymbol: document.getElementById('sourceSymbol'),
    sourceInput: document.getElementById('sourceInput'),
    sourceInWords: document.getElementById('sourceInWords'),
    clearBtn: document.getElementById('clearBtn'),

    // Swap & Summary
    swapBtn: document.getElementById('swapBtn'),
    rateSummaryBadge: document.getElementById('rateSummaryBadge'),

    // Target panel
    targetFlag: document.getElementById('targetFlag'),
    targetCode: document.getElementById('targetCode'),
    targetName: document.getElementById('targetName'),
    targetSymbol: document.getElementById('targetSymbol'),
    targetInput: document.getElementById('targetInput'),
    targetInWords: document.getElementById('targetInWords'),
    copyResultBtn: document.getElementById('copyResultBtn'),
    copyBtnText: document.getElementById('copyBtnText'),

    // Presets
    presetChips: document.getElementById('presetChips'),

    // Settings
    customRateInput: document.getElementById('customRateInput'),
    resetRateBtn: document.getElementById('resetRateBtn'),
    rateUpdatedTime: document.getElementById('rateUpdatedTime'),
    feeSlider: document.getElementById('feeSlider'),
    feePercentageText: document.getElementById('feePercentageText'),

    // Cheat Sheet Tables
    lkrToInrTableBody: document.querySelector('#lkrToInrTable tbody'),
    inrToLkrTableBody: document.querySelector('#inrToLkrTable tbody'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
  };

  // --- Helper Functions ---

  function parseCleanNumber(str) {
    if (!str) return 0;
    const clean = String(str).replace(/,/g, '').trim();
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }

  function formatNumber(num, maxDecimals = 2) {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals
    }).format(num);
  }

  function formatFixed(num, decimals = 2) {
    if (isNaN(num)) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  function getEffectiveInrToLkrRate() {
    return state.customRate !== null && !isNaN(state.customRate) && state.customRate > 0
      ? state.customRate
      : state.inrToLkrRate;
  }

  // --- Verbal Number Reader ---
  function numberToWords(num, currencyCode) {
    const n = Math.floor(Math.abs(num));
    if (n === 0) return `Zero ${currencyCode === 'LKR' ? 'Sri Lankan Rupees' : 'Indian Rupees'}`;
    if (n > 999999999) return `Over 999 Million ${currencyCode}`;

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertGroup(val) {
      let str = '';
      if (val >= 100) {
        str += ones[Math.floor(val / 100)] + ' Hundred ';
        val %= 100;
      }
      if (val >= 20) {
        str += tens[Math.floor(val / 10)] + ' ';
        val %= 10;
      }
      if (val > 0) {
        str += ones[val] + ' ';
      }
      return str.trim();
    }

    let result = '';
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;

    if (crore > 0) result += convertGroup(crore) + ' Crore ';
    if (lakh > 0) result += convertGroup(lakh) + ' Lakh ';
    if (thousand > 0) result += convertGroup(thousand) + ' Thousand ';
    if (remainder > 0) result += convertGroup(remainder);

    const currencyTitle = currencyCode === 'LKR' ? 'Sri Lankan Rupees' : 'Indian Rupees';
    return (result.trim() || 'Zero') + ' ' + currencyTitle;
  }

  // --- API Rate Fetcher ---
  async function fetchExchangeRate() {
    if (el.spinTarget) el.spinTarget.classList.add('spin');
    el.statusText.textContent = 'Updating...';

    let fetchedRate = null;
    let fetchedTime = null;

    try {
      // Primary API: open.er-api.com (free, high availability, no API key needed)
      const res = await fetch('https://open.er-api.com/v6/latest/INR', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && data.rates.LKR) {
          fetchedRate = data.rates.LKR;
          fetchedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    } catch (err) {
      console.warn('Primary exchange API fetch failed:', err);
    }

    // Secondary fallback API
    if (!fetchedRate) {
      try {
        const res2 = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json', { cache: 'no-store' });
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.inr && data2.inr.lkr) {
            fetchedRate = data2.inr.lkr;
            fetchedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      } catch (err2) {
        console.warn('Secondary exchange API fetch failed:', err2);
      }
    }

    if (fetchedRate) {
      state.inrToLkrRate = fetchedRate;
      state.isLiveRate = true;
      state.lastUpdatedTime = fetchedTime;
      localStorage.setItem(STORAGE_KEYS.SAVED_RATE, fetchedRate);
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, fetchedTime);

      el.statusText.textContent = 'Live Rate';
      el.statusDot.classList.remove('warning');
      el.rateUpdatedTime.textContent = `Last updated: Today at ${fetchedTime}`;
    } else {
      state.isLiveRate = false;
      el.statusText.textContent = 'Offline / Saved Rate';
      el.statusDot.classList.add('warning');
      el.rateUpdatedTime.textContent = state.lastUpdatedTime 
        ? `Last updated: ${state.lastUpdatedTime} (Cached)`
        : 'Using standard reference rate (1 INR ≈ 3.62 LKR)';
    }

    setTimeout(() => {
      if (el.spinTarget) el.spinTarget.classList.remove('spin');
    }, 600);

    updateConversion();
    updateCheatSheet();
  }

  // --- Calculation Core ---
  function calculateConversion(amount, fromCode, toCode) {
    const rawRate = getEffectiveInrToLkrRate();
    if (!amount || amount <= 0 || !rawRate) return 0;

    const feeMultiplier = 1 - (state.feePercentage / 100);

    if (fromCode === 'LKR' && toCode === 'INR') {
      // 1 INR = rawRate LKR => 1 LKR = (1 / rawRate) INR
      return (amount / rawRate) * feeMultiplier;
    } else if (fromCode === 'INR' && toCode === 'LKR') {
      // 1 INR = rawRate LKR
      return (amount * rawRate) * feeMultiplier;
    }
    return amount;
  }

  function calculateReverse(targetAmount, fromCode, toCode) {
    const rawRate = getEffectiveInrToLkrRate();
    if (!targetAmount || targetAmount <= 0 || !rawRate) return 0;

    const feeMultiplier = 1 - (state.feePercentage / 100);
    const safeMultiplier = feeMultiplier > 0 ? feeMultiplier : 1;

    if (fromCode === 'LKR' && toCode === 'INR') {
      // targetAmount is in INR, what was source LKR?
      return (targetAmount * rawRate) / safeMultiplier;
    } else if (fromCode === 'INR' && toCode === 'LKR') {
      // targetAmount is in LKR, what was source INR?
      return (targetAmount / rawRate) / safeMultiplier;
    }
    return targetAmount;
  }

  // --- UI Updates ---
  function updateConversion() {
    const rate = getEffectiveInrToLkrRate();
    const inverseRate = rate > 0 ? (1 / rate) : 0;

    // Update rate summary badge
    if (state.customRate !== null) {
      el.rateSummaryBadge.textContent = `⚡ Custom: 1 INR = ${rate.toFixed(3)} LKR`;
      el.statusText.textContent = 'Custom Rate';
      el.statusDot.classList.add('warning');
    } else {
      el.rateSummaryBadge.textContent = `1 INR = ${rate.toFixed(2)} LKR • 1 LKR = ${inverseRate.toFixed(4)} INR`;
    }

    if (state.activeDirection === 'source') {
      const srcVal = parseCleanNumber(el.sourceInput.value);
      const converted = calculateConversion(srcVal, state.sourceCurrency, state.targetCurrency);

      if (srcVal === 0 && el.sourceInput.value === '') {
        el.targetInput.value = '';
        el.sourceInWords.textContent = `Zero ${CURRENCIES[state.sourceCurrency].name}s`;
        el.targetInWords.textContent = `Zero ${CURRENCIES[state.targetCurrency].name}s`;
      } else {
        el.targetInput.value = formatNumber(converted, 2);
        el.sourceInWords.textContent = numberToWords(srcVal, state.sourceCurrency);
        el.targetInWords.textContent = numberToWords(converted, state.targetCurrency);
      }
    } else {
      const tgtVal = parseCleanNumber(el.targetInput.value);
      const reverseConverted = calculateReverse(tgtVal, state.sourceCurrency, state.targetCurrency);

      if (tgtVal === 0 && el.targetInput.value === '') {
        el.sourceInput.value = '';
        el.sourceInWords.textContent = `Zero ${CURRENCIES[state.sourceCurrency].name}s`;
        el.targetInWords.textContent = `Zero ${CURRENCIES[state.targetCurrency].name}s`;
      } else {
        el.sourceInput.value = formatNumber(reverseConverted, 2);
        el.sourceInWords.textContent = numberToWords(reverseConverted, state.sourceCurrency);
        el.targetInWords.textContent = numberToWords(tgtVal, state.targetCurrency);
      }
    }
  }

  function renderCurrencies() {
    const src = CURRENCIES[state.sourceCurrency];
    const tgt = CURRENCIES[state.targetCurrency];

    el.sourceFlag.textContent = src.flag;
    el.sourceCode.textContent = src.code;
    el.sourceName.textContent = src.name;
    el.sourceSymbol.textContent = src.symbol;

    el.targetFlag.textContent = tgt.flag;
    el.targetCode.textContent = tgt.code;
    el.targetName.textContent = tgt.name;
    el.targetSymbol.textContent = tgt.symbol;

    renderPresets();
    updateConversion();
  }

  function renderPresets() {
    const src = CURRENCIES[state.sourceCurrency];
    el.presetChips.innerHTML = '';

    src.presets.forEach(val => {
      const chip = document.createElement('button');
      chip.className = 'preset-chip';
      chip.textContent = `+${src.symbol} ${formatNumber(val)}`;
      chip.setAttribute('aria-label', `Add ${val} ${src.code}`);

      chip.addEventListener('click', () => {
        const current = parseCleanNumber(el.sourceInput.value);
        const next = current + val;
        el.sourceInput.value = formatNumber(next);
        state.activeDirection = 'source';
        updateConversion();
        el.sourceInput.focus();
      });

      el.presetChips.appendChild(chip);
    });
  }

  function updateCheatSheet() {
    const rate = getEffectiveInrToLkrRate();
    if (!rate || rate <= 0) return;

    // LKR to INR Cheat sheet values
    const lkrAmounts = [100, 500, 1000, 2500, 5000, 10000, 50000];
    let lkrHtml = '';
    lkrAmounts.forEach(lkr => {
      const inr = lkr / rate;
      lkrHtml += `
        <tr>
          <td>Rs. ${formatNumber(lkr)}</td>
          <td class="text-right">₹ ${formatFixed(inr, 2)}</td>
        </tr>
      `;
    });
    el.lkrToInrTableBody.innerHTML = lkrHtml;

    // INR to LKR Cheat sheet values
    const inrAmounts = [50, 100, 500, 1000, 2000, 5000, 10000];
    let inrHtml = '';
    inrAmounts.forEach(inr => {
      const lkr = inr * rate;
      inrHtml += `
        <tr>
          <td>₹ ${formatNumber(inr)}</td>
          <td class="text-right">Rs. ${formatFixed(lkr, 2)}</td>
        </tr>
      `;
    });
    el.inrToLkrTableBody.innerHTML = inrHtml;
  }

  function showToast(message) {
    el.toastMessage.textContent = message;
    el.toast.classList.add('show');
    setTimeout(() => {
      el.toast.classList.remove('show');
    }, 2400);
  }

  // --- Swap Action ---
  function swapCurrencies() {
    // Invert source and target
    const temp = state.sourceCurrency;
    state.sourceCurrency = state.targetCurrency;
    state.targetCurrency = temp;

    // Swap input values if both are filled
    const srcVal = el.sourceInput.value;
    const tgtVal = el.targetInput.value;
    el.sourceInput.value = tgtVal;
    state.activeDirection = 'source';

    // Button spin animation
    el.swapBtn.style.transform = 'scale(0.92) rotate(180deg)';
    setTimeout(() => {
      el.swapBtn.style.transform = '';
    }, 250);

    renderCurrencies();
  }

  // --- Theme Toggle ---
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Source input typing
    el.sourceInput.addEventListener('input', (e) => {
      state.activeDirection = 'source';
      // Format loosely without breaking decimals
      const val = e.target.value.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) {
        e.target.value = parts[0] + '.' + parts.slice(1).join('');
      } else {
        e.target.value = val;
      }
      updateConversion();
    });

    // Target input typing (reverse calculation!)
    el.targetInput.addEventListener('input', (e) => {
      state.activeDirection = 'target';
      const val = e.target.value.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) {
        e.target.value = parts[0] + '.' + parts.slice(1).join('');
      } else {
        e.target.value = val;
      }
      updateConversion();
    });

    // Formatting on blur
    el.sourceInput.addEventListener('blur', () => {
      const num = parseCleanNumber(el.sourceInput.value);
      if (num > 0) {
        el.sourceInput.value = formatNumber(num, 2);
      }
    });

    el.targetInput.addEventListener('blur', () => {
      const num = parseCleanNumber(el.targetInput.value);
      if (num > 0) {
        el.targetInput.value = formatNumber(num, 2);
      }
    });

    // Clear Button
    el.clearBtn.addEventListener('click', () => {
      el.sourceInput.value = '';
      el.targetInput.value = '';
      state.activeDirection = 'source';
      updateConversion();
      el.sourceInput.focus();
    });

    // Swap Button
    el.swapBtn.addEventListener('click', swapCurrencies);

    // Refresh Button
    el.refreshBtn.addEventListener('click', () => {
      fetchExchangeRate();
    });

    // Theme Toggle
    el.themeToggleBtn.addEventListener('click', toggleTheme);

    // Copy Result
    el.copyResultBtn.addEventListener('click', () => {
      const rawVal = el.targetInput.value;
      if (!rawVal || rawVal === '0') {
        showToast('Nothing to copy yet!');
        return;
      }
      const textToCopy = `${CURRENCIES[state.targetCurrency].symbol} ${rawVal} (${CURRENCIES[state.targetCurrency].code})`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        el.copyBtnText.textContent = 'Copied!';
        showToast(`Copied ${textToCopy}`);
        setTimeout(() => {
          el.copyBtnText.textContent = 'Copy';
        }, 1800);
      }).catch(() => {
        showToast('Failed to copy');
      });
    });

    // Custom Rate Input
    if (state.customRate) {
      el.customRateInput.value = state.customRate;
    }
    el.customRateInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        state.customRate = val;
        localStorage.setItem(STORAGE_KEYS.CUSTOM_RATE, val);
      } else {
        state.customRate = null;
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_RATE);
      }
      updateConversion();
      updateCheatSheet();
    });

    // Reset Custom Rate
    el.resetRateBtn.addEventListener('click', () => {
      state.customRate = null;
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_RATE);
      el.customRateInput.value = '';
      el.statusText.textContent = state.isLiveRate ? 'Live Rate' : 'Standard Rate';
      el.statusDot.classList.toggle('warning', !state.isLiveRate);
      updateConversion();
      updateCheatSheet();
      showToast('Reset to live exchange rate');
    });

    // Fee Slider
    el.feeSlider.value = state.feePercentage;
    el.feePercentageText.textContent = `${state.feePercentage.toFixed(1)}%`;
    el.feeSlider.addEventListener('input', (e) => {
      const fee = parseFloat(e.target.value);
      state.feePercentage = fee;
      el.feePercentageText.textContent = `${fee.toFixed(1)}%`;
      localStorage.setItem(STORAGE_KEYS.FEE, fee);
      updateConversion();
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Ctrl+S or Cmd+S -> Swap currencies
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        swapCurrencies();
      }
      // Esc -> Clear
      if (e.key === 'Escape') {
        el.sourceInput.value = '';
        el.targetInput.value = '';
        updateConversion();
      }
    });
  }

  // --- Initialization ---
  function init() {
    initTheme();
    renderCurrencies();
    el.sourceInput.value = '1,000';
    updateConversion();
    updateCheatSheet();
    setupEventListeners();
    fetchExchangeRate();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
