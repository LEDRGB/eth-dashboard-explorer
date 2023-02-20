/* eslint react/prop-types: 0 */
import React, { useEffect, useState, createRef, useMemo, useCallback, useRef } from 'react'
// import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'
import ReactDOM from "react-dom";

import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CRow,
  CCol,
  CForm,
  CButton,
  CButtonGroup,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CSpinner
} from '@coreui/react'
import Graph2d from 'src/components/Graph2d';
import Graph3d from 'src/components/Graph3d';
import GraphText from 'src/components/GraphText';
import Jazzicon from '@raugfer/jazzicon';

const bigWallets = {
  "0xeb2629a2734e272bcc07bda959863f316f4bd4cf": 'Coinbase',
}

const Wallet = () => {
  const [actualWallet, setActualWallet] = useState('')
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodePosition, setNodePosition] = useState({});
  const [walletData, setWalletData] = useState({ nodes: [], links: [] })
  const [dimension, setDimension] = useState('2d');
  const [walletPath, setWalletPath] = useState([])
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletsToLink, setWalletsToLink] = useState({});

  //16

  // const inputBRef = useRef(null);


  const getEtherscanApi = (wallet) => 'http://api.etherscan.io/api?module=account&action=txlist&address=' + wallet + '&startblock=0&endblock=99999999&sort=asc&apikey=C8SZYF1PPHGBAZU4MYQ3JHHHB8HBSWD475'
  useEffect(() => {
    getWalletData()
  }, [actualWallet])

  const getWalletData = () => {
    if (actualWallet.length) {
      setLoading(true)
      fetch(getEtherscanApi(actualWallet)).then((respose) => {
        respose.json().then((data) => {
          // setWalletData(data.result.reverse())
          const nodes = [{ id: actualWallet, img: actualWallet, nodeColor: '#10CB22', tooltip: actualWallet }]
          const links = []
          data.result.forEach((tx) => {
            if (tx.to === actualWallet && !nodes.filter((node) => node.id === tx.from).length) {
              nodes.push({ id: tx.from, img: tx.from, tooltip: tx.from })
              links.push({ target: actualWallet, source: tx.from, direction: 'receive' })
            } else if (tx.from === actualWallet && !nodes.filter((node) => node.id === tx.to).length) {
              nodes.push({ id: tx.to, img: tx.to, tooltip: tx.to })
              links.push({ target: tx.to, source: actualWallet, direction: 'send' })
            }
          })
          setWalletData({ nodes: nodes, links: links })
          setLoading(false)
          console.log({ nodes: nodes, links: links })
        })
      })
    }

  }

  const getNewWalletData = (newWallet, oldData) => {
    if (newWallet && newWallet.length) {
      if (bigWallets[newWallet]) { return }
      setLoading(true)
      fetch(getEtherscanApi(newWallet)).then((respose) => {
        respose.json().then((data) => {
          const nodes = [{ id: newWallet, img: newWallet, nodeColor: '#10CB22', tooltip: bigWallets[newWallet] ? bigWallets[newWallet] : newWallet }]
          const links = []
          data.result.forEach((tx) => {
            if (tx.to === newWallet && !nodes.filter((node) => node.id === tx.from).length) {
              nodes.push({ id: tx.from, img: tx.from, tooltip: bigWallets[tx.from] ? bigWallets[tx.from] : tx.from })
              links.push({ target: tx.to, source: tx.from, direction: 'receive' })
            }
            else if (tx.from === newWallet && !nodes.filter((node) => node.id === tx.to).length) {
              nodes.push({ id: tx.to, img: tx.to, tooltip: bigWallets[tx.to] ? bigWallets[tx.to] : tx.to })
              links.push({ target: tx.to, source: tx.from, direction: 'send' })
            }
          })
          const uniqueNodes = {};
          for (const object of nodes.concat(oldData.nodes.map(e => { return { id: e.id, img: e.img, nodeColor: e.nodeColor, tooltip: e.tooltip } }))) {
            if (!uniqueNodes[object.id]?.nodeColor) {
              uniqueNodes[object.id] = object;
            }
          }
          const uniqueLinks = {};
          console.log(oldData, links, oldData.links.concat(links))
          for (const object of oldData.links.map((e) => { return { target: e.target.id, source: e.source.id, direction: e.direction } }).concat(links)) {
            if (object.target.id) {
              uniqueLinks[object.target.id + '-' + object.source.id] = object;
            } else if (object.target) {
              uniqueLinks[object.target + '-' + object.source] = object;

            }
          }
          const newData = { nodes: Object.values(uniqueNodes), links: Object.values(uniqueLinks) }//Object.values(uniqueLinks)}
          console.log(newData, data)
          setWalletData(newData)
          setLoading(false)

        })
      })
    }
  }
  function buildDataUrl(address) {
    try {
      return 'data:image/svg+xml;base64,' + btoa(Jazzicon(address));

    } catch (e) {
      console.log(e, address)
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

  const pathFinder = async (walletA, walletB, path, deep, counter, transactions) => {
    if (deep === 0) { return [] }
    let walletAData = (await (await fetch(getEtherscanApi(walletA[counter]))).json()).result
    transactions[walletA[counter]] = walletAData
    console.log(walletAData)
    while (walletAData === 'Max rate limit reached') {
      walletAData = (await (await fetch(getEtherscanApi(walletA[counter]))).json()).result
    }
    let filteredWallets = []
    walletAData.forEach(tx => {
      filteredWallets[tx.to] = tx.to
      filteredWallets[tx.from] = tx.from
    })
    filteredWallets = Object.keys(filteredWallets)

    if (filteredWallets.filter((wallet) => wallet === walletB).length) {
      return { path: [...path, walletA[counter], walletB], transactions: transactions }
    }
    else {

      if (counter === (walletA.length - 1)) {
        transactions[walletA[counter]] = walletAData
        return pathFinder(filteredWallets, walletB, [...path, walletA[counter]], deep - 1, 0, transactions)
      } else {
        return pathFinder(walletA, walletB, [...path], deep, counter + 1, transactions)
      }
    }

  }
  const launchPathFinder = async (walletFrom, walletTo) => {
    setLoading(true)
    const paths = await pathFinder([walletFrom], walletTo, [], 3, 0, {}) //'0xf66d585c69fad3dfe0a44610e3919f1379c44cf3'
    console.log(paths, 'PATS')
    const nodes = []
    const links = []
    const getColor = (wallet) => {
      const index = paths.path.indexOf(wallet)
      return index === 0
        ? '#80FB22'
        : index === (paths.path.length - 1)
          ? '#80FB22'
          : ''


    }
    Object.keys(paths.transactions).forEach((txKey) => {
      paths.transactions[txKey].forEach((tx) => {
        if (tx.to === txKey && !nodes.filter((node) => node.id === tx.from).length) {
          if (paths.path.includes(tx.from)) {
            !nodes.filter((e) => e.id === tx.from).length && nodes.push({ id: tx.from, img: tx.from, nodeColor: getColor(tx.from), tooltip: bigWallets[tx.from] ? bigWallets[tx.from] : tx.from })
            !nodes.filter((e) => e.id === tx.to).length && nodes.push({ id: tx.to, img: tx.to, nodeColor: getColor(tx.to), tooltip: bigWallets[tx.to] ? bigWallets[tx.to] : tx.to })
            links.push({ target: txKey, source: tx.from, direction: 'receive' })
          }

        } else if (tx.from === txKey && !nodes.filter((node) => node.id === tx.to).length) {
          if (paths.path.includes(tx.to)) {
            !nodes.filter((e) => e.id === tx.from).length && nodes.push({ id: tx.from, img: tx.from, nodeColor: getColor(tx.from), tooltip: bigWallets[tx.from] ? bigWallets[tx.from] : tx.from })
            !nodes.filter((e) => e.id === tx.to).length && nodes.push({ id: tx.to, img: tx.to, nodeColor: getColor(tx.to), tooltip: bigWallets[tx.to] ? bigWallets[tx.to] : tx.to })
            links.push({ target: tx.to, source: txKey, direction: 'send' })
          }
        }
      })
    })
    setWalletData({ nodes: nodes.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i), links: links })
    setLoading(false)
    console.log({ nodes: nodes.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i), links: links })
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
          <CForm>
            <CFormInput
              type="Wallet"
              id="exampleFormControlInput1"
              label="Wallet"
              placeholder="0x2ccC643F1AD1BB8502873079cBD9e685d674Ade1"
              text="Must be 40 characters long."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setWalletPath([e.target.value])
                  setActualWallet(e.target.value)
                }
              }}
            />
          </CForm>
          <CAccordion flush>
            <CAccordionItem itemKey={1}>
              <CAccordionHeader>Filters</CAccordionHeader>
              <CAccordionBody>
                <CRow xs={{ gutter: 2 }}>
                  <CCol md>
                    <CFormInput
                      id="floatingInputGrid"
                      placeholder="From: 0x2ccC643F1AD1BB8502873079cBD9e685d674Ade1"
                      onChange={(e) => {
                        walletsToLink['from'] = e.target.value
                        setWalletsToLink(walletsToLink)
                      }}
                    />
                  </CCol>
                  <CCol md>
                    <CFormInput
                      id="floatingInputGrid"
                      onChange={(e) => {
                        walletsToLink['to'] = e.target.value
                        setWalletsToLink(walletsToLink)
                      }}
                      placeholder="To: 0x2ccC643F1AD1BB8502873079cBD9e685d674Ade1"
                    />
                  </CCol>
                  <CButton color="primary" variant="outline" defaultChecked onClick={() => { launchPathFinder(walletsToLink.from, walletsToLink.to) }}>Search!</CButton>

                </CRow>
              </CAccordionBody>
            </CAccordionItem>

          </CAccordion>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <div>
              <div onMouseMove={setPosition} id='graph-container'>
                {dimension === '2d'
                  ? <Graph2d
                    walletData={filterWalletData(walletData)}
                    getNewWalletData={getNewWalletData}
                    walletPath={walletPath}
                    buildDataUrl={buildDataUrl}
                    setWalletPath={setWalletPath}

                  />
                  : dimension === '3d'
                    ? <Graph3d
                      walletData={filterWalletData(walletData)}
                      getNewWalletData={getNewWalletData}
                      walletPath={walletPath}
                      buildDataUrl={buildDataUrl}
                      setWalletPath={setWalletPath}
                    />
                    : <GraphText
                      walletData={filterWalletData(walletData)}
                      getNewWalletData={getNewWalletData}
                      walletPath={walletPath}
                      buildDataUrl={buildDataUrl}
                      setWalletPath={setWalletPath}
                    />
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                {loading && <CSpinner />}
                <CButtonGroup role="group" aria-label="Basic example">
                  <CButton color="primary" variant="outline" defaultChecked onClick={() => setDimension('2d')}>2D</CButton>
                  <CButton color="primary" variant="outline" onClick={() => setDimension('3d')}>3D</CButton>
                  <CButton color="primary" variant="outline" onClick={() => setDimension('text')}>Text</CButton>
                </CButtonGroup>
              </div>
            </div>
          </CRow> {/* </div> */}
          {/* <ExpandableGraph graphData={dataNames}/>, */}
          {/* </CRow> */}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Wallet
