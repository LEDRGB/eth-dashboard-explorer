/* eslint react/prop-types: 0 */
import React, { useEffect, useCallback } from 'react'
// import { CButton } from '@coreui/react'





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
        nodeColor={(node)=>{ return node.nodeColor  }}
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
  };

  export default Graph2d
