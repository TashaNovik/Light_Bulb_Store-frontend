import { Box, Button, Input, Text, VStack } from '@chakra-ui/react'
import { Field } from '@/components/ui/field'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function PasswordChange() {
  const navigate = useNavigate()
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Пароли не совпадают')
      return
    }
    // Here would be API call to change password
    console.log('Changing password')
    // Navigate to admin dashboard for demo
    navigate('/admin/products')
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
        Изменение пароля
      </Text>
      
      <form onSubmit={handleSubmit}>
        <VStack gap="20px" align="stretch">
          <Field label="Новый пароль" required>
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
              border="1px solid #ddd"
              borderRadius="6px"
              _focus={{
                outline: 'none',
                borderColor: '#79b74a',
                boxShadow: '0 0 0 2px rgba(121, 183, 74, 0.2)'
              }}
            />
          </Field>

          <Field label="Подтвердить новый пароль" required>
            <Input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
            Сохранить
          </Button>
        </VStack>
      </form>
    </Box>
  )
}