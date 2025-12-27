'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import styles from '@/styles/TriangleGame.module.css'

interface ResultsGraphProps {
  voteData: {
    [key: string]: number
  }
}

export default function ResultsGraph({ voteData }: ResultsGraphProps) {
  const chartData = [
    { name: '24', votes: voteData['24'] || 0 },
    { name: '47', votes: voteData['47'] || 0 },
    { name: '199', votes: voteData['199'] || 0 },
    { name: 'Many', votes: voteData['many'] || 0 },
  ]

  const totalVotes = Object.values(voteData).reduce((sum, count) => sum + count, 0)

  return (
    <div className={styles.graphContainer}>
      <p className={styles.totalVotes}>Total Votes: {totalVotes}</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="votes" fill="#667eea" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

