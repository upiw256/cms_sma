import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const showAlert = (options: any) => {
  return MySwal.fire({
    position: 'center',
    ...options
  });
};

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success') => {
  return Toast.fire({
    icon,
    title
  });
};

export const showConfirm = async (title: string, text: string = "") => {
  const result = await MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal'
  });
  return result.isConfirmed;
};
