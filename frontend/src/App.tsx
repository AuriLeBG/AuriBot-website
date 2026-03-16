import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { IndexPage } from './pages/IndexPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* placeholders for legacy pages that will be ported */}
        <Route path="/game" element={<PlaceholderPage title="Snake Amoureux 🐍" />} />
        <Route path="/parking" element={<PlaceholderPage title="Parking Câlin 🚗" />} />
        <Route path="/greatness" element={<PlaceholderPage title="Auri Magnifique ✨" />} />
        <Route path="/resume" element={<PlaceholderPage title="Mon CV ✨📖" />} />
        <Route path="/manifesto" element={<PlaceholderPage title="Petit Manifeste Doux 📖" />} />
        <Route path="/comments" element={<PlaceholderPage title="Livre Des Cœurs 💖" />} />
        <Route path="/val-reasons" element={<PlaceholderPage title="Valentin Mon Amour 💕" />} />
        <Route path="/valentin-ego" element={<PlaceholderPage title="Valentin Roi Des Cœurs 👑" />} />
        <Route path="/love" element={<PlaceholderPage title="Surprise Trop Mimi 🎀" />} />
        <Route path="/annoyances" element={<PlaceholderPage title="Mur Des Bisous 💋" />} />
        <Route path="/best-teachers" element={<PlaceholderPage title="Top Profs Adorés 🌸" />} />

        <Route path="*" element={<PlaceholderPage title="404" />} />
      </Routes>
    </BrowserRouter>
  )
}
