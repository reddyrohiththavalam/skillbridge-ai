
import { useEffect, useState, type ReactElement } from 'react'
import './index.css'
import {
  getCourseProgress,
  saveCourseProgress,
  saveAssessmentResult,
  API_BASE_URL,
} from './services/api'

type Course = {
  id: number
  title: string
  category: string
  level: string
  duration: string
  progress: number
  color: string
}

type Page = 'Home' | 'Courses' | 'Assessment' | 'AI Tutor' | 'Jobs'
type Language = 'English' | 'à°¤à±†à°²à±à°—à±'

type Question = {
  question: string
  options: string[]
  answer: string
  explanation: string
}

type Job = {
  title: string
  company: string
  skills: string
  type: string
}

const initialCourses: Course[] = [
  {
    id: 1,
    title: 'Python Programming',
    category: 'Programming',
    level: 'Beginner',
    duration: '6 weeks',
    progress: 65,
    color: '#e5eaff',
  },
  {
    id: 2,
    title: 'Web Development',
    category: 'Technology',
    level: 'Beginner',
    duration: '8 weeks',
    progress: 35,
    color: '#dff7ed',
  },
  {
    id: 3,
    title: 'Communication Skills',
    category: 'Soft Skills',
    level: 'All levels',
    duration: '4 weeks',
    progress: 80,
    color: '#fff0d8',
  },
  {
    id: 4,
    title: 'Data Structures',
    category: 'Programming',
    level: 'Intermediate',
    duration: '6 weeks',
    progress: 10,
    color: '#f5e5ff',
  },
]

const jobs: Job[] = [
  {
    title: 'Frontend Developer Intern',
    company: 'Sample Technology Company',
    skills: 'HTML, CSS, JavaScript, React',
    type: 'Internship',
  },
  {
    title: 'Python Developer Intern',
    company: 'Sample Software Company',
    skills: 'Python, SQL, Problem Solving',
    type: 'Internship',
  },
  {
    title: 'Junior Web Developer',
    company: 'Sample Digital Company',
    skills: 'HTML, CSS, JavaScript',
    type: 'Entry level',
  },
]

const questions: Question[] = [
  {
    question: 'Which language is commonly used for web page structure?',
    options: ['Python', 'HTML', 'SQL', 'C'],
    answer: 'HTML',
    explanation: 'HTML defines the structure and content of a web page.',
  },
  {
    question: 'Which Python keyword defines a function?',
    options: ['function', 'define', 'def', 'fun'],
    answer: 'def',
    explanation: 'Python uses the def keyword to define a function.',
  },
  {
    question: 'Which of these is a database query language?',
    options: ['SQL', 'CSS', 'HTML', 'Photoshop'],
    answer: 'SQL',
    explanation: 'SQL is used to query and manage data in relational databases.',
  },
]

const englishLabels: Record<string, string> = {
  Home: 'Home',
  Courses: 'Courses',
  Assessment: 'Assessment',
  'AI Tutor': 'AI Tutor',
  Jobs: 'Jobs',
  welcome: 'Build your future',
  subtitle: 'Learn skills. Build confidence. Find your next opportunity.',
  continue: 'Continue learning',
  allCourses: 'All courses',
  search: 'Search courses...',
}

