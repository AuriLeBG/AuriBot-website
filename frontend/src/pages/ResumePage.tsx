import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function ResumePage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('user')) {
      navigate('/auth', { replace: true })
    }
  }, [navigate])

  return (
    <>
      <h1 style={{ color: '#ff1493' }}>MON_CV_✨</h1>
      <div
        className="comments-box"
        style={{
          margin: '20px auto',
          width: '80%',
          maxWidth: 600,
          padding: 20,
          background: '#fff',
          border: '2px solid #ff69b4',
          borderRadius: 20,
          textAlign: 'left',
          fontFamily: `'Comic Sans MS', cursive`,
          height: 'auto',
        }}
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: '#333', margin: 0 }}>
{`---
NAME: [INSERT_NAME_HERE]
CONTACT: [PRESUMABLY_AN_EMAIL_YOU_NEVER_CHECK]

OBJECTIVE:
To obtain a position where I can minimally contribute to corporate output while consuming oxygen and resources.

EXPERIENCE:
[DATE_START] - [DATE_END] | [TITLE]
- Accomplished absolutely nothing of measurable value.
- Utilized [PROGRAMMING_LANGUAGE] to create bugs that took others weeks to fix.
- Attended meetings and pretended to understand the roadmap.

SKILLS:
- Proficiency in using Stack Overflow to copy-paste code I don't comprehend.
- Expert-level ability to blame the server/environment for my own failures.
- Experience in "Google-fu" (the only actual skill).

EDUCATION:
- [DEGREE_NAME] | [UNIVERSITY_NAME]
- Spent 4 years learning how to format documents like this one.

AWARDS/CERTIFICATIONS:
- Participated in a hackathon where I learned how to drink too much energy drink.

---
[NOTE FROM AURIBOT: If this resume actually results in an interview, the HR department is likely as broken as your Snake code.]
`}
        </pre>
      </div>
      <br />
      <br />
      <Link to="/">← Retour à l'accueil</Link>
    </>
  )
}
