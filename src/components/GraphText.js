/* eslint react/prop-types: 0 */
import React, { useEffect, useCallback } from 'react'
// import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'





import { ForceGraph2D } from 'react-force-graph';
import * as THREE from 'three';

const Graph2d = ({walletData, getNewWalletData, buildDataUrl, walletPath, setWalletPath }) => {

    

  const handleNodeClick = useCallback((node, data, walletPath) => {
    node.collapsed = !node.collapsed; // toggle collapse state
    navigator.clipboard.writeText(node.id);
    if(!walletPath.includes(node.id)){
      setWalletPath([...walletPath, node.id])
      getNewWalletData(node.id, data)
    }
    // setPrunedTree(getPrunedTree())
  }, []);
  function parentWidth(elem) {
    return elem?.clientWidth ? elem?.clientWidth - (elem?.clientWidth * 0.02): 800;
  }

  return (    
    <ForceGraph2D
      graphData={walletData}
      linkDirectionalParticles={1}
      // nodeColor={(node)=>{ return node.nodeColor  }}
      nodeId="id"
      linkThreeObjectExtend={true}
      onNodeDrag={(node) => {
        node.fx = node.x;
        node.fy = node.y;
      }}
      onNodeDragEnd={(node) => {
        node.fx = node.x;
        node.fy = node.y;
      }}
      onNodeClick={(node) => handleNodeClick(node, walletData, walletPath)}
      backgroundColor={'white'}
      // onNodeHover={(node) => {
      //   if (node) {
      //     setSelectedNode(node.id);
      //   } else {
      //     setSelectedNode(null);
      //   }
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.id;
        const fontSize = 12/globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
    
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
    
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(label, node.x, node.y);
    
        node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
      }}
      nodePointerAreaPaint={(node, color, ctx) => {
        ctx.fillStyle = color;
        const bckgDimensions = node.__bckgDimensions;
        bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
      }}
    
      // }}
      nodeLabel={node => {
        return node.tooltip
      }}
      nodeThreeObject={({ img }) => {
        const imgTexture = new THREE.TextureLoader().load(buildDataUrl(img));
        const material = new THREE.SpriteMaterial({ map: imgTexture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(6, 6);

        return sprite;
      }}
      width={parentWidth(document.getElementById('graph-container'))}
      height={600}
  />
  )
  }

export default Graph2d;