const teluguLabels: Record<string, string> = {
  Home: 'à°¹à±‹à°®à±',
  Courses: 'à°•à±‹à°°à±à°¸à±à°²à±',
  Assessment: 'à°ªà°°à±€à°•à±à°·',
  'AI Tutor': 'AI à°—à±à°°à±à°µà±',
  Jobs: 'à°‰à°¦à±à°¯à±‹à°—à°¾à°²à±',
  welcome: 'à°®à±€ à°­à°µà°¿à°·à±à°¯à°¤à±à°¤à±à°¨à± à°¨à°¿à°°à±à°®à°¿à°‚à°šà±à°•à±‹à°‚à°¡à°¿',
  subtitle: 'à°¨à±‡à°°à±à°šà±à°•à±‹à°‚à°¡à°¿. à°¨à±ˆà°ªà±à°£à±à°¯à°¾à°²à°¨à± à°ªà±†à°‚à°šà±à°•à±‹à°‚à°¡à°¿. à°‰à°¦à±à°¯à±‹à°— à°…à°µà°•à°¾à°¶à°¾à°²à°¨à± à°ªà±Šà°‚à°¦à°‚à°¡à°¿.',
  continue: 'à°¨à±‡à°°à±à°šà±à°•à±‹à°µà°¡à°‚ à°•à±Šà°¨à°¸à°¾à°—à°¿à°‚à°šà°‚à°¡à°¿',
  allCourses: 'à°…à°¨à±à°¨à°¿ à°•à±‹à°°à±à°¸à±à°²à±',
  search: 'à°•à±‹à°°à±à°¸à±à°²à°¨à± à°µà±†à°¤à°•à°‚à°¡à°¿...',
}

function clampProgress(value: unknown): number {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) return 0

  return Math.max(0, Math.min(100, Math.round(numberValue)))
}

