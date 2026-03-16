import { useNavigate } from 'react-router-dom'

export function AuthPage() {
  const navigate = useNavigate()

  function fakeLogin() {
    // Placeholder until we port auth.html properly.
    localStorage.setItem('user', 'demo')
    navigate('/', { replace: true })
  }

  return (
    <div className="header" style={{ marginTop: 40 }}>
      <h1>AUTH</h1>
      <p>Page de connexion (à moderniser).</p>
      <button className="menu-btn" style={{ position: 'static' }} onClick={fakeLogin}>
        Se connecter (demo)
      </button>
    </div>
  )
}
