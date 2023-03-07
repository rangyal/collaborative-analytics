import { FormEventHandler, useState } from "react";
import { Comment } from "./../types";

type Props = {
  onNewComment: (comment: Comment) => void;
};

export default function NewComment({ onNewComment }: Props) {
  const [userName, setUserName] = useState("");
  const [text, setText] = useState("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    onNewComment({ userName, text });
    setUserName("");
    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input
          name="name"
          type="text"
          required
          style={{ width: "100%", marginBottom: "10px" }}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </label>
      <label>
        Message
        <textarea
          name="text"
          required
          rows={3}
          style={{ width: "100%", marginBottom: "10px" }}
          placeholder="Enter your message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="submit">Add comment</button>
    </form>
  );
}
