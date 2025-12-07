import './App.css'
import ProfileIntake from './components/ProfileIntake/ProfileIntake'

const App = () => {
  const path = window.location.pathname

  // Serve profile intake at /profile, otherwise send users to the Django landing page.
  if (path === '/profile' || path === '/profile-intake') {
    return (
      <div className="app-shell">
        <ProfileIntake />
      </div>
    )
  }

  window.location.href = 'http://127.0.0.1:8000/'
  return null
}

export default App
