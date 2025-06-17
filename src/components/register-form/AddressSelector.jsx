import React from 'react';
import { Select, Form } from 'antd';
import { useAddressSelector } from '../../hooks/useAddressSelector';

const { Option } = Select;

export const AddressSelector = ({ 
  onChange, 
  formItemLayout = {},
  required = true 
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
  } = useAddressSelector();

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
        rules={[{ required, message: 'Vui lòng chọn tỉnh/thành phố' }]}
      >
        <Select
          showSearch
          placeholder="Chọn tỉnh/thành phố"
          optionFilterProp="children"
          onChange={handleProvinceChange}
          value={selectedProvince}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {provinces.map(province => (
            <Option key={province.code} value={province.code}>
              {province.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {selectedProvince && (
        <Form.Item 
          label="Quận/Huyện" 
          {...formItemLayout}
          rules={[{ required, message: 'Vui lòng chọn quận/huyện' }]}
        >
          <Select
            showSearch
            placeholder="Chọn quận/huyện"
            optionFilterProp="children"
            onChange={handleDistrictChange}
            value={selectedDistrict}
            disabled={!selectedProvince}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {districtsByProvince.map(district => (
              <Option key={district.code} value={district.code}>
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
          rules={[{ required, message: 'Vui lòng chọn phường/xã' }]}
        >
          <Select
            showSearch
            placeholder="Chọn phường/xã"
            optionFilterProp="children"
            onChange={handleWardChange}
            value={selectedWard}
            disabled={!selectedDistrict}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {wardsByDistrict.map(ward => (
              <Option key={ward.code} value={ward.code}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </>
  );
}; 