import React, { useState, useEffect } from 'react';

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilPeople,
} from '@coreui/icons'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import { ethers, utils } from 'ethers'



const Dashboard = () => {
  const localProvider = "ws://localhost:8545" 
  const customWsProvider = new ethers.providers.WebSocketProvider(localProvider);

  const [block, setBlock] = useState(0)
  const [blockData, setBlockData] = useState({ transactions: [] })
  const [transactionHistory, setTransactionHistory] = useState([])
  const [rewardHistory, setRewardHistory] = useState({})
  const [traderList, setTraderList] = useState([])
  const [topTradersList, setTopTradersList] = useState([])
  const [rewardedMiners, setRewardedMiners] = useState([{ gas: '' }])
  const [time, setTime] = useState()
  const [blockAndTime, setBlockAndTime] = useState([{ block: '', time: 1 }])

  const MINUTE_MS = 1000;
  useEffect(() => {
    getFirstTransactions()
  }, [])


  useEffect(() => {
    const interval = setInterval(() => {
      getBlock()
    }, MINUTE_MS);

    return () => clearInterval(interval);
  }, [])
  const getBlock = async () => {
    const blocknumber = await customWsProvider.getBlockNumber()
    setBlock(blocknumber)
  }

  useEffect(() => {
    var totalTime = performance.now() - time;

    block && getTransactions(block)
    blockAndTime.push({ block: block, time: totalTime ? totalTime / 1000 : 1 })
    setBlockAndTime(blockAndTime)
    setTime(performance.now())

  }, [block])

  const getTransactions = async (block) => {
    const blockData = await customWsProvider.getBlockWithTransactions(block)
    setBlockData(blockData)
    rewardedMiners.push({ miner: blockData.miner, gas: utils.formatUnits(blockData.gasUsed, 'wei') })
    setRewardedMiners(rewardedMiners)

  }

  useEffect(() => {
    transactionHistory.push({
      blockNumber: block,
      transactionsNum: blockData.transactions?.length
    })
    if (rewardHistory[blockData.miner]) {
      rewardHistory[blockData.miner] = rewardHistory[blockData.miner] + 1
    } else {
      rewardHistory[blockData.miner] = 1
    }
    blockData.transactions.forEach(tx => {
      if (traderList[tx.from]) {
        traderList[tx.from] = traderList[tx.from] + 1
      } else {
        traderList[tx.from] = 1
      }
    })
    setTraderList(traderList)
    setRewardHistory(rewardHistory)
    setTransactionHistory(transactionHistory.map((e) => e))
    findTopTraders(traderList)
  }, [blockData])



  const getFirstTransactions = async () => {
    const firstTrasactionHistory = []
    const firstRewardHistory = {}
    const firstRewardedMiners = []

    const blocknumber = await customWsProvider.getBlockNumber()
    setBlock(blocknumber)
    for (let i = blocknumber - 10;i <= blocknumber;i++) {
      const blockDataTemp = await customWsProvider.getBlockWithTransactions(i)
      firstTrasactionHistory.push({
        blockNumber: i,
        transactionsNum: blockDataTemp.transactions.length
      })
      if (firstRewardHistory[blockDataTemp.miner]) {
        firstRewardHistory[blockDataTemp.miner] = firstRewardHistory[blockDataTemp.miner] + 1
      } else {
        firstRewardHistory[blockDataTemp.miner] = 1
      }
      firstRewardedMiners.push({ miner: blockDataTemp.miner, gas: utils.formatUnits(blockDataTemp.gasUsed, 'wei') })

    }
    setTransactionHistory(firstTrasactionHistory)
    setRewardHistory(firstRewardHistory)
    setRewardedMiners(firstRewardedMiners)


  }
  const findTopTraders = (tradersToShort) => {
    const topTraders = [{ trades: 0 }, { trades: 0 }, { trades: 0 }, { trades: 0 }, { trades: 0 }]
    Object.keys(tradersToShort).forEach((trader) => {
      for (let i = 0;i < 5;i++) {
        if (topTraders[i]?.trades < tradersToShort[trader]) {
          if (!topTraders.slice(0, i).filter((e => e?.trader === trader)).length) {
            for (let j = 4;j > i;j--) {
              topTraders[j] = topTraders[j - 1]
            }
            topTraders[i] = {
              trader: trader,
              trades: tradersToShort[trader]
            }
          }
          i = 5
        }
      }
    })
    setTopTradersList(topTraders)

  }

  return (
    <>
      <WidgetsDropdown blockNumber={block} rewardHistory={rewardHistory} rewardedMiners={rewardedMiners} blockAndTime={blockAndTime} />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Transactions per block
              </h4>
              <div className="small text-medium-emphasis">Live</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Day'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '300px', marginTop: '40px' }}
            data={{
              labels: transactionHistory.map((tx => tx.blockNumber)),
              datasets: [
                {
                  // label: transactionHistory.map((tx => tx.blockNumber)),
                  backgroundColor: hexToRgba(getStyle('--cui-info'), 10),
                  borderColor: getStyle('--cui-info'),
                  pointHoverBackgroundColor: getStyle('--cui-info'),
                  borderWidth: 2,
                  data: transactionHistory.map((tx) => tx.transactionsNum),
                  fill: true,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    drawOnChartArea: false,
                  },
                },
                y: {
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 5,
                    stepSize: Math.ceil(250 / 5),
                    max: 250,
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 4,
                  hoverBorderWidth: 3,
                },
              },
            }}
          />
        </CCardBody>
      </CCard>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Traffic {' & '} Sales</CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell className="text-center">
                      <CIcon icon={cilPeople} />
                    </CTableHeaderCell>
                    <CTableHeaderCell>Top traders</CTableHeaderCell>
                    <CTableHeaderCell>Transactions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {topTradersList.map((item, index) => (
                    <CTableRow v-for="item in tableItems" key={index}>
                      <CTableDataCell className="text-center">
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item.trader}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-medium-emphasis">Tx</div>
                        <strong>{item.trades}</strong>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
