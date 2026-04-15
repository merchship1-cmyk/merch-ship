'use strict';

class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.render();
    }

    loadTodos() {
        const todosJson = localStorage.getItem('todos');
        return todosJson ? JSON.parse(todosJson) : [];
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    addTodo(todo) {
        this.todos.push(todo);
        this.saveTodos();
        this.render();
    }

    removeTodo(index) {
        this.todos.splice(index, 1);
        this.saveTodos();
        this.render();
    }

    render() {
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = '';

        this.todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.textContent = todo;
            const button = document.createElement('button');
            button.textContent = 'Remove';
            button.onclick = () => this.removeTodo(index);
            li.appendChild(button);
            todoList.appendChild(li);
        });
    }
}

const app = new TodoApp();

document.getElementById('add-todo').onclick = () => {
    const todoInput = document.getElementById('todo-input');
    if (todoInput.value) {
        app.addTodo(todoInput.value);
        todoInput.value = '';
    }
};