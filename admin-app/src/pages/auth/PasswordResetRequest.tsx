import {
    Box, 
    VStack,
    Text,
    Button,
    Input
  } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Field } from '@/components/ui/field'

export default function PasswordResetRequest() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here would be API call to send reset email
    console.log('Sending reset email to:', email)
    // Navigate to password change page for demo
    navigate('/password-change')
  }

  return (
    <Box
      bg="white"
      p="40px"
      borderRadius="8px"
      boxShadow="0 4px 15px rgba(0, 0, 0, 0.1)"
      w="400px"
      textAlign="center"
      zIndex={1}
    >
      <Text fontSize="28px" mb="15px" color="#333" fontWeight="bold">
        Сброс пароля
      </Text>
      <Text fontSize="14px" color="#666" mb="30px" lineHeight="1.6">
        Укажите свой email, под которым вы зарегистрированы на сайте и на него будет отправлена информация о восстановлении пароля.
      </Text>
      
      <form onSubmit={handleSubmit}>
        <VStack gap="20px" align="stretch">
          <Field label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              border="1px solid #ddd"
              borderRadius="6px"
              _focus={{
                outline: 'none',
                borderColor: '#79b74a',
                boxShadow: '0 0 0 2px rgba(121, 183, 74, 0.2)'
              }}
            />
          </Field>
          
          <Button
            type="submit"
            bg="#79b74a"
            color="white"
            w="full"
            py="12px"
            fontSize="16px"
            fontWeight="600"
            borderRadius="6px"
            _hover={{ bg: '#6aa23c' }}
          >
            Отправить
          </Button>
        </VStack>
      </form>
    </Box>
  )
}