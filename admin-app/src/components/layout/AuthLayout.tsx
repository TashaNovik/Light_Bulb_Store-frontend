import { Outlet } from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import { useState } from 'react'

export default function AuthLayout() {
  const [lampIcons] = useState(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      top: Math.random() * 90,
      left: Math.random() * 90,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4
    }))
  })

  return (
    <Flex
      direction="column"
      align="center"
      minH="100vh"
      pt="40px"
      bg="#f0f5ec"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative lamp icons */}
      {lampIcons.map(icon => (
        <Box
          key={icon.id}
          position="absolute"
          top={`${icon.top}vh`}
          left={`${icon.left}vw`}
          w="30px"
          h="30px"
          opacity={0.3}
          transform={`rotate(${icon.rotation}deg) scale(${icon.scale})`}
          _before={{
            content: '"💡"',
            position: 'absolute',
            top: 0,
            left: 0,
            fontSize: '24px'
          }}
        />
      ))}

      {/* Logo Header */}
      <Flex align="center" mb="40px">
        <Flex
          align="center"
          justify="center"
          w="30px"
          h="30px"
          bg="#e55335"
          borderRadius="50%"
          color="white"
          fontWeight="bold"
          fontSize="16px"
          mr="8px"
        >
          Л
        </Flex>
        <Box fontSize="24px" fontWeight="bold" color="#e55335">
          лампочка
        </Box>
      </Flex>

      <Outlet />
    </Flex>
  )
}