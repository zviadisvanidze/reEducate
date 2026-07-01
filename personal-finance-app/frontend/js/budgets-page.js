document.addEventListener("DOMContentLoaded", function () {
  var themeMap = {
    green: "--green",
    cyan: "--cyan",
    yellow: "--yellow",
    navy: "--navy",
    red: "--red",
    purple: "--purple",
    turquoise: "--turquoise",
    brown: "--brown",
    magenta: "--magenta",
    blue: "--blue",
    army: "--army",
    gold: "--gold",
    orange: "--orange",
  };
  var summaryEl = document.getElementById("bg-summary");
  var cardsEl = document.getElementById("bg-cards");
  var donutValueEl = document.getElementById("bg-donut-value");
  var donutLimitEl = document.getElementById("bg-donut-limit");

  function themeValue(label) {
    var normalized = String(label || "")
      .toLowerCase()
      .replace(/\s+/g, "");
    return normalized === "armygreen" ? "army" : normalized;
  }

  function themeLabel(value) {
    var map = {
      green: "Green",
      cyan: "Cyan",
      yellow: "Yellow",
      navy: "Navy",
      red: "Red",
      purple: "Purple",
      turquoise: "Turquoise",
      brown: "Brown",
      magenta: "Magenta",
      blue: "Blue",
      army: "Army Green",
      armygreen: "Army Green",
      gold: "Gold",
      orange: "Orange",
    };
    return (
      map[
        String(value || "")
          .toLowerCase()
          .replace(/\s+/g, "")
      ] || "Green"
    );
  }

  function updateCustomCategory(modal) {
    var select = modal.querySelector('[name="category"]');
    var wrapper = modal.querySelector("[data-custom-budget-category]");
    var input = modal.querySelector('[name="customCategory"]');
    var isCustom = select.value === "custom";
    wrapper.hidden = !isCustom;
    input.required = isCustom;
  }

  function selectedCategory(modal) {
    var select = modal.querySelector('[name="category"]');
    return select.value === "custom"
      ? modal
          .querySelector('[name="customCategory"]')
          .value.trim()
          .replace(/\s+/g, " ")
      : select.value;
  }

  function load() {
    apiGet("/budgets").then(function (data) {
      if (!data) return;

      var totalSpent = 0;
      var totalMax = 0;
      var summaryHtml = "";
      var cardsHtml = "";

      data.forEach(function (b) {
        var color = themeMap[b.theme] || "--green";
        totalSpent += b.spent;
        totalMax += b.maximum;
        var pct = Math.min((b.spent / b.maximum) * 100, 100);

        summaryHtml +=
          '<div class="summary-row"><div class="summary-row__left"><span class="bar-tag" style="background:var(' +
          color +
          ')"></span><span class="summary-row__name">' +
          escapeHtml(b.category) +
          '</span></div><div><span class="summary-row__spent">' +
          fmt(b.spent) +
          '</span><span class="summary-row__of">of ' +
          fmt(b.maximum) +
          "</span></div></div>";

        var latestHtml = "";
        b.latestSpending.forEach(function (t) {
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
          latestHtml +=
            '<div class="latest-row"><span class="avatar" style="background:var(' +
            safeTheme(t.color || color) +
            ')">' +
            escapeHtml(t.avatar || "") +
            '</span><div class="latest-row__name">' +
            escapeHtml(t.name) +
            '</div><div class="tx-row__right"><div class="latest-row__amt">-' +
            fmt(Math.abs(t.amount)) +
            '</div><div class="latest-row__date">' +
            dateStr +
            "</div></div></div>";
        });

        cardsHtml +=
          '<section class="card">' +
          '<div class="budget-card__head"><div class="budget-card__title"><span class="dot" style="background:var(' +
          color +
          ')"></span><h3>' +
          escapeHtml(b.category) +
          "</h3></div>" +
          '<div class="menu-wrap"><button class="kebab" data-menu>···</button><div class="menu"><button data-open="modal-edit-budget" data-budget-id="' +
          escapeAttr(b._id) +
          '" data-budget-cat="' +
          escapeAttr(b.category) +
          '" data-budget-max="' +
          escapeAttr(b.maximum) +
          '" data-budget-theme="' +
          escapeAttr(b.theme) +
          '">Edit Budget</button><button class="danger" data-open="modal-delete-budget" data-name="' +
          escapeAttr(b.category) +
          '" data-budget-id="' +
          escapeAttr(b._id) +
          '">Delete Budget</button></div></div></div>' +
          '<div class="muted">Maximum of ' +
          fmt(b.maximum) +
          "</div>" +
          '<div class="progress"><div class="progress__fill" style="width:' +
          pct +
          "%;background:var(" +
          color +
          ')"></div></div>' +
          '<div class="spent-row"><div class="spent-cell" style="border-color:var(' +
          color +
          ')"><div class="spent-cell__label">Spent</div><div class="spent-cell__val">' +
          fmt(b.spent) +
          '</div></div><div class="spent-cell"><div class="spent-cell__label">Remaining</div><div class="spent-cell__val">' +
          fmt(b.remaining) +
          "</div></div></div>" +
          '<div class="latest"><div class="latest__head"><span class="latest__title">Latest Spending</span></div>' +
          latestHtml +
          "</div></section>";
      });

      donutValueEl.textContent = fmt(totalSpent);
      donutLimitEl.textContent = "of " + fmt(totalMax) + " limit";
      summaryEl.innerHTML = summaryHtml;
      cardsEl.innerHTML = cardsHtml;
    });
  }

  load();

  document
    .getElementById("btn-add-budget")
    .addEventListener("click", function () {
      var modal = document.getElementById("modal-add-budget");
      var cat = selectedCategory(modal);
      var max = parseFloat(modal.querySelector('[name="maximum"]').value);
      var theme = themeValue(modal.querySelector('[name="theme"]').value);
      if (!cat || !max || !theme) return;
      apiPost("/budgets", { category: cat, maximum: max, theme: theme }).then(
        function () {
          load();
        },
      );
    });

  document.addEventListener("click", function (e) {
    var openEdit = e.target.closest('[data-open="modal-edit-budget"]');
    if (openEdit && openEdit.dataset.budgetId) {
      var modal = document.getElementById("modal-edit-budget");
      modal.dataset.budgetId = openEdit.dataset.budgetId;
      var category = openEdit.dataset.budgetCat || "";
      var categorySelect = modal.querySelector('[name="category"]');
      var hasCategory = Array.from(categorySelect.options).some(function (
        option,
      ) {
        return option.value === category;
      });
      categorySelect.value = hasCategory ? category : "custom";
      modal.querySelector('[name="customCategory"]').value = hasCategory
        ? ""
        : category;
      updateCustomCategory(modal);
      modal.querySelector('[name="maximum"]').value =
        openEdit.dataset.budgetMax || "";
      modal.querySelector('[name="theme"]').value = themeLabel(
        openEdit.dataset.budgetTheme || "green",
      );
    }

    var editBtn = e.target.closest("#btn-edit-budget");
    if (editBtn) {
      var editModal = document.getElementById("modal-edit-budget");
      var id = editModal.dataset.budgetId;
      var cat = selectedCategory(editModal);
      var max = parseFloat(editModal.querySelector('[name="maximum"]').value);
      var theme = themeValue(editModal.querySelector('[name="theme"]').value);
      if (id && cat && max && theme) {
        apiPut("/budgets/" + id, {
          category: cat,
          maximum: max,
          theme: theme,
        }).then(function () {
          load();
        });
      }
    }

    var delBtn = e.target.closest("#btn-delete-budget");
    if (delBtn) {
      var deleteId = document.getElementById("modal-delete-budget").dataset
        .budgetId;
      if (deleteId) {
        apiDelete("/budgets/" + deleteId).then(function () {
          load();
        });
      }
    }

    var openDel = e.target.closest('[data-open="modal-delete-budget"]');
    if (openDel && openDel.dataset.budgetId) {
      document.getElementById("modal-delete-budget").dataset.budgetId =
        openDel.dataset.budgetId;
    }
  });

  document
    .querySelectorAll(
      '#modal-add-budget [name="category"], #modal-edit-budget [name="category"]',
    )
    .forEach(function (select) {
      select.addEventListener("change", function () {
        updateCustomCategory(this.closest(".modal-overlay"));
      });
    });

  document.querySelectorAll("[data-logout]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  });
});
