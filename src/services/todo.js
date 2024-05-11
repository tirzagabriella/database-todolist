import axios from "axios";

export const getTasks = async (user) => {
  try {
    const uid = user.uid;
    return axios.get(`http://localhost:8000/todos/all/${uid}`)
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const addTask = async (task, datetime, uid) => {
  try {
    const newTodo = {
      id: crypto.randomUUID(), // Generate a UUID for the new todo item
      task,
      datetime,
      userId: uid,
    };

    axios.post("http://localhost:8000/todos/create", newTodo).catch((error) => {
      console.error("There was an error adding the todo: ", error);
    });
  } catch (error) {
    console.log("Error adding task : ", error);
  }
};

export const editTask = async (taskId, title, completed) => {
  try {
    const payload = {
      task: title,
      completed: completed
    }

    axios
      .put(`http://localhost:8000/todos/edit/${taskId}`, payload)
      .catch((error) => {
        console.error("There was an error updating the todo: ", error);
      });
  } catch (error) {
    console.log("Error updating data : ", error);
  }
};

export const deleteTask = async (taskId) => {
  try {
    axios
      .delete(`http://localhost:8000/todos/delete/${taskId}`)
      .catch((error) => {
        console.error("There was an error updating the todo: ", error);
      });
  } catch (error) {
    console.log("Error deleting task : ", error)
  }
}
