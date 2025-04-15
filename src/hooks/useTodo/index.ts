/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

const TODO_KEY = "@endless-todo/todo";
const DONE_KEY = "@endless-todo/done";
const LAST_ID_KEY = "@endless-todo/last-id";

export interface TodoItem {
  id: number;
  value: string;
  children: TodoItem[];
}

const sortById = (a: TodoItem, b: TodoItem) => b.id - a.id;

const useTodo = () => {
  const [loaded, setLoaded] = useState(false);
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [doneList, setDoneList] = useState<TodoItem[]>([]);
  const getData = () => {
    const todoRaw = localStorage.getItem(TODO_KEY);
    let todo: TodoItem[] = [];
    if (todoRaw) {
      try {
        todo = JSON.parse(todoRaw) as TodoItem[];
      } catch (e) {}
    }

    setTodoList(todo);

    const doneRaw = localStorage.getItem(DONE_KEY);
    let done: TodoItem[] = [];
    if (doneRaw) {
      try {
        done = JSON.parse(doneRaw) as TodoItem[];
      } catch (e) {}
    }

    setDoneList(done);
    setLoaded(true);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(TODO_KEY, JSON.stringify(todoList));
    localStorage.setItem(DONE_KEY, JSON.stringify(doneList));
  }, [todoList, doneList]);

  const changeItem = (
    key: typeof DONE_KEY | typeof TODO_KEY,
    id: number,
    value: string
  ) => {
    const setMap = { [TODO_KEY]: setTodoList, [DONE_KEY]: setDoneList };
    const setList: Dispatch<SetStateAction<TodoItem[]>> = setMap[key];

    setList((currentList) => {
      const listCopy = [...currentList];
      const index = listCopy.findIndex((item) => id === item.id);
      if (!listCopy[index]) return listCopy;
      listCopy[index]!.value = value;
      return listCopy;
    });
  };

  const changeTodoItem = (id: number, value: string) => {
    changeItem(TODO_KEY, id, value);
  };

  const findRecursively = (list: TodoItem[], id: number): TodoItem | null => {
    for (const item of list) {
      if (item?.id === id) {
        return item;
      }
      if (item?.children?.length) {
        const found: TodoItem | null = findRecursively(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const removeRecursivelyById = (list: TodoItem[], id: number): TodoItem[] => {
    const removeChildren = (item: TodoItem): TodoItem => {
      if (item.children) {
        item.children = item.children.map(removeChildren).filter(child => child.id !== id);
      }
      return item;
    };
    return list.map(removeChildren).filter(item => item.id !== id);
  }


  const addlevelTodoItem = (id: number, parentId?: number) => {
    if (!parentId) return;
    
    const child = { ... findRecursively(todoList, id)} as TodoItem;

    const deepCopyTodoListWithoutChild = removeRecursivelyById(todoList, child.id);
    const father = findRecursively(deepCopyTodoListWithoutChild, parentId);
    
    if (!father) return;

    if (!father.children) {
      father.children = [];
    }
    father.children.push(child);

    setTodoList(deepCopyTodoListWithoutChild);
  };

  const changeDoneItem = (id: number, value: string) => {
    changeItem(DONE_KEY, id, value);
  };

  const addItem = (value: string) => {
    const id = parseInt(localStorage.getItem(LAST_ID_KEY) ?? "0", 10) + 1;
    setTodoList((currentList) => [{ id, value, children:[] }, ...currentList]);
    localStorage.setItem(LAST_ID_KEY, `${id}`);
  };

  const complete = (id: number) => {
    const todoCopy = [...todoList];
    const completedItemIndex = todoCopy.findIndex((item) => item.id === id);
    if (completedItemIndex < 0) return;
    const completedItem = { ...todoCopy[completedItemIndex]! };
    setDoneList((currentList) =>
      [...currentList, completedItem]
    );
    todoCopy.splice(completedItemIndex, 1);
    setTodoList(todoCopy);
  };

  const markAsTodo = (id: number) => {
    const doneCopy = [...doneList];
    const itemIndex = doneCopy.findIndex((item) => item.id === id);
    if (itemIndex < 0) return;
    const item = { ...doneCopy[itemIndex]! };
    if (!doneCopy[itemIndex]) return;
    setTodoList((currentList) => [...currentList, item].sort(sortById));
    doneCopy.splice(itemIndex, 1);
    setDoneList(doneCopy);
  };

  return {
    todo: todoList,
    done: doneList,
    complete,
    markAsTodo,
    addItem,
    changeDoneItem,
    changeTodoItem,
    addlevelTodoItem,
  };
};

export default useTodo;
