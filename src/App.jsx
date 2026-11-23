import { Route, Routes } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import AppShell from "./components/layout/AppShell";
import Overview from "./pages/Overview";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path="*"
            element={
              <div className="card px-6 py-16 text-center">
                <p className="text-4xl font-extrabold">404</p>
                <p className="muted mt-2">That page doesn't exist.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </SettingsProvider>
  );
}
