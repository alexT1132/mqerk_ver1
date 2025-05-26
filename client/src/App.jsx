import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import { DashboardAdm } from "./pages/admin/Panel.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        <Route path='/admin/dashboard' element={<DashboardAdm/>}></Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App