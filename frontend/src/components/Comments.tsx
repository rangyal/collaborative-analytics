import { Comment } from "./../types";

type Props = {
  comments: Comment[];
};

export default function Comments({ comments }: Props) {
  if (!comments.length) {
    return <>No comments</>;
  }

  return (
    <ul className="comments" style={{ listStyleType: "none", padding: 0 }}>
      {comments.map((comment, index) => (
        <li key={index}>
          <strong>{comment.userName}</strong>: {comment.text}
        </li>
      ))}
    </ul>
  );
}
