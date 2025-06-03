import { 
  Box, 
  Button, 
  HStack, 
  VStack,
  Text, 
  Badge,
  Heading,
  Flex,
  Table,
  Card,
  Grid,
  Spinner,
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
  Textarea
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { createListCollection } from '@chakra-ui/react'
import { 
  OrderService,
  type OrderDetails, 
  type OrderStatus, 
  type OrderStatusHistory,
  type OrderStatusUpdateRequest 
} from '../../services/OrderService'

export default function OrderDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>() // Changed from orderId to id to match route
  const [activeTab, setActiveTab] = useState('basic')
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([])
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStatusUpdateForm, setShowStatusUpdateForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [statusNotes, setStatusNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) { // Changed from orderId to id
      loadOrderData()
    }
  }, [id]) // Changed from orderId to id

  const loadOrderData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading order data for ID:', id) // Debug log
      
      // Check if we have authentication tokens
      const tokens = localStorage.getItem('admin_tokens')
      console.log('Auth tokens available:', !!tokens) // Debug log
      
      const [orderData, statusesData] = await Promise.all([
        OrderService.getOrderDetails(id!),
        OrderService.getOrderStatuses().catch(err => {
          console.error('Error loading order statuses:', err)
          // Don't fail the whole request if statuses fail to load
          return []
        })
      ])
      
      console.log('Order data loaded:', orderData) // Debug log
      console.log('Statuses data loaded:', statusesData) // Debug log
      
      setOrderDetails(orderData)
      setOrderStatuses(statusesData)
      
      // Load status history if on history tab
      if (activeTab === 'history') {
        const historyData = await OrderService.getOrderStatusHistory(id!)
        setStatusHistory(historyData)
      }
    } catch (err) {
      console.error('Error loading order data:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных заказа')
    } finally {
      setLoading(false)
    }
  }

  const loadStatusHistory = async () => {
    try {
      const historyData = await OrderService.getOrderStatusHistory(id!) // Changed from orderId to id
      setStatusHistory(historyData)
    } catch (err) {
      console.error('Error loading status history:', err)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'history' && statusHistory.length === 0) {
      loadStatusHistory()
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !id) return
    
    try {
      setUpdating(true)
      setError(null)
      
      const updateRequest: OrderStatusUpdateRequest = {
        status_id: selectedStatus,
        actor_details: 'Admin User', // You can get this from auth context
        notes: statusNotes || undefined
      }
      
      console.log('Updating order status:', updateRequest) // Debug log
      
      // Update the order status
      const updatedOrder = await OrderService.updateOrderStatus(id, updateRequest)
      
      console.log('Order status updated:', updatedOrder) // Debug log
      
      // Update the order details with new status
      setOrderDetails(updatedOrder)
      
      // Refresh status history if on history tab
      if (activeTab === 'history') {
        await loadStatusHistory()
      }
      
      // Reset form
      setShowStatusUpdateForm(false)
      setSelectedStatus('')
      setStatusNotes('')
      
    } catch (err) {
      console.error('Error updating order status:', err)
      setError(err instanceof Error ? err.message : 'Ошибка обновления статуса заказа')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Spinner size="lg" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box bg="red.50" border="1px solid red" borderRadius="md" p={4} color="red.700">
        <Text fontWeight="bold">Ошибка!</Text>
        <Text>{error}</Text>
      </Box>
    )
  }

  if (!orderDetails) {
    return (
      <Box bg="yellow.50" border="1px solid orange" borderRadius="md" p={4} color="orange.700">
        <Text fontWeight="bold">Заказ не найден</Text>
        <Text>Заказ с указанным ID не существует</Text>
      </Box>
    )
  }

  const statusOptions = createListCollection({
    items: orderStatuses.map(status => {
      console.log('Mapping status:', status) // Debug log
      return {
        label: status.name,
        value: status.id
      }
    })
  })

  console.log('Order statuses state:', orderStatuses) // Debug log
  console.log('Status options collection:', statusOptions) // Debug log

  const getStatusBadge = (statusName: string) => {
    console.log('Getting badge for status:', statusName) // Debug log
    const statusColors: Record<string, { bg: string; color: string; border: string }> = {
      'Новый': { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' },
      'Ожидает оплаты': { bg: '#fff1f0', color: '#f5222d', border: '#ffccc7' },
      'В обработке': { bg: '#fffbe6', color: '#faad14', border: '#ffe58f' },
      'Отправлен': { bg: '#f0f5ff', color: '#722ed1', border: '#d3adf7' },
      'Доставлен': { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
      'Отменен': { bg: '#fff1f0', color: '#f5222d', border: '#ffccc7' }
    }
    
    const colors = statusColors[statusName] || statusColors['Новый']
    return (
      <Badge
        px="8px"
        py="4px"
        borderRadius="12px"
        fontSize="12px"
        fontWeight="600"
        bg={colors.bg}
        color={colors.color}
        border={`1px solid ${colors.border}`}
      >
        {statusName}
      </Badge>
    )
  }

  return (
    <Box>
      Header
      <Flex justify="space-between" align="center" mb="25px" pb="15px" borderBottom="1px solid #ddd">
        <VStack align="start" gap="5px">
          <Heading size="lg" fontWeight="600">
            Заказ № {orderDetails.order_number}
          </Heading>
        </VStack>
        <VStack align="end" gap="5px">
          <Text fontSize="sm" color="gray.600">
            от {new Date(orderDetails.created_at).toLocaleDateString('ru-RU')}
          </Text>
          {getStatusBadge(orderDetails.status_ref?.name || 'Неизвестно')}
        </VStack>
      </Flex>

      {/* Tabs */}
      <Box mb="25px" borderBottom="1px solid #ccc">
        <HStack gap={0}>
          <Button
            variant="ghost"
            py="10px"
            px="20px"
            fontSize="16px"
            color={activeTab === 'basic' ? '#79b74a' : '#555'}
            borderBottom={activeTab === 'basic' ? '3px solid #79b74a' : '3px solid transparent'}
            fontWeight={activeTab === 'basic' ? '600' : 'normal'}
            borderRadius={0}
            mb="-1px"
            onClick={() => handleTabChange('basic')}
          >
            Основная информация
          </Button>
          <Button
            variant="ghost"
            py="10px"
            px="20px"
            fontSize="16px"
            color={activeTab === 'products' ? '#79b74a' : '#555'}
            borderBottom={activeTab === 'products' ? '3px solid #79b74a' : '3px solid transparent'}
            fontWeight={activeTab === 'products' ? '600' : 'normal'}
            borderRadius={0}
            mb="-1px"
            onClick={() => handleTabChange('products')}
          >
            Товары в заказе
          </Button>
          <Button
            variant="ghost"
            py="10px"
            px="20px"
            fontSize="16px"
            color={activeTab === 'history' ? '#79b74a' : '#555'}
            borderBottom={activeTab === 'history' ? '3px solid #79b74a' : '3px solid transparent'}
            fontWeight={activeTab === 'history' ? '600' : 'normal'}
            borderRadius={0}
            mb="-1px"
            onClick={() => handleTabChange('history')}
          >
            История статусов заказа
          </Button>
        </HStack>
      </Box>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="30px">
          {/* Customer Notes */}
          <Card.Root>
            <Card.Header>
              <Heading size="md">Примечания клиента</Heading>
            </Card.Header>
            <Card.Body>
              <Text color="gray.600">
                {orderDetails.customer_notes || 'Нет примечаний'}
              </Text>
            </Card.Body>
          </Card.Root>

          {/* Customer Info */}
          <Card.Root>
            <Card.Header>
              <Heading size="md">Информация о клиенте</Heading>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="10px">
                <Text><strong>ФИО:</strong> {orderDetails.customer_name}</Text>
                <Text><strong>Телефон:</strong> {orderDetails.customer_phone}</Text>
                <Text><strong>Email:</strong> {orderDetails.customer_email}</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Delivery Info */}
          <Card.Root>
            <Card.Header>
              <Heading size="md">Информация о доставке</Heading>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="10px">
                <Text><strong>Способ доставки:</strong> {orderDetails.delivery_method_ref?.name || 'Не указан'}</Text>
                {orderDetails.shipping_address && (
                  <>
                    <Text><strong>Адрес:</strong> {`${orderDetails.shipping_address.city}, ${orderDetails.shipping_address.street_address}`}</Text>
                    {orderDetails.shipping_address.apartment && (
                      <Text><strong>Квартира:</strong> {orderDetails.shipping_address.apartment}</Text>
                    )}
                    {orderDetails.shipping_address.address_notes && (
                      <Text><strong>Примечания:</strong> {orderDetails.shipping_address.address_notes}</Text>
                    )}
                  </>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Payment Info */}
          <Card.Root>
            <Card.Header>
              <Heading size="md">Информация об оплате</Heading>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="10px">
                <Text><strong>Способ оплаты:</strong> {orderDetails.payment_detail?.payment_method_ref?.name || 'Не указан'}</Text>
                <Text><strong>Сумма:</strong> {orderDetails.total_amount} {orderDetails.currency}</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>
      )}

      {activeTab === 'products' && (
        <Box bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.05)" borderRadius="md" overflow="hidden">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader fontWeight="600" color="#333">Товар</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="600" color="#333">Цена</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="600" color="#333">Количество</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="600" color="#333">Сумма</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {orderDetails.items.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <Text fontWeight="500">{item.product_snapshot_name}</Text>
                  </Table.Cell>
                  <Table.Cell>{item.product_snapshot_price} {orderDetails.currency}</Table.Cell>
                  <Table.Cell>{item.quantity} шт</Table.Cell>
                  <Table.Cell fontWeight="600">{item.subtotal_amount} {orderDetails.currency}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.Cell colSpan={3} textAlign="right" fontWeight="bold">
                  Итого:
                </Table.Cell>
                <Table.Cell fontWeight="bold">
                  {orderDetails.total_amount} {orderDetails.currency}
                </Table.Cell>
              </Table.Row>
            </Table.Footer>
          </Table.Root>
        </Box>
      )}

      {activeTab === 'history' && (
        <Box>
          <VStack align="stretch" gap="20px">
            {statusHistory
              .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()) // Сортировка: новые вверху
              .map((historyItem, index) => (
                <Box
                  key={historyItem.id}
                  position="relative"
                  borderLeft="3px solid #ccc"
                  pl="20px"
                  _before={{
                    content: `"${statusHistory.length - index}"`, 
                    position: 'absolute',
                    left: '-12px',
                    top: '0',
                    bg: index === 0 ? '#79b74a' : '#ccc', // Первый (самый новый) - зеленый
                    color: 'white',
                    w: '24px',
                    h: '24px',
                    borderRadius: '50%',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <VStack align="start" gap="5px">
                    <HStack gap="10px">
                      <Heading size="sm">{historyItem.status_ref?.name}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(historyItem.changed_at).toLocaleString('ru-RU')}
                      </Text>
                      {index === 0 && ( // Добавить индикатор "текущий статус"
                        <Badge colorScheme="green" size="sm">
                          Текущий
                        </Badge>
                      )}
                    </HStack>
                    {historyItem.actor_details && (
                      <Text fontSize="sm" color="gray.600">Изменил: {historyItem.actor_details}</Text>
                    )}
                    {historyItem.notes && (
                      <Text fontSize="sm" color="gray.600">{historyItem.notes}</Text>
                    )}
                  </VStack>
                </Box>
              ))}
          </VStack>

          <Box mt="20px">
            {!showStatusUpdateForm ? (
              <Button
                bg="#79b74a"
                color="white"
                _hover={{ bg: '#6aa23c' }}
                onClick={() => setShowStatusUpdateForm(true)}
              >
                Изменить статус ▼
              </Button>
            ) : (
              <Card.Root maxW="500px">
                <Card.Header>
                  <Heading size="md">Изменение статуса заказа</Heading>
                </Card.Header>
                <Card.Body>
                  <VStack align="stretch" gap="15px">
                    <Box>
                      <Text mb="8px" fontWeight="500">Новый статус:</Text>
                      <SelectRoot
                        collection={statusOptions}
                        onValueChange={(details) => setSelectedStatus(details.value[0] || '')}
                        size="md"
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((status) => (
                            <SelectItem key={status.id} item={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </Box>
                    
                    <Box>
                      <Text mb="8px" fontWeight="500">Комментарий (необязательно):</Text>
                      <Textarea
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        placeholder="Добавьте комментарий к изменению статуса..."
                        rows={3}
                      />
                    </Box>

                    <HStack gap="10px">
                      <Button
                        bg="#79b74a"
                        color="white"
                        _hover={{ bg: '#6aa23c' }}
                        onClick={handleStatusUpdate}
                        disabled={!selectedStatus || updating}
                        loading={updating}
                      >
                        Сохранить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowStatusUpdateForm(false)
                          setSelectedStatus('')
                          setStatusNotes('')
                        }}
                        disabled={updating}
                      >
                        Отмена
                      </Button>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}
          </Box>
        </Box>
      )}

      {/* Back Button */}
      <Box mt="30px">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/orders')}
        >
          ← Назад к списку заказов
        </Button>
      </Box>
    </Box>
  )
}