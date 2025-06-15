import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "选择时间",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [step, setStep] = useState<'hour' | 'minute'>('hour');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 生成小时和分钟选项
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // 解析当前时间值
  const [currentHour, currentMinute] = value ? value.split(':').map(Number) : [9, 0];

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setStep('hour');
        setSelectedHour(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    setStep('hour');
    setSelectedHour(null);
  };

  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour);
    setStep('minute');
  };

  const handleMinuteSelect = (minute: number) => {
    if (selectedHour !== null) {
      const timeString = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      onChange(timeString);
      setIsOpen(false);
      setStep('hour');
      setSelectedHour(null);
    }
  };

  const formatDisplayTime = (time: string) => {
    if (!time) return placeholder;
    return time;
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        className={`w-full h-10 px-3 text-sm bg-gray-50/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200 flex items-center justify-between hover:bg-gray-100/50 ${className}`}
      >
        <span className={value ? 'text-gray-900' : 'text-[#A0A0A0]'}>
          {formatDisplayTime(value)}
        </span>
        <Clock className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-hidden"
        >
          {step === 'hour' && (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1 font-medium">选择小时</div>
              <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className={`p-2 text-sm rounded-lg transition-colors flex items-center justify-center ${
                      hour === currentHour
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {hour.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'minute' && selectedHour !== null && (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1 font-medium">
                选择分钟 ({selectedHour.toString().padStart(2, '0')}:__)
              </div>
              <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto">
                {minutes.filter(m => m % 15 === 0).map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    className={`p-2 text-sm rounded-lg transition-colors flex items-center justify-center ${
                      minute === currentMinute && selectedHour === currentHour
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 