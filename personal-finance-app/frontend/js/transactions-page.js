document.addEventListener("DOMContentLoaded", function () {
  var state = { page: 1, sort: "latest", category: "", search: "" };
  var tbody = document.getElementById("tx-body");
  var paginationEl = document.getElementById("tx-pagination");

  function load() {
    var q = "?page=" + state.page + "&limit=10&sort=" + state.sort;
    if (state.search) q += "&search=" + encodeURIComponent(state.search);
    if (state.category) q += "&category=" + encodeURIComponent(state.category);

    apiGet("/transactions" + q).then(function (data) {
      if (!data) return;
      var html = "";
      data.transactions.forEach(function (t) {
        var amount = t.displayAmount !== undefined ? t.displayAmount : t.amount;

        var pos = amount > 0 ? " tx-amt--pos" : "";
        var sign = amount > 0 ? "+" : "-";

        var d = new Date(t.date);
        var dateStr =
          d.getDate() +
          " " +
          [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ][d.getMonth()] +
          " " +
          d.getFullYear();

        html +=
          '<div class="table-row">' +
          '<div class="table-row__who"><span class="avatar" style="background:var(' +
          (t.color || "--green") +
          ')">' +
          (t.avatar || "") +
          '</span><div><div class="name">' +
          t.name +
          '</div><div class="sub">' +
          t.category +
          "</div></div></div>" +
          '<div class="cell">' +
          t.category +
          "</div>" +
          '<div class="cell">' +
          dateStr +
          "</div>" +
          '<div class="cell--amt"><div class="tx-amt' +
          pos +
          '">' +
          sign +
          fmt(Math.abs(amount)) +
          '</div><div class="tx-date">' +
          dateStr +
          "</div></div>" +
          "</div>";
      });
      tbody.innerHTML = html;

      var pagHtml =
        '<button class="page-btn" data-p="prev">‹ Prev</button><div class="page-nums">';
      for (var i = 1; i <= data.totalPages; i++) {
        pagHtml +=
          '<button class="page-num' +
          (i === data.currentPage ? " is-active" : "") +
          '" data-p="' +
          i +
          '">' +
          i +
          "</button>";
      }
      pagHtml += '</div><button class="page-btn" data-p="next">Next ›</button>';
      paginationEl.innerHTML = pagHtml;
      paginationEl.dataset.totalPages = data.totalPages;
    });
  }

  load();

  document.getElementById("tx-sort").addEventListener("change", function () {
    state.sort = this.value.toLowerCase().replace(/ /g, "-");
    state.page = 1;
    load();
  });

  document
    .getElementById("tx-category")
    .addEventListener("change", function () {
      state.category = this.value === "All Transactions" ? "" : this.value;
      state.page = 1;
      load();
    });

  var searchTimer;
  document.getElementById("tx-search").addEventListener("input", function () {
    clearTimeout(searchTimer);
    var val = this.value;
    searchTimer = setTimeout(function () {
      state.search = val;
      state.page = 1;
      load();
    }, 300);
  });

  paginationEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-p]");
    if (!btn) return;
    var p = btn.dataset.p;
    if (p === "prev" && state.page > 1) state.page--;
    else if (
      p === "next" &&
      state.page < Number(paginationEl.dataset.totalPages)
    ) {
      state.page++;
    } else state.page = Number(p);
    load();
  });

  document.querySelectorAll("[data-logout]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  });
});
