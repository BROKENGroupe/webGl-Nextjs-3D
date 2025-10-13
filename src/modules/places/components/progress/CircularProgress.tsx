interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  label?: string;
  showValue?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 60,
  strokeWidth = 4,
  color = 'blue',
  label,
  showValue = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    orange: 'stroke-orange-500',
    red: 'stroke-red-500',
    purple: 'stroke-purple-500'
  };

  const backgroundColorClasses = {
    blue: 'stroke-blue-100',
    green: 'stroke-green-100',
    orange: 'stroke-orange-100',
    red: 'stroke-red-100',
    purple: 'stroke-purple-100'
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className={backgroundColorClasses[color]}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClasses[color]} transition-all duration-500 ease-out`}
          />
        </svg>
        
        {/* Center text */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Label */}
      {label && (
        <span className="text-xs text-gray-600 mt-1 text-center">
          {label}
        </span>
      )}
    </div>
  );
};