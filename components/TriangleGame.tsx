'use client'

import { useState, useEffect } from 'react'
import ResultsGraph from './ResultsGraph'
import TriangleShape from './TriangleShape'
import styles from '@/styles/TriangleGame.module.css'

interface VoteData {
  [key: string]: number
}

export default function TriangleGame() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [voteData, setVoteData] = useState<VoteData>({})
  const [roastMessage, setRoastMessage] = useState<string>('')

  // With this overly complex pattern, "Many" is the most reasonable answer!
  // The pattern has so many intersecting lines that counting becomes tedious
  const CORRECT_ANSWER = 'many'

  // Actually funny roast messages
  const roastMessages = [
    "Wrong. It's 'Many'. Did you actually count?",
    "Lol no. It's 'Many'. This isn't that deep.",
    "You counted, didn't you? It's 'Many'.",
    "Nah. It's 'Many'. Stop counting.",
    "No. It's 'Many'. The answer is literally in the options.",
    "Nope. It's 'Many'. You really tried to count them all?",
    "Nah. It's 'Many'. You sat there counting, didn't you?",
    "Incorrect. It's 'Many'. Did you draw on your screen?",
    "No. It's 'Many'. The answer is right there in the options.",
    "Wrong. It's 'Many'. How did you even get that number? Did you just guess?",
    "Nope. It's 'Many'. What made you think counting was the right approach here?",
    "Incorrect. It's 'Many'. Did you use your fingers? Because that's embarrassing.",
    "Wrong. It's 'Many'. How long did you spend counting before giving up?",
    "Nah. It's 'Many'. Did you ask your mom to help you count?",
    "Wrong answer. It's 'Many'. What was your strategy? Counting one by one?",
    "Nope. It's 'Many'. Did you use a calculator? Because you still got it wrong.",
    "Incorrect. It's 'Many'. How did you arrive at that number? Please explain your process.",
    "Wrong. It's 'Many'. Did you make a spreadsheet? Because you get extra points for that.",
    "Nah. It's 'Many'. What made you think a specific number was the answer?",
    "Wrong. It's 'Many'. Did you count out loud? Your neighbors are concerned.",
    "Nope. It's 'Many'. How many times did you lose count and start over?",
    "Incorrect. It's 'Many'. Did you use a magnifying glass? Because that's dedication to being wrong.",
    "Wrong. It's 'Many'. What was going through your head when you decided to count?",
    "Nah. It's 'Many'. Did you take notes? Because you're still wrong.",
    "Wrong answer. It's 'Many'. How did you think you could count all of them?",
    "Nope. It's 'Many'. Did you use a protractor? Because that's not how this works.",
    "Incorrect. It's 'Many'. What made you think this was a counting challenge?",
    "Wrong. It's 'Many'. Did you ask ChatGPT to count for you? Even AI knows it's 'Many'.",
    "Nah. It's 'Many'. How did you get that number? Did you just make it up?",
    "Wrong. It's 'Many'. What was your plan? Count every single triangle? Good luck with that."
  ]
  
  const answers = [
    { id: '24', label: '24' },
    { id: '47', label: '47' },
    { id: '199', label: '199' },
    { id: 'many', label: 'Many' },
  ]

  // Load initial vote data
  useEffect(() => {
    fetchVoteData()
  }, [])

  const fetchVoteData = async () => {
    try {
      const response = await fetch('/api/votes')
      if (response.ok) {
        const data = await response.json()
        setVoteData(data)
      }
    } catch (error) {
      console.error('Error fetching vote data:', error)
    }
  }

  const isCorrect = (answerId: string) => {
    return answerId === CORRECT_ANSWER || answerId === 'many'
  }

  const handleAnswerSelect = async (answerId: string) => {
    if (hasVoted) return

    setSelectedAnswer(answerId)

    // If incorrect, pick a random roast message
    if (!isCorrect(answerId)) {
      const randomRoast = roastMessages[Math.floor(Math.random() * roastMessages.length)]
      setRoastMessage(randomRoast)
    }

    // Optimistic update: immediately update UI
    setHasVoted(true)
    setVoteData(prev => ({
      ...prev,
      [answerId]: (prev[answerId] || 0) + 1
    }))

    // Send vote to server in the background (don't wait for it)
    fetch('/api/votes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer: answerId }),
    })
      .then(async (response) => {
        if (response.ok) {
          // Optionally refresh vote data to ensure consistency with server
          // But don't block the UI - do it silently in the background
          const data = await response.json()
          if (data.votes) {
            setVoteData(data.votes)
          }
        }
      })
      .catch((error) => {
        console.error('Error submitting vote:', error)
        // On error, we could revert the optimistic update, but for simplicity
        // we'll just log it. The next page refresh will show the correct data.
      })
  }

  const handleRetry = () => {
    setSelectedAnswer(null)
    setHasVoted(false)
    setRoastMessage('')
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameCard}>
        <h1 className={styles.gameTitle}>Triangle Counting Challenge</h1>
        
        <div className={styles.questionSection}>
          <p className={styles.questionText}>How many triangles do you see?</p>
          
          <div className={styles.triangleDisplay}>
            <TriangleShape />
          </div>

          <div className={styles.answersGrid}>
            {answers.map((answer) => {
              const selected = selectedAnswer === answer.id
              const correct = isCorrect(answer.id)
              const showResult = hasVoted && selected
              
              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  disabled={hasVoted}
                  className={`${styles.answerButton} ${
                    selected ? styles.selected : ''
                  } ${hasVoted ? styles.disabled : ''} ${
                    showResult && correct ? styles.correct : ''
                  } ${showResult && !correct ? styles.incorrect : ''}`}
                >
                  <span className={styles.answerLabel}>{answer.label}</span>
                  {showResult && (
                    <span className={styles.resultIcon}>
                      {correct ? '✓' : '✗'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          
          {hasVoted && (
            <>
              <div className={`${styles.feedbackMessage} ${
                isCorrect(selectedAnswer || '') ? styles.feedbackCorrect : styles.feedbackIncorrect
              }`}>
                {isCorrect(selectedAnswer || '') ? (
                  <>
                    <span className={styles.celebration}>🎉</span>
                    <span>Correct! There are way too many triangles to count - "Many" is the right answer!</span>
                    <span className={styles.celebration}>🎉</span>
                  </>
                ) : (
                  <>
                    <span>{roastMessage}</span>
                  </>
                )}
              </div>
              <div className={styles.retryContainer}>
                <button
                  onClick={handleRetry}
                  className={styles.retryButton}
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>

        {hasVoted && (
          <div className={styles.resultsSection}>
            <h2 className={styles.resultsTitle}>Voting Results</h2>
            <ResultsGraph voteData={voteData} />
          </div>
        )}
      </div>
    </div>
  )
}

