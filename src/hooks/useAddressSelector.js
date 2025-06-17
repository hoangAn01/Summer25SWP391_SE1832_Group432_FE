import { useState, useMemo } from 'react';
import provinces from '../hanhchinhvn-master/dist/tinh_tp.json';
import districts from '../hanhchinhvn-master/dist/quan_huyen.json';
import wards from '../hanhchinhvn-master/dist/xa_phuong.json';

export const useAddressSelector = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  // Danh sách tỉnh thành
  const provinceList = useMemo(() => 
    Object.entries(provinces).map(([code, province]) => ({
      code,
      name: province.name_with_type,
      type: province.type
    })).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  // Danh sách quận/huyện theo tỉnh
  const districtsByProvince = useMemo(() => {
    if (!selectedProvince) return [];
    return Object.entries(districts)
      .filter(([_, district]) => district.parent_code === selectedProvince)
      .map(([code, district]) => ({
        code,
        name: district.name_with_type,
        type: district.type
      })).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedProvince]);

  // Danh sách phường/xã theo quận/huyện
  const wardsByDistrict = useMemo(() => {
    if (!selectedDistrict) return [];
    return Object.entries(wards)
      .filter(([_, ward]) => ward.parent_code === selectedDistrict)
      .map(([code, ward]) => ({
        code,
        name: ward.name_with_type,
        type: ward.type
      })).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedDistrict]);

  const resetSelection = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
  };

  return {
    provinces: provinceList,
    districtsByProvince,
    wardsByDistrict,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
    resetSelection
  };
}; 