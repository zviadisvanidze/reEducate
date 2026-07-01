document.addEventListener("DOMContentLoaded", function () {
  var state = { page: 1, sort: "latest", category: "", search: "" };
  var tbody = document.getElementById("tx-body");
  var paginationEl = document.getElementById("tx-pagination");
  var sendForm = document.getElementById("send-money-form");
  var sendModal = document.getElementById("modal-send-money");
  var sendError = document.getElementById("send-money-error");
  var transactionTypeSelect = document.getElementById("transaction-type");
  var receiverEmailWrap = document.getElementById("receiver-email-wrap");
  var merchantNameWrap = document.getElementById("merchant-name-wrap");
  var categorySelect = document.getElementById("transaction-category");
  var customCategoryWrap = document.getElementById("custom-category-wrap");
  var currentBalance = 0;

  function loadBalance() {
    return apiGet("/auth/current-user").then(function (user) {
      currentBalance = Number(user.balance) || 0;
      document.getElementById("modal-tx-balance").textContent = fmt(currentBalance);
    });
  }

  function updatePaymentType() {
    var isMerchant = transactionTypeSelect.value === "merchant";
    receiverEmailWrap.hidden = isMerchant;
    merchantNameWrap.hidden = !isMerchant;
    sendForm.elements.receiverEmail.required = !isMerchant;
    sendForm.elements.counterpartyName.required = isMerchant;
    document.getElementById("send-money-description").textContent = isMerchant
      ? "Enter the shop or service name. This payment will be recorded as spending from your account."
      : "Enter the receiver’s account email. The transfer will appear immediately for both users.";
  }

  function load() {
    var q = "?page=" + state.page + "&limit=10&sort=" + state.sort;
    if (state.search) q += "&search=" + encodeURIComponent(state.search);
    if (state.category) q += "&category=" + encodeURIComponent(state.category);

    return apiGet("/transactions" + q).then(function (data) {
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
          safeTheme(t.color || "--green") +
          ')">' +
          escapeHtml(t.avatar || "") +
          '</span><div><div class="name">' +
          escapeHtml(t.name) +
          '</div><div class="sub">' +
          escapeHtml(t.category) +
          "</div></div></div>" +
          '<div class="cell">' +
          escapeHtml(t.category) +
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
      tbody.innerHTML =
        html ||
        '<div class="transactions-empty"><strong>No transactions yet</strong><span>Send money to another finance user to create your first transaction.</span></div>';

      if (data.totalPages <= 1) {
        paginationEl.innerHTML = "";
        paginationEl.dataset.totalPages = data.totalPages;
        return;
      }

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

  updatePaymentType();
  load();
  loadBalance();

  document
    .getElementById("btn-open-send-money")
    .addEventListener("click", function () {
      sendError.textContent = "";
      loadBalance();
    });

  categorySelect.addEventListener("change", function () {
    var isCustom = this.value === "custom";
    customCategoryWrap.hidden = !isCustom;
    document.getElementById("custom-transaction-category").required = isCustom;
  });

  transactionTypeSelect.addEventListener("change", updatePaymentType);

  sendForm.addEventListener("submit", function (e) {
    e.preventDefault();
    sendError.textContent = "";

    var transactionType = transactionTypeSelect.value;
    var receiverEmail = sendForm.elements.receiverEmail.value.trim().toLowerCase();
    var counterpartyName = sendForm.elements.counterpartyName.value
      .trim()
      .replace(/\s+/g, " ");
    var amount = Number(sendForm.elements.amount.value);
    var category =
      categorySelect.value === "custom"
        ? sendForm.elements.customCategory.value.trim().replace(/\s+/g, " ")
        : categorySelect.value;
    var color = sendForm.elements.color.value;
    var submitButton = document.getElementById("btn-send-money");

    if (!category) {
      sendError.textContent = "Enter a category.";
      return;
    }

    if (transactionType === "merchant" && !counterpartyName) {
      sendError.textContent = "Enter the shop or service name.";
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      sendError.textContent = "Amount must be greater than 0.";
      return;
    }

    if (amount > currentBalance) {
      sendError.textContent =
        "Insufficient balance. You currently have " + fmt(currentBalance) + ".";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    var transactionData = {
      transactionType: transactionType,
      amount: amount,
      category: category,
      color: color,
    };
    if (transactionType === "merchant") {
      transactionData.counterpartyName = counterpartyName;
    } else {
      transactionData.receiverEmail = receiverEmail;
    }

    apiPost("/transactions", transactionData)
      .then(function () {
        sendForm.reset();
        updatePaymentType();
        customCategoryWrap.hidden = true;
        sendModal.classList.remove("is-open");
        state.page = 1;
        return Promise.all([load(), loadBalance()]);
      })
      .catch(function (error) {
        var message = errorMessage(error);
        if (message.indexOf("receiverId") !== -1) {
          message =
            "The server is using an outdated transaction API. Restart or redeploy the backend, then try again.";
        }
        sendError.textContent = message;
      })
      .finally(function () {
        submitButton.disabled = false;
        submitButton.textContent = "Send Money";
      });
  });

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
    if (p === "prev") {
      if (state.page > 1) state.page--;
    } else if (p === "next") {
      if (state.page < Number(paginationEl.dataset.totalPages)) state.page++;
    } else {
      state.page = Number(p);
    }
    load();
  });

  document.querySelectorAll("[data-logout]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  });
});
