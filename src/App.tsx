import { BrowserRouter as Router } from "react-router-dom";
import './App.css'
import AppRoutes from "./routes/routes.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App