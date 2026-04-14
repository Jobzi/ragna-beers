import { useState, useEffect } from 'react'
import styles from '../styles/AgeVerification.module.css'

export function AgeVerification({ onVerified }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if already verified in this session
    const isVerified = sessionStorage.getItem('ageVerified')
    if (isVerified === 'true') {
      setIsVisible(false)
      onVerified?.()
    }
  }, [onVerified])

  const handleConfirm = () => {
    setIsAnimating(true)
    sessionStorage.setItem('ageVerified', 'true')
    setTimeout(() => {
      setIsVisible(false)
      onVerified?.()
    }, 400)
  }

  const handleDeny = () => {
    window.location.href = 'https://www.google.com'
  }

  if (!isVisible) return null

  return (
    <div className={`${styles.overlay} ${isAnimating ? styles.fadeOut : ''}`}>
      <div className={`${styles.modal} ${isAnimating ? styles.scaleOut : ''}`}>
        <div className={styles.glow}></div>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <svg 
              className={styles.icon} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          
          <h2 className={styles.title}>Verificación de Edad</h2>
          
          <p className={styles.description}>
            Este sitio contiene información sobre bebidas alcohólicas. 
            Para continuar, confirma que eres mayor de edad.
          </p>
          
          <div className={styles.question}>
            ¿Tienes 18 años o más?
          </div>
          
          <div className={styles.buttons}>
            <button 
              className={styles.buttonPrimary}
              onClick={handleConfirm}
            >
              <span>Sí, soy mayor de edad</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            
            <button 
              className={styles.buttonSecondary}
              onClick={handleDeny}
            >
              No, soy menor de edad
            </button>
          </div>
          
          <p className={styles.disclaimer}>
            Al ingresar, aceptas nuestros términos de uso y confirmas que el consumo de alcohol es legal en tu país.
          </p>
        </div>
        
        <div className={styles.borderGradient}></div>
      </div>
    </div>
  )
}
