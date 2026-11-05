import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Revisa tu red y la URL de la API.';
  }
  if (err.status === 422 && err.error?.errors) {
    return (Object.values(err.error.errors) as string[][]).flat().join(' ');
  }
  return err.error?.message || 'Ocurrió un error inesperado.';
}
