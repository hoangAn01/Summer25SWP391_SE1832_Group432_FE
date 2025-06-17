import React from 'react';
import { Select, Form } from 'antd';
import { useAdministrativeUnits } from '../../hooks/useAdministrativeUnits';

const { Option } = Select;

export const AdministrativeUnitSelector = ({ 
  onChange, 
  formItemLayout = {} 
}) => {
  const {
    provinces,
    districtsByProvince,
    wardsByDistrict,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard
  } = useAdministrativeUnits();

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedDistrict(null);
    setSelectedWard(null);
    onChange?.({
      province: value,
      district: null,
      ward: null
    });
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedWard(null);
    onChange?.({
      province: selectedProvince,
      district: value,
      ward: null
    });
  };

  const handleWardChange = (value) => {
    setSelectedWard(value);
    onChange?.({
      province: selectedProvince,
      district: selectedDistrict,
      ward: value
    });
  };

  return (
    <>
      <Form.Item 
        label="Tỉnh/Thành phố" 
        {...formItemLayout}
        rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
      >
        <Select
          showSearch
          placeholder="Chọn tỉnh/thành phố"
          optionFilterProp="children"
          onChange={handleProvinceChange}
          value={selectedProvince}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {provinces.map(province => (
            <Option key={province.id} value={province.id}>
              {province.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {selectedProvince && (
        <Form.Item 
          label="Quận/Huyện" 
          {...formItemLayout}
          rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
        >
          <Select
            showSearch
            placeholder="Chọn quận/huyện"
            optionFilterProp="children"
            onChange={handleDistrictChange}
            value={selectedDistrict}
            disabled={!selectedProvince}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {districtsByProvince.map(district => (
              <Option key={district.id} value={district.id}>
                {district.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}

      {selectedProvince && selectedDistrict && (
        <Form.Item 
          label="Phường/Xã" 
          {...formItemLayout}
          rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
        >
          <Select
            showSearch
            placeholder="Chọn phường/xã"
            optionFilterProp="children"
            onChange={handleWardChange}
            value={selectedWard}
            disabled={!selectedDistrict}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {wardsByDistrict.map(ward => (
              <Option key={ward.id} value={ward.id}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </>
  );
}; 