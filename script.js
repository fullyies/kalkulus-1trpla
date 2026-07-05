/* ═══════════════════════════════════════════════════
   KALKULUS 1 — script.js
   Handles: Dark mode, Sidebar navigation, Smooth scroll,
            Scrollspy, Search filter, Reading progress,
            Chapter calculators, Mobile sidebar sync
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. DARK MODE TOGGLE
  ───────────────────────────────────────── */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');
  const htmlEl      = document.documentElement;

  // Restore saved preference
  const savedTheme = localStorage.getItem('kalkulus-theme') || 'light';
  htmlEl.setAttribute('data-bs-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-bs-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-bs-theme', next);
    localStorage.setItem('kalkulus-theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark'
      ? 'bi bi-sun-fill'
      : 'bi bi-moon-stars-fill';
    themeToggle.title = theme === 'dark'
      ? 'Mode Terang'
      : 'Mode Gelap';
  }


  /* ─────────────────────────────────────────
     2. BUILD SIDEBAR (shared between desktop & mobile)
  ───────────────────────────────────────── */
  const desktopMenu  = document.getElementById('sidebarMenuDesktop');
  const mobileInner  = document.getElementById('sidebarInnerMobile');

  // Clone desktop sidebar content into mobile offcanvas
  if (desktopMenu && mobileInner) {
    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'sidebar-section-label';
    sectionLabel.textContent = 'Navigasi';
    mobileInner.appendChild(sectionLabel);

    const clonedNav = document.createElement('nav');
    const clonedMenu = desktopMenu.cloneNode(true);
    clonedMenu.id = 'sidebarMenuMobile';
    clonedNav.appendChild(clonedMenu);
    mobileInner.appendChild(clonedNav);
  }


  /* ─────────────────────────────────────────
     3. SIDEBAR SUBMENU TOGGLE
  ───────────────────────────────────────── */
  function initSubmenuToggle(menuEl) {
    if (!menuEl) return;
    const items = menuEl.querySelectorAll('.sidebar-item.has-submenu');
    items.forEach(item => {
      const link = item.querySelector('.sidebar-link');
      link.addEventListener('click', (e) => {
        // If the link has a hash AND the submenu is open, allow navigation
        const wasOpen = item.classList.contains('open');
        // Close all siblings
        items.forEach(i => { if (i !== item) i.classList.remove('open'); });
        // Toggle current
        item.classList.toggle('open', !wasOpen);
        // Don't prevent default — allow hash navigation
      });
    });
  }

  initSubmenuToggle(desktopMenu);
  initSubmenuToggle(document.getElementById('sidebarMenuMobile'));


  /* ─────────────────────────────────────────
     4. SMOOTH SCROLL + ACTIVE LINK HIGHLIGHT
  ───────────────────────────────────────── */
  function handleSidebarLinkClick(link) {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.querySelectorAll('.sidebar-link, .submenu-link').forEach(link => {
    link.addEventListener('click', (e) => {
      handleSidebarLinkClick(link);
    });
  });


  /* ─────────────────────────────────────────
     5. SCROLLSPY — highlight active sidebar link
  ───────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id], div[id]');
  const allSidebarLinks = () =>
    document.querySelectorAll('#sidebar-nav .sidebar-link, #sidebar-nav .submenu-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        highlightSidebarLink(id);
      }
    });
  }, {
    rootMargin: `-${56 + 40}px 0px -60% 0px`,
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));

  function highlightSidebarLink(id) {
    // Remove all active
    allSidebarLinks().forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active-parent'));

    // Find matching link
    const activeLink = document.querySelector(`#sidebar-nav a[href="#${id}"]`);
    if (activeLink) {
      activeLink.classList.add('active');

      // Open parent submenu if submenu-link
      const parentItem = activeLink.closest('.sidebar-item.has-submenu');
      if (parentItem) {
        parentItem.classList.add('open');
      }
    }
  }


  /* ─────────────────────────────────────────
     6. READING PROGRESS BAR
  ───────────────────────────────────────── */
  const progressBar   = document.getElementById('readingProgress');
  const progressLabel = document.getElementById('progressLabel');

  window.addEventListener('scroll', updateProgress);

  function updateProgress() {
    const scrollTop    = window.scrollY || document.documentElement.scrollTop;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    if (progressBar) {
      progressBar.style.width = progress + '%';
      progressBar.setAttribute('aria-valuenow', progress);
    }
    if (progressLabel) {
      progressLabel.textContent = progress + '% dibaca';
    }
  }


  /* ─────────────────────────────────────────
     7. PREV / NEXT CHAPTER BUTTONS
  ───────────────────────────────────────── */
  const chapters = [
    '#pengantar', '#chapter-1', '#chapter-2',
    '#chapter-3', '#chapter-4', '#chapter-5', '#chapter-6'
  ];

  let currentChapterIndex = 0;

  function getCurrentChapterIndex() {
    // Find which chapter is currently most visible
    const scrollPos = window.scrollY + 80 + 50;
    let nearest = 0;
    chapters.forEach((id, i) => {
      const el = document.querySelector(id);
      if (el && el.offsetTop <= scrollPos) nearest = i;
    });
    return nearest;
  }

  document.getElementById('prevChapterBtn')?.addEventListener('click', () => {
    const idx = getCurrentChapterIndex();
    const target = idx > 0 ? chapters[idx - 1] : chapters[0];
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('nextChapterBtn')?.addEventListener('click', () => {
    const idx = getCurrentChapterIndex();
    const target = idx < chapters.length - 1 ? chapters[idx + 1] : chapters[chapters.length - 1];
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });


  /* ─────────────────────────────────────────
     8. SIDEBAR SEARCH FILTER
  ───────────────────────────────────────── */
  const searchInput = document.getElementById('sidebarSearch');

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const items = document.querySelectorAll('#sidebarMenuDesktop .sidebar-item');

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (!query || text.includes(query)) {
        item.classList.remove('search-hidden');
        if (query) item.classList.add('open'); // Open matched submenus
      } else {
        item.classList.add('search-hidden');
      }
    });

    // Reset if empty
    if (!query) {
      items.forEach(item => {
        item.classList.remove('search-hidden', 'open');
      });
    }
  });


  /* ─────────────────────────────────────────
     9. HASH ON LOAD — scroll to section
  ───────────────────────────────────────── */
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }

  // Initial progress update
  updateProgress();
});


