"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function DashboardSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        width: "100%",
      }}
      aria-busy="true"
      aria-label="Loading accounts dashboard"
    >
      {/* Top Loading Indicator Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: "#141414",
          border: "1px solid #242424",
          borderRadius: "10px",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader2
              size={15}
              style={{ color: "#dbfe01", animation: "spin 1s linear infinite" }}
            />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#ffffff" }}>
            Loading your accounts & quota status...
          </span>
        </div>
        <div
          style={{
            width: "80px",
            height: "10px",
            borderRadius: "99px",
          }}
          className="skeleton-shimmer"
        />
      </div>

      {/* Hero Card Skeleton */}
      <div
        style={{
          backgroundColor: "#171717",
          border: "1px solid #2a2a2a",
          borderRadius: "16px",
          padding: "32px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "350px",
            height: "350px",
            backgroundColor: "rgba(219, 254, 1, 0.03)",
            borderRadius: "50%",
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "140px",
            height: "14px",
            borderRadius: "4px",
          }}
          className="skeleton-shimmer"
        />
        <div
          style={{
            width: "280px",
            height: "34px",
            borderRadius: "8px",
            margin: "2px 0",
          }}
          className="skeleton-shimmer"
        />
        <div
          style={{
            width: "190px",
            height: "16px",
            borderRadius: "4px",
            marginBottom: "8px",
          }}
          className="skeleton-shimmer"
        />
        <div
          style={{
            width: "130px",
            height: "36px",
            borderRadius: "6px",
          }}
          className="skeleton-shimmer"
        />
      </div>

      {/* Stats Row Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#171717",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "12px",
                borderRadius: "4px",
              }}
              className="skeleton-shimmer"
            />
            <div
              style={{
                width: "60px",
                height: "28px",
                borderRadius: "6px",
              }}
              className="skeleton-shimmer"
            />
          </div>
        ))}
      </div>

      {/* Search and Filters Bar Skeleton */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Search Input Placeholder */}
        <div
          style={{
            flex: 1,
            minWidth: "260px",
            height: "38px",
            borderRadius: "8px",
            border: "1px solid #2a2a2a",
          }}
          className="skeleton-shimmer"
        />

        {/* 3 Status Pills */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[45, 75, 65].map((w, idx) => (
            <div
              key={idx}
              style={{
                width: `${w}px`,
                height: "38px",
                borderRadius: "8px",
                border: "1px solid #2a2a2a",
              }}
              className="skeleton-shimmer"
            />
          ))}
        </div>

        {/* Provider Select Placeholder */}
        <div
          style={{
            width: "140px",
            height: "38px",
            borderRadius: "8px",
            border: "1px solid #2a2a2a",
          }}
          className="skeleton-shimmer"
        />

        {/* Sort Select Placeholder */}
        <div
          style={{
            width: "125px",
            height: "38px",
            borderRadius: "8px",
            border: "1px solid #2a2a2a",
          }}
          className="skeleton-shimmer"
        />

        {/* Add Account Button Placeholder */}
        <div
          style={{
            width: "135px",
            height: "38px",
            borderRadius: "8px",
            backgroundColor: "rgba(219, 254, 1, 0.15)",
            border: "1px solid rgba(219, 254, 1, 0.3)",
          }}
        />
      </div>

      {/* Accounts Grid Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#171717",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              minHeight: "200px",
              boxSizing: "border-box",
            }}
          >
            {/* Header: Title + Status Badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "130px",
                      height: "18px",
                      borderRadius: "4px",
                    }}
                    className="skeleton-shimmer"
                  />
                  <div
                    style={{
                      width: "60px",
                      height: "16px",
                      borderRadius: "99px",
                    }}
                    className="skeleton-shimmer"
                  />
                </div>
                <div
                  style={{
                    width: "170px",
                    height: "12px",
                    borderRadius: "4px",
                  }}
                  className="skeleton-shimmer"
                />
              </div>

              {/* Status Badge */}
              <div
                style={{
                  width: "72px",
                  height: "26px",
                  borderRadius: "4px",
                }}
                className="skeleton-shimmer"
              />
            </div>

            {/* Profile Tag & Notes placeholder */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <div
                style={{
                  width: "110px",
                  height: "12px",
                  borderRadius: "4px",
                }}
                className="skeleton-shimmer"
              />
              <div
                style={{
                  width: "85%",
                  height: "12px",
                  borderRadius: "4px",
                  opacity: 0.6,
                }}
                className="skeleton-shimmer"
              />
            </div>

            {/* Action Buttons row */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "auto",
                paddingTop: "12px",
                borderTop: "1px solid #242424",
              }}
            >
              {[1, 2, 3].map((btn) => (
                <div
                  key={btn}
                  style={{
                    flex: 1,
                    height: "34px",
                    borderRadius: "4px",
                  }}
                  className="skeleton-shimmer"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
