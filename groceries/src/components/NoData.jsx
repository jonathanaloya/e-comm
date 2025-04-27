import React from 'react'
import noDataImage from '../assets/nodata.png'

function NoData() {
  return (
    <div>
      <div>
        <img src={noDataImage} alt="no data" className='w-36 mx-auto p-4' />
      </div>
    </div>
  )
}

export default NoData