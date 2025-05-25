import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CartProvider } from './contexts/CartContext'
import { ChakraProvider } from './components/ui/provider'
import { BrowserRouter } from 'react-router-dom'
import './App.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <CartProvider >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </ChakraProvider>
  </StrictMode>,
)
