interface LinearProgressProps {
  percentage: number;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  label?: string;
  height?: string;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({ 
  percentage, 
  color = 'blue',
  label,
  height = 'h-2'
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-600">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div 
          className={`${height} rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};