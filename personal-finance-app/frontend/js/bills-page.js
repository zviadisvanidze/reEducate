document.addEventListener("DOMContentLoaded", function () {
  var state = { sort: "latest", search: "" };
  var billsBody = document.getElementById("bills-body");
  var addForm = document.getElementById("add-bill-form");
  var editForm = document.getElementById("edit-bill-form");
  var editModal = document.getElementById("modal-edit-bill");
  var deleteModal = document.getElementById("modal-delete-bill");

  var paidCheck =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--green)"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var dueIcon =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--red)"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16v.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

  function closeModal(modal) {
    modal.classList.remove("is-open");
  }

  function setSubmitting(button, submitting, defaultText) {
    button.disabled = submitting;
    button.textContent = submitting ? "Saving..." : defaultText;
  }

  function formPayload(form) {
    return {
      name: form.elements.name.value.trim().replace(/\s+/g, " "),
      amount: Number(form.elements.amount.value),
      dueDay: Number(form.elements.dueDay.value),
      color: form.elements.color.value,
      isPaid: form.elements.isPaid.value === "true",
    };
  }

  function load() {
    var q = "?sort=" + encodeURIComponent(state.sort);
    if (state.search) q += "&search=" + encodeURIComponent(state.search);

    return Promise.all([
      apiGet("/bills" + q).then(renderBills),
      apiGet("/bills/summary").then(renderSummary),
    ]);
  }

  function renderBills(bills) {
    var html = "";

    bills.forEach(function (bill) {
      var statusClass =
        bill.status === "paid"
          ? " bill-due--paid"
          : bill.status === "dueSoon"
            ? " bill-due--soon"
            : "";
      var icon =
        bill.status === "paid"
          ? paidCheck
          : bill.status === "dueSoon"
            ? dueIcon
            : "";
      var amountClass = bill.status === "dueSoon" ? " bill-amt--soon" : "";
      var nextPaidState = !bill.isPaid;

      html +=
        '<div class="bill-row">' +
        '<div class="bill-row__who"><span class="avatar" style="background:var(' +
        safeTheme(bill.color || "--green") +
        ')">' +
        escapeHtml(bill.avatar || "") +
        '</span><span class="name">' +
        escapeHtml(bill.name) +
        "</span></div>" +
        '<div class="bill-due' +
        statusClass +
        '"><span>Monthly - ' +
        ordinal(bill.dueDay) +
        "</span>" +
        icon +
        "</div>" +
        '<div class="bill-row__amount-actions"><div class="bill-amt' +
        amountClass +
        '">' +
        fmt(bill.amount) +
        '</div><div class="menu-wrap"><button class="kebab" data-menu aria-label="Manage bill">···</button><div class="menu">' +
        '<button data-bill-action="status" data-bill-id="' +
        escapeAttr(bill._id) +
        '" data-bill-paid="' +
        String(nextPaidState) +
        '">' +
        (bill.isPaid ? "Mark as Unpaid" : "Mark as Paid") +
        '</button><button data-open="modal-edit-bill" data-bill-action="edit" data-bill-id="' +
        escapeAttr(bill._id) +
        '" data-bill-name="' +
        escapeAttr(bill.name) +
        '" data-bill-amount="' +
        escapeAttr(bill.amount) +
        '" data-bill-day="' +
        escapeAttr(bill.dueDay) +
        '" data-bill-color="' +
        escapeAttr(bill.color || "--green") +
        '" data-bill-paid="' +
        String(bill.isPaid) +
        '">Edit Bill</button><button class="danger" data-open="modal-delete-bill" data-bill-action="delete" data-bill-id="' +
        escapeAttr(bill._id) +
        '" data-bill-name="' +
        escapeAttr(bill.name) +
        '">Delete Bill</button></div></div></div></div>';
    });

    billsBody.innerHTML =
      html ||
      '<div class="bills-empty"><strong>No recurring bills yet</strong><span>Add your first monthly bill to start tracking due dates.</span></div>';
  }

  function renderSummary(data) {
    document.getElementById("bills-total").textContent = fmt(data.totalBills);
    document.getElementById("bills-paid-count").textContent =
      data.paid.count + " (" + fmt(data.paid.total) + ")";
    document.getElementById("bills-upcoming-count").textContent =
      data.upcoming.count + " (" + fmt(data.upcoming.total) + ")";
    document.getElementById("bills-due-count").textContent =
      data.dueSoon.count + " (" + fmt(data.dueSoon.total) + ")";
  }

  function ordinal(number) {
    var suffixes = ["th", "st", "nd", "rd"];
    var remainder = number % 100;
    return (
      number +
      (suffixes[(remainder - 20) % 10] ||
        suffixes[remainder] ||
        suffixes[0])
    );
  }

  addForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var button = document.getElementById("btn-add-bill");
    var errorElement = document.getElementById("add-bill-error");
    errorElement.textContent = "";
    setSubmitting(button, true, "Add Bill");

    apiPost("/bills", formPayload(addForm))
      .then(function () {
        addForm.reset();
        closeModal(document.getElementById("modal-add-bill"));
        return load();
      })
      .catch(function (error) {
        errorElement.textContent = errorMessage(error);
      })
      .finally(function () {
        setSubmitting(button, false, "Add Bill");
      });
  });

  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var button = document.getElementById("btn-edit-bill");
    var errorElement = document.getElementById("edit-bill-error");
    var id = editModal.dataset.billId;
    errorElement.textContent = "";
    setSubmitting(button, true, "Save Changes");

    apiPut("/bills/" + encodeURIComponent(id), formPayload(editForm))
      .then(function () {
        closeModal(editModal);
        return load();
      })
      .catch(function (error) {
        errorElement.textContent = errorMessage(error);
      })
      .finally(function () {
        setSubmitting(button, false, "Save Changes");
      });
  });

  document.getElementById("btn-delete-bill").addEventListener("click", function () {
    var button = this;
    var errorElement = document.getElementById("delete-bill-error");
    var id = deleteModal.dataset.billId;
    errorElement.textContent = "";
    button.disabled = true;
    button.textContent = "Deleting...";

    apiDelete("/bills/" + encodeURIComponent(id))
      .then(function () {
        closeModal(deleteModal);
        return load();
      })
      .catch(function (error) {
        errorElement.textContent = errorMessage(error);
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = "Yes, Delete Bill";
      });
  });

  document.addEventListener("click", function (event) {
    var editButton = event.target.closest('[data-bill-action="edit"]');
    if (editButton) {
      editModal.dataset.billId = editButton.dataset.billId;
      editForm.elements.name.value = editButton.dataset.billName;
      editForm.elements.amount.value = editButton.dataset.billAmount;
      editForm.elements.dueDay.value = editButton.dataset.billDay;
      editForm.elements.color.value = editButton.dataset.billColor;
      editForm.elements.isPaid.value = editButton.dataset.billPaid;
      document.getElementById("edit-bill-error").textContent = "";
    }

    var deleteButton = event.target.closest('[data-bill-action="delete"]');
    if (deleteButton) {
      deleteModal.dataset.billId = deleteButton.dataset.billId;
      document.getElementById("delete-bill-title").textContent =
        "Delete ‘" + deleteButton.dataset.billName + "’?";
      document.getElementById("delete-bill-error").textContent = "";
    }

    var statusButton = event.target.closest('[data-bill-action="status"]');
    if (statusButton) {
      statusButton.disabled = true;
      apiPut(
        "/bills/" + encodeURIComponent(statusButton.dataset.billId) + "/status",
        { isPaid: statusButton.dataset.billPaid === "true" },
      )
        .then(load)
        .catch(function (error) {
          window.alert(errorMessage(error));
        })
        .finally(function () {
          statusButton.disabled = false;
        });
    }
  });

  document.getElementById("bills-sort").addEventListener("change", function () {
    state.sort = this.value;
    load();
  });

  var searchTimer;
  document.getElementById("bills-search").addEventListener("input", function () {
    clearTimeout(searchTimer);
    var value = this.value.trim();
    searchTimer = setTimeout(function () {
      state.search = value;
      load();
    }, 300);
  });

  document.querySelectorAll("[data-logout]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      logout();
    });
  });

  load();
});
