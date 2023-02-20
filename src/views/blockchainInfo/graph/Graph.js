/* eslint react/prop-types: 0 */
import React, { useEffect, useState, createRef, useMemo, useCallback, useRef } from 'react'
// import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'
import ReactDOM from "react-dom";




import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
} from '@coreui/react'
import Graph2d from 'src/components/Graph2d';
import Graph3d from 'src/components/Graph3d';
import GraphText from 'src/components/GraphText';
import Jazzicon from '@raugfer/jazzicon';



const bigWallets = {
  "0xeb2629a2734e272bcc07bda959863f316f4bd4cf": 'Coinbase',
}



const Graph = () => {
  const [actualWallet, setActualWallet] = useState('')
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodePosition, setNodePosition] = useState({});
  const [walletData, setWalletData] = useState({ nodes: [], links: [] })
  const [dimension, setDimension] = useState('3d');
  const [walletPath, setWalletPath] = useState([])
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletsToLink, setWalletsToLink] = useState({});

  // const inputBRef = useRef(null);


  const getEtherscanApi = (wallet) => 'http://api.etherscan.io/api?module=account&action=txlist&address=' + wallet + '&startblock=0&endblock=99999999&sort=asc&apikey=C8SZYF1PPHGBAZU4MYQ3JHHHB8HBSWD475'
  const getEthplorerApi = (addr) => 'https://api.ethplorer.io/getTopTokenHolders/' + addr + '?apiKey=EK-5PW89-XqPNmfb-C9mYE&limit=30'

  useEffect(() => {
    getTopTokens()
  }, [])

  const getTopTokens = () => {
    setLoading(true)
    fetch('https://api.ethplorer.io/getTopTokens?apiKey=EK-5PW89-XqPNmfb-C9mYE').then((respose) => {

      respose.json().then((data) => {
        console.log(data)
        getTopHolders(data)
      })
    })



  }

  const getTopHolders = async (topTokens) => {
    const nodes = []
    const links = []
    for (const token of topTokens.tokens) {
      nodes.push({ id: token.address, img: 'https://ethplorer.io' + token.image, tooltip: token.name })
      const holders = await (await fetch(getEthplorerApi(token.address))).json()
      console.log("HOLDERS", holders, token.address)
      holders.holders.forEach((holder) => {
        nodes.push({ id: holder.address, img: 'data:image/svg+xml;base64,' + btoa(Jazzicon(holder.address)), tooltip: holder.address })
        links.push({ target: token.address, source: holder.address, direction: 'send' })
      })
    }
    console.log('FINAL', { nodes: nodes, links: links })
    setWalletData({ nodes: nodes, links: links })
    setLoading(false)

  }

  function buildDataUrl(token) {
    try {
      return token;

    } catch (e) {
      console.log(e, token)
    }
    return ''
  }
  const setPosition = (e) => {
    nodePosition.x = e?.pageX;
    nodePosition.y = e?.pageY;
    setNodePosition(nodePosition);
  };




  const filterWalletData = (walletData) => {
    let filteredData = []
    if (filter === 'receive') {
      walletPath.forEach(wallet => {
        filteredData = [...filteredData, ...walletData.links?.filter((e) => e.target === wallet)]
      })
    }
    else if (filter === 'send') {
      walletPath.forEach(wallet => {
        filteredData = [...filteredData, ...walletData.links?.filter((e) => e.source === wallet)]
      })
    } else {
      return walletData
    }
    return { nodes: walletData.nodes, links: filteredData }
  }




  return (
    <>
      {selectedNode &&
        ReactDOM.createPortal(
          <div
            className="nodeCard"
            style={{
              position: "absolute",
              margin: "2px 0px 2px 0px",
              left: nodePosition?.x,
              top: nodePosition?.y,
              border: "2px solid #1fb6c7",
              backgroundColor: 'white'
            }}
          >
            {selectedNode}
          </div>,
          document.body
        )}
      <CCard className="mb-4" >
        <CCardHeader>
          Blockchain Graph
        </CCardHeader>
        <CCardBody>
          <CRow>
            <div>
              <div onMouseMove={setPosition} id='graph-container'>
                {dimension === '2d'
                  ? <Graph2d
                    walletData={filterWalletData(walletData)}
                    getNewWalletData={() => { }}
                    walletPath={walletPath}
                    buildDataUrl={buildDataUrl}
                    setWalletPath={() => { }}

                  />
                  : dimension === '3d'
                    ? <Graph3d
                      walletData={filterWalletData(walletData)}
                      getNewWalletData={() => { }}
                      walletPath={walletPath}
                      buildDataUrl={buildDataUrl}
                      setWalletPath={() => { }}
                    />
                    : <GraphText
                      walletData={filterWalletData(walletData)}
                      getNewWalletData={() => { }}
                      walletPath={walletPath}
                      buildDataUrl={buildDataUrl}
                      setWalletPath={() => { }}
                    />
                }
              </div>
              {/* <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                {loading && <CSpinner />}
                <CButtonGroup role="group" aria-label="Basic example">
                  <CButton color="primary" variant="outline" onClick={() => setDimension('2d')}>2D</CButton>
                  <CButton color="primary" variant="outline" defaultChecked onClick={() => setDimension('3d')}>3D</CButton>
                  <CButton color="primary" variant="outline" onClick={() => setDimension('text')}>Text</CButton>
                </CButtonGroup>
              </div> */}
            </div>
          </CRow> {/* </div> */}
          {/* <ExpandableGraph graphData={dataNames}/>, */}
          {/* </CRow> */}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Graph
