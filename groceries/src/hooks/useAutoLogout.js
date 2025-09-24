import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUserDetails } from '../store/userSlice'
import { handleAddItemCart } from '../store/cartProduct'
import toast from 'react-hot-toast'

const useAutoLogout = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const timeoutRef = useRef(null)
  const INACTIVITY_TIME = 30 * 60 * 1000 // 30 minutes

  const logout = () => {
    localStorage.clear()
    dispatch(setUserDetails(null))
    dispatch(handleAddItemCart([]))
    toast.success('Logged out due to inactivity')
    window.location.href = '/login'
  }

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (user?._id) {
      timeoutRef.current = setTimeout(logout, INACTIVITY_TIME)
    }
  }

  useEffect(() => {
    if (user?._id) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true)
      })

      resetTimer()

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true)
        })
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }
  }, [user])

  return null
}

export default useAutoLogout