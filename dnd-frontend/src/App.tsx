/// <reference types="react" />
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "./pages/LandingPage";
import { GameLobby } from "./pages/GameLobby";
import { GameRoom } from "./pages/GameRoom";
import { CharacterLibrary } from "./pages/CharacterLibrary";
import { Campaigns } from "./pages/Campaigns";
import { CharacterCreate } from "./pages/CharacterCreate";
import { CharacterEdit } from "./pages/CharacterEdit";
import { CharacterView } from "./pages/CharacterView";
import { FineTuningDemo } from "./pages/FineTuningDemo";
import { DMLibrary } from "./pages/DMLibrary";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import "./App.css";
import { Navbar } from "./components/ui/navbar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen ">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lobby/:roomCode?" element={<GameLobby />} />
            <Route path="/game/:roomCode" element={<GameRoom />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/characters" element={<CharacterLibrary />} />
            <Route path="/characters/create" element={<CharacterCreate />} />
            <Route
              path="/characters/edit/:characterId"
              element={<CharacterEdit />}
            />
            <Route
              path="/characters/view/:characterId"
              element={<CharacterView />}
            />
            <Route path="/fine-tune" element={<FineTuningDemo />} />
            <Route path="/dm-library" element={<DMLibrary />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
