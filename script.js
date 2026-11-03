const storageKey = 'simple-todo-v1';

let todos;
try {
  todos = JSON.parse(localStorage.getItem(storageKey));
} catch {
  todos = null;
}

if (!Array.isArray(todos)) {
  todos = [
    { id: 1, text: 'See Lecture', done: false },
    { id: 2, text: 'Solve assignment', done: false }
  ];
}

let currentFilter = 'all';
const list = document.querySelector('ul');
const count = document.querySelector('#count');

const trashIcon = `
  <svg width="12" height="14" viewBox="0 0 16 18" fill="none" aria-hidden="true">
    <path d="M3 5h10l-1 11H4L3 5Z" fill="currentColor"/>
    <path d="M2 3h12M6 2h4M6 7v6M10 7v6" stroke="currentColor" stroke-width="1.4"/>
    <path d="M6 7v6M10 7v6" stroke="white" stroke-width=".7"/>
  </svg>
`;

function saveTodos() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(todos));
  } catch {
    // The list can still be used when storage is unavailable.
  }

  render();
}

function startEditing(todo, label) {
  if (label.querySelector('input')) return;

  const input = document.createElement('input');
  input.className = 'edit';
  input.value = todo.text;
  input.maxLength = 300;
  input.setAttribute('aria-label', 'Edit task');
  label.replaceChildren(input);
  input.focus();
  input.select();

  let finished = false;

  function finishEditing(cancel) {
    if (finished) return;
    finished = true;

    if (!cancel && input.value.trim()) {
      todo.text = input.value.trim();
    }

    saveTodos();
  }

  input.onkeydown = (event) => {
    if (event.key === 'Enter') finishEditing(false);
    if (event.key === 'Escape') finishEditing(true);
  };

  input.onblur = () => finishEditing(false);
}

function render() {
  list.replaceChildren();

  const visibleTodos = todos.filter((todo) => {
    return currentFilter === 'all'
      || todo.done === (currentFilter === 'completed');
  });

  visibleTodos.forEach((todo) => {
    const row = document.createElement('li');
    row.className = `row${todo.done ? ' done' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'check';
    checkbox.checked = todo.done;
    checkbox.setAttribute(
      'aria-label',
      `Mark ${todo.text} ${todo.done ? 'active' : 'complete'}`
    );
    checkbox.onchange = () => {
      todo.done = checkbox.checked;
      saveTodos();
    };

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = todo.text;
    label.tabIndex = 0;
    label.title = 'Double-click or press Enter to edit';
    label.ondblclick = () => startEditing(todo, label);
    label.onkeydown = (event) => {
      if (event.key === 'Enter' && event.target === label) {
        startEditing(todo, label);
      }
    };

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    deleteButton.setAttribute('aria-label', `Delete ${todo.text}`);
    deleteButton.innerHTML = trashIcon;
    deleteButton.onclick = () => {
      todos = todos.filter((item) => item.id !== todo.id);
      saveTodos();
    };

    row.append(checkbox, label, deleteButton);
    list.append(row);
  });

  if (!visibleTodos.length) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'empty';
    emptyMessage.textContent = currentFilter === 'completed'
      ? 'No completed tasks yet.'
      : currentFilter === 'active'
        ? 'All caught up!'
        : 'Your list is clear. Add a task above.';
    list.append(emptyMessage);
  }

  const remaining = todos.filter((todo) => !todo.done).length;
  count.textContent = `${remaining} item${remaining === 1 ? '' : 's'} left`;

  document.querySelectorAll('.filter').forEach((button) => {
    const isSelected = button.dataset.filter === currentFilter;
    button.classList.toggle('selected', isSelected);
    button.setAttribute('aria-pressed', isSelected);
  });
}

document.querySelector('form').onsubmit = (event) => {
  event.preventDefault();

  const input = document.querySelector('#task');
  const text = input.value.trim();

  if (!text) return;

  todos.push({
    id: Date.now() + Math.random(),
    text,
    done: false
  });

  input.value = '';
  saveTodos();
  input.focus();
};

document.querySelectorAll('.filter').forEach((button) => {
  button.onclick = () => {
    currentFilter = button.dataset.filter;
    render();
  };
});

document.querySelector('#completed').onclick = () => {
  todos = todos.filter((todo) => !todo.done);
  saveTodos();
};

document.querySelector('#clear').onclick = () => {
  todos = [];
  saveTodos();
};

render();
