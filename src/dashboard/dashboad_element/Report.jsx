import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, List, Typography, Spin, Alert, Tabs, DatePicker, Button, Table } from "antd";
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  MedicineBoxFilled,
  CheckCircleOutlined,
  CalendarOutlined,
  AlertOutlined
} from "@ant-design/icons";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import api from "../../config/axios";
// Xóa import dayjs không sử dụng

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

function Report() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [medicineStats, setMedicineStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    refused: 0
  });
  const [loadingMedicine, setLoadingMedicine] = useState(true);
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateEvents, setDateEvents] = useState([]);
  // Biến này được sử dụng trong hàm fetchMedicineRequests, có thể xóa an toàn
  // const [studentClasses, setStudentClasses] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/ui/widgets/dynamic");
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard: " + (err.message || "Lỗi không xác định"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Hàm để lấy thông tin lớp học của học sinh
  const fetchStudentClass = async (studentId) => {
    try {
      if (!studentId) return null;
      
      // Gọi API để lấy thông tin chi tiết học sinh
      const response = await api.get(`/Student/${studentId}`);
      if (response.data && response.data.className) {
        return response.data.className;
      }
      return null;
    } catch (error) {
      console.error(`Không thể lấy thông tin lớp học của học sinh ID ${studentId}:`, error);
      return null;
    }
  };

  // Hàm chuẩn hóa dữ liệu đơn thuốc
  const normalizeMedicineRequest = (request) => {
    if (!request) return {};
    
    // Lấy thông tin chi tiết thuốc từ mảng medicineDetails
    const medicineDetail = request.medicineDetails && 
                          request.medicineDetails.$values && 
                          request.medicineDetails.$values.length > 0 ? 
                          request.medicineDetails.$values[0] : {};
    
    // Chuyển đổi thời gian uống thuốc sang tiếng Việt
    let timeVN = '';
    if (medicineDetail.time) {
      const timeArr = medicineDetail.time.split(',').map(t => t.trim());
      const timeMap = {
        'morning': 'Buổi sáng',
        'noon': 'Buổi trưa',
        'afternoon': 'Buổi chiều',
        'evening': 'Buổi tối',
        'night': 'Buổi đêm'
      };
      timeVN = timeArr.map(t => timeMap[t] || t).join(', ');
    }
    
    return {
      id: request.requestID || 'N/A',
      studentName: request.studentName || 'Không có thông tin',
      parentName: request.parentName || 'Không có thông tin',
      studentClass: request.studentClass || request.className || 'Không có thông tin',
      medicineName: medicineDetail.requestItemName || 'Không có thông tin',
      medicineDescription: medicineDetail.description || '',
      status: request.requestStatus || 'Không có thông tin',
      requestDate: request.date || null,
      dosage: medicineDetail.dosageInstructions || 'Không có thông tin',
      time: timeVN || medicineDetail.time || '',
      quantity: medicineDetail.quantity || '',
      note: request.note || '',
      nurseNote: request.nurseNote || ''
    };
  };

  useEffect(() => {
    const fetchMedicineRequests = async () => {
      try {
        setLoadingMedicine(true);
        // Lấy tất cả đơn gửi thuốc
        const response = await api.get("/MedicineRequest/getAll");
        console.log("Medicine requests raw data:", response.data);
        
        // Trích xuất dữ liệu từ cấu trúc API
        let requests = [];
        
        // Kiểm tra cấu trúc dữ liệu API
        if (response.data && response.data.$values) {
          requests = response.data.$values;
        } else if (response.data && Array.isArray(response.data)) {
          requests = response.data;
        } else if (response.data) {
          requests = [response.data];
        }
        
        console.log("Extracted requests:", requests);
        
        // Chuẩn hóa dữ liệu
        const normalizedRequests = requests.map(req => normalizeMedicineRequest(req));
        
        // Tạo đối tượng để lưu trữ thông tin lớp học
        const classInfo = {};
        
        // Lấy thông tin lớp học cho mỗi học sinh
        const studentIds = [...new Set(requests.map(req => req.studentID).filter(Boolean))];
        
        // Lấy thông tin lớp từ mã định danh học sinh
        for (let i = 0; i < studentIds.length; i++) {
          const studentId = studentIds[i];
          if (studentId) {
            try {
              const studentClassData = await fetchStudentClass(studentId);
              if (studentClassData) {
                classInfo[studentId] = studentClassData;
              }
            } catch (err) {
              console.error(`Error fetching class for student ${studentId}:`, err);
            }
          }
        }
        
        // Thêm thông tin lớp vào danh sách yêu cầu
        const requestsWithClass = normalizedRequests.map(req => {
          const studentId = requests.find(r => r.requestID === req.id)?.studentID;
          return {
            ...req,
            studentClass: studentId ? classInfo[studentId] || 'Không có thông tin' : 'Không có thông tin'
          };
        });
        
        setMedicineRequests(requestsWithClass);
        console.log("Final normalized requests with class:", requestsWithClass);
        
        // Tính toán thống kê
        const pending = requestsWithClass.filter(req => 
          req.status === "Pending" || req.status === "Đang chờ duyệt"
        ).length;
        
        const approved = requestsWithClass.filter(req => 
          req.status === "Approved" || req.status === "Đã duyệt"
        ).length;
        
        // Không hiển thị đơn từ chối trong thống kê
        setMedicineStats({
          total: requestsWithClass.length,
          pending,
          approved,
          refused: 0
        });
      } catch (err) {
        console.error("Không thể tải dữ liệu đơn thuốc:", err);
      } finally {
        setLoadingMedicine(false);
      }
    };

    fetchMedicineRequests();
  }, []);

  // Lấy dữ liệu sự cố y tế
  useEffect(() => {
    const fetchMedicalEvents = async () => {
      try {
        setLoadingEvents(true);
        const response = await api.get("/MedicalEvents");
        
        let events = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            events = response.data;
          } else if (response.data.$values && Array.isArray(response.data.$values)) {
            events = response.data.$values;
          } else {
            events = [response.data];
          }
        }
        
        setMedicalEvents(events);
        console.log("Medical events:", events);
      } catch (err) {
        console.error("Không thể tải dữ liệu sự cố y tế:", err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchMedicalEvents();
  }, []);

  // Xử lý thay đổi ngày được chọn
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const dateStr = date.format('YYYY-MM-DD');
      const filteredEvents = medicalEvents.filter(event => 
        event.eventDate && event.eventDate.startsWith(dateStr)
      );
      setDateEvents(filteredEvents);
      console.log(`Tìm thấy ${filteredEvents.length} sự cố y tế vào ngày ${date.format('DD/MM/YYYY')}`);
    } else {
      setDateEvents([]);
    }
  };

  // Định dạng thời gian

  // Định dạng thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Tạo dữ liệu cho biểu đồ đơn gửi thuốc theo ngày
  const prepareMedicineChartData = () => {
    // Lấy 7 ngày gần nhất
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const labels = last7Days.map(date => 
      date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    );

    // Đếm số đơn thuốc theo ngày
    const dailyCounts = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return medicineRequests.filter(req => 
        req.requestDate && String(req.requestDate).startsWith(dateStr)
      ).length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Đơn gửi thuốc',
          data: dailyCounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Tạo dữ liệu cho biểu đồ trạng thái đơn thuốc
  const prepareMedicineStatusData = () => {
    return {
      labels: ['Đã duyệt', 'Đang chờ'],
      datasets: [
        {
          data: [medicineStats.approved, medicineStats.pending],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',  // xanh lá - đã duyệt
            'rgba(255, 206, 86, 0.6)',  // vàng - đang chờ
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ sự cố y tế theo ngày
  const prepareMedicalEventChartData = () => {
    // Lấy 14 ngày gần nhất
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const labels = last14Days.map(date => 
      date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    );

    // Đếm số sự cố y tế theo ngày
    const dailyCounts = last14Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return medicalEvents.filter(event => 
        event.eventDate && event.eventDate.startsWith(dateStr)
      ).length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Sự cố y tế',
          data: dailyCounts,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ phân loại sự cố y tế theo ngày đã chọn
  const prepareMedicalEventTypeData = () => {
    // Sử dụng các sự kiện của ngày đã chọn hoặc tất cả nếu không có ngày nào được chọn
    const eventsToUse = selectedDate ? dateEvents : medicalEvents;
    
    // Nhóm các sự kiện theo loại
    const eventTypeCount = {};
    eventsToUse.forEach(event => {
      const type = event.eventType || "Không xác định";
      eventTypeCount[type] = (eventTypeCount[type] || 0) + 1;
    });

    const labels = Object.keys(eventTypeCount);
    const data = Object.values(eventTypeCount);

    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',  // Ngã nhẹ
      'rgba(54, 162, 235, 0.6)',  // Dị ứng thực phẩm
      'rgba(255, 206, 86, 0.6)',  // Sốt
      'rgba(75, 192, 192, 0.6)',  // Đau bụng
      'rgba(153, 102, 255, 0.6)'  // Chảy máu cam
    ];

    const borderColors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)'
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, i) => backgroundColors[i % backgroundColors.length]),
          borderColor: labels.map((_, i) => borderColors[i % borderColors.length]),
          borderWidth: 1
        }
      ]
    };
  };

  // Columns for the medical event table
  const medicalEventColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentFullName',
      key: 'studentFullName',
    },
    {
      title: 'Y tá',
      dataIndex: 'nurseFullName',
      key: 'nurseFullName',
    },
    {
      title: 'Loại sự cố',
      dataIndex: 'eventType',
      key: 'eventType',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thời gian',
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (text) => {
        if (!text) return 'Không có thông tin';
        return new Date(text).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    {
      title: 'Kết quả',
      dataIndex: 'outcome',
      key: 'outcome',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!dashboardData) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Không thể tải dữ liệu dashboard"
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: "20px" }}>
      <Tabs defaultActiveKey="general" items={[
        {
          
        
          key: 'medicine',
          label: 'Thống kê đơn thuốc',
          children: (
            <>
              <Typography.Title level={2}>Thống kê đơn gửi thuốc</Typography.Title>
              
              {loadingMedicine ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin size="large" />
                  <p>Đang tải dữ liệu đơn thuốc...</p>
                </div>
              ) : (
                <>
                  {/* Medicine Request Stats */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Card>
                        <Statistic
                          title="Tổng số đơn thuốc"
                          value={medicineStats.total}
                          prefix={<MedicineBoxFilled />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card>
                        <Statistic
                          title="Đơn chờ xỉ lílí"
                          value={medicineStats.pending}
                          prefix={<ClockCircleOutlined />}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card>
                        <Statistic
                          title="Đã hoàn thành"
                          value={medicineStats.approved}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Medicine Request Charts */}
                  <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
                    <Col xs={24} md={12}>
                      <Card title="Đơn gửi thuốc 7 ngày qua">
                        <Bar
                          data={prepareMedicineChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "top",
                              },
                            },
                          }}
                          height={300}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card title="Trạng thái đơn thuốc">
                        <div style={{ height: 300, display: "flex", justifyContent: "center" }}>
                          <Doughnut
                            data={prepareMedicineStatusData()}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: "bottom",
                                },
                              },
                            }}
                          />
                        </div>
                      </Card>
                    </Col>
                  </Row>

                  {/* Recent Medicine Requests */}
                  <Row style={{ marginTop: "20px" }}>
                    <Col span={24}>
                      <Card title="Đơn gửi thuốc gần đây">
                        <List
                          itemLayout="horizontal"
                          dataSource={medicineRequests
                            .filter(item => item.status !== "Refused" && item.status !== "Đã từ chối")
                            .slice(0, 5)}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                title={
                                  <Typography.Text strong>
                                    Đơn thuốc #{item.id} - {item.studentName} {item.studentClass && item.studentClass !== 'Không có thông tin' ? `(${item.studentClass})` : ''}
                                  </Typography.Text>
                                }
                                description={
                                  <>
                                    <Typography.Text>
                                      <strong>Phụ huynh:</strong> {item.parentName}
                                    </Typography.Text>
                                    <br />
                                    <Typography.Text>
                                      <strong>Trạng thái:</strong> {
                                        item.status === "Pending" || item.status === "Đang chờ duyệt" ? "Đang chờ" :
                                        item.status === "Approved" || item.status === "Đã duyệt" ? "Đã duyệt" : 
                                        item.status
                                      }
                                    </Typography.Text>
                                    <br />
                                    <Typography.Text type="secondary">
                                      <strong>Ngày yêu cầu:</strong> {item.requestDate ? formatDate(item.requestDate) : "Không có thông tin"}
                                    </Typography.Text>
                                  </>
                                }
                              />
                            </List.Item>
                          )}
                          locale={{
                            emptyText: "Không có đơn gửi thuốc nào",
                          }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </>
          )
        },
        {
          key: 'medicalEvents',
          label: 'Sự cố y tế',
          children: (
            <>
              <Typography.Title level={2}>Báo cáo sự cố y tế</Typography.Title>
              
              {loadingEvents ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin size="large" />
                  <p>Đang tải dữ liệu sự cố y tế...</p>
                </div>
              ) : (
                <>
                  {/* Medical Events Stats */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Card>
                        <Statistic
                          title="Tổng số sự cố y tế"
                          value={medicalEvents.length}
                          prefix={<AlertOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card>
                        <Statistic
                          title="Số sự cố hôm nay"
                          value={medicalEvents.filter(event => {
                            const today = new Date().toISOString().split('T')[0];
                            return event.eventDate && event.eventDate.startsWith(today);
                          }).length}
                          prefix={<CalendarOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Card>
                        <Statistic
                          title="Cần theo dõi tiếp"
                          value={medicalEvents.filter(event => event.followUpRequired).length}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#fa8c16' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Medical Events Charts */}
                  <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
                    <Col xs={24} md={12}>
                      <Card title="Sự cố y tế 14 ngày qua">
                        <Bar
                          data={prepareMedicalEventChartData()}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "top",
                              },
                            },
                          }}
                          height={300}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card title={`Phân loại sự cố y tế ${selectedDate ? `ngày ${selectedDate.format('DD/MM/YYYY')}` : ''}`}>
                        {(selectedDate && dateEvents.length === 0) ? (
                          <div style={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Typography.Text>Không có sự cố y tế nào vào ngày {selectedDate.format('DD/MM/YYYY')}</Typography.Text>
                          </div>
                        ) : (
                          <div style={{ height: 300, display: "flex", justifyContent: "center" }}>
                            <Doughnut
                              data={prepareMedicalEventTypeData()}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: "bottom",
                                  },
                                },
                              }}
                            />
                          </div>
                        )}
                      </Card>
                    </Col>
                  </Row>

                  {/* Daily Medical Events Report */}
                  <Row style={{ marginTop: "20px" }}>
                    <Col span={24}>
                      <Card 
                        title="Báo cáo sự cố y tế theo ngày" 
                        extra={
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <DatePicker 
                              onChange={handleDateChange} 
                              format="DD/MM/YYYY"
                              placeholder="Chọn ngày"
                            />
                            {selectedDate && dateEvents.length > 0 && (
                              <Button 
                                type="primary" 
                                onClick={() => {
                                  // Hàm xuất báo cáo sẽ được thực hiện ở đây
                                  alert(`Xuất báo cáo cho ngày ${selectedDate.format('DD/MM/YYYY')} với ${dateEvents.length} sự cố`);
                                }}
                              >
                                Xuất báo cáo
                              </Button>
                            )}
                          </div>
                        }
                      >
                        {selectedDate ? (
                          <>
                            {dateEvents.length > 0 ? (
                              <Table
                                dataSource={dateEvents}
                                columns={medicalEventColumns}
                                rowKey="medicalEventID"
                                pagination={{ pageSize: 5 }}
                              />
                            ) : (
                              <Typography.Text>Không có sự cố y tế nào vào ngày {selectedDate.format('DD/MM/YYYY')}</Typography.Text>
                            )}
                          </>
                        ) : (
                          <Typography.Text>Vui lòng chọn ngày để xem báo cáo chi tiết.</Typography.Text>
                        )}
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </>
          )
        }
      ]} />
    </div>
  );
}

export default Report;