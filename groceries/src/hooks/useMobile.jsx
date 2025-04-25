import React, { useEffect, useState } from "react"
const useMobile = ( Breakpoint = 768 ) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < Breakpoint)

    const handleResize = () => {
        const checkpoint = window.innerWidth < Breakpoint
        setIsMobile(checkpoint)
    }

    useEffect(() => {
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])
        

    return [ isMobile ]
}

export default useMobile