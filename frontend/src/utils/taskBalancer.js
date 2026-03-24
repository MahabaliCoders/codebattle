/**
 * Automatic Task Load Balancing Algorithm for Project Antigravity
 * Calculates availability scores for workers based on current workload, priority levels, and time overlaps.
 */

export const calculateAvailabilityScores = (workers, currentTasks, newTaskRequest) => {
  const { startTime, endTime } = newTaskRequest;

  return workers.map(worker => {
    let score = 100; // Base Score
    let isOverloaded = false;
    let hasOverlap = false;

    // 1. Fetch worker's active tasks
    const activeTasks = currentTasks.filter(t => t.assigneeId === worker.id && t.status !== 'done');
    const inProgressCount = activeTasks.filter(t => t.status === 'inProgress').length;
    const highPriorityActive = activeTasks.filter(t => t.priority === 'high').length;

    // 2. Factor: Active Task Count (Penalty for > 3)
    if (inProgressCount >= 3) {
      score -= 40;
      isOverloaded = true;
    } else {
      score -= (inProgressCount * 10);
    }

    // 3. Factor: Task Weight/Priority Penalty
    // High priority tasks reduce availability significantly
    score -= (highPriorityActive * 20);

    // 4. Factor: Time Blocking / Overlap Check
    // If we have precise timing for existing tasks, check for collisions
    if (startTime && endTime) {
      const overlappingTask = activeTasks.find(t => {
        if (!t.startTime || !t.endTime) return false;
        // Check if [newStart, newEnd] overlaps with [taskStart, taskEnd]
        return (startTime < t.endTime && endTime > t.startTime);
      });

      if (overlappingTask) {
        score = 0; // Forced zero for physical impossibility
        hasOverlap = true;
      }
    }

    // Normalize score (clamp between 0-100)
    const finalScore = Math.max(0, score);

    return {
      ...worker,
      availabilityScore: finalScore,
      isOverloaded: isOverloaded || finalScore < 30,
      hasOverlap,
      activeTaskCount: inProgressCount
    };
  })
  .sort((a, b) => b.availabilityScore - a.availabilityScore) // Sort by best fit
  .map((worker, index, sortedList) => ({
    ...worker,
    // Top 3 workers get the recommendation badge (if they aren't zero-scored)
    isRecommended: index < 3 && worker.availabilityScore > 50
  }));
};

/**
 * SQL Implementation for Data Aggregation (PostgreSQL/MySQL Example)
 * 
 * SELECT 
 *   u.id, 
 *   u.name, 
 *   COUNT(CASE WHEN t.status = 'inProgress' THEN 1 END) as active_count,
 *   COUNT(CASE WHEN t.priority = 'high' AND t.status != 'done' THEN 1 END) as high_priority_count,
 *   EXISTS (
 *     SELECT 1 FROM tasks t2 
 *     WHERE t2.assignee_id = u.id 
 *     AND t2.status != 'done' 
 *     AND (t2.start_time < :new_end_time AND t2.end_time > :new_start_time)
 *   ) as has_overlap
 * FROM users u
 * LEFT JOIN tasks t ON t.assignee_id = u.id
 * WHERE u.role = 'MEMBER'
 * GROUP BY u.id, u.name;
 */
