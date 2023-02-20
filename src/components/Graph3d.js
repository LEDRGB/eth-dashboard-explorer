/* eslint react/prop-types: 0 */
import React, { useEffect, useCallback } from 'react'
// import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'





import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';

const Graph3d = ({ walletData, getNewWalletData, buildDataUrl, walletPath, setWalletPath }) => {


  const handleNodeClick = useCallback((node, data, walletPath) => {
    node.collapsed = !node.collapsed; // toggle collapse state
    navigator.clipboard.writeText(node.id);
    if (!walletPath.includes(node.id)) {
      setWalletPath([...walletPath, node.id])
      getNewWalletData(node.id, data)
    }
    // setPrunedTree(getPrunedTree())
  }, []);
  function parentWidth(elem) {
    return elem?.clientWidth ? elem?.clientWidth - (elem?.clientWidth * 0.02) : 800;
  }
  console.log(walletData, 'WALLETDATA')

  return (
    <ForceGraph3D
      graphData={walletData}
      linkDirectionalParticles={1}
      nodeColor={(node) => { return node.nodeColor }}
      nodeId="id"
      linkOpacity={2}
      linkWidth={0.2}
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
      backgroundColor={'black'}
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
        const loader = new THREE.TextureLoader()
        const imgTexture = loader.load(buildDataUrl(img));
        const material = new THREE.SpriteMaterial({ map: imgTexture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(img.includes('http') ? 30 : 6, img.includes('http') ? 30 : 6);

        return sprite;
      }}
      width={parentWidth(document.getElementById('graph-container'))}
      height={600}
    />
  )
};

export default Graph3d
