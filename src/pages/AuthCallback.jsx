import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { setToken } from "../auth";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const sessionCode = searchParams.get("session_code");
    const returnedState = searchParams.get("state");
    const expectedState = sessionStorage.getItem("oauth_state");
    sessionStorage.removeItem("oauth_state");

    if (!sessionCode) {
      navigate("/dash?login_failed=missing_code", { replace: true });
      return;
    }

    if (!expectedState || !returnedState || returnedState !== expectedState) {
      navigate("/dash?login_failed=state_mismatch", { replace: true });
      return;
    }

    api
      .exchangeCode(sessionCode)
      .then(({ token }) => {
        setToken(token);
        navigate("/dash", { replace: true });
      })
      .catch((err) => {
        const reason = err?.status === 0 ? "network" : "exchange";
        navigate(`/dash?login_failed=${reason}`, { replace: true });
      });
  }, [searchParams, navigate]);

  return <div className="center-loading">Signing you in&hellip;</div>;
}