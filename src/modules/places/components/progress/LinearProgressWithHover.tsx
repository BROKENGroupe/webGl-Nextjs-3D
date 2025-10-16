import { AnimatePresence, motion } from "framer-motion";
import { ProgressHoverData } from "../../types";

interface LinearProgressWithHoverProps {
  percentage: number;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'black';
  label?: string;
  height?: string;
  hoverData?: ProgressHoverData;
  progressId?: string;
  hoveredProgress?: string | null;
  setHoveredProgress?: (id: string | null) => void;
}

export const LinearProgressWithHover: React.FC<LinearProgressWithHoverProps> = ({ 
  percentage, 
  color = 'blue',
  label,
  height = 'h-2',
  hoverData,
  progressId,
  hoveredProgress,
  setHoveredProgress
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500', 
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    black: 'bg-gray-900'
  };

  const hoverColorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
    red: 'border-red-200 bg-red-50', 
    purple: 'border-purple-200 bg-purple-50',
    black: 'border-gray-300 bg-gray-100'
  };

  return (
    <div className="relative w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-600">{percentage}%</span>
        </div>
      )}
      <div 
        className={`w-full bg-gray-200 rounded-full ${height} cursor-pointer transition-all duration-200 hover:bg-gray-300`}
        onMouseEnter={() => progressId && setHoveredProgress && setHoveredProgress(progressId)}
        onMouseLeave={() => setHoveredProgress && setHoveredProgress(null)}
      >
        <div 
          className={`${height} rounded-full transition-all duration-500 ease-out ${colorClasses[color]} hover:brightness-110`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Popover on hover */}
      <AnimatePresence>
        {hoveredProgress === progressId && hoverData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`absolute z-50 mt-2 w-64 p-3 rounded-lg shadow-lg border-2 ${hoverColorClasses[color]} backdrop-blur-sm`}
            style={{ 
              left: '50%',
              transform: 'translateX(-50%)',
              top: '100%'
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold text-sm ${color === 'blue' ? 'text-blue-800' : 
                                                       color === 'green' ? 'text-green-800' : 
                                                       color === 'orange' ? 'text-orange-800' : 
                                                       color === 'red' ? 'text-red-800' : 'text-purple-800'}`}>
                  {hoverData.title}
                </h4>
                <span className={`text-lg font-bold ${color === 'blue' ? 'text-blue-700' : 
                                                     color === 'green' ? 'text-green-700' : 
                                                     color === 'orange' ? 'text-orange-700' : 
                                                     color === 'red' ? 'text-red-700' : 'text-purple-700'}`}>
                  {hoverData.value}
                </span>
              </div>
              <p className="text-xs text-gray-700">{hoverData.description}</p>
              {hoverData.recommendation && (
                <div className="mt-2 p-2 bg-white bg-opacity-60 rounded border-l-2 border-gray-400">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">💡 Recomendación:</span> {hoverData.recommendation}
                  </p>
                </div>
              )}
            </div>
            
            {/* Flecha del popover */}
            <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 border-t-2 border-l-2 ${hoverColorClasses[color].split(' ')[0]} ${hoverColorClasses[color].split(' ')[1]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};