/* ═══════════════════════════════════════════════════
   CALCULATORS — Global functions (called from HTML onclick)
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   BAB 1: Kalkulator Fungsi Linear
   f(x) = mx + b
───────────────────────────────────────── */
function calcLinear() {
  const m = parseFloat(document.getElementById('ch1-m').value);
  const b = parseFloat(document.getElementById('ch1-b').value);
  const x = parseFloat(document.getElementById('ch1-x').value);
  const resultEl = document.getElementById('ch1-result');

  if (isNaN(m) || isNaN(b) || isNaN(x)) {
    showCalcError(resultEl, 'Masukkan angka yang valid untuk semua field.');
    return;
  }

  const fx = m * x + b;
  const sign = b >= 0 ? '+' : '−';
  const absB = Math.abs(b);

  resultEl.className = 'calc-result success';
  resultEl.innerHTML = `
    <strong>f(x) = ${m}x ${sign} ${absB}</strong><br>
    f(<strong>${x}</strong>) = ${m} × ${x} ${sign} ${absB}
    = <strong>${formatNum(fx)}</strong>
  `;
}


/* ─────────────────────────────────────────
   BAB 2: Kalkulator Pendekatan Limit
   lim(x→a) (x² − a²)/(x − a) = 2a
───────────────────────────────────────── */
function calcLimit() {
  const a   = parseFloat(document.getElementById('ch2-a').value);
  const eps = parseFloat(document.getElementById('ch2-eps').value);
  const resultEl = document.getElementById('ch2-result');

  if (isNaN(a) || isNaN(eps) || eps <= 0) {
    showCalcError(resultEl, 'Masukkan nilai a yang valid dan ε > 0.');
    return;
  }

  // Approach from left and right
  const xLeft  = a - eps;
  const xRight = a + eps;

  function f(x) {
    // (x² - a²) / (x - a) = x + a  (when x ≠ a)
    if (Math.abs(x - a) < 1e-12) return 2 * a; // exact limit
    return (x * x - a * a) / (x - a);
  }

  const fLeft  = f(xLeft);
  const fRight = f(xRight);
  const exactLimit = 2 * a;

  resultEl.className = 'calc-result success';
  resultEl.innerHTML = `
    <strong>f(x) = (x² − ${a}²) / (x − ${a})</strong><br>
    Pendekatan kiri  (x = ${formatNum(xLeft)}):  f(x) = <strong>${formatNum(fLeft)}</strong><br>
    Pendekatan kanan (x = ${formatNum(xRight)}): f(x) = <strong>${formatNum(fRight)}</strong><br>
    <br>
    ∴ lim<sub>x→${a}</sub> f(x) = <strong>${formatNum(exactLimit)}</strong> (nilai tepat: 2 × ${a})
  `;
}


