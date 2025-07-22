import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../config/axios";
import { Card, Spin, Alert, Button } from "antd";

const StudentHealthProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/HealthProfile/search/${studentId}`);
        setProfile(res.data);
      } catch {
        setError("Không thể tải hồ sơ sức khỏe!");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [studentId]);

  if (loading) return <Spin tip="Đang tải hồ sơ sức khỏe..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!profile) return <Alert type="warning" message="Không tìm thấy hồ sơ sức khỏe cho học sinh này." />;

  return (
    <Card
      title="Hồ sơ sức khỏe học sinh"
      style={{ maxWidth: 600, margin: "40px auto", boxShadow: "0 4px 24px #0001" }}
      extra={<Button onClick={() => navigate("/home")}>Về trang chủ</Button>}
    >
      <p><b>Họ tên:</b> {profile.studentFullName}</p>
      <p><b>Thị lực:</b> {profile.visionTest}</p>
      <p><b>Chiều cao:</b> {profile.height} cm</p>
      <p><b>Cân nặng:</b> {profile.weight} kg</p>
      <p><b>Bệnh mãn tính:</b> {profile.chronicDisease}</p>
      <p><b>Dị ứng:</b> {profile.allergy}</p>
      <p><b>Ngày khám gần nhất:</b> {profile.lastCheckupDate}</p>
    </Card>
  );
};

export default StudentHealthProfile;
