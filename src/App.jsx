import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import Landing from "./pages/Landing";
import AuthCallback from "./pages/AuthCallback";
import GuildPicker from "./pages/GuildPicker";
import DashboardLayout from "./pages/DashboardLayout";
import GeneralSettings from "./pages/GeneralSettings";
import WelcomeAutorolesSettings from "./pages/WelcomeAutorolesSettings";
import LeaveSettings from "./pages/LeaveSettings";
import StarboardSettings from "./pages/StarboardSettings";
import EmbedSender from "./pages/EmbedSender";
import TicketsSettings from "./pages/TicketsSettings";
import LegalPage from "./pages/LegalPage";
import ExternalRedirect from "./pages/ExternalRedirect";
import Changelog from "./pages/Changelog";
import CommandsPage from "./pages/CommandsPage";
import PlaceholdersPage from "./pages/PlaceholdersPage";
import CommandsSettings from "./pages/CommandsSettings";
import NotFound from "./pages/NotFound";
import { botInviteUrl, SUPPORT_SERVER_URL } from "./config";

export default function App() {
  return (
    <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dash" element={<GuildPicker />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/invite" element={<ExternalRedirect to={botInviteUrl()} />} />
            <Route path="/server" element={<ExternalRedirect to={SUPPORT_SERVER_URL} />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/commands" element={<CommandsPage />} />
            <Route path="/placeholders" element={<PlaceholdersPage />} />
            <Route path="*" element={<NotFound />} />

            <Route path="/dash/:guildId" element={<DashboardLayout />}>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<GeneralSettings />} />
              <Route path="commands" element={<CommandsSettings />} />
              <Route path="welcome" element={<WelcomeAutorolesSettings />} />
              <Route path="leave" element={<LeaveSettings />} />
              <Route path="starboard" element={<StarboardSettings />} />
              <Route path="tickets" element={<TicketsSettings />} />
              <Route path="embeds" element={<EmbedSender />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
    </ToastProvider>
  );
}