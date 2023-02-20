import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDrop,
  cilHeart,
  cilGraph,
  cilMagnifyingGlass,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Wallet info',
  },
  {
    component: CNavItem,
    name: 'Wallet',
    to: '/walletInfo/wallet',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Wallet explorer',
    to: '/walletInfo/walletExplorer',
    icon: <CIcon icon={cilMagnifyingGlass} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Blockchain info',
  },
  {
    component: CNavItem,
    name: 'Graph',
    to: '/blockchainInfo/graph',
    icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Heatmap',
    to: '/blockchainInfo/heatmap',
    icon: <CIcon icon={cilHeart} customClassName="nav-icon" />,
  },
]

export default _nav
