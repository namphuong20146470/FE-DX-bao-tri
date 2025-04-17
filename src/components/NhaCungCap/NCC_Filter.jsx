export const getUniqueValues = (data, accessor) => {
  return [...new Set(data.map(accessor).filter(Boolean))];
};

export const filterData = (data, options) => {
  const {
    searchTerm = '',
    statusFilter = 'all',
    countryFilter = 'all',
  } = options;

  const search = searchTerm.toLowerCase();

  return data.filter((item) => {
    if (!item) return false;

    const matchesSearch =
      !searchTerm ||
      item.ma_nha_cung_cap?.toLowerCase().includes(search) ||
      item.ten_nha_cung_cap?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'all' || item.trang_thai === statusFilter;

    const matchesCountry =
      countryFilter === 'all' || item.quoc_gia === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });
};
