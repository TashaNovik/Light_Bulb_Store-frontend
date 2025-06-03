import { 
  Box, 
  Button,  
  Heading, 
  Input,
  VStack,
  HStack,
  Text,
  Checkbox
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Field } from '@/components/ui/field'
import { AdminUserService } from '../../services/AdminUserService'

export default function EditAdminUserPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  
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
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!id) {
        navigate('/admin/users')
        return
      }

      try {
        setFetchLoading(true)
        const adminData = await AdminUserService.getById(id)
        setAdmin({
          username: adminData.username,
          email: adminData.email,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          password: '',
          confirmPassword: '',
          isActive: adminData.isActive
        })
      } catch (err) {
        console.error('Error fetching admin:', err)
        setError('Ошибка загрузки данных администратора')
      } finally {
        setFetchLoading(false)
      }
    }

    fetchAdmin()
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!id) return

    // Validate passwords match if password is being changed
    if (admin.password && admin.password !== admin.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    // Validate required fields
    if (!admin.username || !admin.email || !admin.firstName || !admin.lastName) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const updateData: any = {
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isActive: admin.isActive
      }

      // Only include password if it's being changed
      if (admin.password) {
        updateData.password = admin.password
      }

      await AdminUserService.update(id, updateData)
      navigate('/admin/users')
    } catch (err: any) {
      console.error('Error updating admin:', err)
      setError(err.response?.data?.detail || 'Ошибка при обновлении администратора')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <Box>
        <Text>Загрузка...</Text>
      </Box>
    )
  }

  if (error && fetchLoading) {
    return (
      <Box>
        <Text color="red.500">{error}</Text>
        <Button onClick={() => navigate('/admin/users')} mt={4}>Назад к списку</Button>
      </Box>
    )
  }

  return (
    <Box>
      <Heading size="lg" mb="25px" fontWeight="600">
        Редактировать администратора
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

            <Field label="Новый пароль" fontWeight={600}>
              <Input
                type="password"
                value={admin.password}
                onChange={(e) => setAdmin(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Оставьте пустым, если не хотите менять пароль"
                border="1px solid #ccc"
                borderRadius="5px"
              />
              <Text fontSize="sm" color="gray.600" mt="5px">
                Оставьте пустым, если не хотите менять пароль
              </Text>
            </Field>

            <Field label="Подтвердите новый пароль" fontWeight={600}>
              <Input
                type="password"
                value={admin.confirmPassword}
                onChange={(e) => setAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Подтвердите новый пароль"
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
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </HStack>
        </Box>
      </form>
    </Box>
  )
}