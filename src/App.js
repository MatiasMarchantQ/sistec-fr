import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

//Page
import Login from './components/Login';
import Home from './Pages/Home/Home';
import FichaClinica from './Pages/Home/FichaClinica';
//import Estudiantes from './components/Estudiantes';
// import Instituciones from './Pages/Home/Instituciones';
// import Agenda from './Pages/Home/Agenda';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home/*" element={<Home />} />
        <Route path="/ficha-clinica/:id" element={<FichaClinica />} />
      </Routes>
    </Router>
  );
}

export default App;
