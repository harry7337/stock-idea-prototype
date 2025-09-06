import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isIdeaGen = location.pathname === '/idea-generation';
  const isDetailedAnalysis = location.pathname === '/detailed-analysis';
  
  return (
    <nav className="navbar">
      <div className="navbar-logo" style={{ paddingLeft: '2rem' }}>
        <img
          src="/logo.png"
          alt="Stock Idea Logo"
          className="company-logo"
          style={{ height: '60px' }}
        />
      </div>
      <div className="navbar-actions" style={{ paddingRight: '2rem', display: 'flex', gap: '1.5rem' }}>
        <button
          className="navbar-btn"
          style={{
            background: 'none',
            color: '#00796b',
            border: 'none', // Remove all borders
            outline: 'none', // Remove outline
            borderRadius: 0,
            fontWeight: 500,
            fontSize: '1rem',
            padding: '0.6rem 1.3rem 0.3rem 1.3rem',
            boxShadow: 'none',
            borderBottom: isIdeaGen ? '2.5px solid #000' : '2.5px solid transparent',
            transition: 'border-bottom 0.2s',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/idea-generation')}
        >
          Idea Generation
        </button>
        <button
          className="navbar-btn"
          style={{
            background: 'none',
            color: '#00796b',
            border: 'none', // Remove all borders
            outline: 'none', // Remove outline
            borderRadius: 0,
            fontWeight: 500,
            fontSize: '1rem',
            padding: '0.6rem 1.3rem 0.3rem 1.3rem',
            boxShadow: 'none',
            borderBottom: isDetailedAnalysis ? '2.5px solid #000' : '2.5px solid transparent',
            transition: 'border-bottom 0.2s',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/detailed-analysis')}
        >
          Unstructured Analysis
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
