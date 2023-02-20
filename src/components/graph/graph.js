/* eslint react/prop-types: 0 */

import React, { useState, useEffect, useRef } from "react";
import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';
// import svg_icons from "./all-svgs";
import ReactDOM from "react-dom";
import { notification } from "antd";
import moment from "moment";

export default function ForceDirectedSignal({ signalData }) {
  const fgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodePosition, setNodePosition] = useState(null);
  const [stopEngine, setStopEngine] = useState(false);
  const [graphData, setGraphData] = useState(signalData);

  const getDate = (data, type) => {
    var timeStr;
    if (type === "relative") {
      timeStr = moment(data).startOf("ymd").fromNow();
    } else if (type === "LongDate") {
      timeStr = moment(
        moment(new Date(data * 1000) / 1000).format("YYYY-MM-DDTHH:mm:ss")
      ).format("D MMM YYYY, h:mm A");
    }

    return timeStr;
  };

  const CopyFunction = (statecopy) => {
    navigator.clipboard.writeText(statecopy);
    notification["info"]({
      placement: "bottomRight",
      duration: 4,
      message: "Copied to clipboard",
      description: "Copied to clipboard"
    });
  };

  // finding node position
  const setPosition = (e) => {
    let position = {};
    position.x = e?.pageX;
    position.y = e?.pageY;
    setNodePosition(position);
  };

  useEffect(() => {
    setGraphData(signalData);
    fgRef.current.d3Force("charge").distanceMax(100);
  }, [graphData]);

  return (
    <div>
      {selectedNode &&
        ReactDOM.createPortal(
          <div
            className="nodeCard"
            style={{
              position: "absolute",
              margin: "2px 0px 2px 0px",
              left: nodePosition?.x,
              top: nodePosition?.y,
              border:
                selectedNode.group === "signal"
                  ? "2px solid #1fb6c7"
                  : selectedNode.group === "target"
                    ? "2px solid #50ba47"
                    : selectedNode.group === "suspect"
                      ? "2px solid #ba4a3d"
                      : selectedNode.group === "compromised"
                        ? "2px solid #40af41"
                        : null
            }}
          >
            {selectedNode.group === "signal" ? (
              <div>
                <div style={{ display: "flex" }}>
                  <span style={{ maxWidth: "200px", wordBreak: "break-word" }}>
                    <strong>{selectedNode.DetectionName.toUpperCase()}</strong>
                  </span>
                  <span
                    className="titleDate"
                    style={{
                      marginRight: "10px"
                    }}
                  >
                    {" - "}
                    {getDate(selectedNode.CNAMTime, "LongDate")}
                  </span>
                  {!selectedNode.current_case && (
                    <span
                      style={{ cursor: "pointer", marginLeft: "auto" }}
                      onClick={() => { }}
                    >
                      <i className="fal fa-folder-plus" />
                    </span>
                  )}
                </div>
                <div className="tacticTechnic">
                  <span
                  // className="hoverElements}
                  >
                    {selectedNode.DetectionTactic.toUpperCase()}
                  </span>{" "}
                  /{" "}
                  <span
                  // className="hoverElements}
                  >
                    {selectedNode.DetectionTechnique}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex" }}>
                  <span style={{ color: "#757575" }}>
                    {selectedNode.group.toUpperCase()}
                  </span>{" "}
                  {!selectedNode.current_case && (
                    <span
                      style={{ cursor: "pointer", marginLeft: "auto" }}
                      onClick={() => { }}
                    >
                      <i className="fal fa-folder-plus" />
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    className="hoverItem"
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      cursor: "pointer"
                    }}
                  >
                    <span
                      className="entityInNode"
                    // onClick={() => {
                    //   if (selectedNode) props.openUserPanel(selectedNode);
                    // }}
                    >
                      {selectedNode.id}
                    </span>
                    <div className="copyToClipboard">
                      <i
                        className="fad fa-copy"
                        onClick={() => CopyFunction(selectedNode.id)}
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
      <div onMouseMove={setPosition}>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          backgroundColor={"#18191d"}
          height={700}
          width={1000}
          nodeId="id"
          autoPauseRedraw={false}
          onNodeHover={(node) => {
            if (node) {
              setSelectedNode(node);
            } else {
              setSelectedNode(null);
            }
          }}
          onNodeClick={(node, event) => {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(6, 1000);
          }}
          onNodeDrag={(node) => {
            node.fx = node.x;
            node.fy = node.y;
          }}
          onNodeDragEnd={(node) => {
            node.fx = node.x;
            node.fy = node.y;
          }}
          nodeCanvasObject={(node, ctx) => {
            const size = 15;
            const img = new Image();
            ctx.beginPath();
            if (node.group !== "signal") {
              const label = node.id;
              const textWidth = ctx.measureText(label).width;
              const bgDimensions = [textWidth, 2].map((n) => n + 10 * 0.2); // for padding
              ctx.fillStyle = "#2d343c"; //background color for tag
              const fillY = node.current_case
                ? node.y - bgDimensions[1] / 2 + 10.5
                : node.y - bgDimensions[1] / 2 + 9.5;
              ctx.fillRect(
                node.x - bgDimensions[0] / 2 + 1.3,
                fillY,
                ...bgDimensions
              );
              const y = node.current_case ? node.y + 11.1 : node.y + 10.1;
              // for text styling
              ctx.font = `3px mukta`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#d3d3d3"; //node.color;
              ctx.fillText(label, node.x + 1.3, y);
            }

            // for highlighting
            const outline = new Image();
            // outline.src = node.current_case === true ? frame : null;
            ctx.drawImage(
              outline,
              node.x - size / 2 - 1.9,
              node.y - size / 2 - 2.8,
              size + 6,
              size + 7
            )
            node.img = img;
            ctx.drawImage(
              img,
              node.x - size / 2,
              node.y - size / 2,
              size + 1,
              size
            );
            return ctx;
          }}
          maxZoom={10}
          onEngineStop={() => {
            if (!stopEngine) {
              fgRef.current.zoomToFit(1000, 50);
              setStopEngine(true);
            }
          }}
          cooldownTicks={100}
          linkColor={(link) => (link.current_case ? "#555" : "#555")}
          linkDirectionalParticles={4}
          linkWidth={(link) => (link.current_case ? 3 : 1)}
          linkDirectionalParticleColor={() => "#ea671b"}
          linkLineDash={(link) => (!link.current_case ? [2, 1] : null)}
          linkDirectionalParticleWidth={(link) =>
            link.current_case === "cases"
              ? 4
              : 1
                ? 3
                : 0
          }
          linkDirectionalParticleSpeed={() => 1 * 0.01}
        />
      </div>
    </div>
  );
}