const handleCreateHealthProfile = async (values) => {
  try {
    // Gọi API tạo hồ sơ sức khỏe
    const response = await api.post('/HealthProfile', values);
    
    // Lấy ID của hồ sơ vừa tạo
    const newHealthProfileId = response.data.id;

    // Lưu thông tin để chuyển trang
    localStorage.setItem('selectedStudentId', values.studentId);
    localStorage.setItem('newHealthProfileId', newHealthProfileId);

    // Chuyển hướng đến trang chi tiết hồ sơ
    navigate(`/student-health-profile/${values.studentId}`);
  } catch (error) {
    console.error('Lỗi tạo hồ sơ:', error);
  }
};
