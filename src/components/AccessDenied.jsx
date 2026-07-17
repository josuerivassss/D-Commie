import { SUPPORT_SERVER_URL } from "../config";

export default function AccessDenied() {
  return (
    <div className="access-denied">
      <div className="access-denied-icon">⚠️</div>
      <h2>No tienes acceso a la dashboard</h2>
      <p>Solicítalo en el servidor de soporte.</p>
      <a className="btn btn-primary" href={SUPPORT_SERVER_URL} target="_blank" rel="noopener noreferrer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9 2a5 5 0 0 0-5 5v2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1v1a1 1 0 0 0 2 0v-1h12v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V7a5 5 0 0 0-5-5H9zm-1 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
        </svg>
        Unirse al servidor de soporte
      </a>
    </div>
  );
}