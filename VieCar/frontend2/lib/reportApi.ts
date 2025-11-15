import { api } from './api';

export interface SalesReportRes {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  averageOrderValue: number;
  profitMargin: number;
}

export interface DistributionReportRes {
  totalDistributed: number;
  totalInStock: number;
  totalSold: number;
  totalInactive: number;
  distributionRate: number;
}

export interface DealerPerformanceRes {
  dealerId: number;
  dealerName: string;
  dealerAddress: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalProducts: number;
}

export interface ProductSalesRes {
  productName: string;
  categoryName: string;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
}

// API: Báo cáo doanh thu
export const getSalesReport = async (dealerId?: number): Promise<SalesReportRes> => {
  try {
    const params = dealerId ? `?dealerId=${dealerId}` : '';
    const url = `/reports/sales${params}`;
    console.log('🔍 Calling getSalesReport:', url);
    const response = await api.get<SalesReportRes>(url);
    console.log('✅ getSalesReport response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get sales report error:', error);
    throw error;
  }
};

// API: Báo cáo phân phối
export const getDistributionReport = async (dealerId?: number): Promise<DistributionReportRes> => {
  try {
    const params = dealerId ? `?dealerId=${dealerId}` : '';
    const response = await api.get<DistributionReportRes>(`/reports/distribution${params}`);
    return response.data;
  } catch (error) {
    console.error('Get distribution report error:', error);
    throw error;
  }
};

// API: Hiệu suất đại lý
export const getDealerPerformance = async (): Promise<DealerPerformanceRes[]> => {
  try {
    const response = await api.get<DealerPerformanceRes[]>('/reports/dealer-performance');
    return response.data;
  } catch (error) {
    console.error('Get dealer performance error:', error);
    throw error;
  }
};

// API: Top sản phẩm bán chạy
export const getTopProducts = async (dealerId?: number, limit: number = 5): Promise<ProductSalesRes[]> => {
  try {
    const params = new URLSearchParams();
    if (dealerId) params.append('dealerId', dealerId.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get<ProductSalesRes[]>(`/reports/top-products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Get top products error:', error);
    throw error;
  }
};
