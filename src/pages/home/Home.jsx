import React, { useEffect, useState } from "react";
import AddItemForm from "../../components/dashboard/form/AddItemForm";
import ToDoList from "../../components/dashboard/list/ToDoList";
import Modal from "../../components/dashboard/modal/Modal";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

// import { db } from "../firebase";
// import { collection, addDoc, Timestamp } from "firebase/firestore";
// import utc from "@dayjs/plugin/utc";
// import timezone from "@dayjs/plugin/timezone";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { auth, logout, st } from "../../services/firebase-auth";
import { addTask, deleteTask, editTask, getTasks } from "../../services/todo";
import { DashboardUserDetail } from "../../components/dashboard/DashboardUserDetail";
import { getDownloadURL, ref } from "firebase/storage";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [shownTodos, setShownTodos] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [on, setOn] = useState(false);
  const [editedValue, setEditedValue] = useState("");
  const [editedId, setEditedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [datetimeState, setdatetimeState] = useState(dayjs());
  const [loggedInUser, setLoggedInUser] = useState();
  const [profilePic, setProfilePic] = useState(null);

  const navigate = useNavigate();

  const navtoSplash = () => {
    navigate("/");
  };

  const navToProfile = () => {
    navigate("/profile");
  };

  const populateTodolist = (user) => {
    let tasks = [];
    getTasks(user).then((res) => {
      if (res.data.length > 0) {
        res.data.forEach((doc) => {
          tasks.push({
            id: doc.id,
            title: doc.task,
            completed: doc.completed,
            datetime: doc.datetime,
          });
        });

        setTodos(tasks);
      }
    });
  };

  const fetchProfilePic = async (userId) => {
    try {
      const uri = await getDownloadURL(ref(st, `profile-pics/${userId}`));
      setProfilePic(uri);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfilePic(user.uid);
        setLoggedInUser(user);
        populateTodolist(user);
      } else {
        setProfilePic(null);
        onSignOut();
      }
    });
  }, []);

  useEffect(() => {
    let filteredTodos = todos;

    switch (filterStatus) {
      case "All":
        filteredTodos = todos;
        break;
      case "Complete":
        filteredTodos = todos.filter((obj) => {
          if (obj.completed) {
            return obj;
          }
        });
        break;
      case "Incomplete":
        filteredTodos = todos.filter((obj) => {
          if (!obj.completed) {
            return obj;
          }
        });
        break;
    }

    setShownTodos(filteredTodos);
  }, [todos, filterStatus]);

  const handleDateChange = (newValue) => {
    setdatetimeState(newValue);
  };

  const toggle = () => {
    setOn((on) => !on); // everytime this function triggered it will change the modal apperance
  };

  function handleSubmit(e) {
    e.preventDefault(); // prevent website from refreshing

    // add new task to the actual task list (no filter)
    setTodos((currentTodos) => {
      // duplicate the current todos and add the new one
      return [
        ...currentTodos,
        {
          id: crypto.randomUUID(),
          title: newItem,
          completed: false,
          datetime: datetimeState.format("ddd, YYYY-MM-DD HH:mm"),
        },
      ];
    });

    // add task via fastAPI
    addTask(
      newItem,
      datetimeState.format("ddd, YYYY-MM-DD HH:mm"),
      loggedInUser.uid
    );

    setNewItem(""); // set the box into "" after clicking add button
    setdatetimeState(dayjs());
    // setDataChangeState("submit");
  }

  function toggleTodo(id, completed) {
    setTodos((currentTodos) => {
      return currentTodos.map((todo) => {
        if (todo.id == id) {
          return { ...todo, completed };
        }

        return todo;
      });
    });

    // update using fastapi route
    todos.forEach((todo) => {
      if (todo.id == id) {
        editTask(id, todo.title, completed);
      }
    });
  }

  function editTodo(id, title) {
    setEditedId(id);
    setEditedValue(title);
    toggle();
  }

  function confirmEdit(newValue) {
    setTodos((currentTodos) => {
      return currentTodos.map((todo) => {
        if (todo.id == editedId) {
          return { ...todo, title: newValue };
        }

        return todo;
      });
    });

    // edit task via fastAPI
    todos.forEach((todo) => {
      if (todo.id == editedId) {
        editTask(editedId, newValue, todo.completed);
      }
    });

    setEditedValue("");

    toggle();
  }

  function deleteTodo(id) {
    setTodos((currentTodos) => {
      return currentTodos.filter((todo) => todo.id !== id);
    });

    deleteTask(id);
  }

  const onSignOut = () => {
    logout();
    navtoSplash();
  };

  return (
    <>
      <div className="flex align-center justify-between">
        <DashboardUserDetail
          profilePic={profilePic}
          user={loggedInUser}
          onClickUser={() => navToProfile()}
        />
        <div className="flex">
          <div
            className="flex items-center cursor-pointer m-4"
            onClick={() => navToProfile()}
          >
            <span>My Profile</span>
          </div>
          <div
            className="flex items-center cursor-pointer m-4"
            onClick={() => onSignOut()}
          >
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      <AddItemForm
        handleSubmit={handleSubmit}
        newItem={newItem}
        setNewItem={setNewItem}
        setdatetimeState={handleDateChange}
      />

      <ToDoList
        todos={shownTodos}
        toggleTodo={toggleTodo}
        editTodo={editTodo}
        toggle={toggle}
        deleteTodo={deleteTodo}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {on && (
        <Modal
          toggle={toggle}
          editedValue={editedValue}
          setEditedValue={setEditedValue}
          confirmEdit={confirmEdit}
        />
      )}
    </>
  );
}
