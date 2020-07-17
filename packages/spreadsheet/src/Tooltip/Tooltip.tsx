import React from "react";
import { TooltipProps } from "@rowsncolumns/grid";
import { INVALID_COLOR } from "../constants";
import { Box } from "@chakra-ui/core";

export interface TipProps extends TooltipProps {
  valid?: boolean;
  content?: string;
}

const Tooltip: React.FC<TipProps> = ({ x, y, valid, content }) => {
  const title = valid === false ? "Invalid:" : "";
  const variantColor = INVALID_COLOR;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        maxWidth: 200,
        minWidth: 160,
        background: "white",
        boxShadow: "0 4px 8px 3px rgba(60,64,67,.15)",
        padding: 12,
        borderRadius: 4,
        fontSize: 13,
        borderLeft: `4px ${variantColor} solid`,
        backfaceVisibility: "hidden",
      }}
    >
      {title && (
        <Box pb={2} color={variantColor}>
          <strong>{title}</strong>
        </Box>
      )}
      {content}
    </div>
  );
};

export default Tooltip;
