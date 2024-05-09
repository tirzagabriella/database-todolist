import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "./firebase-auth";
import axios from "axios";

export const getTasks = async (user) => {
  try {
    const uid = user.uid;
    // const tasksRef = collection(db, "tasks");
    // const q = query(tasksRef, where("userId", "==", uid));
    // const querySnapshot = await getDocs(q);

    // let res = [];
    // querySnapshot.forEach((doc) => {
    //   res.push({
    //     id: doc.id,
    //     title: doc.data()["task"],
    //     completed: doc.data()["completed"],
    //     datetime: doc.data()["datetime"],
    //   });
    // });

    // return res;

    return axios.get(`http://localhost:8000/todos/all/${uid}`)
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const addTask = async (task, datetime, uid) => {
  try {
    // const docRef = await addDoc(collection(db, "tasks"), {
    //   task: task,
    //   completed: false,
    //   datetime: datetime,
    //   userId: uid,
    // });
    // console.log("Document written with ID: ", docRef.id);

    const newTodo = {
      id: crypto.randomUUID(), // Generate a UUID for the new todo item
      // title,
      // completed: false,
      task,
      // completed: false,
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
    // await updateDoc(doc(db, "tasks", taskId), {
    //   task: title,
    //   completed: completed
    // });

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
    // await deleteDoc(doc(db, "tasks", taskId));
    
    axios
      .delete(`http://localhost:8000/todos/delete/${taskId}`)
      .catch((error) => {
        console.error("There was an error updating the todo: ", error);
      });
  } catch (error) {
    console.log("Error deleting task : ", error)
  }
}
