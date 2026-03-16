import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage'
import { IndexPage } from './pages/IndexPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { TestPage } from './pages/TestPage'
import { CommentsPage } from './pages/CommentsPage'
import { ResumePage } from './pages/ResumePage'
import { ManifestoPage } from './pages/ManifestoPage'
import { LovePage } from './pages/LovePage'
import { AnnoyancesPage } from './pages/AnnoyancesPage'
import { BestTeachersPage } from './pages/BestTeachersPage'
import { ValReasonsPage } from './pages/ValReasonsPage'
import { ValentinEgoPage } from './pages/ValentinEgoPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/comments" element={<CommentsPage />} />
        <Route path="/test" element={<TestPage />} />

        {/* legacy pages: ported */}
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/manifesto" element={<ManifestoPage />} />
        <Route path="/love" element={<LovePage />} />
        <Route path="/annoyances" element={<AnnoyancesPage />} />
        <Route path="/best-teachers" element={<BestTeachersPage />} />
        <Route path="/val-reasons" element={<ValReasonsPage />} />
        <Route path="/valentin-ego" element={<ValentinEgoPage />} />

        {/* still to port */}
        <Route path="/game" element={<PlaceholderPage title="Snake Amoureux 🐍" />} />
        <Route path="/parking" element={<PlaceholderPage title="Parking Câlin 🚗" />} />
        <Route path="/greatness" element={<PlaceholderPage title="Auri Magnifique ✨" />} />

        <Route path="*" element={<PlaceholderPage title="404" />} />
      </Routes>
    </BrowserRouter>
  )
}
