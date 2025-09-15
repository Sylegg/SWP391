import type { Vehicle, Customer, Staff, Promotion, TestDrive, Quote, Order } from "./types"

export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    brand: "Toyota",
    model: "Camry",
    year: 2024,
    variant: "LE",
    price: 25000,
    specifications: {
      engine: "2.5L 4-Cylinder",
      transmission: "CVT",
      fuelType: "Gasoline",
      seatingCapacity: 5,
      mileage: "32 mpg",
      features: ["Apple CarPlay", "Safety Sense 2.0", "LED Headlights"],
    },
    images: ["/toyota-camry-2024.jpg"],
    availability: "available",
    category: "sedan",
  },
  {
    id: "2",
    brand: "Honda",
    model: "CR-V",
    year: 2024,
    variant: "EX",
    price: 32000,
    specifications: {
      engine: "1.5L Turbo",
      transmission: "CVT",
      fuelType: "Gasoline",
      seatingCapacity: 5,
      mileage: "28 mpg",
      features: ["Honda Sensing", "Sunroof", "Heated Seats"],
    },
    images: ["/honda-cr-v-2024.jpg"],
    availability: "available",
    category: "suv",
  },
  {
    id: "3",
    brand: "BMW",
    model: "3 Series",
    year: 2024,
    variant: "330i",
    price: 45000,
    specifications: {
      engine: "2.0L Twin Turbo",
      transmission: "8-Speed Automatic",
      fuelType: "Gasoline",
      seatingCapacity: 5,
      mileage: "26 mpg",
      features: ["iDrive 8", "Wireless Charging", "Premium Audio"],
    },
    images: ["/bmw-3-series-2024.jpg"],
    availability: "limited",
    category: "luxury",
  },
]

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    phone: "+84 901 234 567",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    preferences: {
      budget: { min: 20000, max: 35000 },
      preferredBrands: ["Toyota", "Honda"],
      vehicleType: ["sedan", "suv"],
    },
    purchaseHistory: [],
    testDrives: [],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    email: "tran.thi.binh@email.com",
    phone: "+84 902 345 678",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    preferences: {
      budget: { min: 40000, max: 60000 },
      preferredBrands: ["BMW", "Mercedes"],
      vehicleType: ["luxury", "suv"],
    },
    purchaseHistory: [],
    testDrives: [],
    createdAt: "2024-02-01T14:30:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
  },
]

export const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Lê Minh Tuấn",
    email: "le.minh.tuan@dealer.com",
    role: "dealer-manager",
    department: "Sales",
    hireDate: "2022-01-15",
    isActive: true,
    permissions: ["view-all", "create-quotes", "manage-staff", "view-reports"],
  },
  {
    id: "2",
    name: "Phạm Thị Lan",
    email: "pham.thi.lan@dealer.com",
    role: "dealer-staff",
    department: "Sales",
    hireDate: "2023-03-20",
    isActive: true,
    permissions: ["view-vehicles", "create-quotes", "manage-customers"],
  },
]

export const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "Khuyến mãi cuối năm",
    description: "Giảm giá 5% cho tất cả xe sedan",
    type: "discount",
    value: 5,
    applicableVehicles: ["1"],
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    isActive: true,
    conditions: ["Áp dụng cho khách hàng mua xe lần đầu"],
  },
]

export const mockTestDrives: TestDrive[] = [
  {
    id: "1",
    customerId: "1",
    vehicleId: "1",
    scheduledDate: "2024-12-20T10:00:00Z",
    status: "scheduled",
    createdAt: "2024-12-15T09:00:00Z",
  },
]

export const mockQuotes: Quote[] = [
  {
    id: "1",
    customerId: "1",
    vehicleId: "1",
    basePrice: 25000,
    discounts: [{ type: "Year-end promotion", amount: 1250 }],
    taxes: 2375,
    totalPrice: 26125,
    validUntil: "2024-12-31",
    status: "sent",
    createdBy: "2",
    createdAt: "2024-12-15T11:00:00Z",
  },
]

export const mockOrders: Order[] = [
  {
    id: "1",
    customerId: "2",
    vehicleId: "3",
    orderDate: "2024-12-10",
    expectedDelivery: "2024-12-25",
    status: "confirmed",
    paymentMethod: "loan",
    paymentStatus: "partial",
    totalAmount: 45000,
    paidAmount: 15000,
    salesPerson: "1",
    notes: "Customer requested black color",
  },
]
