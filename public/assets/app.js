(() => {
  const state = {
    token: localStorage.getItem('saldoo.token'),
    user: null,
    categories: [],
    incomes: [],
    expenses: [],
    goals: [],
    dashboard: null,
    history: [],
    score: null,
    filters: {},
    chat: []
  };

  const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const months = [
    ['1', 'Jan'],
    ['2', 'Fev'],
    ['3', 'Mar'],
    ['4', 'Abr'],
    ['5', 'Mai'],
    ['6', 'Jun'],
    ['7', 'Jul'],
    ['8', 'Ago'],
    ['9', 'Set'],
    ['10', 'Out'],
    ['11', 'Nov'],
    ['12', 'Dez']
  ];

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', () => {
    fillPeriodOptions();
    bindEvents();
    resetDatedForms();

    if (state.token) {
      loadSession();
    } else {
      showAuth();
    }
  });

  function bindEvents() {
    $$('[data-auth-mode]').forEach((button) => {
      button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
    });

    $('#login-form').addEventListener('submit', (event) => handleAuth(event, 'login'));
    $('#register-form').addEventListener('submit', (event) => handleAuth(event, 'register'));
    $('#logout-button').addEventListener('click', () => logout(true));
    $('#period-form').addEventListener('submit', handlePeriod);
    $('#transaction-form').addEventListener('submit', handleTransaction);
    $('#transaction-form [name="tipo"]').addEventListener('change', fillTransactionCategories);
    $('#goal-form').addEventListener('submit', handleGoal);
    $('#profile-form').addEventListener('submit', handleProfile);
    $('#password-form').addEventListener('submit', handlePassword);
    $('#category-form').addEventListener('submit', handleCategory);
    $('#chat-form').addEventListener('submit', handleChat);

    $$('.nav-item').forEach((button) => {
      button.addEventListener('click', () => setPage(button.dataset.page));
    });

    $('#transaction-list').addEventListener('click', handleRecordAction);
    $('#goal-list').addEventListener('click', handleRecordAction);
    $('#category-list').addEventListener('click', handleRecordAction);
  }

  async function handleAuth(event, mode) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      setFormDisabled(form, true);
      const data = await api(path, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      saveSession(data);
      form.reset();
      await refreshAll();
      showApp();
      notify(mode === 'login' ? 'Login realizado.' : 'Conta criada.');
    } catch (error) {
      notify(error.message, true);
    } finally {
      setFormDisabled(form, false);
    }
  }

  async function loadSession() {
    try {
      const data = await api('/api/auth/me');
      state.user = data.user;
      showApp();
      await refreshAll();
    } catch (error) {
      logout(false);
      notify('Sessao expirada. Entre novamente.', true);
    }
  }

  async function refreshAll() {
    renderLoading();
    const query = periodQuery();
    const [categories, dashboard, history, score, incomes, expenses, goals] = await Promise.all([
      api('/api/categories'),
      api('/api/dashboard' + query),
      api('/api/dashboard/history?meses=6'),
      api('/api/score'),
      api('/api/incomes' + query),
      api('/api/expenses' + query),
      api('/api/goals')
    ]);

    state.categories = categories.categories || [];
    state.dashboard = dashboard.dashboard;
    state.history = history.history || [];
    state.score = score.score;
    state.incomes = incomes.incomes || [];
    state.expenses = expenses.expenses || [];
    state.goals = goals.goals || [];

    renderAll();
  }

  async function handlePeriod(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    state.filters = {};
    if (data.mes) {
      state.filters.mes = data.mes;
    }
    if (data.ano) {
      state.filters.ano = data.ano;
    }

    try {
      await refreshAll();
    } catch (error) {
      notify(error.message, true);
    }
  }

  async function handleTransaction(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const type = data.tipo;
    const path = type === 'income' ? '/api/incomes' : '/api/expenses';
    const payload = {
      valor: Number(data.valor),
      data: data.data,
      id_categoria: Number(data.id_categoria),
      descricao: data.descricao || null
    };

    try {
      setFormDisabled(form, true);
      await api(path, { method: 'POST', body: JSON.stringify(payload) });
      form.reset();
      resetDatedForms();
      fillTransactionCategories();
      await refreshAll();
      notify('Lancamento salvo.');
    } catch (error) {
      notify(error.message, true);
    } finally {
      setFormDisabled(form, false);
    }
  }

  async function handleGoal(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const payload = {
      titulo: data.titulo,
      valor_alvo: Number(data.valor_alvo),
      valor_atual: data.valor_atual ? Number(data.valor_atual) : 0,
      data_limite: data.data_limite || null,
      id_categoria: data.id_categoria ? Number(data.id_categoria) : null
    };

    try {
      setFormDisabled(form, true);
      await api('/api/goals', { method: 'POST', body: JSON.stringify(payload) });
      form.reset();
      resetDatedForms();
      await refreshAll();
      notify('Meta salva.');
    } catch (error) {
      notify(error.message, true);
    } finally {
      setFormDisabled(form, false);
    }
  }

  async function handleProfile(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    try {
      setFormDisabled(form, true);
      const data = await api('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      state.user = data.user;
      renderProfile();
      renderUser();
      notify('Perfil atualizado.');
    } catch (error) {
      notify(error.message, true);
    } finally {
      setFormDisabled(form, false);
    }
  }

  async function handlePassword(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    try {
      setFormDisabled(form, true);
      await api('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      form.reset();
      notify('Senha atualizada.');
    } catch (error) {
      notify(error.message, true);
    } finally {
      setFormDisabled(form, false);
    }
  }

  async function handleCategory(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    try {
      setFormDisabled(form, true);
      await api('/api/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      form.reset();
      await refreshAll();
      notify('Categoria adicionada.');
    } catch (error) {
      notify(error.message, true);
    } finally {
      setFormDisabled(form, false);
    }
  }

  async function handleChat(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const message = data.mensagem.trim();

    if (!message) {
      return;
    }

    state.chat.push({ role: 'user', text: message });
    renderChat();
    form.reset();

    try {
      setFormDisabled(form, true);
      const result = await api('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ mensagem: message })
      });
      state.chat.push({ role: 'assistant', text: result.chat.resposta });
      renderChat();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setFormDisabled(form, false);
      $('#chat-input').focus();
    }
  }

  async function handleRecordAction(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.action;

    try {
      button.disabled = true;
      if (action === 'delete-transaction') {
        const path = button.dataset.kind === 'income' ? '/api/incomes/' : '/api/expenses/';
        await api(path + button.dataset.id, { method: 'DELETE' });
        notify('Lancamento removido.');
      }

      if (action === 'delete-goal') {
        await api('/api/goals/' + button.dataset.id, { method: 'DELETE' });
        notify('Meta removida.');
      }

      if (action === 'update-goal') {
        const goal = state.goals.find((item) => String(item.id_meta) === button.dataset.id);
        const input = $(`[data-goal-progress="${button.dataset.id}"]`);
        await api('/api/goals/' + button.dataset.id, {
          method: 'PUT',
          body: JSON.stringify({
            titulo: goal.titulo,
            valor_alvo: goal.valor_alvo,
            valor_atual: Number(input.value || 0),
            data_limite: goal.data_limite,
            id_categoria: goal.id_categoria
          })
        });
        notify('Progresso atualizado.');
      }

      if (action === 'delete-category') {
        await api('/api/categories/' + button.dataset.id, { method: 'DELETE' });
        notify('Categoria removida.');
      }

      await refreshAll();
    } catch (error) {
      notify(error.message, true);
    } finally {
      button.disabled = false;
    }
  }

  async function api(path, options = {}) {
    const headers = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    };

    if (state.token) {
      headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(path, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error?.message || 'Nao foi possivel completar a operacao.');
    }

    return payload.data || {};
  }

  function renderAll() {
    renderUser();
    renderProfile();
    fillTransactionCategories();
    fillGoalCategories();
    renderSummary();
    renderHistory();
    renderScore();
    renderDistribution();
    renderRecent();
    renderTransactions();
    renderGoals();
    renderCategories();
    renderChat();
  }

  function renderLoading() {
    $('#summary-grid').innerHTML = emptyState('Carregando dados...');
    $('#history-chart').innerHTML = emptyState('Carregando historico...');
    $('#score-panel').innerHTML = emptyState('Carregando score...');
  }

  function renderUser() {
    if (!state.user) {
      return;
    }
    $('#user-pill').textContent = `${state.user.nome} · ${state.user.tipo_usuario === 'business' ? 'Empresa' : 'Pessoa fisica'}`;
  }

  function renderProfile() {
    if (!state.user) {
      return;
    }

    const form = $('#profile-form');
    form.elements.nome.value = state.user.nome;
    form.elements.email.value = state.user.email;
    form.elements.tipo_usuario.value = state.user.tipo_usuario;
  }

  function renderSummary() {
    const dashboard = state.dashboard || {};
    const score = state.score || {};
    const cards = [
      ['Saldo atual', formatCurrency(dashboard.saldo_atual || 0), 'summary-card'],
      ['Receitas', formatCurrency(dashboard.total_receitas || 0), 'summary-card income'],
      ['Despesas', formatCurrency(dashboard.total_despesas || 0), 'summary-card expense'],
      ['Score', `${score.score || 0} · ${score.nivel || 'Sem dados'}`, 'summary-card score'],
      ['Metas', `${dashboard.metas?.progresso_percentual || 0}%`, 'summary-card goal']
    ];

    $('#summary-grid').innerHTML = cards.map(([label, value, className]) => `
      <article class="${className}">
        <span>${label}</span>
        <strong>${escapeHtml(value)}</strong>
      </article>
    `).join('');
  }

  function renderHistory() {
    if (!state.history.length) {
      $('#history-chart').innerHTML = emptyState('Sem historico para exibir.');
      return;
    }

    const max = Math.max(...state.history.flatMap((item) => [item.total_receitas, item.total_despesas]), 1);
    $('#history-chart').style.gridTemplateColumns = `repeat(${state.history.length}, minmax(36px, 1fr))`;
    $('#history-chart').innerHTML = state.history.map((item) => {
      const incomeHeight = Math.max(4, (item.total_receitas / max) * 100);
      const expenseHeight = Math.max(4, (item.total_despesas / max) * 100);
      return `
        <div class="bar-group" title="${formatCurrency(item.saldo)} de saldo">
          <div class="bar-stack">
            <span class="bar income" style="height:${incomeHeight}%"></span>
            <span class="bar expense" style="height:${expenseHeight}%"></span>
          </div>
          <span class="bar-label">${monthName(item.mes)}/${String(item.ano).slice(-2)}</span>
        </div>
      `;
    }).join('');
  }

  function renderScore() {
    const score = state.score;
    if (!score) {
      $('#score-panel').innerHTML = emptyState('Sem score calculado.');
      return;
    }

    $('#score-panel').innerHTML = `
      <div class="score-block">
        <div class="distribution-row">
          <strong>${score.score}</strong>
          <span class="muted">${escapeHtml(score.nivel)}</span>
        </div>
        <div class="meter" aria-label="Score de ${score.score} em 1000">
          <span style="width:${Math.min(100, score.score / 10)}%"></span>
        </div>
        <div class="record-list">
          ${(score.recomendacoes || []).map((item) => `<p class="muted">${escapeHtml(item)}</p>`).join('')}
        </div>
      </div>
    `;
  }

  function renderDistribution() {
    const items = state.dashboard?.distribuicao_gastos || [];
    if (!items.length) {
      $('#expense-distribution').innerHTML = emptyState('Nenhuma despesa no periodo.');
      return;
    }

    const max = Math.max(...items.map((item) => item.total), 1);
    $('#expense-distribution').innerHTML = items.map((item) => `
      <div class="distribution-item">
        <div class="distribution-row">
          <strong>${escapeHtml(item.categoria)}</strong>
          <span>${formatCurrency(item.total)}</span>
        </div>
        <div class="meter"><span style="width:${Math.max(4, (item.total / max) * 100)}%"></span></div>
      </div>
    `).join('');
  }

  function renderRecent() {
    const items = state.dashboard?.transacoes_recentes || [];
    $('#recent-list').innerHTML = items.length
      ? items.map((item) => recordRow(item)).join('')
      : emptyState('Nenhuma movimentacao registrada.');
  }

  function renderTransactions() {
    const items = combinedTransactions();
    $('#transaction-list').innerHTML = items.length
      ? items.map((item) => recordRow(item, true)).join('')
      : emptyState('Nenhum lancamento no periodo.');
  }

  function renderGoals() {
    $('#goal-list').innerHTML = state.goals.length
      ? state.goals.map((goal) => `
        <article class="goal-row">
          <div class="goal-head">
            <div>
              <strong>${escapeHtml(goal.titulo)}</strong>
              <span class="record-meta">${goal.categoria_nome ? escapeHtml(goal.categoria_nome) : 'Sem categoria'} · ${goal.data_limite ? formatDate(goal.data_limite) : 'Sem prazo'}</span>
            </div>
            <strong>${formatCurrency(goal.valor_atual)} / ${formatCurrency(goal.valor_alvo)}</strong>
          </div>
          <div class="meter"><span style="width:${Math.min(100, goal.progresso_percentual)}%"></span></div>
          <div class="goal-actions">
            <label>
              <span class="sr-only">Valor atual de ${escapeHtml(goal.titulo)}</span>
              <input data-goal-progress="${goal.id_meta}" type="number" min="0" step="0.01" value="${goal.valor_atual}">
            </label>
            <button type="button" class="secondary-action" data-action="update-goal" data-id="${goal.id_meta}">Atualizar</button>
            <button type="button" class="danger-action" data-action="delete-goal" data-id="${goal.id_meta}">Remover</button>
          </div>
        </article>
      `).join('')
      : emptyState('Nenhuma meta cadastrada.');
  }

  function renderCategories() {
    const owned = state.categories.filter((category) => category.id_usuario !== null);
    $('#category-list').innerHTML = owned.length
      ? owned.map((category) => `
        <div class="chip">
          <span>${escapeHtml(category.nome)} · ${categoryType(category.tipo)}</span>
          <button type="button" class="danger-action" data-action="delete-category" data-id="${category.id_categoria}">Remover</button>
        </div>
      `).join('')
      : '<p class="muted">Sem categorias proprias.</p>';
  }

  function renderChat() {
    if (!state.chat.length) {
      state.chat = [{
        role: 'assistant',
        text: 'Pergunte sobre score, economia, dividas ou organizacao financeira com base nos seus dados.'
      }];
    }

    $('#chat-log').innerHTML = state.chat.map((message) => `
      <div class="message ${message.role === 'user' ? 'user' : 'assistant'}">${escapeHtml(message.text)}</div>
    `).join('');
    $('#chat-log').scrollTop = $('#chat-log').scrollHeight;
  }

  function recordRow(item, withAction = false) {
    const isIncome = item.tipo === 'receita' || item.kind === 'income';
    const kind = item.kind || (isIncome ? 'income' : 'expense');
    return `
      <article class="record-row ${isIncome ? 'income' : 'expense'}">
        <div>
          <strong>${escapeHtml(item.descricao || item.categoria_nome || 'Lancamento')}</strong>
          <span class="record-meta">${escapeHtml(item.categoria_nome || 'Sem categoria')} · ${formatDate(item.data)}</span>
        </div>
        <div>
          <strong>${isIncome ? '+' : '-'}${formatCurrency(item.valor)}</strong>
          ${withAction ? `<button type="button" class="danger-action" data-action="delete-transaction" data-kind="${kind}" data-id="${item.id}">Remover</button>` : ''}
        </div>
      </article>
    `;
  }

  function fillPeriodOptions() {
    const select = $('#period-form [name="mes"]');
    select.innerHTML = '<option value="">Todos</option>' + months.map(([value, label]) => (
      `<option value="${value}">${label}</option>`
    )).join('');
    $('#period-form [name="ano"]').value = new Date().getFullYear();
    state.filters.ano = String(new Date().getFullYear());
  }

  function fillTransactionCategories() {
    const form = $('#transaction-form');
    const type = form.elements.tipo.value;
    const select = form.elements.id_categoria;
    const available = state.categories.filter((category) => category.tipo === type || category.tipo === 'both');
    select.innerHTML = available.map((category) => (
      `<option value="${category.id_categoria}">${escapeHtml(category.nome)}</option>`
    )).join('');
  }

  function fillGoalCategories() {
    const select = $('#goal-form [name="id_categoria"]');
    select.innerHTML = '<option value="">Sem categoria</option>' + state.categories.map((category) => (
      `<option value="${category.id_categoria}">${escapeHtml(category.nome)}</option>`
    )).join('');
  }

  function setAuthMode(mode) {
    const isLogin = mode === 'login';
    $('#login-form').hidden = !isLogin;
    $('#register-form').hidden = isLogin;
    $('#auth-title').textContent = isLogin ? 'Acesse sua conta' : 'Crie sua conta';
    $$('[data-auth-mode]').forEach((button) => {
      const active = button.dataset.authMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  function setPage(page) {
    $$('.nav-item').forEach((button) => button.classList.toggle('is-active', button.dataset.page === page));
    $$('.page').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.pagePanel === page));
  }

  function showAuth() {
    $('#auth-view').hidden = false;
    $('#app-view').hidden = true;
  }

  function showApp() {
    $('#auth-view').hidden = true;
    $('#app-view').hidden = false;
  }

  function saveSession(data) {
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('saldoo.token', data.token);
  }

  function logout(showMessage) {
    state.token = null;
    state.user = null;
    localStorage.removeItem('saldoo.token');
    showAuth();
    if (showMessage) {
      notify('Sessao encerrada.');
    }
  }

  function combinedTransactions() {
    return [
      ...state.incomes.map((item) => ({ ...item, kind: 'income' })),
      ...state.expenses.map((item) => ({ ...item, kind: 'expense' }))
    ].sort((a, b) => String(b.data + b.created_at).localeCompare(String(a.data + a.created_at)));
  }

  function periodQuery() {
    const params = new URLSearchParams();
    if (state.filters.mes) {
      params.set('mes', state.filters.mes);
    }
    if (state.filters.ano) {
      params.set('ano', state.filters.ano);
    }
    const query = params.toString();
    return query ? `?${query}` : '';
  }

  function resetDatedForms() {
    const today = new Date().toISOString().slice(0, 10);
    $('#transaction-form [name="data"]').value = today;
  }

  function setFormDisabled(form, disabled) {
    $$('button, input, select', form).forEach((control) => {
      control.disabled = disabled;
    });
  }

  function notify(message, isError = false) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.style.background = isError ? 'var(--rose)' : 'var(--ink)';
    toast.classList.add('is-visible');
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  function emptyState(message) {
    return `<p class="muted">${escapeHtml(message)}</p>`;
  }

  function formatCurrency(value) {
    return currency.format(Number(value || 0));
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
  }

  function monthName(value) {
    return months.find(([month]) => month === String(value))?.[1] || String(value);
  }

  function categoryType(value) {
    return {
      income: 'Receita',
      expense: 'Despesa',
      both: 'Ambos'
    }[value] || value;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
