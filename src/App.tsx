import { AdminRoutes } from "@/routes/adminRoutes"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider } from "@/context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <AdminRoutes />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App