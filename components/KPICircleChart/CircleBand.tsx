"use client";

import React, { useEffect, useState } from "react";
import styles from "./CircleBand.module.css";

type SegmentColor =
  | "red"
  | "amber"
  | "yellow"
  | "white"
  | { gradient: [string, string] };

export interface CircleBandProps {
  letter: string;
  segments: number;
  colors: SegmentColor[];
  size?: number | string;
  rotationEnabled?: boolean;
  tooltipRenderer?: (index: number) => React.ReactNode;
  onSegmentClick?: (index: number) => void;
  activeSegment?: number | null;
  setActiveSegment?: (i: number | null) => void;
  direction?: "clockwise" | "anticlockwise";
  startRing?: "outer" | "inner";
  length?: 1 | 2 | 3;
}

const SOLID_COLOR_MAP: Record<string, string> = {
  red: "#e53935",
  amber: "#fb8c00",
  yellow: "#f1c40f",
  white: "#ffffff",
};

export default function CircleBand({
  letter,
  segments,
  colors,
  size = 200,
  rotationEnabled = true,
  tooltipRenderer,
  onSegmentClick,
  activeSegment,
  setActiveSegment,
  direction = "clockwise",
  startRing = "inner",
  length = 1,
}: CircleBandProps) {
  const isNumberSize = typeof size === "number";
  const numericSize = isNumberSize ? size : 400;

  const center = numericSize / 2;
  const borderThickness = Math.max(2, Math.round(numericSize * 0.01));
  const baseStroke = numericSize * 0.18;

  const strokeWidth = length === 1 ? baseStroke * 1.5 : baseStroke;

  let rings = 1;
  let outerCount = segments;
  let innerCount = 0;

  if (length === 2) {
    rings = 2;
    innerCount = Math.ceil(segments / 2);
    outerCount = segments - innerCount;
  } else if (length === 3) {
    rings = 2;
    innerCount = Math.ceil(segments / 3);
    outerCount = segments - innerCount;
  }

  const segmentOrder =
    rings === 2
      ? Array.from({ length: innerCount }, (_, i) => i + outerCount).concat(
          Array.from({ length: outerCount }, (_, i) => i)
        )
      : Array.from({ length: segments }, (_, i) => i);

  const ringThickness = numericSize * 0.16;
  const padding = borderThickness * 2;

  const ringRadii =
    rings === 2
      ? [
          numericSize / 1.6 - padding,
          numericSize / 1.6 - padding - ringThickness,
        ]
      : [numericSize / 1.7];

  const rad = (deg: number) => (Math.PI / 180) * deg;

  return (
    <div
      className={styles.wrapper}
      style={{
        width: isNumberSize ? numericSize + borderThickness * 2 : size,
        height: isNumberSize ? numericSize + borderThickness * 2 : size,
      }}
    >
      <div
        className={
          rotationEnabled
            ? styles.rotateContainer
            : `${styles.rotateContainer} ${styles.noRotate}`
        }
      >
        <svg
          width={isNumberSize ? numericSize : "100%"}
          height={isNumberSize ? numericSize : "100%"}
          viewBox={`0 0 ${numericSize} ${numericSize}`}
          style={{ overflow: "visible" }}
        >
          {/* Borders */}
          <circle
            cx={center}
            cy={center}
            r={ringRadii[0] - borderThickness / 2}
            fill="none"
            stroke="#fff"
            strokeWidth={borderThickness}
            vectorEffect="non-scaling-stroke"
          />
          {rings === 2 && (
            <circle
              cx={center}
              cy={center}
              r={ringRadii[1] + borderThickness / 2}
              fill="none"
              stroke="#fff"
              strokeWidth={borderThickness}
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Center Letter */}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white dark:fill-black"
            style={{
              fontSize: numericSize * 0.42,
              fontWeight: 800,
              pointerEvents: "none",
            }}
          >
            {letter?.toUpperCase?.()}
          </text>

          {segmentOrder.map((i) => {
            let ringIndex = 0;
            if (startRing === "inner") ringIndex = i < outerCount ? 0 : 1;
            else ringIndex = i < innerCount ? 1 : 0;

            let localIndex = 0;
            let countThisRing = 0;

            if (startRing === "inner") {
              if (i < innerCount) {
                ringIndex = 1;
                localIndex = i;
                countThisRing = innerCount;
              } else {
                ringIndex = 0;
                localIndex = i - innerCount;
                countThisRing = outerCount;
              }
            } else {
              if (i < outerCount) {
                ringIndex = 0;
                localIndex = i;
                countThisRing = outerCount;
              } else {
                ringIndex = 1;
                localIndex = i - outerCount;
                countThisRing = innerCount;
              }
            }

            const ringRadius = ringRadii[ringIndex];
            const stroke = strokeWidth * 0.9;
            const innerR = ringRadius - stroke;
            const anglePer = 360 / countThisRing;

            // CLOCKWISE / ANTICLOCKWISE
            let startAngle = localIndex * anglePer - 90;
            let endAngle = (localIndex + 1) * anglePer - 90;
            if (direction === "anticlockwise") {
              startAngle = -startAngle - anglePer - 180;
              endAngle = -endAngle + anglePer - 180;
            }

            // Outer coordinates
            const x0o = center + ringRadius * Math.cos(rad(startAngle));
            const y0o = center + ringRadius * Math.sin(rad(startAngle));
            const x1o = center + ringRadius * Math.cos(rad(endAngle));
            const y1o = center + ringRadius * Math.sin(rad(endAngle));

            // Inner coordinates
            const x0i = center + innerR * Math.cos(rad(endAngle));
            const y0i = center + innerR * Math.sin(rad(endAngle));
            const x1i = center + innerR * Math.cos(rad(startAngle));
            const y1i = center + innerR * Math.sin(rad(startAngle));

            const isGradient = typeof colors[i] === "object";
            const fillId = `grad_${i}`;

            const midAngle = (startAngle + endAngle) / 2;
            const textRadius = (ringRadius + innerR) / 2;
            const mx = center + textRadius * Math.cos(rad(midAngle));
            const my = center + textRadius * Math.sin(rad(midAngle));

            const fgColor =
              colors[i] === "white" || colors[i] === "yellow" ? "#000" : "#fff";

            const arcLength = textRadius * Math.abs(rad(endAngle - startAngle));
            const sliceThickness = ringRadius - innerR;
            const numberFont = Math.round(
              Math.max(
                10,
                Math.min(
                  arcLength * 0.38,
                  sliceThickness * 0.6,
                  numericSize * 0.06
                )
              )
            );

            const isActive = activeSegment === i;

            return (
              <g
                key={i}
                className={`${styles.segment} ${
                  isActive ? styles.segmentActive : ""
                }`}
                onMouseEnter={() => setActiveSegment?.(i)}
                onMouseLeave={() => setActiveSegment?.(null)}
                onClick={() => onSegmentClick?.(i)}
                style={{ cursor: onSegmentClick ? "pointer" : "default" }}
              >
                {isGradient && (
                  <defs>
                    <linearGradient
                      id={fillId}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={(colors[i] as any).gradient[0]}
                      />
                      <stop
                        offset="100%"
                        stopColor={(colors[i] as any).gradient[1]}
                      />
                    </linearGradient>
                  </defs>
                )}

                <path
                  d={`
                    M ${x0o} ${y0o}
                    A ${ringRadius} ${ringRadius} 0 0 1 ${x1o} ${y1o}
                    L ${x0i} ${y0i}
                    A ${innerR} ${innerR} 0 0 0 ${x1i} ${y1i}
                    Z
                  `}
                  fill={
                    isGradient
                      ? `url(#${fillId})`
                      : SOLID_COLOR_MAP[colors[i] as string]
                  }
                  stroke="#222"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />

                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: numberFont,
                    fontWeight: 700,
                    fill: fgColor,
                    pointerEvents: "none",
                  }}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {typeof activeSegment === "number" && tooltipRenderer && (
        <div className={styles.tooltipWrap}>
          <div className={styles.tooltipInner}>
            {tooltipRenderer(activeSegment)}
          </div>
        </div>
      )}
    </div>
  );
}
