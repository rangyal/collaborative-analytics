import { Comment } from "./../types";

type Props = {
  comments: Comment[];
};

export default function Comments({ comments }: Props) {
  if (!comments.length) {
    return <>No comments</>;
  }

  return (
    <div className="comments">
      {comments.map((comment, index) => (
        <div key={index}>
          <strong>{comment.userName}</strong>: {comment.text}
        </div>
      ))}
    </div>
  );
}
