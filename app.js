const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const deadlineInput = document.getElementById('deadline-input');
const todoListUL = document.getElementById('todo-list');
const emptyEl = document.getElementById('empty');

let allTodos      = JSON.parse(localStorage.getItem('todos') || '[]');
const shownPopups = new Set();

renderList();
startDeadlineChecker();

todoForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const text     = todoInput.value.trim();
  const deadline = deadlineInput.value;

  if (!text) {
    todoInput.style.borderColor = '#ef4444';
    setTimeout(() => todoInput.style.borderColor = '', 1000);
    return;
  }

  const todo = {
    id: Date.now(),
    text: text,
    deadline: deadline || null,
    done: false,
  };

  allTodos.push(todo);
  save();
  renderList();

  todoInput.value     = '';
  deadlineInput.value = '';
  todoInput.focus();
});

function renderList() {
  todoListUL.innerHTML = '';
  emptyEl.classList.toggle('show', allTodos.length === 0);
  allTodos.forEach(todo => todoListUL.appendChild(buildTodoEl(todo)));
}

function buildTodoEl(todo) {
  const li   = document.createElement('li');
  const cbId = `cb-${todo.id}`;

  li.classList.add('todo');
  if (todo.done) li.classList.add('done');
  if (todo.deadline && new Date(todo.deadline) < new Date() && !todo.done) {
    li.classList.add('overdue');
  }

  const deadlineBadge = todo.deadline
    ? `<span class="deadline-badge">⏰ ${niceDate(todo.deadline)}</span>` : '';

  li.innerHTML = `
    <input type="checkbox" id="${cbId}" ${todo.done ? 'checked' : ''}>
    <label class="custom-checkbox" for="${cbId}"></label>
    <svg class="check-svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <div class="task-body">
      <label for="${cbId}" class="todo-text">${safe(todo.text)}</label>
      ${deadlineBadge}
    </div>
    <button class="delete-btn" aria-label="Delete">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086
          2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142
          2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6L18.1168 19.1493C18.0504
          20.1909 17.1901 21 16.1463 21H7.85369C6.80986 21 5.94956 20.1909
          5.88322 19.1493L5 6H19Z" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;

  li.querySelector(`#${cbId}`).addEventListener('change', () => {
    allTodos = allTodos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t);
    save();
    renderList();
  });

  li.querySelector('.delete-btn').addEventListener('click', () => {
    allTodos = allTodos.filter(t => t.id !== todo.id);
    save();
    renderList();
  });

  return li;
}

function startDeadlineChecker() {
  checkDeadlines();
  setInterval(checkDeadlines, 60000);
}

function checkDeadlines() {
  const now = new Date();
  allTodos.forEach(todo => {
    if (!todo.deadline || todo.done || shownPopups.has(todo.id)) return;
    if (new Date(todo.deadline) <= now) {
      shownPopups.add(todo.id);
      showPopup(`"${todo.text}" was due on ${niceDate(todo.deadline)}`);
    }
  });
}

function showPopup(msg) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="popup">
      <div class="popup-emoji">⏰</div>
      <h2>Deadline reached!</h2>
      <p>${safe(msg)}</p>
      <button class="popup-btn">Got it</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  overlay.querySelector('.popup-btn').addEventListener('click', () => closePopup(overlay));
  overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(overlay); });
}

function closePopup(overlay) {
  overlay.classList.remove('show');
  setTimeout(() => overlay.remove(), 300);
}

function save() {
  localStorage.setItem('todos', JSON.stringify(allTodos));
}

function niceDate(str) {
  return new Date(str).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function safe(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}