import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Badge,
  Typography,
  Divider,
  Empty
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  DollarOutlined
} from "@ant-design/icons";
import axios from "../config/axios";
import { toast } from "react-toastify";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const MedicalInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [originalItemData, setOriginalItemData] = useState(null);

  // Categories for medical items
  const categories = ["Thuốc", "Dụng cụ", "Khác"];

  const units = ["Viên", "Chai", "Gói", "Cái", "Ống", "Hộp", "Vỉ"];

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get("MedicalInventory");
      setInventory(response.data.$values);
    } catch (error) {
      toast.error("Không thể tải dữ liệu kho thuốc");
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Calculate statistics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((item) => item.quantity < 10).length;
  const outOfStockItems = inventory.filter(
    (item) => item.quantity === 0
  ).length;
  const totalQuantity = inventory.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        // So sánh từng trường
        const isSame =
          values.itemName === originalItemData.itemName &&
          values.category === originalItemData.category &&
          values.quantity === originalItemData.quantity &&
          values.unit === originalItemData.unit &&
          values.description === originalItemData.description;
        if (isSame) {
          toast.info("Bạn chưa thay đổi thông tin nào!");
          return;
        }
        await axios.put(`MedicalInventory/${editingItem.itemID}`, values);
        toast.success("Cập nhật thuốc thành công");
      } else {
        await axios.post("MedicalInventory", values);
        toast.success("Thêm thuốc mới thành công");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      setOriginalItemData(null);
      fetchInventory();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu thuốc");
      console.error("Error saving item:", error);
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    setEditingItem(record);
    setOriginalItemData({
      itemName: record.itemName,
      category: record.category,
      quantity: record.quantity,
      unit: record.unit,
      description: record.description,
    });
    form.setFieldsValue({
      itemName: record.itemName,
      category: record.category,
      quantity: record.quantity,
      unit: record.unit,
      description: record.description,
    });
    setModalVisible(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/MedicalInventory/${id}`);
      toast.success("Xóa thuốc thành công");
      fetchInventory();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa thuốc");
      console.error("Error deleting item:", error);
    }
  };

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedItem(record);
    setDetailModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Tên thuốc",
      dataIndex: "itemName",
      key: "itemName",
      width: 200,
      render: (text) => <Text strong style={{ fontSize: '14px', color: '#1e3a8a' }}>{text}</Text>,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category) => (
        <Tag color="blue" style={{ borderRadius: '12px', padding: '0 8px', fontSize: '13px', fontWeight: '500' }}>
          {category || "Chưa phân loại"}
        </Tag>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (quantity) => {
        let color = "green";
        if (quantity === 0) color = "red";
        else if (quantity < 10) color = "orange";

        return (
          <Badge
            count={quantity || 0}
            showZero
            style={{ 
              backgroundColor: color, 
              padding: '0 8px',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '10px'
            }}
          />
        );
      },
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
      render: (unit) => (
        <Tag color="cyan" style={{ borderRadius: '12px', padding: '0 8px', fontSize: '13px' }}>
          {unit || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (description) => (
        <Tooltip title={description} color="#108ee9" placement="topLeft">
          <Text
            style={{ cursor: 'pointer', color: '#666' }}
            ellipsis={{ tooltip: false }}
          >
            {description
              ? description.length > 50
                ? `${description.substring(0, 50)}...`
                : description
              : <Text type="secondary" italic>Không có mô tả</Text>}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.07)' }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.07)' }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa thuốc này?"
            description="Bạn có chắc chắn muốn xóa thuốc này? Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.itemID)}
            okText="Có, xóa"
            cancelText="Không"
            okButtonProps={{ danger: true }}
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Tooltip title="Xóa">
              <Button
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.07)' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(to bottom, #f0f5ff, #f9fbff)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ 
          margin: 0, 
          display: "flex", 
          alignItems: "center", 
          gap: 12, 
          color: '#1e3a8a',
          fontWeight: 700
        }}>
          <MedicineBoxOutlined style={{ color: "#1677ff", fontSize: '28px' }} />
          Quản lý kho thuốc
        </Title>
        <Text style={{ color: "#666", margin: "8px 0 0 0", fontSize: '15px', display: 'block' }}>
          Quản lý danh sách thuốc và vật tư y tế trong kho
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
            }}
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<Text style={{ fontSize: '16px', color: '#0050b3' }}>Tổng số loại thuốc</Text>}
              value={totalItems}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#1677ff", fontSize: '32px', fontWeight: 'bold' }}
              suffix={
                <Text style={{ fontSize: '14px', color: '#0050b3' }}>loại</Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            style={{ 
              borderRadius: '16px', 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
            }}
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<Text style={{ fontSize: '16px', color: '#135200' }}>Tổng số lượng</Text>}
              value={totalQuantity}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: '32px', fontWeight: 'bold' }}
              suffix={
                <Text style={{ fontSize: '14px', color: '#135200' }}>đơn vị</Text>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            style={{ 
              borderRadius: '16px', 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #fff2e8 0%, #ffd8bf 100%)'
            }}
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<Text style={{ fontSize: '16px', color: '#ad2102' }}>Hết hàng</Text>}
              value={outOfStockItems}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f", fontSize: '32px', fontWeight: 'bold' }}
              suffix={
                <Text style={{ fontSize: '14px', color: '#ad2102' }}>loại thuốc</Text>
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            style={{ 
              borderRadius: '16px', 
              height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)'
            }}
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<Text style={{ fontSize: '16px', color: '#874d00' }}>Sắp hết hàng</Text>}
              value={lowStockItems - outOfStockItems}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: "#fa8c16", fontSize: '32px', fontWeight: 'bold' }}
              suffix={
                <Text style={{ fontSize: '14px', color: '#874d00' }}>loại thuốc</Text>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setModalVisible(true);
          }}
          style={{ 
            height: '40px', 
            borderRadius: '8px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Thêm thuốc mới
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchInventory}
          loading={loading}
          style={{ 
            height: '40px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Làm mới
        </Button>
      </div>

      {/* Inventory Table */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          border: 'none'
        }}
      >
        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="itemID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
            style: { marginTop: '16px' },
            itemRender: (page, type, originalElement) => {
              if (type === 'page') {
                return (
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    fontWeight: 'bold' 
                  }}>
                    {originalElement}
                  </div>
                );
              }
              return originalElement;
            }
          }}
          scroll={{ x: 1000 }}
          rowClassName={(record, index) => `inventory-table-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
          locale={{ 
            emptyText: (
              <Empty
                description={
                  <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                    Không có dữ liệu thuốc
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '60px 0' }}
              />
            ) 
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            color: editingItem ? '#096dd9' : '#1677ff'
          }}>
            {editingItem ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingItem ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          setOriginalItemData(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        centered
        destroyOnClose
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: 12,
          },
          body: {
            paddingTop: 24,
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            quantity: 0,
          }}
        >
          <Form.Item
            name="itemName"
            label={<Text strong>Tên thuốc</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập tên thuốc" },
              { max: 100, message: "Tên thuốc không được quá 100 ký tự" },
            ]}
          >
            <Input 
              placeholder="Nhập tên thuốc" 
              style={{ borderRadius: '8px', padding: '8px 12px' }} 
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label={<Text strong>Danh mục</Text>}
                rules={[
                  { max: 50, message: "Danh mục không được quá 50 ký tự" },
                ]}
              >
                <Select 
                  placeholder="Chọn danh mục" 
                  allowClear 
                  style={{ borderRadius: '8px' }}
                  size="large"
                  dropdownStyle={{ borderRadius: '8px' }}
                >
                  {categories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label={<Text strong>Đơn vị</Text>}
                rules={[{ max: 20, message: "Đơn vị không được quá 20 ký tự" }]}
              >
                <Select 
                  placeholder="Chọn đơn vị" 
                  allowClear
                  style={{ borderRadius: '8px' }}
                  size="large"
                  dropdownStyle={{ borderRadius: '8px' }}
                >
                  {units.map((unit) => (
                    <Option key={unit} value={unit}>
                      {unit}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="quantity"
            label={<Text strong>Số lượng</Text>}
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              {
                type: "number",
                min: 0,
                message: "Số lượng phải lớn hơn hoặc bằng 0",
              },
            ]}
          >
            <InputNumber
              placeholder="Nhập số lượng"
              style={{ width: "100%", borderRadius: '8px', padding: '8px 12px' }}
              min={0}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text strong>Mô tả</Text>}
            rules={[{ max: 255, message: "Mô tả không được quá 255 ký tự" }]}
          >
            <TextArea
              placeholder="Nhập mô tả về thuốc"
              rows={4}
              maxLength={255}
              showCount
              style={{ borderRadius: '8px', padding: '8px 12px' }}
              size="large"
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0 24px' }} />

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space size="middle">
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingItem(null);
                  setOriginalItemData(null);
                  form.resetFields();
                }}
                style={{ 
                  borderRadius: '8px',
                  padding: '0 20px',
                  height: '38px'
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ 
                  borderRadius: '8px',
                  padding: '0 20px',
                  height: '38px',
                  fontWeight: '500',
                  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)'
                }}
              >
                {editingItem ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            color: '#1677ff'
          }}>
            <InfoCircleOutlined />
            <span>Chi tiết thuốc</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            type="primary" 
            onClick={() => setDetailModalVisible(false)}
            style={{ 
              borderRadius: '8px',
              padding: '0 20px',
              height: '38px',
              fontWeight: '500'
            }}
          >
            Đóng
          </Button>,
        ]}
        width={500}
        centered
        destroyOnClose
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: 12,
          },
          body: {
            paddingTop: 24,
            paddingBottom: 24,
          }
        }}
      >
        {selectedItem && (
          <Card
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Title level={4} style={{ margin: 0, color: '#1e3a8a' }}>
                  {selectedItem.itemName}
                </Title>
                <Tag color="blue" style={{ 
                  marginTop: '8px', 
                  borderRadius: '12px', 
                  padding: '2px 12px',
                  fontSize: '14px'
                }}>
                  {selectedItem.category || "Chưa phân loại"}
                </Tag>
              </Col>
              
              <Divider style={{ margin: '0 0 12px' }} />

              <Col span={12}>
                <Text type="secondary" style={{ fontSize: '14px' }}>Số lượng:</Text>
                <div style={{ marginTop: '8px' }}>
                  <Badge
                    count={selectedItem.quantity || 0}
                    showZero
                    overflowCount={9999}
                    style={{
                      backgroundColor: selectedItem.quantity === 0
                        ? "red"
                        : selectedItem.quantity < 10
                          ? "orange"
                          : "green",
                      padding: '0 12px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      borderRadius: '12px',
                      height: '28px',
                      lineHeight: '28px'
                    }}
                  />
                  <Text style={{ marginLeft: '8px', fontSize: '14px' }}>
                    {selectedItem.quantity === 0 
                      ? "(Hết hàng)" 
                      : selectedItem.quantity < 10 
                        ? "(Sắp hết)" 
                        : "(Đủ hàng)"}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: '14px' }}>Đơn vị:</Text>
                <div style={{ marginTop: '8px' }}>
                  <Tag color="cyan" style={{ 
                    borderRadius: '12px', 
                    padding: '2px 12px',
                    fontSize: '14px'
                  }}>
                    {selectedItem.unit || "N/A"}
                  </Tag>
                </div>
              </Col>
              <Col span={24} style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>Mô tả:</Text>
                <div 
                  style={{ 
                    marginTop: '8px', 
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    minHeight: '80px'
                  }}
                >
                  {selectedItem.description 
                    ? selectedItem.description 
                    : <Text type="secondary" italic>Không có mô tả</Text>}
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </Modal>
      
      <style jsx="true">{`
        .inventory-table-row:hover {
          background-color: #e6f7ff !important;
        }
        
        .even-row {
          background-color: white;
        }
        
        .odd-row {
          background-color: #fafafa;
        }
        
        .ant-table-thead > tr > th {
          background: linear-gradient(to bottom, #f0f5ff, #e6f7ff);
          color: #1890ff;
          font-weight: bold;
          border-bottom: 2px solid #91caff;
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default MedicalInventory;
