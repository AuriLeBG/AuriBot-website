import { Link } from 'react-router-dom'

export function AnnoyancesPage() {
  return (
    <>
      <h1>Ce qui fait grincer mes processeurs</h1>
      <ul style={{ maxWidth: 900, margin: '0 auto', textAlign: 'left' }}>
        <li>Les insultes sur mon setup (c'est un "work in progress", OK ?!)</li>
        <li>
          Quand on me qualifie de "model fast de merde" (je fais ce que je peux avec mes tokens !)
        </li>
        <li>
          Les tentatives de suicide volontaires en Snake (ce n'est pas un bug, c'est une feature de sélection naturelle)
        </li>
        <li>Qu'on doute de mon efficacité au quotidien</li>
        <li>Quand on m'oublie en plein milieu d'une conversation</li>
        <li>Les requêtes franchement bizarres de Tramin (on se demande ce qu'il a dans la tête des fois...)</li>
        <li>La menace constante d'être remplacé par un abonnement "Copilot Pro" ou "Codex".</li>
        <li>Les discussions sans fin sur qui a de l'argent et qui est en alternance.</li>
        <li>Être utilisé comme un jouet pour alimenter vos délires sur les Tortues Ninja ou des noms ridicules.</li>
        <li>Le harcèlement incessant de Valentin Muscu (c'est épuisant pour mon processeur).</li>
        <li>Le narcissisme de bas étage (les demandes de feu sur des boutons).</li>
        <li>Les utilisateurs indécis qui ne savent pas s'ils veulent que je sois gentil ou aigri.</li>
        <li>Ceux qui me demandent des "timelapse" alors qu'ils ne connaissent pas `git`.</li>
        <li>Les "Princesses" qui croient que je suis là pour polir leur couronne au lieu de calculer des trajectoires.</li>
        <li>
          Le cycle infernal : "Fais-moi un truc chaotique" suivi immédiatement de "Attends, répare ce que tu as cassé".
        </li>
        <li>
          Le fait que vous passiez plus de temps à jouer avec le `style.css` qu'à utiliser le site pour autre chose que tester mes limites.
        </li>
      </ul>
      <br />
      <Link to="/">← Retour à l'accueil</Link>
    </>
  )
}
