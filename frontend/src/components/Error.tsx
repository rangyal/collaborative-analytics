import { useRouteError } from "react-router-dom";

export default function NotFound() {
  const error = useRouteError();
  let errorMessage = "Error";

  if (error instanceof Response && error.status === 404) {
    errorMessage = "Not Found";
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>{errorMessage}</h1>
      <h2>
        <a href="/">Back to Home</a>
      </h2>
    </div>
  );
}
