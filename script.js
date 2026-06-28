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

  // Menentukan sifat fungsi
  let sifat = "";
  if (m > 0) {
    sifat = "Grafik fungsi naik karena gradien bernilai positif.";
  } else if (m < 0) {
    sifat = "Grafik fungsi menurun karena gradien bernilai negatif.";
  } else {
    sifat = "Grafik fungsi mendatar karena gradien sama dengan nol.";
  }

  // Laju perubahan fungsi linear = gradien
  const laju = m;

  resultEl.className = 'calc-result success';

  resultEl.innerHTML = `
    <strong>📘 Persamaan Fungsi</strong><br>
    f(x) = ${m}x ${sign} ${absB}

    <hr>

    <strong>🧮 Langkah Perhitungan</strong><br>
    f(${formatNum(x)}) = (${formatNum(m)} × ${formatNum(x)}) ${sign} ${absB}<br>
    = ${formatNum(m * x)} ${sign} ${absB}<br>
    = <strong>${formatNum(fx)}</strong>

    <hr>

    <strong>📚 Informasi Fungsi</strong><br>
    • Jenis Fungsi : Linear<br>
    • Gradien (m) : <strong>${formatNum(m)}</strong><br>
    • Konstanta (b) : <strong>${formatNum(b)}</strong><br>
    • Domain : ℝ<br>
    • Kodomain : ℝ<br>
    • Range : ℝ

    <hr>

    <strong>📈 Laju Perubahan</strong><br>
    Δy / Δx = <strong>${formatNum(laju)}</strong><br>
    Artinya, setiap kenaikan <strong>1</strong> satuan pada nilai x,
    maka nilai f(x) akan berubah sebesar
    <strong>${formatNum(laju)}</strong> satuan.

    <hr>

    <strong>📊 Analisis</strong><br>
    Nilai fungsi pada x = <strong>${formatNum(x)}</strong> adalah
    <strong>${formatNum(fx)}</strong>.<br>
    ${sifat}
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

/* ─────────────────────────────────────────
   kalkulator kelompok 7 
───────────────────────────────────────── */

function hitungTurunan() {

    let a = parseFloat(document.getElementById("a").value);
    let b = parseFloat(document.getElementById("b").value);
    let c = parseFloat(document.getElementById("c").value);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        alert("Lengkapi semua nilai!");
        return;
    }

    let x = -b / (2 * a);
    let y = (a * x * x) + (b * x) + c;

    let jenis = "";
    let warna = "";

    if (a > 0) {
        jenis = "Titik Minimum";
        warna = "success";
    } else {
        jenis = "Titik Maksimum";
        warna = "danger";
    }

    document.getElementById("hasilTurunan").innerHTML = `
    
    <div class="card border-${warna}">
        <div class="card-header bg-${warna} text-white">
            Hasil Perhitungan
        </div>

        <div class="card-body">

            <h5>Fungsi</h5>
            <p>
                f(x) = ${a}x² + (${b})x + (${c})
            </p>

            <hr>

            <h5>Langkah 1 - Turunan Pertama</h5>
            <p>
                f'(x) = ${2*a}x + (${b})
            </p>

            <h5>Langkah 2 - Titik Kritis</h5>
            <p>
                ${2*a}x + (${b}) = 0
            </p>

            <p>
                x = ${x.toFixed(2)}
            </p>

            <h5>Langkah 3 - Nilai Fungsi</h5>

            <p>
                f(${x.toFixed(2)}) = ${y.toFixed(2)}
            </p>

            <hr>

            <div class="alert alert-${warna}">
                <strong>${jenis}</strong><br>
                Titik Stasioner = (${x.toFixed(2)}, ${y.toFixed(2)})
            </div>

        </div>
    </div>
    
    `;
}