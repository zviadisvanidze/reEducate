var API = '/api';

function authHeaders(headers) {
  var token = localStorage.getItem('accessToken');
  var result = headers || {};
  if (token) {
    result.Authorization = 'Bearer ' + token;
  }
  return result;
}

function apiGet(url) {
  return fetch(API + url, {
    headers: authHeaders()
  }).then(function (res) {
    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    return res.json();
  });
}

function apiPost(url, data) {
  return fetch(API + url, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  }).then(function (res) {
    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    return res.json().then(function (json) {
      json._status = res.status;
      return json;
    });
  });
}

function apiPut(url, data) {
  return fetch(API + url, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  }).then(function (res) {
    return res.json();
  });
}

function apiDelete(url) {
  return fetch(API + url, {
    method: 'DELETE',
    headers: authHeaders()
  }).then(function (res) {
    return res.json();
  });
}

function logout() {
  fetch(API + '/auth/logout', {
    method: 'POST',
    headers: authHeaders()
  }).finally(function () {
    localStorage.removeItem('accessToken');
    window.location.href = 'login.html';
  });
}

function fmt(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
