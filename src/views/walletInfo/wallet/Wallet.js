import React, { useEffect, useState } from 'react'
// import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'
/* eslint react/prop-types: 0 */

import { utils } from 'ethers'
import CIcon from '@coreui/icons-react'
import Jazzicon from '@raugfer/jazzicon';

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CRow,
  CForm,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableRow,
  CAvatar,
  CTooltip,
  CWidgetStatsA,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTableHeaderCell,
} from '@coreui/react'
import { CChart } from '@coreui/react-chartjs'

import {
  cilArrowThickFromTop,
  cilArrowThickFromBottom,
} from '@coreui/icons'



const Wallet = () => {
  // const localProvider = "ws://localhost:8545"
  // const customWsProvider = new ethers.providers.WebSocketProvider(localProvider);
  const [actualWallet, setActualWallet] = useState('')
  const [walletData, setWalletData] = useState([])
  const [walletTokensData, setWalletTokensData] = useState([])
  const getEtherscanApi = (wallet) => 'http://api.etherscan.io/api?module=account&action=txlist&address=' + wallet + '&startblock=0&endblock=99999999&sort=asc&apikey=C8SZYF1PPHGBAZU4MYQ3JHHHB8HBSWD475'
  const getEthplorerApi = (wallet) => 'https://api.ethplorer.io/getAddressInfo/' + wallet + '?apiKey=EK-5PW89-XqPNmfb-C9mYE'//EK-5PW89-XqPNmfb-C9mYE'


  useEffect(() => {
    if (actualWallet.length) {
      fetch(getEtherscanApi(actualWallet)).then((respose) => {
        respose.json().then((data) => {
          console.log(data.result)
          setWalletData(data.result.reverse())
        })
      })
      fetch(getEthplorerApi(actualWallet)).then((respose) => {
        respose.json().then((data) => {
          const tokenList = [{
            token: 'ETH',
            rawBalance: data.ETH?.rawBalance,
            decimals: 18,
            actualPrice: data.ETH?.balance * data.ETH?.price.rate,
            actualAmmount: data.ETH?.balance,
            image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=023',
            ...data.ETH?.price,
          }]
          data.tokens?.forEach((token) => {
            if (token.tokenInfo?.price) {
              tokenList.push({
                token: token.tokenInfo.symbol,
                rawBalance: token.rawBalance,
                decimals: token.tokenInfo.decimals,
                actualAmmount: token.rawBalance / Math.pow(10, token.tokenInfo.decimals),
                actualPrice: token.rawBalance * token.tokenInfo.price.rate / Math.pow(10, token.tokenInfo.decimals),
                image: 'https://ethplorer.io' + token.tokenInfo.image,
                ...token.tokenInfo.price,
              })
            }
          })
          setWalletTokensData(tokenList)
          // calculateWalletAmmount(data)
        })
      })
      // getTransactionsByAccount(actualWallet)
    }
  }, [actualWallet])

  function buildDataUrl(address) {
    try {
      return 'data:image/svg+xml;base64,' + btoa(Jazzicon(address));

    } catch (e) {
      console.log(e, address)
    }
    return ''
  }
  console.log(walletData)
  const getTime = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date
  }
  const getTableBody = (data) => {
    let firstDate = ''
    return data.map((item, index) => {
      let dateRow = <></>;
      let itemTime = getTime(item.timeStamp).toDateString()

      if (itemTime !== firstDate) {
        dateRow = (<CTableRow v-for="item in tableItems" key={index * 1000} style={{ color: '#00308F' }}>
          <CTableDataCell>
            <></>
          </CTableDataCell>
          <CTableDataCell>
            <strong>{itemTime}</strong>
          </CTableDataCell>
          <CTableDataCell>
            <></>
          </CTableDataCell>
          <CTableDataCell>
            <></>
          </CTableDataCell>
        </CTableRow>);
        firstDate = itemTime
      }

      return <>
        {dateRow}
        <CTableRow v-for="item in tableItems" key={index + 'tx-table'}>
          <CTableDataCell>
            <strong>{item.from === actualWallet
              ? <CIcon size="xl" icon={cilArrowThickFromBottom} style={{ color: 'red' }} />
              : <CIcon size="xl" icon={cilArrowThickFromTop} style={{ color: 'green' }} />}
            </strong>
          </CTableDataCell>
          <CTableDataCell>
            <strong>{utils.formatEther(item.value) + ' ETH'}</strong>
            <div className="small text-medium-emphasis">{getTime(item.timeStamp).toLocaleTimeString()}</div>
          </CTableDataCell>
          <CTableDataCell>
            <strong>{item.hash}</strong>
          </CTableDataCell>
          <CTableDataCell>
            {item.from === actualWallet
              ? <CTooltip content={item.to}>
                <CAvatar size="md" src={buildDataUrl(item.to)} />
              </CTooltip>
              : <CTooltip content={item.from}>
                <CAvatar size="md" src={buildDataUrl(item.from)} />
              </CTooltip>
            }
          </CTableDataCell>
        </CTableRow>
      </>
    })
  }
  const getTokenTableBody = (tokenList) => {
    console.log(tokenList)
    return tokenList.sort((a, b) => b.actualPrice - a.actualPrice).map((item, index) => {
      return <>
        <CTableRow v-for="item in tableItems" key={index + '-token-table'}>
          <CTableDataCell>
            <strong>
              <CAvatar size="md" src={item.image} />
            </strong>
          </CTableDataCell>
          <CTableDataCell>
            <strong>{item.token}</strong>
            {/* <div className="small text-medium-emphasis">{getTime(item.timeStamp).toLocaleTimeString()}</div> */}
          </CTableDataCell>
          <CTableDataCell>
            <strong>{Math.round(item.actualAmmount * 100000) / 100000}</strong>
          </CTableDataCell>
          <CTableDataCell>
            <strong>{Math.round(item.actualPrice * 100) / 100 + ' $'}</strong>
          </CTableDataCell>
          <CTableDataCell>
            <strong style={{ color: item.diff > 0 ? 'green' : 'red' }}>{item.diff + '%'}</strong>
          </CTableDataCell>
        </CTableRow>
      </>
    })
  }
  var stringToColour = function (str) {
    var hash = 0;
    for (var i = 0;i < str.length;i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0;i < 3;i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }


  return (
    <>
      <CCard className="mb-4">
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
                  setActualWallet(e.target.value)
                }
              }}
            />
          </CForm>

        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol sm={3} lg={6}>
              <CWidgetStatsA
                style={{ height: '100%' }}
                color=""
                value={
                  <>
                    <div>Actual amount:{' '}</div>
                    <span style={{ color: 'green' }}>
                      {(walletTokensData.length ? Math.round(walletTokensData.reduce(
                        (a, b) => a + b.actualPrice,
                        0
                      ) * 100) / 100 : 0) + ' $'}
                    </span>

                  </>
                }

              /><></>
            </CCol>
            <CCol sm={3} lg={6}>
              <CWidgetStatsA
                style={{ height: '100%' }}
                color=""
                value={
                  <>
                  </>
                }
                chart={
                  <CChart
                    type="doughnut"
                    data={{
                      labels: walletTokensData.map(e => e.token),
                      datasets: [
                        {
                          data: walletTokensData.map(e => e.actualPrice),
                          backgroundColor: walletTokensData.map(e => stringToColour(e.token)),
                          borderColor: 'rgba(255,255,255,.55)',
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          grid: {
                            display: false,
                            drawBorder: false,
                          },
                          ticks: {
                            display: false,
                          },
                        },
                        y: {
                          min: 30,
                          max: 89,
                          display: false,
                          grid: {
                            display: false,
                          },
                          ticks: {
                            display: false,
                          },
                        },
                      },
                      elements: {
                        line: {
                          borderWidth: 1,
                          tension: 0.4,
                        },
                        point: {
                          radius: 4,
                          hitRadius: 10,
                          hoverRadius: 4,
                        },
                      },
                    }}
                  />
                }

              /><></>
            </CCol>

          </CRow>
          <CRow>
            <CAccordion flush style={{ paddingTop: '5%' }}>
              <CAccordionItem itemKey={1}>
                <CAccordionHeader>Tokens</CAccordionHeader>
                <CAccordionBody>
                  <CTable align="middle" className="mb-0 border" hover responsive>
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Icon</CTableHeaderCell>
                        {/* <CTableHeaderCell className="text-center">Country</CTableHeaderCell> */}
                        <CTableHeaderCell>Token name</CTableHeaderCell>
                        <CTableHeaderCell>Ammount</CTableHeaderCell>
                        <CTableHeaderCell>Value</CTableHeaderCell>
                        <CTableHeaderCell>Change</CTableHeaderCell>
                        {/* <CTableHeaderCell className="text-center">Payment Method</CTableHeaderCell>
                    <CTableHeaderCell>Activity</CTableHeaderCell> */}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {getTokenTableBody(walletTokensData)}
                    </CTableBody>
                  </CTable>

                </CAccordionBody>
              </CAccordionItem>
              <CAccordionItem itemKey={2}>
                <CAccordionHeader>Transactions</CAccordionHeader>
                <CAccordionBody>
                  <CTable align="middle" className="mb-0 border" hover responsive>
                    <CTableBody>
                      {getTableBody(walletData)}
                    </CTableBody>
                  </CTable>

                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          </CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Wallet
