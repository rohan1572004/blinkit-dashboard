// =============================================
//  BLINKIT ANALYTICS — MOCK DATA
// =============================================

const BLINKIT_DATA = {
  kpis: {
    totalOrders:    { value: 284329, suffix: '',     prefix: '',  label: 'Total Orders',      icon: 'package',  trend: +12.4, color: '#F9C511' },
    revenue:        { value: 42.6,   suffix: ' Cr',  prefix: '₹', label: 'Revenue',           icon: 'rupee',    trend: +18.7, color: '#00D4FF' },
    avgDelivery:    { value: 8.3,    suffix: ' min', prefix: '',  label: 'Avg Delivery Time', icon: 'lightning',trend: -4.2,  color: '#A78BFA' },
    activeUsers:    { value: 123456, suffix: '',     prefix: '',  label: 'Active Users',      icon: 'users',    trend: +9.1,  color: '#34D399' },
    conversionRate: { value: 68.4,   suffix: '%',    prefix: '',  label: 'Conversion Rate',   icon: 'target',   trend: +3.2,  color: '#FB923C' },
    npsScore:       { value: 87,     suffix: '',     prefix: '',  label: 'NPS Score',         icon: 'star',     trend: +5.0,  color: '#F472B6' },
  },
  revenueByCategory: {
    labels: ['Fruits & Veggies','Dairy & Eggs','Snacks','Beverages','Household','Personal Care','Meat & Fish','Frozen Foods'],
    data:   [18.4, 15.2, 12.8, 10.6, 9.3, 7.7, 6.4, 5.1],
    colors: ['#F9C511','#00D4FF','#A78BFA','#34D399','#FB923C','#F472B6','#60A5FA','#FCD34D']
  },
  orderStatus: {
    labels: ['Delivered','In Transit','Preparing','Cancelled','Returned'],
    data:   [71.2, 14.3, 8.1, 4.8, 1.6],
    colors: ['#34D399','#00D4FF','#F9C511','#F87171','#A78BFA']
  },
  topCities: {
    labels: ['Mumbai','Delhi NCR','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Lucknow'],
    orders: [52400,48300,43200,31800,28500,26900,22100,18400,14300,11200],
    revenue:[9.2,8.4,7.8,5.6,5.1,4.9,4.0,3.3,2.6,2.0],
    colors: ['#F9C511','#00D4FF','#A78BFA','#34D399','#FB923C','#F472B6','#60A5FA','#FCD34D','#818CF8','#4ADE80']
  },
  topProducts: {
    labels: ["Amul Milk 1L","Lay's Classic","Organic Bananas","Aashirvaad Atta 5kg","Red Bull 250ml","Dettol Soap","Britannia Bread","Maggi Noodles","Tropicana OJ","Parle-G"],
    units:   [18420,15630,14210,12880,11540,10920,10340,9870,9120,8760],
    revenue: [2.21,1.09,0.85,1.93,1.39,0.66,0.93,0.99,1.37,0.53]
  },
  funnel: {
    labels: ['App Opens','Browsed Products','Added to Cart','Checkout Started','Order Placed','Reordered'],
    values: [1000000,680000,420000,310000,284329,189000],
    colors: ['#F9C511','#FCD34D','#00D4FF','#A78BFA','#34D399','#FB923C']
  },
  recentOrders: [
    { id:'#BLK-284329', customer:'Priya Sharma',   city:'Mumbai',    items:6, amount:842,  status:'Delivered',  time:'4 min', category:'Grocery' },
    { id:'#BLK-284328', customer:'Rahul Gupta',    city:'Delhi',     items:2, amount:234,  status:'In Transit', time:'6 min', category:'Beverages' },
    { id:'#BLK-284327', customer:'Ananya Patel',   city:'Bangalore', items:9, amount:1243, status:'Preparing',  time:'3 min', category:'Fruits & Vegs' },
    { id:'#BLK-284326', customer:'Karan Mehta',    city:'Hyderabad', items:4, amount:567,  status:'Delivered',  time:'7 min', category:'Dairy' },
    { id:'#BLK-284325', customer:'Sneha Iyer',     city:'Chennai',   items:3, amount:389,  status:'Delivered',  time:'9 min', category:'Snacks' },
    { id:'#BLK-284324', customer:'Vikram Singh',   city:'Pune',      items:7, amount:1102, status:'Cancelled',  time:'—',     category:'Grocery' },
    { id:'#BLK-284323', customer:'Pooja Reddy',    city:'Mumbai',    items:1, amount:149,  status:'Delivered',  time:'5 min', category:'Personal Care' },
    { id:'#BLK-284322', customer:'Arjun Nair',     city:'Bangalore', items:5, amount:723,  status:'In Transit', time:'8 min', category:'Household' },
    { id:'#BLK-284321', customer:'Meera Joshi',    city:'Kolkata',   items:2, amount:298,  status:'Delivered',  time:'11 min',category:'Beverages' },
    { id:'#BLK-284320', customer:'Aditya Kumar',   city:'Delhi',     items:8, amount:1567, status:'Preparing',  time:'2 min', category:'Grocery' },
    { id:'#BLK-284319', customer:'Divya Krishnan', city:'Ahmedabad', items:3, amount:412,  status:'Delivered',  time:'6 min', category:'Dairy' },
    { id:'#BLK-284318', customer:'Rohit Sharma',   city:'Jaipur',    items:4, amount:634,  status:'Returned',   time:'—',     category:'Snacks' },
  ],
  sparklines: {
    totalOrders:    [7800,8100,7950,8400,8200,8900,9100,8700,9200,9500,9300,9800,10100,9600,10400],
    revenue:        [130,142,138,155,149,162,168,158,172,178,175,185,191,183,196],
    avgDelivery:    [9.1,8.9,9.0,8.7,8.6,8.5,8.4,8.6,8.3,8.2,8.4,8.3,8.1,8.3,8.3],
    activeUsers:    [108000,110000,109500,112000,113000,115000,114000,116000,118000,120000,119000,121000,122000,123000,123456],
    conversionRate: [63,64,65,64,65,66,66,67,67,67,68,68,68,68,68.4],
    npsScore:       [80,81,82,82,83,83,84,84,85,85,85,86,86,87,87]
  }
};
