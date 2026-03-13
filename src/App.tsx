import { BrowserRouter as Router } from "react-router-dom";
import './App.css'
import AppRoutes from "./routes/routes.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App