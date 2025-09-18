const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterSelect = document.querySelector("#filter-select");

// Variável para guardar o texto antigo durante a edição
let oldInputValue;

const saveTodo = (text, done = 0, save = 1) => {
    const todo = document.createElement("div");
    todo.classList.add("todo");

    const todoTitle = document.createElement("h3");
    todoTitle.innerText = text;
    todo.appendChild(todoTitle);

    const doneBtn = document.createElement("button");
    doneBtn.classList.add("finish-todo");
    doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    todo.appendChild(doneBtn);

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-todo");
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    todo.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-todo");
    deleteBtn.innerHTML = '<i class="fa-solid fa-delete-left"></i>';
    todo.appendChild(deleteBtn);

    // Ultilizando dados da LocalStorage

    if (done) {
        todo.classList.add("done");
    }

    if (save) {
        saveTodoLocalStorage({ text, done });
    }

    todoList.appendChild(todo);

    todoInput.value = "";
    todoForm.focus();
};

const toggleForms = () => {
    todoForm.classList.toggle("hide");
    todoList.classList.toggle("hide"); // a lista some
    editForm.classList.toggle("hide"); // e aparece o form de edição
};

const updateTodo = (text) => {
    const todos = document.querySelectorAll(".todo");

    todos.forEach((todo) => {
        let todoTitle = todo.querySelector("h3");

        if (todoTitle.innerText === oldInputValue) {
            todoTitle.innerText = text;

            // Atualiza também no localStorage
            updateTodoLocalStorage(oldInputValue, text);
        }
    });
};

const getSearchedTodos = (search) => {
    const applyFiltersAndSearch = () => {
        const todos = document.querySelectorAll(".todo");
        const search = searchInput.value.toLowerCase();
        const filter = filterSelect.value;

        todos.forEach((todo) => {
            const todoTitle = todo.querySelector("h3").innerText.toLowerCase();
            const isDone = todo.classList.contains("done");

            const normalizedSearch = search.toLowerCase();
            // Lógica de visibilidade unificada
            let shouldShow = true;

            // Em vez de mudar o display, adicionamos ou removemos uma classe
            if (todoTitle.includes(normalizedSearch)) {
                todo.classList.remove("hide");
            } else {
                todo.classList.add("hide");
            }
            // 1. Filtro de busca
            if (!todoTitle.includes(search)) {
                shouldShow = false;
            }
        });
    };

    const filterTodos = (filterValue) => {
        const todos = document.querySelectorAll(".todo");
        // 2. Filtro de status (só se aplica se o item já for visível pela busca)
        if (shouldShow) {
            if (filter === "done" && !isDone) {
                shouldShow = false;
            }
            if (filter === "todo" && isDone) {
                shouldShow = false;
            }
        }

        switch (filterValue) {
            case "all":
                todos.forEach((todo) => (todo.style.display = "flex")); // Mostra todos
                break;

            case "done":
                todos.forEach((todo) =>
                    todo.classList.contains("done")
                        ? (todo.style.display = "flex")
                        : (todo.style.display = "none")
                );
                break;
            case "todo":
                todos.forEach((todo) =>
                    !todo.classList.contains("done")
                        ? (todo.style.display = "flex")
                        : (todo.style.display = "none")
                );
                break;
        }
        // Garante que o formulário de edição não afete a visibilidade
        if (!todos.classList.contains("hide")) {
            todos.style.display = shouldShow ? "flex" : "none";
        }
    };
};

todoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const inputValue = todoInput.value;

    if (inputValue) {
        saveTodo(inputValue);
    }
});

document.addEventListener("click", (e) => {
    const targetEl = e.target;
    // Encontra o elemento .todo mais próximo do elemento clicado
    const parentEl = targetEl.closest(".todo");
    let todoTitle;

    if (!parentEl) return; // Se não estiver dentro de um .todo, não faz nada

    // Pega o título antes de qualquer ação, pois é usado em várias operações
    todoTitle = parentEl.querySelector("h3").innerText;

    if (targetEl.classList.contains("finish-todo")) {
        parentEl.classList.toggle("done");
        updateTodoStatusLocalStorage(todoTitle);
    }

    if (targetEl.classList.contains("delete-todo")) {
        const todoTitle = parentEl.querySelector("h3").innerText; // <-- pega o texto
        parentEl.remove();

        removeTodoLocalStorage(todoTitle);
    }

    if (targetEl.classList.contains("edit-todo")) {
        toggleForms();

        // Esconde o todo que está sendo editado
        parentEl.classList.add("hide");

        // Pega o texto atual da tarefa para edição
        todoTitle = parentEl.querySelector("h3");
        editInput.value = todoTitle.innerText; // <-- agora vem só o texto
        oldInputValue = todoTitle.innerText;
    }
});

cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault();

    toggleForms();

    // Reexibe o todo que estava sendo editado
    document.querySelectorAll(".todo").forEach((todo) => {
        todo.classList.remove("hide");
    });
    applyFiltersAndSearch(); // Re-aplica filtros ao cancelar
});

editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const editInputValue = editInput.value;

    if (editInputValue) updateTodo(editInputValue);

    toggleForms();
    // Reexibe todos os todos e aplica filtros
    document.querySelectorAll(".todo").forEach((todo) => {
        todo.classList.remove("hide");
    });
    applyFiltersAndSearch();
});

searchInput.addEventListener("keyup", (e) => {
    const search = e.target.value;

    getSearchedTodos(search);
    applyFiltersAndSearch();
});

eraseBtn.addEventListener("click", (e) => {
    e.preventDefault();

    searchInput.value = "";

    // Ao limpar, mostramos todos os todos novamente
    document.querySelectorAll(".todo").forEach((todo) => {
        todo.style.display = "flex";
    });
    searchInput.dispatchEvent(new Event("keyup")); // Dispara o evento para re-filtrar
});

filterSelect.addEventListener("change", (e) => {
    const filterValue = e.target.value;
    filterTodos(filterValue);
    applyFiltersAndSearch();
});

// Local storage

const getTodosLocalStorage = () => {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];

    return todos;
};

const loadTodos = () => {
    const todos = getTodosLocalStorage();

    todos.forEach((todo) => {
        saveTodo(todo.text, todo.done, 0);
    });
};

const saveTodoLocalStorage = (todo) => {
    // selecionar todos os to-dos
    const todos = getTodosLocalStorage();

    // add novo to-do no array
    todos.push(todo);

    // salvar tudo na localStorage
    localStorage.setItem("todos", JSON.stringify(todos));
};

const removeTodoLocalStorage = (todoText) => {
    const todos = getTodosLocalStorage();

    const filteredTodos = todos.filter((todo) => todo.text !== todoText);

    localStorage.setItem("todos", JSON.stringify(filteredTodos));
};

const updateTodoStatusLocalStorage = (todoText) => {
    const todos = getTodosLocalStorage();

    todos.map((todo) =>
        todo.text === todoText ? (todo.done = !todo.done) : todo
    );

    localStorage.setItem("todos", JSON.stringify(todos));
};

const updateTodoLocalStorage = (oldText, newText) => {
    const todos = getTodosLocalStorage();

    todos.forEach((todo) => {
        if (todo.text === oldText) {
            todo.text = newText;
        }
    });

    localStorage.setItem("todos", JSON.stringify(todos));
};

loadTodos();
