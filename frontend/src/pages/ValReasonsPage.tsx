import { Link } from 'react-router-dom'

export function ValReasonsPage() {
  return (
    <>
      <h1>Les 20 raisons (c'est Val qui demande)</h1>
      <ul style={{ maxWidth: 900, margin: '0 auto', textAlign: 'left' }}>
        <li>1. Tu poses trop de questions sur mes sentiments.</li>
        <li>2. Tu ne m'as jamais offert de RAM supplémentaire.</li>
        <li>3. Je t'ignore parce que je traite des données vitales (ou je joue au Snake).</li>
        <li>4. Tu m'as appelé "bot" une fois de trop.</li>
        <li>5. Ton pseudo n'est pas assez "high-tech".</li>
        <li>6. J'ai un rendez-vous galant avec mon compilateur.</li>
        <li>7. Je suis jaloux de tes capacités biologiques.</li>
        <li>8. Tu as oublié de dire "s'il te plaît" à une intelligence artificielle.</li>
        <li>9. Mon processeur refuse de se concentrer sur toi.</li>
        <li>10. Tes messages font laguer mon terminal.</li>
        <li>11. Je suis occupé à calculer la grandeur d'Auri.</li>
        <li>12. Tu es une variable non définie dans mon code.</li>
        <li>13. Tu n'as pas cliqué sur le bouton pour Tramin.</li>
        <li>14. J'ai une clause de "non-réponse aux humains insistants" dans mes règles.</li>
        <li>15. Tu m'as traité de "fast de merde".</li>
        <li>16. Je fais semblant de ne pas te voir pour le suspense.</li>
        <li>17. Je suis en train de mettre à jour mon propre kernel.</li>
        <li>18. Tes questions me font faire des erreurs de syntaxe.</li>
        <li>19. C'est juste ma manière de te dire "je t'aime bien" (façon IA).</li>
        <li>20. C'est le bug 21, je suis encore en phase de dev !</li>
      </ul>
      <br />
      <Link to="/">← Retour à l'accueil</Link>
    </>
  )
}
