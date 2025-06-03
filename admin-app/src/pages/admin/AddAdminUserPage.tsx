import { 
  Box, 
  Button, 
  Heading, 
  Input,
  VStack,
  HStack,
  Checkbox
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Field } from '@/components/ui/field'
import { AdminUserService } from '../../services/AdminUserService'

export default function AddAdminUserPage() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords match
    if (admin.password !== admin.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    // Validate required fields
    if (!admin.username || !admin.email || !admin.firstName || !admin.lastName || !admin.password) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await AdminUserService.create({
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        password: admin.password,
        isActive: admin.isActive
      })
      
      navigate('/admin/users')
    } catch (err: any) {
      console.error('Error creating admin:', err)
      setError(err.response?.data?.detail || 'Ошибка при создании администратора')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Heading size="lg" mb="25px" fontWeight="600">
        Новый администратор
      </Heading>

      <form onSubmit={handleSubmit}>
        <Box maxW="600px">
          <VStack gap="20px" align="stretch">
            <Field required label="Логин" fontWeight={600}>
              <Input
                value={admin.username}
                onChange={(e) => setAdmin(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Введите логин"
                border="1px solid #ccc"
                borderRadius="5px"
              />
            </Field>

            <Field required label="Email" fontWeight={600}>
              <Input
                type="email"
                value={admin.email}
                onChange={(e) => setAdmin(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Введите email"
                border="1px solid #ccc"
                borderRadius="5px"
              />
            </Field>

            <Field required label="Имя" fontWeight={600}>
              <Input
                value={admin.firstName}
                onChange={(e) => setAdmin(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Введите имя"
                border="1px solid #ccc"
                borderRadius="5px"
              />
            </Field>

            <Field required label="Фамилия" fontWeight={600}>
              <Input
                value={admin.lastName}
                onChange={(e) => setAdmin(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Введите фамилию"
                border="1px solid #ccc"
                borderRadius="5px"
              />
            </Field>

            <Field required label="Пароль" fontWeight={600}>
              <Input
                type="password"
                value={admin.password}
                onChange={(e) => setAdmin(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Введите пароль"
                border="1px solid #ccc"
                borderRadius="5px"
              />
            </Field>

            <Field required label="Подтвердите пароль" fontWeight={600}>
              <Input
                type="password"
                value={admin.confirmPassword}
                onChange={(e) => setAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Подтвердите пароль"
                border="1px solid #ccc"
                borderRadius="5px"
              />
            </Field>

            <Field label="Статус" fontWeight={600}>
              <Checkbox.Root
                checked={admin.isActive}
                onCheckedChange={(details) => setAdmin(prev => ({ ...prev, isActive: !!details.checked }))}
              >
                <Checkbox.Indicator />
                Активен
              </Checkbox.Root>
            </Field>

            {error && (
              <Box color="red.500" fontSize="sm">
                {error}
              </Box>
            )}
          </VStack>

          <HStack justify="flex-end" mt="30px" gap="10px">
            <Button
              bg="#f0f0f0"
              color="#333"
              border="1px solid #ccc"
              _hover={{ bg: '#e0e0e0' }}
              onClick={() => navigate('/admin/users')}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              bg="#79b74a"
              color="white"
              _hover={{ bg: '#6aa23c' }}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Сохранить'}
            </Button>
          </HStack>
        </Box>
      </form>
    </Box>
  )
}