// src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import HomePage from './pages/HomePage';
import './index.css'


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <HomePage />
      </Layout>
    </BrowserRouter>
  );
}

export default App;