"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Children, createContext, isValidElement, useContext, useEffect, useMemo, useRef, useState } from "react";

type Size = { width: number; height: number };

const SizeContext = createContext<Size | null>(null);

function useSize(): Size {
  const size = useContext(SizeContext);
  if (!size) {
    throw new Error("Chart components must be used within a ResponsiveContainer");
  }
  return size;
}

interface ResponsiveContainerProps {
  width?: number | string;
  height?: number;
  minHeight?: number;
  children: ReactNode;
  style?: CSSProperties;
}

export function ResponsiveContainer({
  width = "100%",
  height = 240,
  minHeight,
  style,
  children
}: ResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size>({
    width: typeof width === "number" ? width : 0,
    height: typeof height === "number" ? height : 0
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    function updateSize() {
      setSize({
        width: typeof width === "number" ? width : element.clientWidth,
        height: typeof height === "number" ? height : element.clientHeight
      });
    }

    updateSize();

    if (typeof width !== "number") {
      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(updateSize);
        observer.observe(element);
        return () => observer.disconnect();
      }
    }

    return undefined;
  }, [width, height]);

  const resolvedStyle: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : `${height}px`,
    minHeight,
    ...style
  };

  return (
    <div ref={containerRef} style={resolvedStyle}>
      {size.width > 0 && size.height > 0 ? <SizeContext.Provider value={size}>{children}</SizeContext.Provider> : null}
    </div>
  );
}

interface PieProps<T> {
  data: T[];
  dataKey: keyof T;
  innerRadius?: number;
  outerRadius?: number;
  children?: ReactNode;
  chartWidth?: number;
  chartHeight?: number;
  paddingAngle?: number;
}

interface CellProps {
  fill: string;
}

export function Cell(_props: CellProps) {
  return null;
}

interface PieSlice<T> {
  entry: T;
  value: number;
  color: string;
}

export function Pie<T extends Record<string, unknown>>({
  data,
  dataKey,
  innerRadius = 0,
  outerRadius,
  children,
  chartWidth,
  chartHeight,
  paddingAngle = 0
}: PieProps<T>) {
  const width = chartWidth ?? 240;
  const height = chartHeight ?? 240;
  const radius = outerRadius ?? Math.min(width, height) / 2 - 8;
  const cx = width / 2;
  const cy = height / 2;

  const cells = useMemo(() => {
    return Children.toArray(children).filter(isValidElement<CellProps>) as ReactElement<CellProps>[];
  }, [children]);

  const slices: PieSlice<T>[] = useMemo(() => {
    const total = data.reduce((sum, entry) => {
      const raw = entry[dataKey];
      const numeric = Number(raw ?? 0);
      return Number.isNaN(numeric) ? sum : sum + numeric;
    }, 0);

    if (total === 0) {
      return [];
    }

    return data.map((entry, index) => {
      const raw = entry[dataKey];
      const numeric = Number(raw ?? 0);
      const value = Number.isNaN(numeric) ? 0 : numeric;
      const cell = cells[index % cells.length];
      const color = cell?.props.fill ?? `hsl(${(index * 57) % 360} 70% 55%)`;
      return { entry, value, color };
    });
  }, [cells, data, dataKey]);

  const totalValue = slices.reduce((sum, slice) => sum + slice.value, 0);
  const baseAngle = -Math.PI / 2;
  const inner = Math.max(0, Math.min(innerRadius, radius - 4));
  const padRadians = (paddingAngle * Math.PI) / 180;

  if (totalValue === 0) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={inner > 0 ? (inner + radius) / 2 : radius}
        fill="#e2e8f0"
      />
    );
  }

  let currentAngle = baseAngle;

  return (
    <g>
      {slices.map((slice, index) => {
        const sliceAngle = (slice.value / totalValue) * Math.PI * 2;
        const startAngle = currentAngle + padRadians / 2;
        const endAngle = currentAngle + sliceAngle - padRadians / 2;
        currentAngle += sliceAngle;

        const path = buildDonutPath(cx, cy, radius, inner, startAngle, endAngle);

        return <path key={index} d={path} fill={slice.color} />;
      })}
    </g>
  );
}

function buildDonutPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);

  if (innerRadius <= 0) {
    return [
      "M",
      outerStart.x,
      outerStart.y,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArc,
      0,
      outerEnd.x,
      outerEnd.y,
      "L",
      cx,
      cy,
      "Z"
    ].join(" ");
  }

  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);

  return [
    "M",
    outerStart.x,
    outerStart.y,
    "A",
    outerRadius,
    outerRadius,
    0,
    largeArc,
    0,
    outerEnd.x,
    outerEnd.y,
    "L",
    innerStart.x,
    innerStart.y,
    "A",
    innerRadius,
    innerRadius,
    0,
    largeArc,
    1,
    innerEnd.x,
    innerEnd.y,
    "Z"
  ].join(" ");
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

interface LineChartProps<T> {
  data: T[];
  xKey: keyof T;
  margin?: Partial<ChartMargin>;
  children: ReactNode;
}

interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface LineProps<T> {
  dataKey: keyof T;
  stroke?: string;
  strokeWidth?: number;
  dot?: boolean;
}

const LineComponent = <T extends Record<string, unknown>>({}: LineProps<T>) => null;
LineComponent.displayName = "Line";

export const Line = LineComponent as <T extends Record<string, unknown>>(props: LineProps<T>) => null;

export function LineChart<T extends Record<string, unknown>>({
  data,
  xKey,
  margin,
  children
}: LineChartProps<T>) {
  const size = useSize();
  const resolvedMargin: ChartMargin = {
    top: 16,
    right: 16,
    bottom: 28,
    left: 44,
    ...margin
  };

  const innerWidth = Math.max(size.width - resolvedMargin.left - resolvedMargin.right, 1);
  const innerHeight = Math.max(size.height - resolvedMargin.top - resolvedMargin.bottom, 1);

  const lines = useMemo(() => {
    return Children.toArray(children)
      .filter((child): child is ReactElement<LineProps<T>> => isValidElement(child) && child.type === LineComponent)
      .map((child) => child.props);
  }, [children]);

  const yValues = lines.flatMap((line) => data.map((entry) => Number(entry[line.dataKey] ?? 0))).filter((value) => !Number.isNaN(value));

  const yMin = yValues.length ? Math.min(0, ...yValues) : 0;
  const yMax = yValues.length ? Math.max(...yValues) : 1;
  const domainSpan = yMax - yMin || 1;

  const scaleX = (index: number) => {
    if (data.length === 1) {
      return resolvedMargin.left + innerWidth / 2;
    }
    return resolvedMargin.left + (index / (data.length - 1)) * innerWidth;
  };

  const scaleY = (value: number) => {
    return resolvedMargin.top + innerHeight - ((value - yMin) / domainSpan) * innerHeight;
  };

  const xLabels = data.map((entry) => String(entry[xKey] ?? ""));

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, index) => yMin + (domainSpan / yTicks) * index);

  return (
    <svg width={size.width} height={size.height} role="img">
      <title>Line chart</title>
      <g>
        <line
          x1={resolvedMargin.left}
          y1={resolvedMargin.top}
          x2={resolvedMargin.left}
          y2={resolvedMargin.top + innerHeight}
          stroke="#cbd5f5"
          strokeWidth={1}
        />
        <line
          x1={resolvedMargin.left}
          y1={resolvedMargin.top + innerHeight}
          x2={resolvedMargin.left + innerWidth}
          y2={resolvedMargin.top + innerHeight}
          stroke="#cbd5f5"
          strokeWidth={1}
        />
        {tickValues.map((tick) => {
          const y = scaleY(tick);
          return (
            <g key={`grid-${tick}`}>
              <line
                x1={resolvedMargin.left}
                y1={y}
                x2={resolvedMargin.left + innerWidth}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 6"
              />
              <text
                x={resolvedMargin.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="#64748b"
              >
                {Math.round(tick)}
              </text>
            </g>
          );
        })}
        {lines.map((line, lineIndex) => {
          const path = data
            .map((entry, index) => {
              const value = Number(entry[line.dataKey] ?? 0);
              if (Number.isNaN(value)) return null;
              const x = scaleX(index);
              const y = scaleY(value);
              return `${index === 0 ? "M" : "L"}${x},${y}`;
            })
            .filter(Boolean)
            .join(" ");

          const stroke = line.stroke ?? `hsl(${(lineIndex * 70) % 360} 70% 45%)`;

          if (!path) {
            return null;
          }

          return (
            <g key={`line-${lineIndex}`}>
              <path d={path} fill="none" stroke={stroke} strokeWidth={line.strokeWidth ?? 2} strokeLinejoin="round" />
              {line.dot !== false
                ? data.map((entry, index) => {
                    const value = Number(entry[line.dataKey] ?? 0);
                    if (Number.isNaN(value)) return null;
                    const x = scaleX(index);
                    const y = scaleY(value);
                    return <circle key={`dot-${lineIndex}-${index}`} cx={x} cy={y} r={3} fill={stroke} />;
                  })
                : null}
            </g>
          );
        })}
        {xLabels.map((label, index) => {
          const x = scaleX(index);
          return (
            <text key={`label-${index}`} x={x} y={resolvedMargin.top + innerHeight + 18} textAnchor="middle" fontSize={11} fill="#475569">
              {label}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

interface BarChartProps<T> {
  data: T[];
  xKey: keyof T;
  margin?: Partial<ChartMargin>;
  children: ReactNode;
}

interface BarProps<T> {
  dataKey: keyof T;
  fill?: string;
}

const BarComponent = <T extends Record<string, unknown>>({}: BarProps<T>) => null;
BarComponent.displayName = "Bar";

export const Bar = BarComponent as <T extends Record<string, unknown>>(props: BarProps<T>) => null;

export function BarChart<T extends Record<string, unknown>>({ data, xKey, margin, children }: BarChartProps<T>) {
  const size = useSize();
  const resolvedMargin: ChartMargin = {
    top: 16,
    right: 16,
    bottom: 32,
    left: 48,
    ...margin
  };

  const innerWidth = Math.max(size.width - resolvedMargin.left - resolvedMargin.right, 1);
  const innerHeight = Math.max(size.height - resolvedMargin.top - resolvedMargin.bottom, 1);

  const bars = useMemo(() => {
    return Children.toArray(children)
      .filter((child): child is ReactElement<BarProps<T>> => isValidElement(child) && child.type === BarComponent)
      .map((child) => child.props);
  }, [children]);

  const yValues = bars.flatMap((bar) => data.map((entry) => Number(entry[bar.dataKey] ?? 0))).filter((value) => !Number.isNaN(value));

  const yMax = yValues.length ? Math.max(...yValues, 1) : 1;

  const xStep = data.length ? innerWidth / data.length : innerWidth;
  const barWidth = bars.length ? (xStep * 0.6) / bars.length : xStep * 0.6;

  const scaleY = (value: number) => {
    return resolvedMargin.top + innerHeight - (value / yMax) * innerHeight;
  };

  const xLabels = data.map((entry) => String(entry[xKey] ?? ""));

  return (
    <svg width={size.width} height={size.height} role="img">
      <title>Bar chart</title>
      <g>
        <line
          x1={resolvedMargin.left}
          y1={resolvedMargin.top}
          x2={resolvedMargin.left}
          y2={resolvedMargin.top + innerHeight}
          stroke="#cbd5f5"
        />
        <line
          x1={resolvedMargin.left}
          y1={resolvedMargin.top + innerHeight}
          x2={resolvedMargin.left + innerWidth}
          y2={resolvedMargin.top + innerHeight}
          stroke="#cbd5f5"
        />
        {data.map((entry, dataIndex) => {
          const groupX = resolvedMargin.left + dataIndex * xStep + xStep / 2;
          return bars.map((bar, barIndex) => {
            const value = Number(entry[bar.dataKey] ?? 0);
            if (Number.isNaN(value)) return null;
            const x = groupX - (bars.length * barWidth) / 2 + barIndex * barWidth;
            const clampedValue = Math.max(0, value);
            const scaledHeight = (clampedValue / yMax) * innerHeight;
            const y = resolvedMargin.top + innerHeight - scaledHeight;
            const customColor = typeof (entry as Record<string, unknown>).color === "string" ? String((entry as Record<string, unknown>).color) : undefined;
            const fill = bar.fill ?? customColor ?? `hsl(${(barIndex * 80) % 360} 70% 55%)`;

            return <rect key={`bar-${dataIndex}-${barIndex}`} x={x} y={y} width={barWidth} height={scaledHeight} fill={fill} />;
          });
        })}
        {xLabels.map((label, index) => {
          const x = resolvedMargin.left + index * xStep + xStep / 2;
          return (
            <text key={`bar-label-${index}`} x={x} y={resolvedMargin.top + innerHeight + 18} textAnchor="middle" fontSize={11} fill="#475569">
              {label}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

export function Tooltip() {
  return null;
}

export function Legend() {
  return null;
}

export function CartesianGrid() {
  return null;
}

export function XAxis() {
  return null;
}

export function YAxis() {
  return null;
}

