(function () {
  const token = localStorage.getItem('tram_sac_admin_token') || '';
  const chartCanvas = document.getElementById('dashboardRevenueChart');
  if (!chartCanvas) return;

  const loadRevenue = async () => {
    try {
      const response = await fetch('/api/admin/charging-sessions?limit=100', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) return;
      const data = await response.json();
      const sessions = Array.isArray(data.items) ? data.items : [];
      const labels = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      });
      const revenue = labels.map((label) => sessions
        .filter((item) => item.status === 'completed' && item.transactionStatus === 'success' && item.startedAt)
        .filter((item) => new Date(item.startedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) === label)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0));
      const total = revenue.reduce((sum, value) => sum + value, 0);
      const today = revenue[revenue.length - 1] || 0;
      const kpi = document.getElementById('dashboardRevenueToday');
      if (kpi) kpi.textContent = `${today.toLocaleString('vi-VN')} ₫`;
      if (!window.Chart) return;
      window.dashboardRevenueChart = new Chart(chartCanvas, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Doanh thu (VND)', data: revenue, backgroundColor: '#e6a32c', borderRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => Number(value).toLocaleString('vi-VN') } }, x: { grid: { display: false } } } },
      });
      const note = document.querySelector('.dashboard-kpi-revenue small');
      if (note) note.textContent = `7 ngày: ${total.toLocaleString('vi-VN')} ₫`;
    } catch (_) {
      // The main dashboard remains usable when billing data is unavailable.
    }
  };
  loadRevenue();
})();
