/* ============================================================
   Ta'awun DAHAM 2026 — App logic
   Sumber data: Google Apps Script Web App yang membaca Google Sheet.
   Lihat apps-script/Code.gs dan README.md untuk cara menghubungkannya.
   ============================================================ */
(function () {
  "use strict";

  // ------------------------------------------------------------
  // KONFIGURASI — ganti API_URL setelah deploy Apps Script (lihat README)
  // ------------------------------------------------------------
  const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbyXU7-5-g1FE9JFABgDBNZZUwpoRzOgu8kYFwxiNF_OP255O0jGK9jsek2DxOfn6mNbRA/exec", // contoh: "https://script.google.com/macros/s/XXXXXXXX/exec"
    TARGET: 300000000,
    DEADLINE: new Date("2026-09-17T23:59:59+07:00"),
  };

  const rupiah = (n) =>
    "Rp" + Math.round(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

  function daysLeft() {
    const diff = CONFIG.DEADLINE.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  function renderStats(data) {
    const total = data && data.total ? Number(data.total) : 0;
    const donors = data && data.donors ? Number(data.donors) : 0;
    const pct = Math.min(100, (total / CONFIG.TARGET) * 100);
    const avg = donors > 0 ? total / donors : 0;
    const left = daysLeft();

    document.getElementById("statCollected").textContent = rupiah(total);
    document.getElementById("repCollected").textContent = rupiah(total);
    document.getElementById("statPercent").textContent = pct.toFixed(1) + "%";
    document.getElementById("statDonors").textContent = donors.toLocaleString("id-ID");
    document.getElementById("repDonors").textContent = donors.toLocaleString("id-ID");
    document.getElementById("statDays").textContent = left;
    document.getElementById("repDays").textContent = left;
    document.getElementById("statAvg").textContent = rupiah(avg);

    requestAnimationFrame(() => {
      document.getElementById("tasbihFill").style.width = pct + "%";
    });
  }

  function renderDonors(list) {
    const body = document.getElementById("donorTableBody");
    if (!list || !list.length) {
      body.innerHTML =
        '<tr><td colspan="3" class="donor-table__empty">Belum ada donasi tercatat. Jadilah yang pertama!</td></tr>';
      return;
    }
    body.innerHTML = list
      .slice(0, 15)
      .map((d) => {
        const time = d.time ? new Date(d.time).toLocaleString("id-ID", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }) : "-";
        const name = (d.name || "Hamba Allah").replace(/</g, "&lt;");
        return `<tr><td>${time}</td><td>${name}</td><td>${rupiah(d.amount)}</td></tr>`;
      })
      .join("");
  }

  async function loadStats() {
    // Tanpa API_URL diisi, tampilkan status kosong tapi tetap jalankan countdown.
    if (!CONFIG.API_URL) {
      renderStats({ total: 0, donors: 0 });
      renderDonors([]);
      return;
    }
    try {
      const res = await fetch(CONFIG.API_URL + "?action=stats", { method: "GET" });
      const data = await res.json();
      renderStats(data);
      renderDonors(data.recent || []);
      document.getElementById("dataDisclaimer").textContent =
        "Data laporan bersumber langsung dari Google Sheet dan diperbarui setiap kali halaman dimuat.";
    } catch (err) {
      console.error("Gagal memuat data laporan:", err);
      renderStats({ total: 0, donors: 0 });
      renderDonors([]);
      document.getElementById("dataDisclaimer").textContent =
        "Laporan belum dapat dimuat saat ini. Coba muat ulang halaman beberapa saat lagi.";
    }
  }

  function initCountdownOnly() {
    document.getElementById("statDays").textContent = daysLeft();
    document.getElementById("repDays").textContent = daysLeft();
  }

  function initCopyButtons() {
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const val = btn.getAttribute("data-copy");
        try {
          await navigator.clipboard.writeText(val);
          const original = btn.textContent;
          btn.textContent = "Tersalin!";
          setTimeout(() => (btn.textContent = original), 1600);
        } catch (e) {
          alert("Nomor rekening: " + val);
        }
      });
    });
  }

  function initDonateForm() {
    const form = document.getElementById("donateForm");
    const statusEl = document.getElementById("donateStatus");
    const submitBtn = document.getElementById("donateSubmit");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        nama: fd.get("nama") || "Hamba Allah",
        jumlah: Number(fd.get("jumlah")) || 0,
        nohp: fd.get("nohp") || "",
        metode: fd.get("metode") || "",
        pesan: fd.get("pesan") || "",
      };

      if (!CONFIG.API_URL) {
        statusEl.textContent =
          "Formulir belum terhubung ke Google Sheet. Lihat README.md untuk menyambungkan Apps Script.";
        statusEl.style.color = "#a3401f";
        return;
      }

      submitBtn.disabled = true;
      statusEl.textContent = "Mengirim konfirmasi…";
      statusEl.style.color = "";

      try {
        // Content-Type text/plain menghindari CORS preflight pada Apps Script Web App.
        await fetch(CONFIG.API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        statusEl.textContent =
          "Terima kasih! Konfirmasi diterima dan akan diverifikasi panitia.";
        statusEl.style.color = "";
        form.reset();
        loadStats();
      } catch (err) {
        console.error(err);
        statusEl.textContent = "Gagal mengirim. Silakan coba lagi atau hubungi panitia.";
        statusEl.style.color = "#a3401f";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCountdownOnly();
    loadStats();
    initCopyButtons();
    initDonateForm();
  });
})();
