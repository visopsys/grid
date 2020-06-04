import React, { useEffect, useState, useRef } from "react";
import { Layer, Group, Transformer, Rect } from "react-konva";
import Grid from "./../src";

// More info https://konvajs.org/docs/react/Transformer.html

export default {
  title: "Overlays",
  component: Grid,
};

const Resizable = ({ scrollTop, scrollLeft, isSelected, onSelect }) => {
  const trRef = useRef(null);
  const shapeRef = useRef();
  useEffect(() => {
    if (!isSelected) return;
    trRef.current.attachTo(shapeRef.current);
    trRef.current.getLayer().batchDraw();
  }, [isSelected]);
  const [dimensions, setDimensions] = useState({
    x: 100,
    y: 100,
    width: 100,
    height: 100,
  });
  const x = dimensions.x + scrollLeft;
  const y = dimensions.y + scrollTop;
  return (
    <>
      <Rect
        onMouseDown={onSelect}
        ref={shapeRef}
        draggable
        onDragEnd={(e) => {
          setDimensions((prev) => {
            return {
              ...prev,
              x: e.target.x() - scrollLeft,
              y: e.target.y() - scrollTop,
            };
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          setDimensions({
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
        fill="lightblue"
        stroke="#aaa"
        strokeWidth={1}
        x={x}
        y={y}
        width={dimensions.width}
        height={dimensions.height}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export const CanvasOverlay = () => {
  const App = () => {
    const [isSelected, setIsSelected] = useState(false);
    const handleMouseDown = (e) => {
      // Handle it better, maybe using `ids`
      const clickedOnEmpty = e.target.className !== "Rect";
      if (clickedOnEmpty) setIsSelected(false);
    };
    return (
      <Grid
        rowCount={100}
        columnCount={100}
        stageProps={{
          onMouseDown: handleMouseDown,
        }}
      >
        {({ x, y }) => {
          return (
            <Layer>
              <Resizable
                scrollTop={y}
                scrollLeft={x}
                isSelected={isSelected}
                onSelect={() => {
                  setIsSelected(true);
                }}
              />
            </Layer>
          );
        }}
      </Grid>
    );
  };
  return <App />;
};
