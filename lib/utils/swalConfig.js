// utils/swalConfig.js
import Swal from 'sweetalert2';

export const showConfirmDialog = (options) => {
  const defaultOptions = {
    background: '#1f2937',
    color: '#fff',
    iconColor: '#fbbf24',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'rounded-2xl border border-white/10',
      title: 'text-white font-semibold',
      htmlContainer: 'text-white/80'
    }
  };
  
  return Swal.fire({
    ...defaultOptions,
    ...options
  });
};
