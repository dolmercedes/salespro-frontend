export interface SalesOrder {
  id: number;
  so_number: string;
  date_so_approved: string;
  salesman: string;
  client: string;
  product_type: string;
  item_description: string;
  quantity: number;
  uom: string;
  gross_price: number;
  total_price: number;
  delivery_date?: string;
  remarks?: string;
  status: 'Pending' | 'Delivered' | 'Cancelled';
}

export interface SalesData {
  totalSales: number;
  totalOrders: number;
  salesBySalesman: { name: string; sales: number }[];
  salesByClient: { name: string; sales: number }[];
}
