import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        if (onExpire) onExpire();
        return null;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds, totalHours: hours };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (!timeLeft) {
    return <span className="text-gray-600">Class time passed</span>;
  }

  // If more than 24 hours away, show date and time
  if (timeLeft.totalHours >= 24) {
    return (
      <span className="text-gray-700">
        Class starts on {new Date(targetDate).toLocaleDateString()} at{' '}
        {new Date(targetDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    );
  }

  // If within 24 hours, show countdown
  return (
    <span className="text-indigo-600 font-semibold">
      Starts in {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </span>
  );
}
