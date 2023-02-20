import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Wallet = React.lazy(() => import('./views/walletInfo/wallet/Wallet'))
const WalletExplorer = React.lazy(() => import('./views/walletInfo/walletExplorer/WalletExplorer'))
const HeatMap = React.lazy(() => import('./views/blockchainInfo/heatmap/HeatMap'))
const Graph = React.lazy(() => import('./views/blockchainInfo/graph/Graph'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/walletInfo/wallet', name: 'Wallet', element: Wallet },
  { path: '/walletInfo/walletExplorer', name: 'Wallet Explorer', element: WalletExplorer },
  { path: '/blockchainInfo/heatmap', name: 'Heatmap', element: HeatMap },
  { path: '/blockchainInfo/graph', name: 'Graph', element: Graph },
]

export default routes
