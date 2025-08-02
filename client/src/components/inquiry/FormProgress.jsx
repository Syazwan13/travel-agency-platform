import React from 'react';

const FormProgress = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="form-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`progress-step ${currentStep >= step.id ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`}
          >
            <div className="step-number">
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .form-progress {
          margin-bottom: 32px;
        }
        
        .progress-bar {
          width: 100%;
          height: 4px;
          background-color: #e5e7eb;
          border-radius: 2px;
          margin-bottom: 16px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #3b82f6;
          transition: width 0.3s ease;
        }
        
        .progress-steps {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          text-align: center;
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 8px;
          transition: all 0.3s ease;
          background-color: #e5e7eb;
          color: #6b7280;
        }
        
        .progress-step.active .step-number {
          background-color: #3b82f6;
          color: white;
        }
        
        .progress-step.completed .step-number {
          background-color: #10b981;
          color: white;
        }
        
        .step-title {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          max-width: 80px;
          line-height: 1.2;
        }
        
        .progress-step.active .step-title {
          color: #3b82f6;
          font-weight: 600;
        }
        
        .progress-step.completed .step-title {
          color: #10b981;
        }
        
        @media (max-width: 768px) {
          .step-title {
            font-size: 0.7rem;
            max-width: 60px;
          }
          
          .step-number {
            width: 28px;
            height: 28px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FormProgress;
