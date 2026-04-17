import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="abt.vn" target="_blank" rel="noopener noreferrer">
          TOPHOME
        </a>
        <span className="ms-1">&copy; 2026.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Xây dựng bởi</span>
        <span>Mr.Hùng - 0922.860.999</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
