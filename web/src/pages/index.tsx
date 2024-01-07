import { useState, useEffect } from "react";
const { v4: uuidv4 } = require("uuid");

interface Todo {
  id: string;
  name: string;
  category: string;
  isCompleted: boolean;
}

const API_BASE = "http://[::1]:3000/tasks/";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [popupActive, setPopupActive] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleDropdownChange = (event: any) => {
    setSelectedCategory(event.target.value);
  };

  const filteredTodos =
    selectedCategory === "All"
      ? todos
      : todos.filter((todo) => todo.category === selectedCategory);

  useEffect(() => {
    GetTodos();
  }, []);

  const GetTodos = async () => {
    const res = await fetch("http://[::1]:3000/tasks");
    const data = await res.json();
    setTodos(data);
  };

  const handleTodoChange = (event: any) => {
    const value = event.target.value;
    setNewTodo(value);
  };

  const handleCategoryChange = (event: any) => {
    const value = event.target.value;
    setNewCategory(value);
  };

  const addTodo = async () => {
    const newRandomId = uuidv4();
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: newRandomId,
        name: newTodo,
        category: newCategory,
        isCompleted: false,
      }),
    });
    const data = await res.json();
    setTodos([...todos, data]);
    setPopupActive(false);
    setNewTodo("");
    setNewCategory("");
  };

  const completeTodo = async (id: string) => {
    try {
      const currentTodoResponse = await fetch(API_BASE + id);
      const currentTodo = await currentTodoResponse.json();
      const updatedIsCompleted = !currentTodo.isCompleted;

      const res = await fetch(API_BASE + id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted: updatedIsCompleted,
        }),
      });

      const updatedTodo = res.status === 204 ? currentTodo : await res.json();

      setTodos((todos) =>
        todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
    } catch (error: any) {
      console.error("Error completing todo:", error.message);
    }
  };

  const deleteTodo = async (id: any) => {
    const res = await fetch(API_BASE + id, { method: "DELETE" });
    setTodos((todos) => todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="App">
      <h1>Welcome</h1>
      <h4>Your Tasks</h4>
      <h4>Filter by Category:</h4>
      <select
        value={selectedCategory}
        onChange={handleDropdownChange}
        className="dropdown"
      >
        <option value="All">All</option>
        {Array.from(new Set(todos.map((todo) => todo.category))).map(
          (category) => (
            <option key={category} value={category}>
              {category}
            </option>
          )
        )}
      </select>
      <div className="todos">
        {filteredTodos.map((todo) => (
          <div
            className={"todo" + (todo.isCompleted ? " is-complete" : "")}
            key={todo.id}
          >
            <div
              className="checkbox"
              onClick={() => completeTodo(todo.id)}
            ></div>
            <div className="text" onClick={() => completeTodo(todo.id)}>
              {todo.name}
            </div>
            <div className="delete-todo" onClick={() => deleteTodo(todo.id)}>
              X
            </div>
          </div>
        ))}
      </div>

      <div className="addPopup" onClick={() => setPopupActive(true)}>
        +
      </div>

      {popupActive ? (
        <div className="popup">
          <div
            className="closePopup"
            onClick={() => {
              setPopupActive(false);
              setNewTodo("");
              setNewCategory("");
            }}
          >
            X
          </div>
          <div className="content">
            <h3>Add Task</h3>
            <input
              type="text"
              className="add-todo-input"
              onChange={handleTodoChange}
              value={newTodo}
              placeholder="What is your task?"
            />
            <input
              type="text"
              className="add-todo-input"
              onChange={handleCategoryChange}
              value={newCategory}
              placeholder="What is your task's category?"
            />
            <div className="button" onClick={addTodo}>
              Create Todo
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
