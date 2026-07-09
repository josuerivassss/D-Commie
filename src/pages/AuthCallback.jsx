import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "../auth";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      navigate("/dash", { replace: true });
    } else {
      navigate("/?login_failed=1", { replace: true });
    }
  }, [searchParams, navigate]);

  return <div className="center-loading">Signing you in&hellip;</div>;
}
