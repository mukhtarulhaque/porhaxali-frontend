import React, { useState, useEffect } from 'react';

export default function DynamicDate() {
  // Initialize state with the current date object
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Helper function to calculate time remaining until midnight
    const getMsUntilMidnight = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime() - Date.now();
    };

    let timerId;

    // Sets up a timeout to trigger exactly at midnight, then updates daily
    const scheduleNextUpdate = () => {
      const msUntilMidnight = getMsUntilMidnight();
      
      timerId = setTimeout(() => {
        setCurrentDate(new Date());
        scheduleNextUpdate(); // Reschedule for the next midnight
      }, msUntilMidnight);
    };

    scheduleNextUpdate();

    // Clean up timeout on component unmount to prevent memory leaks
    return () => clearTimeout(timerId);
  }, []);

  // Helper function to append st, nd, rd, or th
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  // Format the individual components of the date
  const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = currentDate.getDate();
  const suffix = getOrdinalSuffix(dayNum);
  const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div>
      <p>{`${weekday} ${dayNum}${suffix} ${month}, ${year}`}</p>
    </div>
  );
}