import {
  useState,
  type ChangeEventHandler,
  type FC,
  type FormEventHandler,
  useRef,
} from "react";
import Checkbox from "../Checkbox";
import Input from "../Input";

interface Props {
  done?: boolean;
  onChangeStatus: () => void;
  onChange: (value: string) => void;
  initialValue: string;
  addLevelTodoItem:() => void;
}

const Item: FC<Props> = ({ done, onChangeStatus, onChange, initialValue, addLevelTodoItem }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      // setValue('OKOKOK');
      addLevelTodoItem();
      debugger;
      // event.preventDefault();
      console.log('ket TAB')
    }
  };

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    inputRef.current?.blur();
  };

  const handleBlur: FormEventHandler = (e) => {
    onChange(value);
  };

  return (
    <div data-testid="todo-item" className="flex gap-2 py-1">
      <Checkbox checked={done} onClick={onChangeStatus} />
      <form name="edit-todo-form" onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          value={value}
          done={done}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </form>
    </div>
  );
};

export default Item;
function onAddLevelTodoItem(value: string, parentId: number | undefined) {
  throw new Error("Function not implemented.");
}

