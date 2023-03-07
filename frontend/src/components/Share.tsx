import { HTMLAttributes, useEffect, useState } from "react";
import { useHref } from "react-router-dom";
import { getShareToken } from "../api";

export default function Share(props: HTMLAttributes<HTMLSpanElement>) {
  const [token, setToken] = useState("");
  const appRootUrl = `${window.location.protocol}//${window.location.host}`;
  const shareUrl = appRootUrl + useHref(`shared/${token}`);

  const copyToClipboard = async () => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(shareUrl);
    } else {
      document.execCommand("copy", true, shareUrl);
    }
    alert("Copied to clipboard");
  };

  useEffect(() => {
    getShareToken().then(({ token }) => setToken(token));
  }, []);

  if (!token) {
    return null;
  }

  return (
    <span {...props}>
      <a href={shareUrl} target="_blank" rel="noreferrer">
        Link to chart
      </a>
      <button
        type="button"
        onClick={copyToClipboard}
        style={{ marginLeft: "5px" }}
      >
        📋
      </button>
    </span>
  );
}
