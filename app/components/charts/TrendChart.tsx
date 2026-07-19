import { useId, useRef, useState } from 'react';
import type { HistoryPoint } from '../../data/priceFormat';
import { formatPrice } from '../../data/priceFormat';

interface TrendChartProps {
  data?: HistoryPoint[] | null;
  color?: string;
  currency?: string;
  height?: number;
}

function formatPointTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
}

export function TrendChart({
  data,
  color = '#E8672E',
  currency = 'USD',
  height = 220,
}: TrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();
  if (!data || data.length < 2)
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b6b70',
        }}
      >
        Not enough data
      </div>
    );

  const width = 800,
    padding = 28,
    prices = data.map((d) => d.price);
  const min = Math.min(...prices),
    max = Math.max(...prices),
    range = max - min || 1,
    innerH = height - padding * 2;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: padding + innerH - ((d.price - min) / range) * innerH,
  }));
  const linePath = points
    .map(
      (point, i) =>
        `${i ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
    )
    .join(' ');
  const areaPath = `${linePath} L ${width} ${height - padding} L 0 ${height - padding} Z`;
  const active =
    activeIndex === null
      ? null
      : { point: points[activeIndex], data: data[activeIndex] };
  const selectFromPointer = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setActiveIndex(
      Math.max(
        0,
        Math.min(
          data.length - 1,
          Math.round(((clientX - rect.left) / rect.width) * (data.length - 1)),
        ),
      ),
    );
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          width='100%'
          height={height}
          preserveAspectRatio='none'
          role='img'
          aria-label='Interactive price trend. Move across the chart to inspect a point.'
          tabIndex={0}
          onPointerMove={(event) => selectFromPointer(event.clientX)}
          onPointerLeave={() => setActiveIndex(null)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft')
              setActiveIndex((i) => Math.max(0, (i ?? data.length - 1) - 1));
            if (event.key === 'ArrowRight')
              setActiveIndex((i) => Math.min(data.length - 1, (i ?? -1) + 1));
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={color} stopOpacity={0.3} />
              <stop offset='100%' stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={0}
              x2={width}
              y1={padding + innerH * f}
              y2={padding + innerH * f}
              stroke='#27272a'
              strokeWidth={1}
            />
          ))}
          <path d={areaPath} fill={`url(#${gradientId})`} stroke='none' />
          <path d={linePath} fill='none' stroke={color} strokeWidth={2} />
          {active && (
            <>
              <line
                x1={active.point.x}
                x2={active.point.x}
                y1={padding}
                y2={height - padding}
                stroke='#8b8b90'
                strokeDasharray='4 4'
              />
              <circle
                cx={active.point.x}
                cy={active.point.y}
                r={5}
                fill='var(--surface)'
                stroke={color}
                strokeWidth={2.5}
              />
            </>
          )}
        </svg>
        {active && (
          <div
            className='chart-tooltip'
            style={{
              left: `${Math.min(88, Math.max(2, (active.point.x / width) * 100))}%`,
            }}
          >
            <strong>{formatPrice(active.data.price, currency)}</strong>
            <span>{formatPointTime(active.data.time)}</span>
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#8b8b90',
          marginTop: 4,
        }}
      >
        <span>{formatPrice(min, currency)}</span>
        <span>{formatPrice(max, currency)}</span>
      </div>
    </div>
  );
}
