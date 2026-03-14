const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');

let allTodos = [];

// ── Listen for form submit ────────────────────────────────────
todoForm.addEventListener('submit', function(e) {
  e.preventDefault();
  addTodo();
});

// ── Add a new todo ────────────────────────────────────────────
function addTodo() {
  const todoText = todoInput.value.trim(); // FIX: was todoInput.ariaValueMax
  if (todoText.length > 0) {
    allTodos.push(todoText);
    updateTodoList();
    todoInput.value = "";
  }
}

// ── Re-render the full list ───────────────────────────────────
function updateTodoList() {
  todoListUL.innerHTML = ""; // FIX: was innerhtml (case sensitive)
  allTodos.forEach((todo, todoIndex) => {
    const todoItem = createTodoItem(todo, todoIndex); // FIX: was missing const
    todoListUL.append(todoItem);
  });
}

// ── Create one todo list item ─────────────────────────────────
function createTodoItem(todo, todoIndex) {
  const todoLI = document.createElement("li");
  todoLI.classList.add("todo");

  const checkboxId = `todo-${todoIndex}`;

  todoLI.innerHTML = `
    <input type="checkbox" id="${checkboxId}">
    <label class="custom-checkbox" for="${checkboxId}"></label>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <label for="${checkboxId}" class="todo-next">${escapeHTML(todo)}</label>
    <button class="delete-button" onclick="deleteTodo(${todoIndex})">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086
          2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142
          2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6L18.1168
          19.1493C18.0504 20.1909 17.1901 21 16.1463 21H7.85369C6.80986
          21 5.94956 20.1909 5.88322 19.1493L5 6H19Z"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;

  // FIX: removed the extra todoListUL.append(todoLI) that was inside here
  return todoLI;
}

// ── Delete a todo ─────────────────────────────────────────────
function deleteTodo(todoIndex) {
  allTodos = allTodos.filter((_, i) => i !== todoIndex);
  updateTodoList();
}

// ── Security: prevent XSS from user input ────────────────────
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}