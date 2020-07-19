import React from "react";
import { TooltipProps } from "@rowsncolumns/grid";
import { INVALID_COLOR, HYPERLINK_COLOR } from "../constants";
import { Box, Link } from "@chakra-ui/core";
import { CellConfig } from "../Spreadsheet";
import { DATATYPE } from "../types";

export interface TipProps extends TooltipProps, CellConfig {
  valid?: boolean;
  content?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  variant?: TooltipVariant;
  position?: TooltipPosition;
}

export type TooltipPosition = "right" | "left" | "top" | "bottom";
export type TooltipVariant = "error" | "info";

const Tooltip: React.FC<TipProps> = ({
  x = 0,
  y = 0,
  width = 0,
  position = "right",
  scrollLeft = 0,
  scrollTop = 0,
  height = 0,
  valid,
  variant = "info",
  content,
  datatype,
  hyperlink,
  text,
  onMouseEnter,
  onMouseLeave,
}) => {
  const title = valid === false ? "Invalid:" : "";
  const variantColor = variant === "error" ? INVALID_COLOR : "transparent";

  const posX = position === "right" ? x + width - scrollLeft : x - scrollLeft;
  const posY = position === "bottom" ? y + height - scrollTop : y - scrollTop;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${posX}px, ${posY}px)`,
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
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      {datatype === DATATYPE.Hyperlink ? (
        <HyperLink title={text} url={hyperlink} variantColor={variantColor} />
      ) : (
        <Alert title={title} content={content} variantColor={variantColor} />
      )}
    </div>
  );
};

interface TooltipContentProps {
  title?: React.ReactText;
  url?: string;
  content?: string;
  variantColor?: string;
}

const HyperLink: React.FC<TooltipContentProps> = ({ title, url }) => {
  return (
    <>
      <Box mb={1} fontWeight="bold">
        <Link color={HYPERLINK_COLOR} href={url} target="_blank">
          {title}
        </Link>
      </Box>
      <Box color="#666">{url}</Box>
    </>
  );
};

const Alert: React.FC<TooltipContentProps> = ({
  title,
  content,
  variantColor,
}) => {
  return (
    <>
      {title && (
        <Box pb={2} color={variantColor}>
          <strong>{title}</strong>
        </Box>
      )}
      {content}
    </>
  );
};

export default Tooltip;
