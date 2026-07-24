import { env } from '../config/env';

const bearerAuth = { bearerAuth: [] as string[] };

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Stop API',
    version: '1.0.0',
    description: 'API za Stop - aplikaciju za automatizaciju porudzbina brze hrane.',
  },
  servers: [
    { url: 'http://localhost:' + env.PORT + '/api', description: 'Lokalni server' },
    { url: 'https://stop-backend-production.up.railway.app/api', description: 'Produkcija (Railway)' },
  ],
  tags: [
    { name: 'Auth', description: 'Registracija i login za kupce i zaposlene' },
    { name: 'Categories', description: 'Kategorije proizvoda' },
    { name: 'Products', description: 'Proizvodi i njihovi modifikatori' },
    { name: 'Addresses', description: 'Adrese kupca za dostavu' },
    { name: 'Orders', description: 'Porudzbine - kreiranje, statusi, otkazivanje' },
    { name: 'Employees', description: 'Zaposleni' },
    { name: 'Notifications', description: 'Notifikacije kupca' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT dobijen kroz /auth/customers/login ili /auth/employees/login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'object' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoryInput: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string' } },
      },
      ProductModifier: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          productId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          price: { type: 'string', example: '1.00' },
        },
      },
      ModifierInput: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string' },
          price: { type: 'number', minimum: 0 },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          categoryId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'string', example: '5.99' },
          imageUrl: { type: 'string', nullable: true },
          isAvailable: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          modifiers: { type: 'array', items: { $ref: '#/components/schemas/ProductModifier' } },
        },
      },
      ProductInput: {
        type: 'object',
        required: ['categoryId', 'name', 'price'],
        properties: {
          categoryId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number', exclusiveMinimum: 0 },
          imageUrl: { type: 'string' },
          isAvailable: { type: 'boolean' },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
          street: { type: 'string' },
          city: { type: 'string' },
          note: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AddressInput: {
        type: 'object',
        required: ['street', 'city'],
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          note: { type: 'string' },
        },
      },
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true },
        },
      },
      RegisterCustomerInput: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          password: { type: 'string', minLength: 8 },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          customer: { $ref: '#/components/schemas/Customer' },
        },
      },
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      EmployeeInput: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      OrderItemModifier: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderItemId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          price: { type: 'string' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          productId: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer' },
          price: { type: 'string' },
          modifiers: { type: 'array', items: { $ref: '#/components/schemas/OrderItemModifier' } },
        },
      },
      OrderStatus: {
        type: 'string',
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'],
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
          addressId: { type: 'string', format: 'uuid', nullable: true },
          orderType: { type: 'string', enum: ['delivery', 'pickup'] },
          status: { $ref: '#/components/schemas/OrderStatus' },
          total: { type: 'string', example: '13.98' },
          createdAt: { type: 'string', format: 'date-time' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          address: { $ref: '#/components/schemas/Address' },
        },
      },
      CreateOrderInput: {
        type: 'object',
        required: ['orderType', 'items'],
        properties: {
          orderType: { type: 'string', enum: ['delivery', 'pickup'] },
          addressId: { type: 'string', format: 'uuid', description: 'Obavezno za orderType=delivery' },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer', minimum: 1 },
                modifierIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
              },
            },
          },
        },
      },
      StatusUpdateInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { $ref: '#/components/schemas/OrderStatus' },
          employeeId: { type: 'string', format: 'uuid' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          message: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Provera da li server radi',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/auth/customers/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registracija novog kupca',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterCustomerInput' } } } },
        responses: {
          '201': { description: 'Kupac kreiran', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '409': errorResponse('Email vec postoji'),
        },
      },
    },
    '/auth/customers/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login kupca',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': errorResponse('Pogresan email ili lozinka'),
        },
      },
    },
    '/auth/employees/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login zaposlenog',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
        responses: {
          '200': { description: 'OK' },
          '401': errorResponse('Pogresan email ili lozinka'),
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Lista kategorija',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } },
      },
      post: {
        tags: ['Categories'],
        summary: 'Kreiranje kategorije',
        security: [bearerAuth],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } },
        responses: { '201': { description: 'Kreirano' }, '401': errorResponse('Nedostaje token') },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Detalji kategorije',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK' }, '404': errorResponse('Nije pronadjeno') },
      },
      put: {
        tags: ['Categories'],
        summary: 'Izmena kategorije',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } },
        responses: { '200': { description: 'OK' }, '401': errorResponse('Nedostaje token') },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Brisanje kategorije',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Obrisano' }, '409': errorResponse('Postoje povezani zapisi') },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Lista dostupnih proizvoda',
        parameters: [{ name: 'categoryId', in: 'query', schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } },
      },
      post: {
        tags: ['Products'],
        summary: 'Kreiranje proizvoda',
        security: [bearerAuth],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { '201': { description: 'Kreirano' }, '404': errorResponse('Kategorija nije pronadjena') },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Detalji proizvoda',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK' }, '404': errorResponse('Nije pronadjeno') },
      },
      put: {
        tags: ['Products'],
        summary: 'Izmena proizvoda',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { '200': { description: 'OK' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Brisanje proizvoda',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Obrisano' }, '409': errorResponse('Postoje povezani zapisi (npr. modifikatori ili porudzbine)') },
      },
    },
    '/products/{productId}/modifiers': {
      post: {
        tags: ['Products'],
        summary: 'Dodavanje modifikatora proizvodu',
        security: [bearerAuth],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ModifierInput' } } } },
        responses: { '201': { description: 'Kreirano' }, '404': errorResponse('Proizvod nije pronadjen') },
      },
    },
    '/products/modifiers/{id}': {
      put: {
        tags: ['Products'],
        summary: 'Izmena modifikatora',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ModifierInput' } } } },
        responses: { '200': { description: 'OK' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Brisanje modifikatora',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Obrisano' } },
      },
    },
    '/addresses': {
      get: {
        tags: ['Addresses'],
        summary: 'Lista adresa ulogovanog kupca',
        security: [bearerAuth],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Address' } } } } } },
      },
      post: {
        tags: ['Addresses'],
        summary: 'Kreiranje adrese',
        security: [bearerAuth],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AddressInput' } } } },
        responses: { '201': { description: 'Kreirano' } },
      },
    },
    '/addresses/{id}': {
      put: {
        tags: ['Addresses'],
        summary: 'Izmena adrese (samo vlasnik)',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AddressInput' } } } },
        responses: { '200': { description: 'OK' }, '404': errorResponse('Adresa nije pronadjena') },
      },
      delete: {
        tags: ['Addresses'],
        summary: 'Brisanje adrese (samo vlasnik)',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'Obrisano' }, '404': errorResponse('Adresa nije pronadjena') },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Lista porudzbina (za dashboard)',
        parameters: [{ name: 'status', in: 'query', schema: { $ref: '#/components/schemas/OrderStatus' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } },
      },
      post: {
        tags: ['Orders'],
        summary: 'Kreiranje porudzbine (kupac)',
        security: [bearerAuth],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderInput' } } } },
        responses: {
          '201': { description: 'Kreirano', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          '400': errorResponse('Neispravni podaci (npr. proizvod nedostupan, modifikator ne pripada proizvodu)'),
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Detalji porudzbine',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK' }, '404': errorResponse('Nije pronadjeno') },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Promena statusa porudzbine (zaposleni)',
        description: 'Dozvoljeni su samo logicni prelazi (npr. pending -> confirmed -> preparing -> ...). Nelogican prelaz vraca 409.',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusUpdateInput' } } } },
        responses: {
          '200': { description: 'OK' },
          '409': errorResponse('Nedozvoljen prelaz statusa'),
        },
      },
    },
    '/orders/{id}/cancel': {
      patch: {
        tags: ['Orders'],
        summary: 'Otkazivanje porudzbine (kupac)',
        description: 'Kupac moze otkazati samo dok je status "pending" ili "confirmed".',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'OK' },
          '404': errorResponse('Porudzbina nije pronadjena'),
          '409': errorResponse('Porudzbina se vise ne moze otkazati'),
        },
      },
    },
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'Lista zaposlenih',
        security: [bearerAuth],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Employee' } } } } } },
      },
      post: {
        tags: ['Employees'],
        summary: 'Dodavanje novog zaposlenog (nema samostalne registracije)',
        security: [bearerAuth],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeInput' } } } },
        responses: { '201': { description: 'Kreirano' }, '409': errorResponse('Email vec postoji') },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Lista notifikacija ulogovanog kupca',
        security: [bearerAuth],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } } },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Obelezavanje notifikacije kao procitane',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK' }, '404': errorResponse('Notifikacija nije pronadjena') },
      },
    },
  },
};
