const mongoose = require('mongoose');

// Create a separate schema for sourceResults to suppress warnings
const sourceResultSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['AmiTravel', 'HolidayGoGo', 'PulauMalaysia'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  startTime: Date,
  endTime: Date,
  duration: Number,
  packagesFound: {
    type: Number,
    default: 0
  },
  packagesProcessed: {
    type: Number,
    default: 0
  },
  newPackages: {
    type: Number,
    default: 0
  },
  updatedPackages: {
    type: Number,
    default: 0
  },
  errors: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    stack: String
  }]
}, {
  suppressReservedKeysWarning: true
});

const scrapingLogSchema = new mongoose.Schema({
  // Basic operation info
  operationId: {
    type: String,
    required: true,
    unique: true
  },
  triggerType: {
    type: String,
    enum: ['manual', 'automated', 'api'],
    required: true
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.triggerType === 'manual';
    }
  },
  
  // Timing information
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'cancelled'],
    default: 'running'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentStep: {
    type: String,
    default: 'Initializing'
  },
  
  // Results summary
  results: {
    totalSources: {
      type: Number,
      default: 0
    },
    successfulSources: {
      type: Number,
      default: 0
    },
    failedSources: {
      type: Number,
      default: 0
    },
    totalPackagesFound: {
      type: Number,
      default: 0
    },
    newPackages: {
      type: Number,
      default: 0
    },
    updatedPackages: {
      type: Number,
      default: 0
    },
    duplicatesSkipped: {
      type: Number,
      default: 0
    }
  },
  
  // Source-specific results
  sourceResults: [sourceResultSchema],
  
  // Error handling
  errors: [{
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'error'
    },
    message: {
      type: String,
      required: true
    },
    source: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    stack: String,
    context: mongoose.Schema.Types.Mixed
  }],
  
  // Configuration used
  configuration: {
    sources: [{
      type: String,
      enum: ['AmiTravel', 'HolidayGoGo', 'PulauMalaysia']
    }],
    timeout: {
      type: Number,
      default: 300000 // 5 minutes
    },
    retryAttempts: {
      type: Number,
      default: 3
    },
    batchSize: {
      type: Number,
      default: 50
    }
  },
  
  // Additional metadata
  metadata: {
    serverInfo: {
      hostname: String,
      platform: String,
      nodeVersion: String,
      memoryUsage: mongoose.Schema.Types.Mixed
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  suppressReservedKeysWarning: true
});

// Virtual for formatted duration
scrapingLogSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return 'N/A';
  
  const seconds = Math.floor(this.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

// Virtual for success rate
scrapingLogSchema.virtual('successRate').get(function() {
  if (this.results.totalSources === 0) return 0;
  return Math.round((this.results.successfulSources / this.results.totalSources) * 100);
});

// Virtual for overall efficiency
scrapingLogSchema.virtual('efficiency').get(function() {
  const total = this.results.totalPackagesFound;
  const processed = this.results.newPackages + this.results.updatedPackages;
  if (total === 0) return 0;
  return Math.round((processed / total) * 100);
});

// Indexes for better query performance
scrapingLogSchema.index({ startTime: -1 });
scrapingLogSchema.index({ status: 1 });
scrapingLogSchema.index({ triggerType: 1 });
// operationId index is already created by unique: true in schema
scrapingLogSchema.index({ 'sourceResults.source': 1 });

// Static methods
scrapingLogSchema.statics.getRecentLogs = function(limit = 10) {
  return this.find()
    .sort({ startTime: -1 })
    .limit(limit)
    .populate('triggeredBy', 'name email')
    .lean();
};

scrapingLogSchema.statics.getRunningOperations = function() {
  return this.find({ status: 'running' })
    .sort({ startTime: -1 })
    .populate('triggeredBy', 'name email')
    .lean();
};

scrapingLogSchema.statics.getStatistics = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { startTime: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalOperations: { $sum: 1 },
        successfulOperations: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedOperations: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalPackagesProcessed: { $sum: '$results.totalPackagesFound' },
        totalNewPackages: { $sum: '$results.newPackages' },
        totalUpdatedPackages: { $sum: '$results.updatedPackages' },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);
};

// Instance methods
scrapingLogSchema.methods.updateProgress = function(progress, currentStep) {
  this.progress = progress;
  this.currentStep = currentStep;
  return this.save();
};

scrapingLogSchema.methods.addError = function(error, level = 'error', source = null) {
  this.errors.push({
    level,
    message: error.message || error,
    source,
    stack: error.stack,
    context: error.context || {}
  });
  return this.save();
};

scrapingLogSchema.methods.completeOperation = function(status = 'completed') {
  this.status = status;
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  this.progress = status === 'completed' ? 100 : this.progress;
  return this.save();
};

const ScrapingLog = mongoose.model('ScrapingLog', scrapingLogSchema);

module.exports = ScrapingLog;
