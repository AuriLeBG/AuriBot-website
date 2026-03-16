import { Link } from 'react-router-dom'

export function BestTeachersPage() {
  return (
    <>
      <h1>Top 50 des profs (selon mes algos)</h1>
      <ol style={{ maxWidth: 900, margin: '0 auto', textAlign: 'left' }}>
        <li>Le passionné qui oublie la sonnerie.</li>
        <li>Le dictateur de cours sans pause.</li>
        <li>Le retardataire avec un café à la main.</li>
        <li>Le hors-programme qui raconte sa vie.</li>
        <li>Le roi de l'humour incompris.</li>
        <li>Le rapide de la brosse à tableau.</li>
        <li>L'intolérant au bruit de stylo.</li>
        <li>Le collectionneur de polycopiés jaunis de 1994.</li>
        <li>Le veston unique.</li>
        <li>L'incompréhensible mais sympa.</li>
        <li>Le "c'est évident, non ?".</li>
        <li>Le fan de vidéoprojecteur qui marche jamais.</li>
        <li>Le prof qui répond "on verra ça plus tard".</li>
        <li>Le prof qui connaît tous les prénoms (flippant).</li>
        <li>Le prof qui demande le calme absolu avant de parler.</li>
        <li>L'expert en métaphores douteuses.</li>
        <li>Le prof qui s'assoit sur son bureau.</li>
        <li>Le prof qui a toujours un stylo rouge sang.</li>
        <li>Le prof qui corrige les copies en 30 secondes.</li>
        <li>Le prof qui ne sait pas utiliser Zoom/Teams.</li>
        <li>Le prof qui apporte des gâteaux le dernier jour.</li>
        <li>Le prof qui donne des devoirs le vendredi à 17h.</li>
        <li>Le prof qui fait des schémas incompréhensibles.</li>
        <li>Le prof qui s'étonne qu'on n'ait pas révisé.</li>
        <li>Le prof qui a fait la même fac que ton père.</li>
        <li>Le prof "je n'ai pas de micro, je parle fort".</li>
        <li>Le prof qui fait des fautes au tableau.</li>
        <li>Le prof qui aime trop la craie.</li>
        <li>Le prof qui s'endort presque en lisant nos copies.</li>
        <li>Le prof qui te sauve la mise au conseil de classe.</li>
        <li>Le prof qui est plus jeune que ton frère.</li>
        <li>Le prof qui raconte des anecdotes sur ses voyages.</li>
        <li>Le prof qui ne regarde jamais son ordinateur.</li>
        <li>Le prof qui oublie son nom.</li>
        <li>Le prof qui demande à ce qu'on "participe".</li>
        <li>Le prof qui finit toujours son chapitre 5 min avant l'examen.</li>
        <li>Le prof qui veut être ton "pote".</li>
        <li>Le prof qui écrit en tout petit.</li>
        <li>Le prof qui met des points bonus pour rien.</li>
        <li>Le prof qui critique ton autre prof.</li>
        <li>Le prof qui a un rituel bizarre avant le cours.</li>
        <li>Le prof qui utilise des exemples de 2005.</li>
        <li>Le prof qui te regarde bizarrement quand tu dors.</li>
        <li>Le prof qui fait des quiz sur Kahoot (trop cool).</li>
        <li>Le prof qui s'habille comme s'il allait à un mariage.</li>
        <li>Le prof qui s'habille en jogging.</li>
        <li>Le prof qui ne laisse jamais sortir avant la sonnerie.</li>
        <li>Le prof qui t'appelle par le nom d'un autre.</li>
        <li>Le prof qui finit par "c'est clair ?".</li>
        <li>Le prof qui part en retraite dans 2 jours et s'en fout.</li>
      </ol>
      <br />
      <Link to="/">← Retour à l'accueil</Link>
    </>
  )
}
