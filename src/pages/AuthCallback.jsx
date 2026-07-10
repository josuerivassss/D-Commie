import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { setToken } from "../auth";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return; // avoid double-exchange under React StrictMode's double-invoke in dev
    ranOnce.current = true;

    const sessionCode = searchParams.get("session_code");
    if (!sessionCode) {
      navigate("/?login_failed=1", { replace: true });
      return;
    }

    api
      .exchangeCode(sessionCode)
      .then(({ token }) => {
        setToken(token);
        navigate("/dash", { replace: true });
      })
      .catch(() => {
        navigate("/?login_failed=1", { replace: true });
      });
  }, [searchParams, navigate]);

  return <div className="center-loading">Signing you in&hellip;</div>;
}
