import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return next(request);
  }

  // Only set the Authorization header if it's not already present
  const updatedRequest = request.headers.has('Authorization')
    ? request
    : request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });

  return next(updatedRequest);
};


