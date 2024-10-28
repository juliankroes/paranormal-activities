import React, { useEffect, useState } from 'react'

// FIXME: keeps waiting for like 5 seconds after timer is finished
const Timer: React.FC<{ endTime: Date }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>()

  useEffect(() => {
    const endTimeSeconds = Math.floor((endTime.getTime() - new Date().getTime()) / 1000)
    setTimeLeft(endTimeSeconds)
  
    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0))
    }, 1000)
  
    return () => clearInterval(timerId)
  }, [endTime])
  

  return (
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="stopwatch" viewBox="0 0 16 16">
      <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5z"/>
      <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64l.012-.013.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5M8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3"/>
      </svg>
      &nbsp;
      {timeLeft! > 0 ? timeLeft : 'Time is up!'}
    </div>)
}

export default Timer
