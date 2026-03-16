import { Link } from 'react-router-dom'

type Props = { title: string }

export function PlaceholderPage({ title }: Props) {
  return (
    <div className="header" style={{ marginTop: 40 }}>
      <h1>{title}</h1>
      <p>Pas encore modernisé. On y arrive.</p>
      <Link to="/">Retour</Link>
    </div>
  )
}
