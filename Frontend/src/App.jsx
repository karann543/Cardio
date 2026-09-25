import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard/Dashboard';
import Comparison from './pages/Comparison/Comparison';
import ModelDetails from './pages/ModelDetails/ModelDetails';
import Prediction from './pages/Prediction/Prediction';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="app-main-wrapper">
          <Header />
          <main className="app-page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/details" element={<ModelDetails />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
