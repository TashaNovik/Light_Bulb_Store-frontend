import { ColorModeProvider } from "./color-mode"
import { ChakraProvider as Provider, defaultSystem } from "@chakra-ui/react"
import type { ReactNode } from "react"

interface ChakraProviderProps {
  children: ReactNode
}

export function ChakraProvider(props: ChakraProviderProps) {
  return (
    <Provider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </Provider>
  )
}