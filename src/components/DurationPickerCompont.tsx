import React, { useState } from 'react';
import { InputNumber, Typography, Space } from 'antd';
import './component.css';

const { Text } = Typography;

interface DurationInputProps {
  onChange?: (hours: number, minutes: number) => void;
}

export const DurationInput: React.FC<DurationInputProps> = ({ onChange }) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);

  const handleHoursChange = (value: number | null) => {
    const h = value || 0;
    setHours(h);
    onChange?.(h, minutes);
  };

  const handleMinutesChange = (value: number | null) => {
    const m = value || 0;
    setMinutes(m);
    onChange?.(hours, m);
  };

  return (
    <Space direction="vertical">
      <Space>
        <InputNumber
          min={0}
          value={hours}
          onChange={handleHoursChange}
          placeholder="Hours"
          className="Hour"
        />
        <Text>{hours > 1 ? 'hours' : 'hour'}</Text>
        <InputNumber
          min={0}
          max={59}
          value={minutes}
          onChange={handleMinutesChange}
          placeholder="Minutes"
          className="Min"
        />
        <Text>min</Text>
      </Space>
    </Space>
  );
};
