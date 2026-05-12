import React from 'react';
import { checkPasswordStrength } from '../utils/validation';

const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null;
  
  const { strength, level, color, bgColor, feedback } = checkPasswordStrength(password);
  const progressWidth = `${(strength / 5) * 100}%`;
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${color}`}>
          Strength: {level}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            level === 'strong' ? 'bg-green-600' :
            level === 'medium' ? 'bg-yellow-500' :
            'bg-red-600'
          }`}
          style={{ width: progressWidth }}
        />
      </div>
      <p className={`text-xs mt-1 ${color}`}>{feedback}</p>
    </div>
  );
};

export default PasswordStrengthIndicator;
