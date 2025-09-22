import React, { useEffect, useRef } from 'react'

const ReCaptcha = ({ onVerify, onExpired, onError }) => {
  const recaptchaRef = useRef(null)
  const widgetId = useRef(null)

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render && recaptchaRef.current) {
        // Check if already rendered
        if (widgetId.current !== null) {
          window.grecaptcha.reset(widgetId.current)
          return
        }
        
        // Clear any existing content
        recaptchaRef.current.innerHTML = ''
        
        try {
          widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
            callback: onVerify,
            'expired-callback': onExpired,
            'error-callback': onError
          })
        } catch (error) {
          console.error('reCAPTCHA render error:', error)
        }
      }
    }

    const timer = setTimeout(() => {
      if (window.grecaptcha) {
        loadRecaptcha()
      } else {
        window.addEventListener('load', loadRecaptcha)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (widgetId.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetId.current)
        } catch (error) {
          console.error('reCAPTCHA reset error:', error)
        }
        widgetId.current = null
      }
    }
  }, [])

  return <div ref={recaptchaRef}></div>
}

export default ReCaptcha