import React, { useEffect, useState, createRef } from 'react'
// import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react'
/* eslint react/prop-types: 0 */

import { ethers, utils } from 'ethers'
import CIcon from '@coreui/icons-react'
import Jazzicon from '@raugfer/jazzicon';
import * as THREE from 'three';

import {
  CCard,
  CCardBody,
  CCardHeader,

} from '@coreui/react'


const HeatMap = () => {

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          Blockchain heatmap
        </CCardHeader>
        <CCardBody style={{ height: '80vh' }}>
          <div style={{ height: '100%' }}>
            <iframe src="https://coin360.com/widget/map?utm_source=embed_map" frameBorder="0" width="100%" height="100%"></iframe>
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}

export default HeatMap