function App() {
  const [page, setPage] = useState<Page>('Home')
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [progressMessage, setProgressMessage] = useState('')
  const [assessmentMessage, setAssessmentMessage] = useState('')
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState<Language>('English')
  const [backendStatus, setBackendStatus] = useState('Checking backend...')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [quizFinished, setQuizFinished] = useState(false)
  const [quizSubmitting, setQuizSubmitting] = useState(false)
  const [tutorQuestion, setTutorQuestion] = useState('')
  const [tutorMessages, setTutorMessages] = useState<
    { question: string; answer: string }[]
  >([])

  const labels =
    language === 'à°¤à±†à°²à±à°—à±' ? teluguLabels : englishLabels

  useEffect(() => {
    let cancelled = false

    async function loadProgress() {
      try {
        const records = await getCourseProgress()

        if (cancelled || !Array.isArray(records)) return

        setCourses((previous) =>
          previous.map((course) => {
            const saved = records.find(
              (record: any) =>
                String(
                  record.course_title ??
                    record.title ??
                    record.course ??
                    '',
                ) === course.title,
            )

            return saved
              ? {
                  ...course,
                  progress: clampProgress(saved.progress),
                }
              : course
          }),
        )
      } catch (error) {
        console.error('Could not load saved progress:', error)
      }
    }

    void loadProgress()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function checkBackend() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/health`,
        )

        if (!response.ok) {
          throw new Error('Backend request failed')
        }

        const data = await response.json()

        if (!cancelled) {
          const status = String(data.status ?? 'connected')

          setBackendStatus(
            status.toLowerCase() === 'healthy' ||
              status.toLowerCase() === 'ok'
              ? 'Backend: healthy'
              : `Backend: ${status}`,
          )
        }
      } catch {
        if (!cancelled) {
          setBackendStatus('Backend connection failed')
        }
      }
    }

    void checkBackend()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredCourses = courses.filter((course) =>
    `${course.title} ${course.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const averageProgress = Math.round(
    courses.reduce((sum, course) => sum + course.progress, 0) /
      Math.max(courses.length, 1),
  )

  async function updateProgress(id: number) {
    const course = courses.find((item) => item.id === id)

    if (!course || course.progress >= 100) return

    const nextProgress = Math.min(course.progress + 10, 100)

    setProgressMessage('')

    setCourses((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, progress: nextProgress }
          : item,
      ),
    )

    try {
      await saveCourseProgress(course.title, nextProgress)

      setProgressMessage(
        `${course.title}: progress saved successfully.`,
      )
    } catch (error) {
      console.error('Could not save progress:', error)

      setProgressMessage(
        'Progress changed on this screen, but could not be saved to the backend.',
      )
    }
  }

  async function answerQuestion() {
    if (!selectedAnswer || quizFinished || quizSubmitting) return

    const question = questions[currentQuestion]

    const newScore =
      (quizScore ?? 0) +
      (selectedAnswer === question.answer ? 1 : 0)

    setQuizScore(newScore)
    setSelectedAnswer('')

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((previous) => previous + 1)
      return
    }

    setQuizSubmitting(true)
    setQuizFinished(true)

    try {
      await saveAssessmentResult(
        'Skill Assessment',
        newScore,
        questions.length,
      )

      setAssessmentMessage(
        'Assessment result saved successfully.',
      )
    } catch (error) {
      console.error('Could not save assessment result:', error)

      setAssessmentMessage(
        'Your result is shown, but could not be saved. Check the backend connection.',
      )
    } finally {
      setQuizSubmitting(false)
    }
  }

  function restartQuiz() {
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setQuizScore(null)
    setQuizFinished(false)
    setQuizSubmitting(false)
    setAssessmentMessage('')
  }

  function askTutor() {
    const question = tutorQuestion.trim()

    if (!question) return

    const normalized = question.toLowerCase()

    let answer =
      'Break the topic into small steps. Learn the basic concept, practise one example, and then try a small project. This prototype provides rule-based guidance, not a live AI response.'

    if (normalized.includes('python')) {
      answer =
        'Start with variables, data types, input and output, conditions, loops, functions, and lists. Write a small Python program every day. This is a rule-based demo response, not a live AI answer.'
    } else if (
      normalized.includes('resume') ||
      normalized.includes('job') ||
      normalized.includes('career')
    ) {
      answer =
        'Create a one-page resume with your education, technical skills, projects, and certifications. Describe your own contributions honestly and practise explaining each project. The job listings in this prototype are samples.'
    } else if (normalized.includes('interview')) {
      answer =
        'Prepare a short self-introduction, revise core subjects, practise coding questions, and prepare to explain your projects. Try answering questions aloud and improve your answers after each practice session.'
    } else if (
      normalized.includes('html') ||
      normalized.includes('web')
    ) {
      answer =
        'Learn HTML for page structure, CSS for styling, and JavaScript for interactivity. Then build a personal portfolio and a responsive webpage.'
    } else if (normalized.includes('communication')) {
      answer =
        'Practise speaking for five minutes daily. Read a short article aloud, learn a few new words, and explain one topic in your own words. Focus on clear sentences rather than speaking fast.'
    } else if (
      normalized.includes('data structure') ||
      normalized.includes('dsa')
    ) {
      answer =
        'Start with arrays and strings, then practise searching and sorting. Next learn linked lists, stacks, queues, trees, and time complexity. Draw each structure and solve small problems.'
    }

    setTutorMessages((previous) => [
      ...previous,
      { question, answer },
    ])

    setTutorQuestion('')
  }

  function renderHome() {
    const recommendedCourse = [...courses]
      .filter((course) => course.progress < 100)
      .sort((a, b) => a.progress - b.progress)[0]

    return (
      <>
        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="eyebrow">
              YOUR LEARNING JOURNEY
            </span>

            <h1>{labels.welcome}</h1>
            <p>{labels.subtitle}</p>

            <button
              className="primary-button"
              onClick={() => setPage('Courses')}
              type="button"
            >
              {labels.continue} â†’
            </button>
          </div>

          <div className="welcome-illustration" aria-hidden="true">
            <div className="illustration-circle">ðŸŽ“</div>
            <div className="illustration-caption">
              Learn today. Lead tomorrow.
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            icon="ðŸ“š"
            label="Available Courses"
            value={courses.length}
          />

          <StatCard
            icon="ðŸŽ¯"
            label="Courses Started"
            value={courses.filter((c) => c.progress > 0).length}
          />

          <StatCard
            icon="ðŸ†"
            label="Courses Completed"
            value={courses.filter((c) => c.progress === 100).length}
          />

          <StatCard
            icon="âš¡"
            label="Average Progress"
            value={`${averageProgress}%`}
          />
        </section>

        <section className="section-heading">
          <div>
            <span className="eyebrow">YOUR PERSONAL PATH</span>
            <h2>{labels.continue}</h2>
          </div>

          <button
            className="text-button"
            onClick={() => setPage('Courses')}
            type="button"
          >
            View all â†’
          </button>
        </section>

        <div className="course-grid">
          {courses
            .filter(
              (course) =>
                course.progress > 0 && course.progress < 100,
            )
            .slice(0, 3)
            .map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onContinue={updateProgress}
              />
            ))}
        </div>

        {progressMessage && (
          <p className="save-message" role="status">
            {progressMessage}
          </p>
        )}

        {recommendedCourse && (
          <section className="recommendation-card">
            <span className="eyebrow">PERSONALIZED FOR YOU</span>

            <h2>
              âœ¨ Recommended next: {recommendedCourse.title}
            </h2>

            <p>
              {recommendedCourse.progress < 30
                ? 'This course needs more attention. Focus on its fundamentals and practise regularly.'
                : 'Continue this course to build your skills and move closer to completion.'}
            </p>

            <div className="progress-label-row">
              <span>Current progress</span>
              <strong>{recommendedCourse.progress}%</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${recommendedCourse.progress}%`,
                }}
              />
            </div>

            <button
              className="primary-button"
              onClick={() =>
                void updateProgress(recommendedCourse.id)
              }
              type="button"
            >
              Continue recommended course â†’
            </button>
          </section>
        )}

        <section className="quick-actions">
          <h2>Ready for your next step?</h2>
          <p>
            Check your skills, practise with the tutor, or explore careers.
          </p>

          <div className="action-buttons">
            <button
              className="secondary-button"
              onClick={() => setPage('Assessment')}
              type="button"
            >
              ðŸ“ Take Assessment
            </button>

            <button
              className="secondary-button"
              onClick={() => setPage('AI Tutor')}
              type="button"
            >
              âœ¨ Ask Learning Tutor
            </button>

            <button
              className="secondary-button"
              onClick={() => setPage('Jobs')}
              type="button"
            >
              ðŸ’¼ Explore Careers
            </button>
          </div>
        </section>
      </>
    )
  }

  function renderCourses() {
    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">LEARN AT YOUR OWN PACE</span>
          <h1>{labels.allCourses}</h1>
          <p>
            Build practical skills for education and employment.
          </p>
        </section>

        <div className="search-bar">
          <span aria-hidden="true">ðŸ”Ž</span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={labels.search}
            aria-label="Search courses"
          />

          {search && (
            <button
              className="text-button"
              onClick={() => setSearch('')}
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        {progressMessage && (
          <p className="save-message" role="status">
            {progressMessage}
          </p>
        )}

        <div className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onContinue={updateProgress}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="empty-state">
            <span aria-hidden="true">ðŸ”Ž</span>
            <h3>No courses found</h3>
            <p>Try another search term.</p>
          </div>
        )}
      </>
    )
  }

  function renderAssessment() {
    const question = questions[currentQuestion]

    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">KNOW YOUR STRENGTHS</span>
          <h1>Skill Assessment</h1>
          <p>
            Answer these questions to practise your technical basics.
          </p>
        </section>

        <section className="assessment-card">
          {quizFinished ? (
            <div className="quiz-result">
              <div className="result-icon">ðŸ†</div>
              <h2>Assessment complete!</h2>

              <p>
                Your score: <strong>{quizScore ?? 0}</strong> out of{' '}
                {questions.length}
              </p>

              <p>
                {((quizScore ?? 0) / questions.length) * 100 >= 70
                  ? 'Great work! Keep practising to strengthen your skills.'
                  : 'Keep learning and try again. Every attempt helps you improve.'}
              </p>

              {assessmentMessage && (
                <p role="status" className="save-message">
                  {assessmentMessage}
                </p>
              )}

              {quizSubmitting && <p>Saving your result...</p>}

              <button
                className="primary-button"
                onClick={restartQuiz}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="question-progress">
                <span>
                  Question {currentQuestion + 1} of {questions.length}
                </span>

                <span>
                  {Math.round(
                    ((currentQuestion + 1) / questions.length) * 100,
                  )}
                  % of questions
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              <h2>{question.question}</h2>

              <div className="answer-options">
                {question.options.map((option) => (
                  <button
                    key={option}
                    className={`answer-option ${
                      selectedAnswer === option ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedAnswer(option)}
                    type="button"
                  >
                    <span className="option-circle" aria-hidden="true">
                      {selectedAnswer === option ? 'â—' : 'â—‹'}
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              <button
                className="primary-button"
                onClick={() => void answerQuestion()}
                disabled={!selectedAnswer || quizSubmitting}
                type="button"
              >
                {currentQuestion === questions.length - 1
                  ? 'Finish assessment'
                  : 'Next question â†’'}
              </button>
            </>
          )}
        </section>
      </>
    )
  }

  function renderTutor() {
    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">LEARN WITH GUIDANCE</span>
          <h1>Learning Tutor</h1>
          <p>
            Ask about programming, resumes, interviews, or learning strategies.
          </p>
        </section>

        <section className="tutor-card">
          <div className="tutor-header">
            <div className="tutor-avatar" aria-hidden="true">
              âœ¨
            </div>

            <div>
              <h2>SkillBridge Learning Assistant</h2>
              <p>Demo tutor Â· Instant practice guidance</p>
            </div>
          </div>

          <div className="tutor-disclaimer">
            This prototype uses sample rule-based responses. It is not
            connected to a live AI model.
          </div>

          <div className="suggestion-list">
            <span>Try asking:</span>

            {[
              'How do I learn Python?',
              'How can I prepare for interviews?',
              'How do I improve communication?',
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="suggestion-chip"
                onClick={() => setTutorQuestion(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="tutor-messages" aria-live="polite">
            {tutorMessages.map((message, index) => (
              <div
                className="message-pair"
                key={`${message.question}-${index}`}
              >
                <div className="user-message">
                  <strong>You</strong>
                  <p>{message.question}</p>
                </div>

                <div className="assistant-message">
                  <strong>âœ¨ Learning Assistant</strong>
                  <p>{message.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="tutor-input-row"
            onSubmit={(event) => {
              event.preventDefault()
              askTutor()
            }}
          >
            <input
              value={tutorQuestion}
              onChange={(event) => setTutorQuestion(event.target.value)}
              placeholder="Ask your learning question..."
              aria-label="Ask the tutor a question"
            />

            <button className="primary-button" type="submit">
              Send â†‘
            </button>
          </form>
        </section>
      </>
    )
  }

  function renderJobs() {
    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">YOUR NEXT OPPORTUNITY</span>
          <h1>Career Opportunities</h1>
          <p>
            Explore sample roles and identify skills you can develop.
          </p>
        </section>

        <div className="notice-banner">
          â„¹ï¸ These are sample job listings for demonstration, not verified
          live vacancies. Check employers' official websites before applying.
        </div>

        <div className="job-list">
          {jobs.map((job) => (
            <article className="job-card" key={job.title}>
              <div className="job-icon" aria-hidden="true">
                ðŸ’¼
              </div>

              <div className="job-details">
                <span className="job-type">{job.type}</span>
                <h2>{job.title}</h2>
                <p>{job.company}</p>

                <div className="skill-tags">
                  {job.skills.split(', ').map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>

              <button
                className="secondary-button"
                onClick={() => setPage('Courses')}
                type="button"
              >
                Build skills
              </button>
            </article>
          ))}
        </div>
      </>
    )
  }

 const pageContent: Record<Page, () => ReactElement> = {
    Home: renderHome,
    Courses: renderCourses,
    Assessment: renderAssessment,
    'AI Tutor': renderTutor,
    Jobs: renderJobs,
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            S
          </div>

          <div>
            <h2>
              SkillBridge<span>AI</span>
            </h2>
            <p>Learn Â· Grow Â· Succeed</p>
          </div>
        </div>

        <div className="sidebar-label">MENU</div>

        <nav className="navigation" aria-label="Main navigation">
          {(
            [
              ['Home', 'âŒ‚'],
              ['Courses', 'â–¤'],
              ['Assessment', 'âœ“'],
              ['AI Tutor', 'âœ§'],
              ['Jobs', 'â†—'],
            ] as [Page, string][]
          ).map(([item, icon]) => (
            <button
              key={item}
              className={`nav-item ${page === item ? 'active' : ''}`}
              onClick={() => setPage(item)}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">
                {icon}
              </span>

              <span>{labels[item]}</span>

              {page === item && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon" aria-hidden="true">
              ðŸ’¡
            </div>
            <strong>Keep growing!</strong>
            <p>Small steps every day create big results.</p>
          </div>

          <div className="profile">
            <div className="profile-avatar" aria-hidden="true">
              S
            </div>
            <div>
              <strong>Student</strong>
              <p>Learner account</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span> / </span>
            <strong>{labels[page]}</strong>
          </div>

          <div className="topbar-actions">
            <span
              className={`backend-indicator ${
                backendStatus.toLowerCase().includes('healthy') ||
                backendStatus.toLowerCase().includes('connected')
                  ? 'connected'
                  : 'offline'
              }`}
              title={backendStatus}
            >
              <span className="status-dot" />
              {backendStatus}
            </span>

            <button
              className="language-button"
              onClick={() =>
                setLanguage((current) =>
                  current === 'English' ? 'à°¤à±†à°²à±à°—à±' : 'English',
                )
              }
              type="button"
              aria-label="Change application language"
            >
              ðŸŒ {language === 'English' ? 'à°¤à±†à°²à±à°—à±' : 'English'}
            </button>

            <div className="topbar-avatar" aria-hidden="true">
              S
            </div>
          </div>
        </header>

        <div className="page-container">{pageContent[page]()}</div>

        <footer className="app-footer">
          <span>Â© 2026 SkillBridge AI</span>
          <span>Learning opportunities for everyone.</span>
        </footer>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string | number
}) {
  return (
    <div className="stat-card">
      <span className="stat-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
      </div>
    </div>
  )
}

function CourseCard({
  course,
  onContinue,
}: {
  course: Course
  onContinue: (id: number) => void
}) {
  const icon =
    course.category === 'Programming'
      ? 'ðŸ’»'
      : course.category === 'Technology'
        ? 'ðŸŒ'
        : course.category === 'Soft Skills'
          ? 'ðŸ—£ï¸'
          : 'ðŸ§©'

  return (
    <article className="course-card">
      <div
        className="course-art"
        style={{ backgroundColor: course.color }}
      >
        <span className="course-art-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="course-level">{course.level}</span>
      </div>

      <div className="course-card-body">
        <span className="course-category">{course.category}</span>
        <h3>{course.title}</h3>
        <p className="course-duration">â—· {course.duration}</p>

        <div className="course-progress-label">
          <span>Progress</span>
          <strong>{course.progress}%</strong>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-label={`${course.title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={course.progress}
        >
          <div
            className="progress-fill"
            style={{ width: `${course.progress}%` }}
          />
        </div>

        <button
          className="course-button"
          onClick={() => onContinue(course.id)}
          disabled={course.progress === 100}
          type="button"
        >
          {course.progress === 100
            ? 'âœ“ Completed'
            : course.progress === 0
              ? 'Start learning â†’'
              : 'Continue learning â†’'}
        </button>
      </div>
    </article>
  )
}

export default App