/* ─────────────────────────────────────────
   BAB 4: Kalkulator Turunan (Power Rule)
   f(x) = axⁿ → f'(x) = a·n·x^(n-1)
───────────────────────────────────────── */
function calcDerivative() {
  const a = parseFloat(document.getElementById('ch4-a').value);
  const n = parseFloat(document.getElementById('ch4-n').value);
  const x = parseFloat(document.getElementById('ch4-x').value);
  const resultEl = document.getElementById('ch4-result');

  if (isNaN(a) || isNaN(n) || isNaN(x)) {
    showCalcError(resultEl, 'Masukkan angka yang valid untuk semua field.');
    return;
  }

  if (n === 0) {
    resultEl.className = 'calc-result success';
    resultEl.innerHTML = `
      f(x) = ${a} (konstanta)<br>
      f'(x) = <strong>0</strong>
    `;
    return;
  }

  const newCoeff = a * n;
  const newPow   = n - 1;
  const fPrimeX  = newCoeff * Math.pow(x, newPow);

  resultEl.className = 'calc-result success';
  resultEl.innerHTML = `
    <strong>f(x) = ${a}x<sup>${n}</sup></strong><br>
    f'(x) = ${a} × ${n} × x<sup>${n}−1</sup>
          = <strong>${newCoeff}x<sup>${newPow}</sup></strong><br>
    <br>
    Pada x = ${x}:<br>
    f'(${x}) = ${newCoeff} × (${x})<sup>${newPow}</sup>
             = <strong>${formatNum(fPrimeX)}</strong>
  `;
}


/* ─────────────────────────────────────────
   BAB 6: Kalkulator Integral Tentu
   ∫ₐᵇ xⁿ dx = [x^(n+1)/(n+1)]ₐᵇ
   Also computed numerically via trapezoid for verification
───────────────────────────────────────── */
function calcIntegral() {
  const n = parseFloat(document.getElementById('ch6-n').value);
  const a = parseFloat(document.getElementById('ch6-a').value);
  const b = parseFloat(document.getElementById('ch6-b').value);
  const resultEl = document.getElementById('ch6-result');

  if (isNaN(n) || isNaN(a) || isNaN(b)) {
    showCalcError(resultEl, 'Masukkan angka yang valid untuk semua field.');
    return;
  }

  if (a === b) {
    resultEl.className = 'calc-result success';
    resultEl.innerHTML = `Batas integrasi sama (a = b = ${a}), nilai integral = <strong>0</strong>`;
    return;
  }

  if (n === -1) {
    // ∫ 1/x dx = ln|x|
    if (a <= 0 || b <= 0) {
      showCalcError(resultEl, 'Untuk n = −1, batas harus positif (ln tidak terdefinisi untuk x ≤ 0).');
      return;
    }
    const exact = Math.log(b) - Math.log(a);
    resultEl.className = 'calc-result success';
    resultEl.innerHTML = `
      <strong>∫<sub>${a}</sub><sup>${b}</sup> x<sup>−1</sup> dx</strong><br>
      = [ln|x|]<sub>${a}</sub><sup>${b}</sup><br>
      = ln(${b}) − ln(${a})<br>
      = <strong>${formatNum(exact)}</strong>
    `;
    return;
  }

  // Exact: x^(n+1)/(n+1) evaluated from a to b
  const exp1  = n + 1;
  const Fb    = Math.pow(b, exp1) / exp1;
  const Fa    = Math.pow(a, exp1) / exp1;
  const exact = Fb - Fa;

  // Numerical approximation (trapezoid, 10000 steps)
  const steps = 10000;
  const h     = (b - a) / steps;
  let trapSum = 0;
  for (let i = 0; i <= steps; i++) {
    const xi = a + i * h;
    const fi = Math.pow(xi, n);
    trapSum += (i === 0 || i === steps) ? fi / 2 : fi;
  }
  const numerical = trapSum * h;

  resultEl.className = 'calc-result success';
  resultEl.innerHTML = `
    <strong>∫<sub>${a}</sub><sup>${b}</sup> x<sup>${n}</sup> dx</strong><br>
    = [x<sup>${exp1}</sup> / ${exp1}]<sub>${a}</sub><sup>${b}</sup><br>
    = (${formatNum(Fb)}) − (${formatNum(Fa)})<br>
    <br>
    Nilai tepat:    <strong>${formatNum(exact)}</strong><br>
    Verifikasi num: <strong>${formatNum(numerical)}</strong>
  `;
}


  // =========================================================================
