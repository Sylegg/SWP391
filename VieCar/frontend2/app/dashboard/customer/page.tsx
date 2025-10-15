"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car, ShoppingCart, Calendar, Clock, History, Star, CreditCard, Truck, MapPin, Phone, ArrowLeft, LogOut, User, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Download, Wallet, Building2, Smartphone, DollarSign, Receipt, AlertCircle, CheckCircle2, FileText, Package, Info, Navigation, MessageSquare, FileDown, Ban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { paymentService } from '@/lib/services/paymentService'
import type { Payment, PaymentStatus } from '@/types/payment'
import { orderService, Order, DeliveryTracking } from "@/lib/services/order-service";

interface TestDrive {
  id: string;
  vehicleModel: string;
  date: string;
  time: string;
  dealership: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

interface PaymentMethodData {
  id: string;
  type: 'credit-card' | 'bank-transfer' | 'e-wallet' | 'cash';
  name: string;
  details: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  orderId: string;
  orderName: string;
  amount: number;
  finalAmount?: number;
  fee?: number;
  discount?: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  date: string;
  description?: string;
  receiptUrl?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branchName?: string;
    transactionRef?: string;
  };
  orderItems?: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

interface InstallmentPlan {
  id: string;
  orderId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  numberOfMonths: number;
  currentPeriod: number;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  nextPaymentDate: string;
  periods: {
    period: number;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    paidDate?: string;
  }[];
}

interface TrackingHistoryPoint {
  location: string;
  status: string;
  note?: string;
  timestamp: string | Date;
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Order State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryTracking, setDeliveryTracking] = useState<DeliveryTracking | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
  const [isContactDealerOpen, setIsContactDealerOpen] = useState(false);
  const [isQuoteRequestOpen, setIsQuoteRequestOpen] = useState(false);
  const [isUpdateAddressOpen, setIsUpdateAddressOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [dealerMessage, setDealerMessage] = useState('');
  const [newDeliveryAddress, setNewDeliveryAddress] = useState('');
  const [quoteRequest, setQuoteRequest] = useState({
    vehicleModel: '',
    preferredColor: '',
    customerNotes: ''
  });

  // Payment State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isInstallmentDialogOpen, setIsInstallmentDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'credit-card' as 'credit-card' | 'bank-transfer' | 'e-wallet' | 'cash',
    name: '',
    details: ''
  });

  const [paymentData, setPaymentData] = useState({
    orderId: 'VF2025001',
    amount: 0,
    paymentMethodId: '',
    description: ''
  });

  // Load order data
  useEffect(() => {
    loadOrders();
  }, []);

  // Load payment data
  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const orderList = await orderService.getOrders();
      setOrders(orderList);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đơn hàng",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadPaymentData = async () => {
    setIsLoadingPayments(true);
    try {
      const [methods, txns, plans] = await Promise.all([
        paymentService.getPaymentMethods(),
        paymentService.getTransactions(),
        paymentService.getInstallmentPlans()
      ]);
      setPaymentMethods(methods);
      setTransactions(txns);
      setInstallmentPlans(plans);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu thanh toán",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPayments(false);
    }
  };

  // Add payment method
  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.name || !newPaymentMethod.details) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin!",
        variant: "destructive"
      });
      return;
    }

    try {
      const method = await paymentService.addPaymentMethod({
        ...newPaymentMethod,
        isDefault: paymentMethods.length === 0
      });
      setPaymentMethods([...paymentMethods, method]);
      setIsAddPaymentMethodOpen(false);
      setNewPaymentMethod({ type: 'credit-card', name: '', details: '' });
      toast({
        title: "Thành công",
        description: "Đã thêm phương thức thanh toán!",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm phương thức thanh toán",
        variant: "destructive"
      });
    }
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await paymentService.deletePaymentMethod(id);
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
      toast({
        title: "Đã xóa",
        description: "Phương thức thanh toán đã được xóa!",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa phương thức thanh toán",
        variant: "destructive"
      });
    }
  };

  // Set default payment method
  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await paymentService.setDefaultPaymentMethod(id);
      setPaymentMethods(paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === id
      })));
      toast({
        title: "Thành công",
        description: "Đã đặt làm phương thức mặc định!",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật",
        variant: "destructive"
      });
    }
  };

  // ===== ORDER HANDLERS =====
  
  // View order detail and load tracking
  const handleViewOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
    
    // Load tracking if order is being delivered
    if (order.status === 'delivering') {
      try {
        const tracking = await orderService.getDeliveryTracking(order.id);
        setDeliveryTracking(tracking);
      } catch (error) {
        console.error('Cannot load tracking:', error);
      }
    }
  };

  // Create quote request
  const handleCreateQuoteRequest = async () => {
    if (!quoteRequest.vehicleModel) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn mẫu xe!",
        variant: "destructive"
      });
      return;
    }

    try {
      const newOrder = await orderService.createQuoteRequest(quoteRequest);
      setOrders([newOrder, ...orders]);
      setIsQuoteRequestOpen(false);
      setQuoteRequest({ vehicleModel: '', preferredColor: '', customerNotes: '' });
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu báo giá! Đại lý sẽ liên hệ sớm.",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi yêu cầu báo giá",
        variant: "destructive"
      });
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do hủy!",
        variant: "destructive"
      });
      return;
    }

    try {
      await orderService.cancelOrder(selectedOrder.id, cancelReason);
      await loadOrders();
      setIsCancelOrderOpen(false);
      setIsOrderDetailOpen(false);
      setCancelReason('');
      toast({
        title: "Đã hủy đơn hàng",
        description: "Đơn hàng đã được hủy thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể hủy đơn hàng",
        variant: "destructive"
      });
    }
  };

  // Update delivery address
  const handleUpdateAddress = async () => {
    if (!selectedOrder || !newDeliveryAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ mới!",
        variant: "destructive"
      });
      return;
    }

    try {
      await orderService.updateDeliveryAddress(selectedOrder.id, newDeliveryAddress);
      await loadOrders();
      setIsUpdateAddressOpen(false);
      setNewDeliveryAddress('');
      toast({
        title: "Thành công",
        description: "Đã cập nhật địa chỉ giao xe",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật địa chỉ",
        variant: "destructive"
      });
    }
  };

  // Contact dealer
  const handleContactDealer = async () => {
    if (!selectedOrder || !dealerMessage) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tin nhắn!",
        variant: "destructive"
      });
      return;
    }

    try {
      await orderService.contactDealer(selectedOrder.id, dealerMessage);
      setIsContactDealerOpen(false);
      setDealerMessage('');
      toast({
        title: "Thành công",
        description: "Tin nhắn đã được gửi đến đại lý",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn",
        variant: "destructive"
      });
    }
  };

  // Download invoice
  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const blob = await orderService.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Thành công",
        description: "Đã tải hóa đơn!",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải hóa đơn",
        variant: "destructive"
      });
    }
  };

  // Download contract
  const handleDownloadContract = async (orderId: string) => {
    try {
      const blob = await orderService.downloadContract(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${orderId}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Thành công",
        description: "Đã tải hợp đồng!",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải hợp đồng",
        variant: "destructive"
      });
    }
  };

  // View tracking
  const handleViewTracking = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const tracking = await orderService.getDeliveryTracking(order.id);
      setDeliveryTracking(tracking);
      setIsTrackingDialogOpen(true);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin vận chuyển",
        variant: "destructive"
      });
    }
  };

  // ===== PAYMENT HANDLERS =====

  // Process payment
  const handleProcessPayment = async () => {
    if (!paymentData.paymentMethodId || !paymentData.amount) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin!",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const transaction = await paymentService.createPayment(paymentData);
      
      if (transaction.status === 'completed') {
        setTransactions([transaction, ...transactions]);
        setIsPaymentDialogOpen(false);
        setPaymentData({ orderId: 'VF2025001', amount: 0, paymentMethodId: '', description: '' });
        toast({
          title: "Thanh toán thành công!",
          description: `Đã thanh toán ${formatCurrency(transaction.amount)}`,
        });
      } else {
        toast({
          title: "Thanh toán thất bại",
          description: "Vui lòng thử lại hoặc chọn phương thức khác",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xử lý thanh toán",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Pay installment
  const handlePayInstallment = async (planId: string, period: number) => {
    const defaultMethod = paymentMethods.find(pm => pm.isDefault);
    if (!defaultMethod) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm phương thức thanh toán!",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const transaction = await paymentService.payInstallment(planId, period, defaultMethod.id);
      
      if (transaction.status === 'completed') {
        setTransactions([transaction, ...transactions]);
        await loadPaymentData(); // Reload to update installment plan
        toast({
          title: "Thanh toán thành công!",
          description: `Đã thanh toán kỳ ${period}`,
        });
      } else {
        toast({
          title: "Thanh toán thất bại",
          description: "Vui lòng thử lại",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xử lý thanh toán",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Download receipt
  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const blob = await paymentService.downloadReceipt(transactionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionId}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Thành công",
        description: "Đã tải biên lai!",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải biên lai",
        variant: "destructive"
      });
    }
  };

  // View transaction details
  const handleViewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDetailOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get payment method icon
  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'credit-card': return <CreditCard className="h-4 w-4" />;
      case 'bank-transfer': return <Building2 className="h-4 w-4" />;
      case 'e-wallet': return <Smartphone className="h-4 w-4" />;
      case 'cash': return <Wallet className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  // Get transaction status badge
  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Đang xử lý</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Thất bại</Badge>;
      case 'refunded':
        return <Badge variant="outline"><ArrowLeft className="w-3 h-3 mr-1" />Đã hoàn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Test Drive State
  const [testDrives, setTestDrives] = useState<TestDrive[]>([
    {
      id: "TD001",
      vehicleModel: "VinFast VF9",
      date: "2025-10-15",
      time: "10:00 AM",
      dealership: "Đại lý VinFast Hà Nội",
      address: "123 Đường Láng, Đống Đa, Hà Nội",
      contactPerson: "Mr. Tuấn",
      contactPhone: "0912345678",
      status: "confirmed",
      notes: "Mang theo giấy phép lái xe"
    },
    {
      id: "TD002",
      vehicleModel: "VinFast VF8",
      date: "2025-10-01",
      time: "02:00 PM",
      dealership: "Đại lý VinFast TP.HCM",
      address: "456 Nguyễn Văn Linh, Quận 7, TP.HCM",
      contactPerson: "Ms. Lan",
      contactPhone: "0987654321",
      status: "completed",
      notes: "Đã hoàn thành"
    },
    {
      id: "TD003",
      vehicleModel: "VinFast VF5",
      date: "2025-09-15",
      time: "09:00 AM",
      dealership: "Đại lý VinFast Đà Nẵng",
      address: "789 Ngũ Hành Sơn, Đà Nẵng",
      contactPerson: "Mr. Nam",
      contactPhone: "0901234567",
      status: "completed"
    }
  ]);

  const [isNewTestDriveOpen, setIsNewTestDriveOpen] = useState(false);
  const [isEditTestDriveOpen, setIsEditTestDriveOpen] = useState(false);
  const [isViewTestDriveOpen, setIsViewTestDriveOpen] = useState(false);
  const [selectedTestDrive, setSelectedTestDrive] = useState<TestDrive | null>(null);
  
  const [newTestDrive, setNewTestDrive] = useState({
    vehicleModel: "",
    date: "",
    time: "",
    dealership: "",
    notes: ""
  });

  const vehicleModels = ["VF3", "VF5", "VF6", "VF7", "VF8", "VF9", "VF e34"];
  const dealerships = [
    { name: "Đại lý VinFast Hà Nội", address: "123 Đường Láng, Đống Đa, Hà Nội", contact: "Mr. Tuấn", phone: "0912345678" },
    { name: "Đại lý VinFast TP.HCM", address: "456 Nguyễn Văn Linh, Quận 7, TP.HCM", contact: "Ms. Lan", phone: "0987654321" },
    { name: "Đại lý VinFast Đà Nẵng", address: "789 Ngũ Hành Sơn, Đà Nẵng", contact: "Mr. Nam", phone: "0901234567" },
    { name: "Đại lý VinFast Cần Thơ", address: "321 Mậu Thân, Ninh Kiều, Cần Thơ", contact: "Ms. Hương", phone: "0909876543" }
  ];

  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  // Create new test drive
  const handleCreateTestDrive = () => {
    if (!newTestDrive.vehicleModel || !newTestDrive.date || !newTestDrive.time || !newTestDrive.dealership) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin!",
        variant: "destructive"
      });
      return;
    }

    const selectedDealership = dealerships.find(d => d.name === newTestDrive.dealership);
    
    const testDrive: TestDrive = {
      id: `TD${String(testDrives.length + 1).padStart(3, '0')}`,
      vehicleModel: `VinFast ${newTestDrive.vehicleModel}`,
      date: newTestDrive.date,
      time: newTestDrive.time,
      dealership: newTestDrive.dealership,
      address: selectedDealership?.address || "",
      contactPerson: selectedDealership?.contact || "",
      contactPhone: selectedDealership?.phone || "",
      status: "pending",
      notes: newTestDrive.notes
    };

    setTestDrives([testDrive, ...testDrives]);
    setIsNewTestDriveOpen(false);
    setNewTestDrive({
      vehicleModel: "",
      date: "",
      time: "",
      dealership: "",
      notes: ""
    });

    toast({
      title: "Thành công",
      description: "Đã tạo lịch lái thử mới!",
    });
  };

  // Edit test drive
  const handleEditTestDrive = () => {
    if (!selectedTestDrive) return;

    setTestDrives(testDrives.map(td => 
      td.id === selectedTestDrive.id ? selectedTestDrive : td
    ));

    setIsEditTestDriveOpen(false);
    toast({
      title: "Thành công",
      description: "Đã cập nhật lịch lái thử!",
    });
  };

  // Cancel test drive
  const handleCancelTestDrive = (id: string) => {
    setTestDrives(testDrives.map(td => 
      td.id === id ? { ...td, status: "cancelled" as const } : td
    ));

    toast({
      title: "Đã hủy",
      description: "Lịch lái thử đã được hủy!",
      variant: "destructive"
    });
  };

  // Delete test drive
  const handleDeleteTestDrive = (id: string) => {
    setTestDrives(testDrives.filter(td => td.id !== id));
    toast({
      title: "Đã xóa",
      description: "Lịch lái thử đã được xóa!",
    });
  };

  // View details
  const handleViewDetails = (testDrive: TestDrive) => {
    setSelectedTestDrive(testDrive);
    setIsViewTestDriveOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (testDrive: TestDrive) => {
    setSelectedTestDrive(testDrive);
    setIsEditTestDriveOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-500">Đã xác nhận</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ xác nhận</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const upcomingCount = testDrives.filter(td => td.status === "confirmed" || td.status === "pending").length;
  const completedCount = testDrives.filter(td => td.status === "completed").length;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute allowedRoles={['Customer']}> 
      <div className="dashboard-shell relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_55%)]" />

        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Trang chủ
                </Button>
              </Link>
              <div>
                <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">VieCar</h2>
                <p className="text-xs text-slate-500">Bảng điều khiển khách hàng</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-indigo-600 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.45)] transition hover:border-indigo-200 hover:from-indigo-500/20 hover:to-sky-500/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="relative z-10 w-full px-4 py-10">
          <div className="mx-auto w-full max-w-7xl space-y-10">
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-indigo-600">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                Khách hàng
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">Bảng điều khiển khách hàng</h1>
              <p className="max-w-2xl text-sm text-slate-600">Chào mừng, {user?.username}! Quản lý lịch hẹn và đơn hàng của bạn.</p>
            </div>

            <div className="space-y-10">

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Lịch lái thử</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{testDrives.length}</div>
                <p className="text-xs text-slate-500 mt-1">{upcomingCount} lịch sắp tới</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Đơn hàng</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">2</div>
                <p className="text-xs text-slate-500 mt-1">1 đang xử lý</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Thanh toán</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <CreditCard className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">1</div>
                <p className="text-xs text-slate-500 mt-1">Chờ thanh toán</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Xe của tôi</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Car className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">1</div>
                <p className="text-xs text-slate-500 mt-1">VinFast VF8</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="vehicles" className="space-y-6">
            <TabsList className="grid w-full gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm grid-cols-5">
              <TabsTrigger value="vehicles" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Xem xe</TabsTrigger>
              <TabsTrigger value="orders" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Đơn hàng</TabsTrigger>
              <TabsTrigger value="test-drives" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Lái thử</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Thanh toán</TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Phản hồi</TabsTrigger>
            </TabsList>

            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <Car className="mr-2 h-5 w-5 text-indigo-600" />
                    Danh mục xe điện
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Xem danh mục, so sánh mẫu xe, cấu hình và giá bán
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9'].map((model, i) => (
                      <div key={i} className="group border border-slate-200 rounded-2xl p-4 hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-3 flex items-center justify-center group-hover:from-indigo-50 group-hover:to-sky-50 transition-all">
                          <Car className="h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <h3 className="font-semibold mb-2 text-slate-900">VinFast {model}</h3>
                        <p className="text-sm text-slate-600 mb-3">
                          Từ ₫{(300 + i * 150)}M
                        </p>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full border-slate-200 hover:border-indigo-300 hover:bg-indigo-50" size="sm">
                            Xem chi tiết
                          </Button>
                          <Button className="w-full bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700" size="sm">
                            Đăng ký lái thử
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                      So sánh các mẫu xe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                        <Package className="mr-2 h-5 w-5 text-indigo-600" />
                        Đơn hàng của tôi
                      </CardTitle>
                      <CardDescription className="text-slate-600 mt-1">
                        Quản lý đơn hàng, theo dõi vận chuyển và yêu cầu báo giá
                      </CardDescription>
                    </div>
                    <Dialog open={isQuoteRequestOpen} onOpenChange={setIsQuoteRequestOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Yêu cầu báo giá
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Tạo yêu cầu báo giá</DialogTitle>
                          <DialogDescription>
                            Gửi yêu cầu báo giá cho mẫu xe bạn quan tâm. Đại lý sẽ liên hệ sớm nhất.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Mẫu xe *</Label>
                            <Select value={quoteRequest.vehicleModel} onValueChange={(value) => setQuoteRequest({...quoteRequest, vehicleModel: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn mẫu xe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="VF3">VinFast VF3</SelectItem>
                                <SelectItem value="VF5">VinFast VF5</SelectItem>
                                <SelectItem value="VF6">VinFast VF6</SelectItem>
                                <SelectItem value="VF7">VinFast VF7</SelectItem>
                                <SelectItem value="VF8">VinFast VF8</SelectItem>
                                <SelectItem value="VF9">VinFast VF9</SelectItem>
                                <SelectItem value="VF e34">VinFast VF e34</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Màu sắc ưa thích</Label>
                            <Input 
                              placeholder="Ví dụ: Đỏ Ruby, Xanh Ocean..."
                              value={quoteRequest.preferredColor}
                              onChange={(e) => setQuoteRequest({...quoteRequest, preferredColor: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ghi chú</Label>
                            <Textarea 
                              placeholder="Yêu cầu đặc biệt hoặc câu hỏi..."
                              value={quoteRequest.customerNotes}
                              onChange={(e) => setQuoteRequest({...quoteRequest, customerNotes: e.target.value})}
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsQuoteRequestOpen(false)}>Hủy</Button>
                          <Button onClick={handleCreateQuoteRequest} className="bg-indigo-600 hover:bg-indigo-700">
                            Gửi yêu cầu
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                      <p className="mt-2 text-sm text-slate-600">Đang tải đơn hàng...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-slate-300" />
                      <h3 className="mt-4 text-lg font-medium text-slate-900">Chưa có đơn hàng</h3>
                      <p className="mt-2 text-sm text-slate-600">Tạo yêu cầu báo giá để bắt đầu</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div 
                          key={order.id}
                          className={`border-l-4 p-4 rounded-r-lg cursor-pointer transition-all hover:shadow-md ${
                            order.status === 'delivering' ? 'border-l-blue-500 bg-blue-50' :
                            order.status === 'completed' ? 'border-l-green-500 bg-green-50' :
                            order.status === 'cancelled' ? 'border-l-red-500 bg-red-50' :
                            order.status === 'quote-request' ? 'border-l-purple-500 bg-purple-50' :
                            'border-l-amber-500 bg-amber-50'
                          }`}
                          onClick={() => handleViewOrderDetail(order)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={
                                  order.status === 'delivering' ? 'bg-blue-600' :
                                  order.status === 'completed' ? 'bg-green-600' :
                                  order.status === 'cancelled' ? 'bg-red-600' :
                                  order.status === 'quote-request' ? 'bg-purple-600' :
                                  'bg-amber-600'
                                }>
                                  {order.status === 'quote-request' ? 'Yêu cầu báo giá' :
                                   order.status === 'quote-sent' ? 'Đã báo giá' :
                                   order.status === 'deposit-pending' ? 'Chờ đặt cọc' :
                                   order.status === 'deposit-paid' ? 'Đã đặt cọc' :
                                   order.status === 'in-production' ? 'Đang sản xuất' :
                                   order.status === 'ready-for-delivery' ? 'Sẵn sàng giao' :
                                   order.status === 'delivering' ? 'Đang vận chuyển' :
                                   order.status === 'completed' ? 'Hoàn thành' :
                                   'Đã hủy'}
                                </Badge>
                                <span className="font-semibold text-sm">#{order.orderNumber}</span>
                              </div>
                              <p className="font-medium text-slate-900">{order.vehicleModel}</p>
                              <p className="text-xs text-slate-600">{order.vehicleConfig.color}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                              {order.remainingAmount > 0 && (
                                <p className="text-xs text-slate-600">Còn: {formatCurrency(order.remainingAmount)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">
                              {new Date(order.createdDate).toLocaleDateString('vi-VN')}
                            </span>
                            {order.status === 'delivering' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTracking(order);
                                }}
                              >
                                <Navigation className="mr-1 h-3 w-3" />
                                Theo dõi
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Test Drives Tab */}
            <TabsContent value="test-drives" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                      Lịch lái thử của tôi
                    </span>
                    <Dialog open={isNewTestDriveOpen} onOpenChange={setIsNewTestDriveOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Đăng ký lái thử mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Đăng ký lái thử mới</DialogTitle>
                          <DialogDescription>
                            Điền thông tin để đăng ký lịch lái thử xe
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="vehicle">Mẫu xe *</Label>
                            <Select value={newTestDrive.vehicleModel} onValueChange={(value) => setNewTestDrive({...newTestDrive, vehicleModel: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn mẫu xe" />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicleModels.map(model => (
                                  <SelectItem key={model} value={model}>VinFast {model}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="dealership">Đại lý *</Label>
                            <Select value={newTestDrive.dealership} onValueChange={(value) => setNewTestDrive({...newTestDrive, dealership: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn đại lý" />
                              </SelectTrigger>
                              <SelectContent>
                                {dealerships.map(dealer => (
                                  <SelectItem key={dealer.name} value={dealer.name}>{dealer.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="date">Ngày *</Label>
                              <Input 
                                id="date" 
                                type="date" 
                                value={newTestDrive.date}
                                onChange={(e) => setNewTestDrive({...newTestDrive, date: e.target.value})}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="time">Giờ *</Label>
                              <Select value={newTestDrive.time} onValueChange={(value) => setNewTestDrive({...newTestDrive, time: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn giờ" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeSlots.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="notes">Ghi chú</Label>
                            <Textarea 
                              id="notes" 
                              placeholder="Thông tin thêm..."
                              value={newTestDrive.notes}
                              onChange={(e) => setNewTestDrive({...newTestDrive, notes: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsNewTestDriveOpen(false)}>Hủy</Button>
                          <Button onClick={handleCreateTestDrive}>Đăng ký</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Đăng ký lái thử, theo dõi trạng thái lịch hẹn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upcoming Test Drives */}
                  {testDrives.filter(td => td.status === "confirmed" || td.status === "pending").length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Lịch sắp tới</h4>
                      {testDrives
                        .filter(td => td.status === "confirmed" || td.status === "pending")
                        .map(testDrive => (
                          <div key={testDrive.id} className={`border-l-4 ${testDrive.status === "confirmed" ? "border-l-blue-500 bg-blue-50" : "border-l-yellow-500 bg-yellow-50"} p-4 rounded-r-lg`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusBadge(testDrive.status)}
                                  <p className="font-semibold">{testDrive.vehicleModel}</p>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(testDrive.date).toLocaleDateString('vi-VN')} - {testDrive.time}
                                  </p>
                                  <p className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {testDrive.dealership}
                                  </p>
                                  <p className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Liên hệ: {testDrive.contactPhone} ({testDrive.contactPerson})
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(testDrive)}>
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </Button>
                              {testDrive.status === "pending" && (
                                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(testDrive)}>
                                  <Edit className="w-4 h-4 mr-1" />
                                  Sửa
                                </Button>
                              )}
                              {(testDrive.status === "pending" || testDrive.status === "confirmed") && (
                                <Button variant="destructive" size="sm" onClick={() => handleCancelTestDrive(testDrive.id)}>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Hủy
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Past Test Drives */}
                  {(testDrives.filter(td => td.status === "completed" || td.status === "cancelled").length > 0) && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Lịch sử lái thử</h4>
                      {testDrives
                        .filter(td => td.status === "completed" || td.status === "cancelled")
                        .map(testDrive => (
                          <div key={testDrive.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{testDrive.vehicleModel}</p>
                                {getStatusBadge(testDrive.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {testDrive.dealership} - {new Date(testDrive.date).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(testDrive)}>
                                <Eye className="w-4 h-4 mr-1" />
                                Xem
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTestDrive(testDrive.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {testDrives.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có lịch lái thử nào</p>
                      <p className="text-sm">Nhấn nút "Đăng ký lái thử mới" để bắt đầu</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* View Test Drive Dialog */}
              <Dialog open={isViewTestDriveOpen} onOpenChange={setIsViewTestDriveOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Chi tiết lịch lái thử</DialogTitle>
                    <DialogDescription>
                      Mã lịch: {selectedTestDrive?.id}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedTestDrive && (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Trạng thái</Label>
                        {getStatusBadge(selectedTestDrive.status)}
                      </div>
                      <div className="grid gap-2">
                        <Label>Mẫu xe</Label>
                        <p className="font-medium">{selectedTestDrive.vehicleModel}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Ngày</Label>
                          <p>{new Date(selectedTestDrive.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="grid gap-2">
                          <Label>Giờ</Label>
                          <p>{selectedTestDrive.time}</p>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Đại lý</Label>
                        <p className="font-medium">{selectedTestDrive.dealership}</p>
                        <p className="text-sm text-muted-foreground">{selectedTestDrive.address}</p>
                      </div>
                      <div className="grid gap-2">
                        <Label>Người liên hệ</Label>
                        <p>{selectedTestDrive.contactPerson} - {selectedTestDrive.contactPhone}</p>
                      </div>
                      {selectedTestDrive.notes && (
                        <div className="grid gap-2">
                          <Label>Ghi chú</Label>
                          <p className="text-sm">{selectedTestDrive.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsViewTestDriveOpen(false)}>Đóng</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Test Drive Dialog */}
              <Dialog open={isEditTestDriveOpen} onOpenChange={setIsEditTestDriveOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa lịch lái thử</DialogTitle>
                    <DialogDescription>
                      Cập nhật thông tin lịch lái thử
                    </DialogDescription>
                  </DialogHeader>
                  {selectedTestDrive && (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Mẫu xe</Label>
                        <Input value={selectedTestDrive.vehicleModel} disabled />
                      </div>
                      <div className="grid gap-2">
                        <Label>Đại lý</Label>
                        <Select 
                          value={selectedTestDrive.dealership} 
                          onValueChange={(value) => {
                            const dealer = dealerships.find(d => d.name === value);
                            setSelectedTestDrive({
                              ...selectedTestDrive, 
                              dealership: value,
                              address: dealer?.address || "",
                              contactPerson: dealer?.contact || "",
                              contactPhone: dealer?.phone || ""
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dealerships.map(dealer => (
                              <SelectItem key={dealer.name} value={dealer.name}>{dealer.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Ngày</Label>
                          <Input 
                            type="date" 
                            value={selectedTestDrive.date}
                            onChange={(e) => setSelectedTestDrive({...selectedTestDrive, date: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Giờ</Label>
                          <Select 
                            value={selectedTestDrive.time} 
                            onValueChange={(value) => setSelectedTestDrive({...selectedTestDrive, time: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Ghi chú</Label>
                        <Textarea 
                          value={selectedTestDrive.notes || ""}
                          onChange={(e) => setSelectedTestDrive({...selectedTestDrive, notes: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditTestDriveOpen(false)}>Hủy</Button>
                    <Button onClick={handleEditTestDrive}>Lưu thay đổi</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              {/* Payment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">Tổng chi tiêu</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {transactions.filter(t => t.status === 'completed').length} giao dịch
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-yellow-50 to-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">Chờ thanh toán</CardTitle>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(1200000000 - transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Hạn: 20/10/2025</p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-green-50 to-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">Trả góp</CardTitle>
                    <Receipt className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{installmentPlans.length}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      {installmentPlans.filter(p => p.status === 'active').length} kế hoạch đang hoạt động
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Payment */}
              <Card className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-[0_25px_45px_-30px_rgba(79,70,229,0.3)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <CreditCard className="mr-2 h-5 w-5 text-indigo-600" />
                    Thanh toán nhanh
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Thanh toán đơn hàng VF2025001
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border-l-4 border-l-yellow-500 bg-yellow-50 rounded-r-lg">
                    <div className="flex-1">
                      <p className="font-semibold mb-1">VinFast VF8 Plus</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(1200000000 - transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Số tiền còn lại</p>
                    </div>
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700"
                          onClick={() => setPaymentData({
                            ...paymentData,
                            amount: 1200000000 - transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
                          })}
                        >
                          <DollarSign className="mr-2 h-5 w-5" />
                          Thanh toán ngay
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Xác nhận thanh toán</DialogTitle>
                          <DialogDescription>
                            Chọn phương thức thanh toán và xác nhận
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Số tiền thanh toán</Label>
                            <Input
                              type="number"
                              value={paymentData.amount}
                              onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                              placeholder="Nhập số tiền"
                            />
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(paymentData.amount)}
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <Label>Phương thức thanh toán</Label>
                            <Select 
                              value={paymentData.paymentMethodId} 
                              onValueChange={(value) => setPaymentData({...paymentData, paymentMethodId: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn phương thức" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map(method => (
                                  <SelectItem key={method.id} value={method.id}>
                                    <div className="flex items-center gap-2">
                                      {getPaymentMethodIcon(method.type)}
                                      <span>{method.name}</span>
                                      {method.isDefault && <Badge variant="secondary" className="text-xs">Mặc định</Badge>}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {paymentMethods.length === 0 && (
                              <p className="text-sm text-red-500">Vui lòng thêm phương thức thanh toán trước</p>
                            )}
                          </div>
                          <div className="grid gap-2">
                            <Label>Ghi chú (tùy chọn)</Label>
                            <Textarea
                              value={paymentData.description}
                              onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                              placeholder="Nhập ghi chú..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} disabled={isProcessingPayment}>
                            Hủy
                          </Button>
                          <Button onClick={handleProcessPayment} disabled={isProcessingPayment || paymentMethods.length === 0}>
                            {isProcessingPayment ? "Đang xử lý..." : "Xác nhận thanh toán"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <Wallet className="mr-2 h-5 w-5 text-indigo-600" />
                      Phương thức thanh toán
                    </span>
                    <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm mới
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Thêm phương thức thanh toán</DialogTitle>
                          <DialogDescription>
                            Thêm thẻ tín dụng, tài khoản ngân hàng hoặc ví điện tử
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Loại phương thức</Label>
                            <Select 
                              value={newPaymentMethod.type} 
                              onValueChange={(value: any) => setNewPaymentMethod({...newPaymentMethod, type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="credit-card">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Thẻ tín dụng/ghi nợ
                                  </div>
                                </SelectItem>
                                <SelectItem value="bank-transfer">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Chuyển khoản ngân hàng
                                  </div>
                                </SelectItem>
                                <SelectItem value="e-wallet">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    Ví điện tử
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Tên hiển thị</Label>
                            <Input
                              value={newPaymentMethod.name}
                              onChange={(e) => setNewPaymentMethod({...newPaymentMethod, name: e.target.value})}
                              placeholder={
                                newPaymentMethod.type === 'credit-card' ? 'VD: Visa **** 4242' :
                                newPaymentMethod.type === 'bank-transfer' ? 'VD: Techcombank' :
                                'VD: MoMo'
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Thông tin chi tiết</Label>
                            <Input
                              value={newPaymentMethod.details}
                              onChange={(e) => setNewPaymentMethod({...newPaymentMethod, details: e.target.value})}
                              placeholder={
                                newPaymentMethod.type === 'credit-card' ? 'VD: Hết hạn 12/2026' :
                                newPaymentMethod.type === 'bank-transfer' ? 'VD: 1234567890' :
                                'VD: 0912345678'
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddPaymentMethodOpen(false)}>Hủy</Button>
                          <Button onClick={handleAddPaymentMethod}>Thêm phương thức</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Quản lý các phương thức thanh toán của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPayments ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                      <p>Đang tải...</p>
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có phương thức thanh toán</p>
                      <p className="text-sm">Nhấn "Thêm mới" để bắt đầu</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map(method => (
                        <div 
                          key={method.id} 
                          className={`p-4 border rounded-xl ${method.isDefault ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'} hover:shadow-lg transition`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${method.isDefault ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                {getPaymentMethodIcon(method.type)}
                              </div>
                              <div>
                                <p className="font-semibold flex items-center gap-2">
                                  {method.name}
                                  {method.isDefault && <Badge variant="default" className="text-xs">Mặc định</Badge>}
                                </p>
                                <p className="text-sm text-muted-foreground">{method.details}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!method.isDefault && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Đặt mặc định
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <History className="mr-2 h-5 w-5 text-indigo-600" />
                    Lịch sử giao dịch
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Xem chi tiết tất cả giao dịch thanh toán
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPayments ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                      <p>Đang tải...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có giao dịch nào</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 10).map(transaction => (
                        <div key={transaction.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-indigo-200 transition-all">
                          {/* Compact Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900">{transaction.orderName}</h4>
                                {getTransactionStatusBadge(transaction.status)}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Receipt className="w-3 h-3" />
                                  {transaction.id}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(transaction.date).toLocaleDateString('vi-VN')} {new Date(transaction.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  {transaction.paymentMethod}
                                </span>
                              </div>
                              {transaction.description && (
                                <p className="text-sm text-slate-600 mt-1">{transaction.description}</p>
                              )}
                            </div>
                            <div className="text-right ml-4 flex items-center gap-2">
                              <div>
                                <p className={`text-lg font-bold ${
                                  transaction.status === 'refunded' ? 'text-green-600' : 
                                  transaction.status === 'failed' ? 'text-red-600' : 
                                  'text-indigo-600'
                                }`}>
                                  {transaction.status === 'refunded' ? '+' : ''}{formatCurrency(transaction.finalAmount || transaction.amount)}
                                </p>
                                {transaction.fee !== undefined && transaction.fee > 0 && (
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Phí: {formatCurrency(transaction.fee)}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewTransactionDetails(transaction)}
                                >
                                  <Info className="w-4 h-4 mr-1" />
                                  Chi tiết
                                </Button>
                                {transaction.receiptUrl && transaction.status === 'completed' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDownloadReceipt(transaction.id)}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Biên lai
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {transactions.length > 10 && (
                        <Button variant="outline" className="w-full">
                          Xem tất cả {transactions.length} giao dịch
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transaction Detail Dialog */}
              <Dialog open={isTransactionDetailOpen} onOpenChange={setIsTransactionDetailOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Chi tiết giao dịch</DialogTitle>
                    <DialogDescription>
                      Mã giao dịch: {selectedTransaction?.id}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedTransaction && (
                    <div className="space-y-4 py-4">
                      {/* Status */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-700">Trạng thái:</span>
                        {getTransactionStatusBadge(selectedTransaction.status)}
                      </div>

                      {/* Basic Info */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b">
                          <h4 className="font-semibold text-slate-900">Thông tin giao dịch</h4>
                        </div>
                        <div className="divide-y">
                          <div className="flex justify-between p-3">
                            <span className="text-slate-600">Đơn hàng:</span>
                            <span className="font-medium text-slate-900">{selectedTransaction.orderName}</span>
                          </div>
                          <div className="flex justify-between p-3">
                            <span className="text-slate-600">Mã đơn hàng:</span>
                            <span className="font-medium text-slate-900">{selectedTransaction.orderId}</span>
                          </div>
                          <div className="flex justify-between p-3">
                            <span className="text-slate-600">Ngày giao dịch:</span>
                            <span className="font-medium text-slate-900">
                              {new Date(selectedTransaction.date).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex justify-between p-3">
                            <span className="text-slate-600">Phương thức:</span>
                            <span className="font-medium text-slate-900">{selectedTransaction.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bank Details */}
                      {selectedTransaction.bankDetails && (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100">
                            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                              Thông tin ngân hàng / Ví điện tử
                            </h4>
                          </div>
                          <div className="divide-y">
                            <div className="flex justify-between p-3 bg-white">
                              <span className="text-slate-600">Ngân hàng/Ví:</span>
                              <span className="font-medium text-slate-900">{selectedTransaction.bankDetails.bankName}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-white">
                              <span className="text-slate-600">Số tài khoản:</span>
                              <span className="font-medium text-slate-900 font-mono">{selectedTransaction.bankDetails.accountNumber}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-white">
                              <span className="text-slate-600">Chủ tài khoản:</span>
                              <span className="font-medium text-slate-900">{selectedTransaction.bankDetails.accountHolder}</span>
                            </div>
                            {selectedTransaction.bankDetails.branchName && (
                              <div className="flex justify-between p-3 bg-white">
                                <span className="text-slate-600">Chi nhánh:</span>
                                <span className="font-medium text-slate-900">{selectedTransaction.bankDetails.branchName}</span>
                              </div>
                            )}
                            {selectedTransaction.bankDetails.transactionRef && (
                              <div className="flex justify-between p-3 bg-white">
                                <span className="text-slate-600">Mã tham chiếu:</span>
                                <span className="font-medium text-slate-900 font-mono">{selectedTransaction.bankDetails.transactionRef}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      {selectedTransaction.orderItems && selectedTransaction.orderItems.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-600" />
                              Danh sách sản phẩm
                            </h4>
                          </div>
                          <div className="p-3 bg-white">
                            <div className="space-y-3">
                              {selectedTransaction.orderItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start p-3 bg-blue-50 rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900">{item.productName}</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                      Số lượng: {item.quantity} × {formatCurrency(item.unitPrice)}
                                    </p>
                                  </div>
                                  <p className="font-bold text-slate-900">{formatCurrency(item.totalPrice)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Amount Breakdown */}
                      <div className="border-2 border-indigo-200 rounded-lg overflow-hidden">
                        <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-200">
                          <h4 className="font-semibold text-slate-900">Chi tiết số tiền</h4>
                        </div>
                        <div className="p-4 bg-white">
                          <div className="space-y-2">
                            <div className="flex justify-between text-slate-700">
                              <span>Tổng tiền hàng:</span>
                              <span className="font-medium">{formatCurrency(selectedTransaction.amount)}</span>
                            </div>
                            {selectedTransaction.discount !== undefined && selectedTransaction.discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Giảm giá:</span>
                                <span className="font-medium">-{formatCurrency(selectedTransaction.discount)}</span>
                              </div>
                            )}
                            {selectedTransaction.fee !== undefined && selectedTransaction.fee > 0 && (
                              <div className="flex justify-between text-orange-600">
                                <span>Phí giao dịch:</span>
                                <span className="font-medium">+{formatCurrency(selectedTransaction.fee)}</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-3 border-t-2 border-indigo-200 mt-2">
                              <span className="font-bold text-lg text-slate-900">Tổng thanh toán:</span>
                              <span className="font-bold text-indigo-600 text-xl">
                                {formatCurrency(selectedTransaction.finalAmount || selectedTransaction.amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedTransaction.description && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-slate-700">
                            <strong>Ghi chú:</strong> {selectedTransaction.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <DialogFooter>
                    {selectedTransaction?.receiptUrl && selectedTransaction.status === 'completed' && (
                      <Button 
                        variant="default"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => {
                          if (selectedTransaction) {
                            handleDownloadReceipt(selectedTransaction.id);
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Tải biên lai
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setIsTransactionDetailOpen(false)}>
                      Đóng
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <Star className="mr-2 h-5 w-5 text-indigo-600" />
                    Phản hồi & đánh giá
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Gửi phản hồi, đánh giá dịch vụ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Gửi phản hồi mới</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Chia sẻ trải nghiệm của bạn với chúng tôi
                      </p>
                      <Button className="w-full">
                        Viết phản hồi
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Phản hồi đã gửi</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Đã xử lý</Badge>
                              <span className="text-sm font-medium">Dịch vụ lái thử</span>
                            </div>
                            <div className="flex">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            "Dịch vụ tuyệt vời! Nhân viên nhiệt tình..."
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">01/10/2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
          </div>

          {/* Order Detail Dialog */}
          <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Chi tiết đơn hàng #{selectedOrder?.orderNumber}</DialogTitle>
                <DialogDescription>
                  Thông tin đầy đủ về đơn hàng và tiến trình giao xe
                </DialogDescription>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <Badge className={`mb-2 ${
                      selectedOrder.status === 'delivering' ? 'bg-blue-600' :
                      selectedOrder.status === 'completed' ? 'bg-green-600' :
                      selectedOrder.status === 'cancelled' ? 'bg-red-600' :
                      'bg-amber-600'
                    }`}>
                      {selectedOrder.status === 'quote-request' ? 'Yêu cầu báo giá' :
                       selectedOrder.status === 'delivering' ? 'Đang vận chuyển' :
                       selectedOrder.status === 'completed' ? 'Hoàn thành' :
                       selectedOrder.status === 'cancelled' ? 'Đã hủy' :
                       'Đang xử lý'}
                    </Badge>
                    <p className="text-sm text-slate-600 mt-1">
                      Ngày tạo: {new Date(selectedOrder.createdDate).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Vehicle Info */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Car className="mr-2 h-5 w-5 text-indigo-600" />
                      Thông tin xe
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-600">Mẫu xe</p>
                        <p className="font-medium">{selectedOrder.vehicleModel}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Màu sắc</p>
                        <p className="font-medium">{selectedOrder.vehicleConfig.color}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Nội thất</p>
                        <p className="font-medium">{selectedOrder.vehicleConfig.interior}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Pin</p>
                        <p className="font-medium">{selectedOrder.vehicleConfig.battery}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Mâm xe</p>
                        <p className="font-medium">{selectedOrder.vehicleConfig.wheels}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Tự lái</p>
                        <p className="font-medium">{selectedOrder.vehicleConfig.autopilot ? 'Có' : 'Không'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-indigo-600" />
                      Thông tin thanh toán
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tổng giá trị</span>
                        <span className="font-bold">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Đã thanh toán</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedOrder.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-slate-600 font-medium">Còn lại</span>
                        <span className="font-bold text-red-600">{formatCurrency(selectedOrder.remainingAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dealer Info */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Building2 className="mr-2 h-5 w-5 text-indigo-600" />
                      Thông tin đại lý
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{selectedOrder.dealerName}</p>
                      <p className="text-slate-600 flex items-start">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                        {selectedOrder.dealerAddress}
                      </p>
                      <p className="text-slate-600 flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        {selectedOrder.dealerContact}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {selectedOrder.deliveryAddress && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center">
                          <Truck className="mr-2 h-5 w-5 text-indigo-600" />
                          Địa chỉ giao xe
                        </h3>
                        {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setNewDeliveryAddress(selectedOrder.deliveryAddress || '');
                              setIsUpdateAddressOpen(true);
                            }}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Sửa
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{selectedOrder.deliveryAddress}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <History className="mr-2 h-5 w-5 text-indigo-600" />
                      Tiến trình đơn hàng
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.timeline.map((item: any, index: number) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`rounded-full p-2 ${
                              item.isCompleted ? 'bg-green-100' : item.isCurrent ? 'bg-blue-100' : 'bg-slate-100'
                            }`}>
                              {item.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : item.isCurrent ? (
                                <Clock className="h-4 w-4 text-blue-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                              )}
                            </div>
                            {index < selectedOrder.timeline.length - 1 && (
                              <div className={`w-0.5 h-8 ${item.isCompleted ? 'bg-green-300' : 'bg-slate-200'}`} />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-slate-600">{item.description}</p>
                            {item.date && (
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(item.date).toLocaleDateString('vi-VN', {
                                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Tracking (if delivering) */}
                  {selectedOrder.status === 'delivering' && deliveryTracking && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center text-blue-900">
                        <Navigation className="mr-2 h-5 w-5" />
                        Theo dõi vận chuyển
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Vị trí hiện tại</span>
                          <span className="font-medium text-blue-900">{deliveryTracking.currentLocation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Dự kiến đến</span>
                          <span className="font-medium text-blue-900">
                            {new Date(deliveryTracking.estimatedArrival).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Tài xế</span>
                          <span className="font-medium text-blue-900">{deliveryTracking.driverName} - {deliveryTracking.driverPhone}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Info className="mr-2 h-5 w-5 text-indigo-600" />
                        Ghi chú
                      </h3>
                      <p className="text-sm text-slate-600 italic">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap pt-4 border-t">
                    {selectedOrder.status === 'delivering' && (
                      <Button onClick={() => handleViewTracking(selectedOrder)} className="flex-1">
                        <Navigation className="mr-2 h-4 w-4" />
                        Chi tiết vận chuyển
                      </Button>
                    )}
                    {(selectedOrder.status === 'completed' || selectedOrder.paidAmount > 0) && (
                      <>
                        <Button variant="outline" onClick={() => handleDownloadInvoice(selectedOrder.id)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Tải hóa đơn
                        </Button>
                        <Button variant="outline" onClick={() => handleDownloadContract(selectedOrder.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Tải hợp đồng
                        </Button>
                      </>
                    )}
                    {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setDealerMessage('');
                            setIsContactDealerOpen(true);
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Liên hệ đại lý
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            setCancelReason('');
                            setIsCancelOrderOpen(true);
                          }}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Hủy đơn
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Tracking Detail Dialog */}
          <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Navigation className="mr-2 h-5 w-5 text-blue-600" />
                  Theo dõi vận chuyển - #{selectedOrder?.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  Thông tin chi tiết về quá trình vận chuyển xe
                </DialogDescription>
              </DialogHeader>
              
              {deliveryTracking && (
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <Badge className={`mb-2 ${
                      deliveryTracking.status === 'in-transit' ? 'bg-blue-600' :
                      deliveryTracking.status === 'arrived' ? 'bg-green-600' :
                      'bg-slate-600'
                    }`}>
                      {deliveryTracking.status === 'preparing' ? 'Đang chuẩn bị' :
                       deliveryTracking.status === 'in-transit' ? 'Đang vận chuyển' :
                       deliveryTracking.status === 'arrived' ? 'Đã đến' :
                       'Đã giao'}
                    </Badge>
                    <div className="space-y-2 text-sm mt-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-900">Vị trí hiện tại</p>
                          <p className="text-blue-700">{deliveryTracking.currentLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-900">Dự kiến đến</p>
                          <p className="text-blue-700">
                            {new Date(deliveryTracking.estimatedArrival).toLocaleString('vi-VN', {
                              weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <User className="mr-2 h-5 w-5 text-indigo-600" />
                      Thông tin tài xế
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tài xế</span>
                        <span className="font-medium">{deliveryTracking.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Số điện thoại</span>
                        <span className="font-medium">{deliveryTracking.driverPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Biển số xe</span>
                        <span className="font-medium">{deliveryTracking.vehicleNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking History */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <History className="mr-2 h-5 w-5 text-indigo-600" />
                      Lịch sử di chuyển
                    </h3>
                    <div className="space-y-3">
                      {deliveryTracking.trackingHistory.map((point: TrackingHistoryPoint, index: number) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`rounded-full p-2 ${
                              index === deliveryTracking.trackingHistory.length - 1 ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {index === deliveryTracking.trackingHistory.length - 1 ? (
                                <Navigation className="h-4 w-4 text-blue-600" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            {index < deliveryTracking.trackingHistory.length - 1 && (
                              <div className="w-0.5 h-8 bg-green-300" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-sm">{point.location}</p>
                            <p className="text-xs text-slate-600">{point.status}</p>
                            {point.note && (
                              <p className="text-xs text-slate-500 italic mt-1">{point.note}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(point.timestamp).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Cancel Order Dialog */}
          <Dialog open={isCancelOrderOpen} onOpenChange={setIsCancelOrderOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hủy đơn hàng</DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn hủy đơn hàng #{selectedOrder?.orderNumber}? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Lý do hủy *</Label>
                  <Textarea 
                    placeholder="Vui lòng cho biết lý do hủy đơn hàng..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCancelOrderOpen(false)}>Quay lại</Button>
                <Button variant="destructive" onClick={handleCancelOrder}>
                  <Ban className="mr-2 h-4 w-4" />
                  Xác nhận hủy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Contact Dealer Dialog */}
          <Dialog open={isContactDealerOpen} onOpenChange={setIsContactDealerOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Liên hệ đại lý</DialogTitle>
                <DialogDescription>
                  Gửi tin nhắn đến {selectedOrder?.dealerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tin nhắn *</Label>
                  <Textarea 
                    placeholder="Nội dung cần trao đổi với đại lý..."
                    value={dealerMessage}
                    onChange={(e) => setDealerMessage(e.target.value)}
                    rows={5}
                  />
                </div>
                <div className="text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Hoặc gọi trực tiếp: <span className="font-medium">{selectedOrder?.dealerContact}</span>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsContactDealerOpen(false)}>Hủy</Button>
                <Button onClick={handleContactDealer} className="bg-indigo-600 hover:bg-indigo-700">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Gửi tin nhắn
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Update Address Dialog */}
          <Dialog open={isUpdateAddressOpen} onOpenChange={setIsUpdateAddressOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cập nhật địa chỉ giao xe</DialogTitle>
                <DialogDescription>
                  Thay đổi địa chỉ nhận xe cho đơn hàng #{selectedOrder?.orderNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Địa chỉ mới *</Label>
                  <Textarea 
                    placeholder="Nhập địa chỉ giao xe mới..."
                    value={newDeliveryAddress}
                    onChange={(e) => setNewDeliveryAddress(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateAddressOpen(false)}>Hủy</Button>
                <Button onClick={handleUpdateAddress} className="bg-indigo-600 hover:bg-indigo-700">
                  <MapPin className="mr-2 h-4 w-4" />
                  Cập nhật
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </main>
      </div>
    </ProtectedRoute>
  );
}