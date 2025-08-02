const cron = require('node-cron');
const scrapingService = require('./scrapingService');

class CronScheduler {
  constructor() {
    this.scheduledTasks = new Map();
    this.defaultSchedule = '0 2 * * *'; // Daily at 2:00 AM
    this.isEnabled = process.env.ENABLE_CRON_SCRAPING !== 'false';
  }

  // Initialize the cron scheduler
  init() {
    if (!this.isEnabled) {
      console.log('Cron scraping is disabled');
      return;
    }

    console.log('Initializing cron scheduler for automated scraping...');
    this.scheduleAutomatedScraping();
  }

  // Schedule the main automated scraping task
  scheduleAutomatedScraping() {
    const schedule = process.env.SCRAPING_CRON_SCHEDULE || this.defaultSchedule;
    
    console.log(`Scheduling automated scraping with cron pattern: ${schedule}`);
    
    const task = cron.schedule(schedule, async () => {
      console.log('Starting automated scraping operation...');
      
      try {
        // Check if manual scraping is already running
        if (scrapingService.isScrapingInProgress()) {
          console.log('Skipping automated scraping - manual operation in progress');
          return;
        }

        // Start automated scraping
        const result = await scrapingService.startScraping('automated', null, {
          sources: ['AmiTravel', 'HolidayGoGo', 'PulauMalaysia'],
          timeout: 600000, // 10 minutes per source for automated runs
          retryAttempts: 3
        });

        console.log('Automated scraping started:', result);

      } catch (error) {
        console.error('Error starting automated scraping:', error);
        
        // Log the error for monitoring
        this.logCronError('automated_scraping', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'Asia/Kuala_Lumpur'
    });

    this.scheduledTasks.set('automated_scraping', {
      task,
      schedule,
      name: 'Automated Package Scraping',
      lastRun: null,
      nextRun: this.getNextRunTime(schedule),
      status: 'active'
    });

    console.log(`Automated scraping scheduled successfully. Next run: ${this.getNextRunTime(schedule)}`);
  }

  // Schedule a custom scraping task
  scheduleCustomTask(name, cronPattern, config = {}) {
    try {
      // Validate cron pattern
      if (!cron.validate(cronPattern)) {
        throw new Error('Invalid cron pattern');
      }

      // Remove existing task if it exists
      if (this.scheduledTasks.has(name)) {
        this.removeScheduledTask(name);
      }

      const task = cron.schedule(cronPattern, async () => {
        console.log(`Starting custom scraping task: ${name}`);
        
        try {
          if (scrapingService.isScrapingInProgress()) {
            console.log(`Skipping custom task ${name} - another operation in progress`);
            return;
          }

          const result = await scrapingService.startScraping('automated', null, config);
          console.log(`Custom task ${name} started:`, result);

          // Update last run time
          const taskInfo = this.scheduledTasks.get(name);
          if (taskInfo) {
            taskInfo.lastRun = new Date();
          }

        } catch (error) {
          console.error(`Error in custom task ${name}:`, error);
          this.logCronError(name, error);
        }
      }, {
        scheduled: true,
        timezone: process.env.TIMEZONE || 'Asia/Kuala_Lumpur'
      });

      this.scheduledTasks.set(name, {
        task,
        schedule: cronPattern,
        name,
        lastRun: null,
        nextRun: this.getNextRunTime(cronPattern),
        status: 'active',
        config
      });

      return {
        success: true,
        message: `Custom task ${name} scheduled successfully`,
        nextRun: this.getNextRunTime(cronPattern)
      };

    } catch (error) {
      console.error(`Error scheduling custom task ${name}:`, error);
      throw error;
    }
  }

  // Remove a scheduled task
  removeScheduledTask(name) {
    const taskInfo = this.scheduledTasks.get(name);
    if (taskInfo) {
      taskInfo.task.stop();
      taskInfo.task.destroy();
      this.scheduledTasks.delete(name);
      
      console.log(`Scheduled task ${name} removed`);
      return true;
    }
    return false;
  }

  // Get all scheduled tasks
  getScheduledTasks() {
    const tasks = [];
    
    for (const [name, taskInfo] of this.scheduledTasks) {
      tasks.push({
        name: taskInfo.name,
        schedule: taskInfo.schedule,
        lastRun: taskInfo.lastRun,
        nextRun: taskInfo.nextRun,
        status: taskInfo.status,
        config: taskInfo.config
      });
    }
    
    return tasks;
  }

  // Update task schedule
  updateTaskSchedule(name, newCronPattern) {
    const taskInfo = this.scheduledTasks.get(name);
    if (!taskInfo) {
      throw new Error(`Task ${name} not found`);
    }

    // Validate new cron pattern
    if (!cron.validate(newCronPattern)) {
      throw new Error('Invalid cron pattern');
    }

    // Store config for rescheduling
    const config = taskInfo.config || {};
    
    // Remove old task
    this.removeScheduledTask(name);
    
    // Create new task with updated schedule
    return this.scheduleCustomTask(name, newCronPattern, config);
  }

  // Pause a scheduled task
  pauseTask(name) {
    const taskInfo = this.scheduledTasks.get(name);
    if (taskInfo && taskInfo.status === 'active') {
      taskInfo.task.stop();
      taskInfo.status = 'paused';
      console.log(`Task ${name} paused`);
      return true;
    }
    return false;
  }

  // Resume a paused task
  resumeTask(name) {
    const taskInfo = this.scheduledTasks.get(name);
    if (taskInfo && taskInfo.status === 'paused') {
      taskInfo.task.start();
      taskInfo.status = 'active';
      taskInfo.nextRun = this.getNextRunTime(taskInfo.schedule);
      console.log(`Task ${name} resumed`);
      return true;
    }
    return false;
  }

  // Get next scheduled run times
  getNextRuns(limit = 5) {
    const nextRuns = [];

    for (const [name, taskInfo] of this.scheduledTasks) {
      if (taskInfo.status === 'active' && taskInfo.nextRun) {
        nextRuns.push({
          taskName: taskInfo.name,
          nextRun: taskInfo.nextRun,
          schedule: taskInfo.schedule
        });
      }
    }

    // Sort by next run time
    nextRuns.sort((a, b) => new Date(a.nextRun) - new Date(b.nextRun));

    return nextRuns.slice(0, limit);
  }

  // Helper method to calculate next run time from cron pattern
  getNextRunTime(cronPattern) {
    try {
      // Simple calculation for next run time based on cron pattern
      // This is a basic implementation - for production, consider using a proper cron parser
      const now = new Date();

      // For daily at 2 AM pattern (0 2 * * *)
      if (cronPattern === '0 2 * * *') {
        const nextRun = new Date(now);
        nextRun.setHours(2, 0, 0, 0);

        // If it's already past 2 AM today, schedule for tomorrow
        if (now.getHours() >= 2) {
          nextRun.setDate(nextRun.getDate() + 1);
        }

        return nextRun;
      }

      // For other patterns, just add 24 hours as a fallback
      const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return nextRun;

    } catch (error) {
      console.error('Error calculating next run time:', error);
      // Fallback to 24 hours from now
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }

  // Log cron errors for monitoring
  logCronError(taskName, error) {
    const errorLog = {
      timestamp: new Date(),
      taskName,
      error: {
        message: error.message,
        stack: error.stack
      }
    };
    
    // In a production environment, you might want to:
    // - Send to a logging service
    // - Store in database
    // - Send notifications
    console.error('Cron task error:', errorLog);
  }

  // Get cron scheduler status
  getStatus() {
    return {
      enabled: this.isEnabled,
      totalTasks: this.scheduledTasks.size,
      activeTasks: Array.from(this.scheduledTasks.values()).filter(t => t.status === 'active').length,
      pausedTasks: Array.from(this.scheduledTasks.values()).filter(t => t.status === 'paused').length,
      nextRuns: this.getNextRuns(3),
      timezone: process.env.TIMEZONE || 'Asia/Kuala_Lumpur'
    };
  }

  // Validate cron pattern
  static validateCronPattern(pattern) {
    return cron.validate(pattern);
  }

  // Get human-readable description of cron pattern
  static describeCronPattern(pattern) {
    // Basic descriptions for common patterns
    const descriptions = {
      '0 2 * * *': 'Daily at 2:00 AM',
      '0 */6 * * *': 'Every 6 hours',
      '0 0 * * 0': 'Weekly on Sunday at midnight',
      '0 0 1 * *': 'Monthly on the 1st at midnight',
      '*/30 * * * *': 'Every 30 minutes',
      '0 */2 * * *': 'Every 2 hours'
    };

    return descriptions[pattern] || `Custom pattern: ${pattern}`;
  }

  // Shutdown all scheduled tasks
  shutdown() {
    console.log('Shutting down cron scheduler...');
    
    for (const [name, taskInfo] of this.scheduledTasks) {
      taskInfo.task.stop();
      taskInfo.task.destroy();
    }
    
    this.scheduledTasks.clear();
    console.log('All scheduled tasks stopped');
  }
}

// Create singleton instance
const cronScheduler = new CronScheduler();

// Graceful shutdown handling
process.on('SIGINT', () => {
  cronScheduler.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cronScheduler.shutdown();
  process.exit(0);
});

module.exports = cronScheduler;