// SINKRONISASI LOGIKA KALKULATOR INTEGRAL (KELOMPOK 9)
// =========================================================================
(function() {
  // Fungsi Pembantu internal untuk mereset tampilan dan mengecek library Math.js
  function siapkanKalkulator(idHasil, idError) {
    const hasilDiv = document.getElementById(idHasil);
    const errorDiv = document.getElementById(idError);
    if (hasilDiv) hasilDiv.classList.add('d-none');
    if (errorDiv) errorDiv.classList.add('d-none');
    
    if (typeof math === 'undefined') {
      if (errorDiv) {
        errorDiv.innerText = "Error: Library 'math.js' belum termuat. Pastikan CDN math.js terpasang.";
        errorDiv.classList.remove('d-none');
      }
      return false;
    }
    return true;
  }

  // --- Helper: cek apakah sub-ekspresi murni angka (tidak mengandung x) ---
  function mengandungX(node) {
    if (node.type === 'SymbolNode') return node.name === 'x';
    if (node.type === 'ParenthesisNode') return mengandungX(node.content);
    if (node.args) return node.args.some(mengandungX);
    return false;
  }
  function angkaDari(node) {
    try {
      if (mengandungX(node)) return null;
      const v = node.evaluate();
      return (typeof v === 'number' && isFinite(v)) ? v : null;
    } catch (e) { return null; }
  }
  function lepasKurung(node) {
    while (node.type === 'ParenthesisNode') node = node.content;
    return node;
  }

  // --- Pecah ekspresi jadi suku-suku yang dipisah oleh + / - ---
  function pecahSuku(node, tanda, daftar) {
    node = lepasKurung(node);
    if (node.type === 'OperatorNode' && node.fn === 'add') {
      pecahSuku(node.args[0], tanda, daftar);
      pecahSuku(node.args[1], tanda, daftar);
    } else if (node.type === 'OperatorNode' && node.fn === 'subtract') {
      pecahSuku(node.args[0], tanda, daftar);
      pecahSuku(node.args[1], -tanda, daftar);
    } else if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
      pecahSuku(node.args[0], -tanda, daftar);
    } else if (node.type === 'OperatorNode' && node.fn === 'unaryPlus') {
      pecahSuku(node.args[0], tanda, daftar);
    } else {
      daftar.push({ tanda, node });
    }
    return daftar;
  }

  // --- Pisahkan koefisien angka murni dari "inti" fungsi suku tsb ---
  function pisahKoefisien(node) {
    node = lepasKurung(node);
    const konst = angkaDari(node);
    if (konst !== null) return { koef: konst, inti: null }; // suku konstanta murni
    if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
      const sub = pisahKoefisien(node.args[0]);
      return { koef: -sub.koef, inti: sub.inti };
    }
    if (node.type === 'OperatorNode' && node.fn === 'multiply') {
      const kiri = angkaDari(node.args[0]);
      if (kiri !== null) { const sub = pisahKoefisien(node.args[1]); return { koef: kiri * sub.koef, inti: sub.inti }; }
      const kanan = angkaDari(node.args[1]);
      if (kanan !== null) { const sub = pisahKoefisien(node.args[0]); return { koef: kanan * sub.koef, inti: sub.inti }; }
    }
    if (node.type === 'OperatorNode' && node.fn === 'divide') {
      const kanan = angkaDari(node.args[1]);
      if (kanan !== null) { const sub = pisahKoefisien(node.args[0]); return { koef: sub.koef / kanan, inti: sub.inti }; }
    }
    return { koef: 1, inti: node };
  }

  // --- Koefisien k jika argumen berbentuk (k * x), dipakai untuk sin(kx), e^(kx), dll ---
  function koefLinearX(node) {
    node = lepasKurung(node);
    if (node.type === 'SymbolNode' && node.name === 'x') return 1;
    const { koef, inti } = pisahKoefisien(node);
    if (inti && inti.type === 'SymbolNode' && inti.name === 'x') return koef;
    return null;
  }

  // --- Format angka: bilangan bulat apa adanya, kalau tidak dicoba sbg pecahan sederhana ---
  function formatAngka(num) {
    if (Math.abs(num - Math.round(num)) < 1e-9) return Math.round(num).toString();
    for (let d = 2; d <= 12; d++) {
      const n2 = num * d;
      if (Math.abs(n2 - Math.round(n2)) < 1e-9) return `${Math.round(n2)}/${d}`;
    }
    return parseFloat(num.toFixed(4)).toString();
  }
  const isPecahan = (s) => s.includes('/');

  // --- Ubah "x^(3/2)" / "x^3" / "e^(2x)" jadi HTML superscript rapi ---
  function keHtml(str) {
    return str
      .replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>')
      .replace(/\^(-?[0-9]+(\.[0-9]+)?)/g, '<sup>$1</sup>');
  }

  // --- Aturan integral dasar untuk satu "inti" fungsi (tanpa koefisien di depan) ---

  function aturanIntegral(inti) {
    if (inti === null) return { factor: 1, expr: 'x', rumus: '∫ k dx = k·x', nilai: (x) => x };
    inti = lepasKurung(inti);

    if (inti.type === 'SymbolNode' && inti.name === 'x') {
      return { factor: 1 / 2, expr: 'x^2', rumus: '∫ x dx = x²/2', nilai: (x) => (x * x) / 2 };
    }

    if (inti.type === 'OperatorNode' && inti.fn === 'pow') {
      const basis = lepasKurung(inti.args[0]);
      const pangkat = angkaDari(inti.args[1]);

      // Aturan pangkat: xⁿ
      if (basis.type === 'SymbolNode' && basis.name === 'x' && pangkat !== null) {
        if (Math.abs(pangkat + 1) < 1e-9) {
          return { factor: 1, expr: 'ln|x|', rumus: '∫ x⁻¹ dx = ln|x|', nilai: (x) => Math.log(Math.abs(x)) };
        }
        const n1 = pangkat + 1;
        const n1Str = formatAngka(n1);
        return {
          factor: 1 / n1,
          expr: isPecahan(n1Str) ? `x^(${n1Str})` : `x^${n1Str}`,
          rumus: `∫ xⁿ dx = xⁿ⁺¹/(n+1), dengan n = ${formatAngka(pangkat)}`,
          nilai: (x) => Math.pow(x, n1) / n1
        };
      }

      // Eksponensial: a^(k·x), termasuk basis e
      const basisAngka = angkaDari(basis);
      const basisE = basis.type === 'SymbolNode' && basis.name === 'e';
      if (basisE || basisAngka !== null) {
        const k = koefLinearX(inti.args[1]);
        if (k !== null) {
          const namaBasis = basisE ? 'e' : formatAngka(basisAngka);
          const exprBasis = Math.abs(k - 1) < 1e-9 ? `${namaBasis}^x` : `${namaBasis}^(${formatAngka(k)}x)`;
          const lnA = basisE ? 1 : Math.log(basisAngka);
          return {
            factor: 1 / k, expr: exprBasis,
            extraDenom: basisE ? null : `ln(${namaBasis})`,
            rumus: '∫ a<sup>kx</sup> dx = a<sup>kx</sup> / (k·ln a)',
            nilai: (x) => (basisE ? Math.exp(k * x) : Math.pow(basisAngka, k * x)) / (k * lnA)
          };
        }
      }
    }

    if (inti.type === 'FunctionNode') {
      const nama = inti.fn.name;
      const arg = inti.args[0];
      const k = koefLinearX(arg);

      if (k !== null) {
        if (nama === 'sin') {
          const expr = Math.abs(k - 1) < 1e-9 ? 'cos(x)' : `cos(${formatAngka(k)}x)`;
          return { factor: -1 / k, expr, rumus: '∫ sin(kx) dx = −cos(kx)/k', nilai: (x) => -Math.cos(k * x) / k };
        }
        if (nama === 'cos') {
          const expr = Math.abs(k - 1) < 1e-9 ? 'sin(x)' : `sin(${formatAngka(k)}x)`;
          return { factor: 1 / k, expr, rumus: '∫ cos(kx) dx = sin(kx)/k', nilai: (x) => Math.sin(k * x) / k };
        }
        if (nama === 'exp') {
          const expr = Math.abs(k - 1) < 1e-9 ? 'e^x' : `e^(${formatAngka(k)}x)`;
          return { factor: 1 / k, expr, rumus: '∫ e<sup>kx</sup> dx = e<sup>kx</sup>/k', nilai: (x) => Math.exp(k * x) / k };
        }
      }
      if (nama === 'sqrt') {
        const dalam = lepasKurung(arg);
        if (dalam.type === 'SymbolNode' && dalam.name === 'x') {
          return { factor: 2 / 3, expr: 'x^(3/2)', rumus: '∫ √x dx = ∫x^(1/2) dx = (2/3)x^(3/2)', nilai: (x) => (2 / 3) * Math.pow(x, 1.5) };
        }
      }
    }

    if (inti.type === 'OperatorNode' && inti.fn === 'divide') {
      const pembilang = angkaDari(inti.args[0]);
      const penyebut = lepasKurung(inti.args[1]);
      if (pembilang !== null && Math.abs(pembilang - 1) < 1e-9 && penyebut.type === 'SymbolNode' && penyebut.name === 'x') {
        return { factor: 1, expr: 'ln|x|', rumus: '∫ (1/x) dx = ln|x|', nilai: (x) => Math.log(Math.abs(x)) };
      }
    }

    return null; 
  }

  // --- Selesaikan antiturunan F(x) dari sebuah ekspresi f(x) secara umum (suku demi suku) ---

  function selesaikanAntiturunan(nodePars) {
    const dafSuku = pecahSuku(nodePars, 1, []);
    let langkahHtml = '';
    const potongan = []; // { tanda, teks, koefTotal, aturan } — koefTotal & aturan null bila tak dikenali
    let semuaDikenali = true;

    dafSuku.forEach((s, idx) => {
      const { koef, inti } = pisahKoefisien(s.node);
      const koefTotal = s.tanda * koef;
      const aturan = aturanIntegral(inti);
      const nomor = idx + 1;
      const sukuAsliHtml = keHtml((s.tanda < 0 ? '-' : '') + s.node.toString());

      if (!aturan) {
        semuaDikenali = false;
        langkahHtml += `${nomor}. Suku <strong>${sukuAsliHtml}</strong>: pola fungsi ini belum didukung kalkulator (di luar aturan pangkat/trigonometri/eksponen/1/x dasar).<br>`;
        potongan.push({ tanda: s.tanda < 0 ? -1 : 1, teks: `∫(${s.node.toString()})dx`, koefTotal: null, aturan: null });
        return;
      }

      const kaliAkhir = koefTotal * aturan.factor;
      const tandaHasil = kaliAkhir < 0 ? -1 : 1;
      const absKoef = Math.abs(kaliAkhir);
      const koefStr = Math.abs(absKoef - 1) < 1e-9 ? '' : formatAngka(absKoef);
      let teksHasil = koefStr ? `${koefStr}${aturan.expr}` : aturan.expr;
      if (aturan.extraDenom) teksHasil = `${teksHasil}/${aturan.extraDenom}`;

      langkahHtml += `${nomor}. Suku <strong>${sukuAsliHtml}</strong>: gunakan ${aturan.rumus} &rarr; hasil = <strong>${tandaHasil < 0 ? '-' : ''}${keHtml(teksHasil)}</strong><br>`;
      potongan.push({ tanda: tandaHasil, teks: teksHasil, koefTotal, aturan });
    });

    // Gabungkan jadi tampilan F(x) (tanpa +C, biar bisa dipakai kalkulator Tentu maupun Tak Tentu)
    let fxHtml = '';
    potongan.forEach((t, i) => {
      if (i === 0) fxHtml += (t.tanda < 0 ? '-' : '') + keHtml(t.teks);
      else fxHtml += (t.tanda < 0 ? ' - ' : ' + ') + keHtml(t.teks);
    });

    // Fungsi evaluasi numerik F(x0) — hanya valid kalau semua suku dikenali
    function nilaiF(x0) {
      return potongan.reduce((total, t) => total + t.koefTotal * t.aturan.nilai(x0), 0);
    }

    return { langkahHtml, fxHtml, semuaDikenali, nilaiF };
  }

  // 1. LOGIKA INTEGRAL TENTU
  window.hitungTentu = function() {
    if (!siapkanKalkulator('hasil-tentu', 'error-tentu')) return;

    const fxInput = document.getElementById('tentu-fx').value.trim();
    const a = parseFloat(document.getElementById('tentu-a').value);
    const b = parseFloat(document.getElementById('tentu-b').value);
    
    const hasilDiv = document.getElementById('hasil-tentu');
    const errorDiv = document.getElementById('error-tentu');

    if (!fxInput || isNaN(a) || isNaN(b)) {
      errorDiv.innerText = "Error: Pastikan fungsi f(x), batas bawah (a), dan batas atas (b) sudah diisi.";
      errorDiv.classList.remove('d-none');
      return;
    }

    try {
      const nodePars = math.parse(fxInput);

      // Verifikasi numerik memakai Aturan Simpson 1/3 (selalu dihitung sbg pembanding)
      const kodeKompilasi = math.compile(fxInput);
      const nLangkah = 2000;
      const h = (b - a) / nLangkah;
      let f_a = kodeKompilasi.evaluate({ x: a });
      let f_b = kodeKompilasi.evaluate({ x: b });
      let sum = f_a + f_b;
      for (let i = 1; i < nLangkah; i++) {
        const x_i = a + i * h;
        const fx_i = kodeKompilasi.evaluate({ x: x_i });
        sum += (i % 2 === 0) ? (2 * fx_i) : (4 * fx_i);
      }
      const nilaiNumerik = (h / 3) * sum;
      if (isNaN(nilaiNumerik) || !isFinite(nilaiNumerik)) {
        throw new Error("Hasil tidak konvergen atau menghasilkan nilai tidak terdefinisi pada batas tersebut.");
      }

      document.getElementById('simbol-tentu').innerHTML = `<h4 class="mb-0"><sub>${a}</sub>∫<sup>${b}</sup> (${keHtml(nodePars.toString())}) dx</h4>`;

      const antiturunan = selesaikanAntiturunan(nodePars);

      if (antiturunan.semuaDikenali) {
        // --- Jalur utama: penyelesaian umum (aturan integral + substitusi batas) ---
        const Fb = antiturunan.nilaiF(b);
        const Fa = antiturunan.nilaiF(a);
        const hasilEksak = Fb - Fa;

        document.getElementById('langkah-tentu').innerHTML = `
          <strong>1. Cari fungsi antiturunan F(x):</strong><br>
          ${antiturunan.langkahHtml}
          F(x) = ${antiturunan.fxHtml}<br><br>
          <strong>2. Substitusikan batas atas dan batas bawah:</strong><br>
          F(${b}) = ${formatAngka(math.round(Fb, 6))}<br>
          F(${a}) = ${formatAngka(math.round(Fa, 6))}<br><br>
          <strong>3. Hasil Akhir:</strong> F(${b}) − F(${a}) = ${formatAngka(math.round(Fb, 6))} − (${formatAngka(math.round(Fa, 6))})
        `;
        document.getElementById('nilai-tentu').innerHTML = `
          <i class="bi bi-check-circle-fill me-2"></i>Hasil Akhir: <strong>${math.round(hasilEksak, 4)}</strong><br>
          <small class="text-muted">Verifikasi numerik (Aturan Simpson): ${math.round(nilaiNumerik, 4)}</small>
        `;
      } else {
        // --- Cadangan: fungsi di luar cakupan aturan simbolik, pakai pendekatan numerik ---
        document.getElementById('langkah-tentu').innerHTML = `
          ${antiturunan.langkahHtml}
          <span class="text-danger">Karena ada bentuk yang tidak dikenali secara simbolik, kalkulator memakai pendekatan numerik:</span><br>
          1. <strong>Metode Integrasi:</strong> Aturan Simpson 1/3 Kontinu (${nLangkah} sub-interval).<br>
          2. <strong>Lebar Langkah (Δx):</strong> (${b} − ${a}) / ${nLangkah} = ${h.toFixed(6)}.<br>
          3. Menjumlahkan akumulasi elemen luas kontinu di bawah grafik fungsi.
        `;
        document.getElementById('nilai-tentu').innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Hasil Akhir Nilai Kontinu: <strong>${math.round(nilaiNumerik, 4)}</strong>`;
      }

      hasilDiv.classList.remove('d-none');
    } catch (error) {
      errorDiv.innerText = "Error Penulisan Fungsi: " + error.message + " (Contoh valid: 3*x, x^2, sin(x), e^x, sqrt(x))";
      errorDiv.classList.remove('d-none');
    }
  };

  // 2. LOGIKA INTEGRAL TAK TENTU (Solver berbasis Aturan Integral, bukan hafalan pola)
  //    Mendukung: aturan pangkat xⁿ, konstanta, sin(kx), cos(kx), e^(kx)/a^(kx),
  //    1/x, sqrt(x), serta gabungan suku-suku (+ / -) dari semua bentuk di atas.
  window.hitungTakTentu = function() {
    if (!siapkanKalkulator('hasil-taktentu', 'error-taktentu')) return;

    const fxInput = document.getElementById('taktentu-fx').value.trim();
    const hasilDiv = document.getElementById('hasil-taktentu');
    const errorDiv = document.getElementById('error-taktentu');

    if (!fxInput) {
      errorDiv.innerText = "Error: Input rumus fungsi f(x) tidak boleh kosong.";
      errorDiv.classList.remove('d-none');
      return;
    }

    try {
      const nodePars = math.parse(fxInput);
      const antiturunan = selesaikanAntiturunan(nodePars);

      document.getElementById('simbol-taktentu').innerHTML = `<h4 class="mb-0">∫ (${keHtml(nodePars.toString())}) dx</h4>`;
      document.getElementById('langkah-taktentu').innerHTML = `
        ${antiturunan.langkahHtml}
        ${antiturunan.semuaDikenali
          ? 'Jumlahkan seluruh hasil antiturunan tiap suku, lalu tambahkan konstanta integrasi <strong>(+ C)</strong> karena tidak dibatasi oleh nilai batas tertentu.'
          : '<span class="text-danger">Sebagian suku tidak dapat diselesaikan otomatis — silakan selesaikan suku tersebut secara manual.</span>'}
      `;
      document.getElementById('nilai-taktentu').innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>F(x) = <strong>${antiturunan.fxHtml} + C</strong>`;

      hasilDiv.classList.remove('d-none');
    } catch (error) {
      errorDiv.innerText = "Error Analisis: Pastikan operator perkalian ditulis eksplisit (Contoh: 3*x atau 2*x^2).";
      errorDiv.classList.remove('d-none');
    }
  };

  // 3. LOGIKA PENDEKATAN DISKRET (Jumlah Riemann + Rendering Tabel HTML)
  window.hitungDiskret = function() {
    if (!siapkanKalkulator('hasil-diskret', 'error-diskret')) return;

    const fxInput = document.getElementById('diskret-fx').value.trim();
    const a = parseFloat(document.getElementById('diskret-a').value);
    const b = parseFloat(document.getElementById('diskret-b').value);
    const n = parseInt(document.getElementById('diskret-n').value);
    const metode = document.getElementById('diskret-metode').value;

    const hasilDiv = document.getElementById('hasil-diskret');
    const errorDiv = document.getElementById('error-diskret');
    const tbody = document.getElementById('tbody-diskret');
    const tfoot = document.getElementById('tfoot-diskret');

    if (!fxInput || isNaN(a) || isNaN(b) || isNaN(n) || n <= 0) {
      errorDiv.innerText = "Error: Parameter input nilai diskret belum lengkap atau interval salah.";
      errorDiv.classList.remove('d-none');
      return;
    }

    try {
      const kodeKompilasi = math.compile(fxInput);
      const dx = (b - a) / n;
      let totalSum = 0;
      let tabelHtml = '';

      for (let i = 0; i < n; i++) {
        let xKiri = a + i * dx;
        let xKanan = xKiri + dx;
        let xSampel = 0;

        // Pemilihan Titik Sampel Sesuai Opsi Pilihan Pengguna
        if (metode === 'kiri') xSampel = xKiri;
        else if (metode === 'kanan') xSampel = xKanan;
        else if (metode === 'tengah') xSampel = xKiri + (dx / 2);

        let fxNilai = kodeKompilasi.evaluate({ x: xSampel });
        let luasKotak = fxNilai * dx;
        totalSum += luasKotak;

        // Render Baris Sesuai Kolom Elemen HTML (i, x_kiri, x_kanan, x_sampel, f(xi), dx, total)
        tabelHtml += `
          <tr>
            <td>${i + 1}</td>
            <td>${math.round(xKiri, 4)}</td>
            <td>${math.round(xKanan, 4)}</td>
            <td class="table-primary fw-bold">${math.round(xSampel, 4)}</td>
            <td>${math.round(fxNilai, 4)}</td>
            <td>${math.round(dx, 4)}</td>
            <td>${math.round(luasKotak, 4)}</td>
          </tr>
        `;
      }

      // Masukkan baris ke dalam element tabel pembentuk DOM
      tbody.innerHTML = tabelHtml;
      tfoot.innerHTML = `
        <tr>
          <td colspan="6" class="text-end fw-bold">Total Jumlah Riemann (${metode.toUpperCase()}):</td>
          <td class="table-warning text-dark fw-bold">${math.round(totalSum, 4)}</td>
        </tr>
      `;

      document.getElementById('simbol-diskret').innerHTML = `<h5 class="mb-0 text-warning">Aproksimasi Luas Diskret ≈ ∑ f(x<sub>i</sub>) · Δx</h5>`;
      document.getElementById('langkah-diskret').innerHTML = `
        • Lebar kotak partisi (Δx) = (b - a) / n = (${b} - ${a}) / ${n} = <strong>${math.round(dx, 4)}</strong>.<br>
        • Total area dihitung berdasarkan akumulasi luas ${n} kotak diskret dengan metode sampel titik <strong>Riemann ${metode}</strong>.
      `;
      document.getElementById('nilai-diskret').innerHTML = `<i class="bi bi-calculator me-2"></i>Hasil Estimasi Diskret: <strong>${math.round(totalSum, 4)}</strong>`;

      hasilDiv.classList.remove('d-none');
    } catch (error) {
      errorDiv.innerText = "Error Diskret: " + error.message;
      errorDiv.classList.remove('d-none');
    }
  };

})();

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function formatNum(n) {
  if (!isFinite(n)) return 'Tidak terdefinisi';
  // Round to 6 significant digits
  const rounded = parseFloat(n.toPrecision(8));
  // Show integer if whole number
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toString();
}

function showCalcError(el, msg) {
  el.className = 'calc-result';
  el.style.background = 'var(--bs-danger-bg-subtle, #fff2f0)';
  el.style.borderColor = '#fca5a5';
  el.style.color = '#b91c1c';
  el.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-1"></i>${msg}`;

  // Reset style after 3 seconds
  setTimeout(() => {
    el.style.background = '';
    el.style.borderColor = '';
    el.style.color = '';
    el.className = 'calc-result';
    el.innerHTML = 'Masukkan nilai, lalu klik <strong>Hitung</strong>';
  }, 3000);
}

// highlight active menu (multi-page FIX)
function getCurrentPage() {
  return window.location.pathname.split("/").pop();
}

const currentPage = getCurrentPage();

document.querySelectorAll(".sidebar a").forEach(link => {

  const linkPage = link.getAttribute("href").split("#")[0].split("/").pop();

  if (linkPage === currentPage) {
    link.classList.add("active");

    // OPTIONAL: buka parent submenu otomatis
    const parent = link.closest(".sidebar-item.has-submenu");
    if (parent) parent.classList.add("open");

  } else {
    link.classList.remove("active");
  }

});