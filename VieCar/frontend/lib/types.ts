export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  variant: string
  price: number
  specifications: {
    engine: string
    transmission: string
    fuelType: string
    seatingCapacity: number
    mileage: string
    features: string[]
  }
  images: string[]
  availability: "available" | "limited" | "out-of-stock"
  category: "sedan" | "suv" | "hatchback" | "luxury" | "electric"
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth?: string
  preferences: {
    budget: { min: number; max: number }
    preferredBrands: string[]
    vehicleType: string[]
  }
  purchaseHistory: Purchase[]
  testDrives: TestDrive[]
  createdAt: string
  updatedAt: string
}

export interface TestDrive {
  id: string
  customerId: string
  vehicleId: string
  scheduledDate: string
  status: "scheduled" | "completed" | "cancelled"
  feedback?: string
  rating?: number
  createdAt: string
}

export interface Quote {
  id: string
  customerId: string
  vehicleId: string
  basePrice: number
  discounts: { type: string; amount: number }[]
  taxes: number
  totalPrice: number
  validUntil: string
  status: "draft" | "sent" | "accepted" | "expired"
  createdBy: string
  createdAt: string
}

export interface Order {
  id: string
  customerId: string
  vehicleId: string
  quoteId?: string
  orderDate: string
  expectedDelivery: string
  status: "pending" | "confirmed" | "in-production" | "ready" | "delivered" | "cancelled"
  paymentMethod: "cash" | "loan" | "lease"
  paymentStatus: "pending" | "partial" | "completed"
  totalAmount: number
  paidAmount: number
  salesPerson: string
  notes?: string
}

export interface Purchase {
  id: string
  customerId: string
  vehicleId: string
  orderId: string
  purchaseDate: string
  totalAmount: number
  paymentMethod: "cash" | "loan" | "lease"
  warranty: {
    type: string
    duration: string
    expiryDate: string
  }
  deliveryStatus: "pending" | "delivered"
  salesPerson: string
}

export interface Promotion {
  id: string
  title: string
  description: string
  type: "discount" | "cashback" | "trade-in" | "financing"
  value: number
  applicableVehicles: string[]
  startDate: string
  endDate: string
  isActive: boolean
  conditions: string[]
}

export interface Staff {
  id: string
  name: string
  email: string
  role: "dealer-staff" | "dealer-manager" | "admin"
  department: string
  hireDate: string
  isActive: boolean
  permissions: string[]
}

export interface SalesReport {
  period: string
  salesPerson: string
  totalSales: number
  vehiclesSold: number
  revenue: number
  commissions: number
  targets: {
    sales: number
    revenue: number
  }
}

export interface CustomerDebt {
  customerId: string
  customerName: string
  totalDebt: number
  overdueAmount: number
  lastPaymentDate: string
  nextDueDate: string
  status: "current" | "overdue" | "critical"
}

export interface ManufacturerDebt {
  manufacturerId: string
  manufacturerName: string
  totalOwed: number
  pendingOrders: number
  lastPaymentDate: string
  creditLimit: number
  status: "good" | "warning" | "critical"
}
