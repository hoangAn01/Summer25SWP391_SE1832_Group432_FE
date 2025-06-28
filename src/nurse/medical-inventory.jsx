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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "../config/axios";
import { toast } from "react-toastify";

const { Option } = Select;
const { TextArea } = Input;

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

  const units = ["Viên", "Chai", "Gói", "Cái"];

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
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category) => (
        <Tag color="blue" key={category}>
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

        return (
          <Badge
            count={quantity || 0}
            showZero
            color={color}
            style={{ backgroundColor: color }}
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
      render: (unit) => unit || "-",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (description) => (
        <Tooltip title={description}>
          <span>
            {description
              ? description.length > 50
                ? `${description.substring(0, 50)}...`
                : description
              : "Không có mô tả"}
          </span>
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
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thuốc này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.itemID)}
            okText="Có"
            cancelText="Không"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
        >
          <MedicineBoxOutlined style={{ color: "#1677ff" }} />
          Quản lý kho thuốc
        </h2>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Quản lý danh sách thuốc và vật tư y tế trong kho
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số loại thuốc"
              value={totalItems}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số lượng"
              value={totalQuantity}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={outOfStockItems}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm thuốc mới
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchInventory}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
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
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingItem ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          setOriginalItemData(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
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
            label="Tên thuốc"
            rules={[
              { required: true, message: "Vui lòng nhập tên thuốc" },
              { max: 100, message: "Tên thuốc không được quá 100 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên thuốc" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[
                  { max: 50, message: "Danh mục không được quá 50 ký tự" },
                ]}
              >
                <Select placeholder="Chọn danh mục" allowClear>
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
                label="Đơn vị"
                rules={[{ max: 20, message: "Đơn vị không được quá 20 ký tự" }]}
              >
                <Select placeholder="Chọn đơn vị" allowClear>
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
            label="Số lượng"
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
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ max: 255, message: "Mô tả không được quá 255 ký tự" }]}
          >
            <TextArea
              placeholder="Nhập mô tả về thuốc"
              rows={4}
              maxLength={255}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingItem(null);
                  setOriginalItemData(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết thuốc"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={500}
      >
        {selectedItem && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Tên thuốc:</strong>
                <br />
                {selectedItem.itemName}
              </Col>
              <Col span={12}>
                <strong>Danh mục:</strong>
                <br />
                <Tag color="blue">
                  {selectedItem.category || "Chưa phân loại"}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>Số lượng:</strong>
                <br />
                <Badge
                  count={selectedItem.quantity || 0}
                  showZero
                  overflowCount={9999}
                  color={
                    selectedItem.quantity === 0
                      ? "red"
                      : selectedItem.quantity < 10
                      ? "orange"
                      : "green"
                  }
                />
              </Col>
              <Col span={12}>
                <strong>Đơn vị:</strong>
                <br />
                {selectedItem.unit || "-"}
              </Col>
              <Col span={24}>
                <strong>Mô tả:</strong>
                <br />
                {selectedItem.description || "Không có mô tả"}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalInventory;
