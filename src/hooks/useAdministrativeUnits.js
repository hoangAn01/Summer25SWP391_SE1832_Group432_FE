import { useState, useMemo } from 'react';
import administrativeUnits from '../utils/administrative-units/vietnam-administrative-units.json';

export const useAdministrativeUnits = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const provinces = useMemo(() => 
    administrativeUnits.map(province => ({
      id: province.level1_id,
      name: province.name,
      type: province.type
    })).sort((a, b) => a.name.localeCompare(b.name)), 
    []
  );

  const districtsByProvince = useMemo(() => {
    if (!selectedProvince) return [];
    const province = administrativeUnits.find(p => p.level1_id === selectedProvince);
    return province ? province.level2s.map(district => ({
      id: district.level2_id,
      name: district.name,
      type: district.type
    })) : [];
  }, [selectedProvince]);

  const wardsByDistrict = useMemo(() => {
    if (!selectedDistrict) return [];
    const province = administrativeUnits.find(p => 
      p.level2s.some(d => d.level2_id === selectedDistrict)
    );
    const district = province?.level2s.find(d => d.level2_id === selectedDistrict);
    return district ? district.level3s.map(ward => ({
      id: ward.level3_id,
      name: ward.name,
      type: ward.type
    })) : [];
  }, [selectedDistrict]);

  const resetSelection = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
  };

  return {
    provinces,
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