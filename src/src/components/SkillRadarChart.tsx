'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { RadarChartData } from '@/types';

interface SkillRadarChartProps {
  data: RadarChartData[];
  title?: string;
}

export default function SkillRadarChart({ data, title }: SkillRadarChartProps) {
  return (
    <div className="w-full h-96 bg-white rounded-lg shadow p-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fontSize: 12, fill: '#374151' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="現在のスキル"
            dataKey="current"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
          />
          <Radar
            name="目標スキル"
            dataKey="target"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.2}
          />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
