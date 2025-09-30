import { HttpInterceptorFn } from '@angular/common/http';

export const contentTypeInterceptor: HttpInterceptorFn = (request, next) => {
  // Only set Content-Type header if it's not already present and the request has a body
  const hasBody = request.body !== null && request.body !== undefined;
  const hasContentType = request.headers.has('Content-Type');
  
  if (hasBody && !hasContentType) {
    const updatedRequest = request.clone({
      setHeaders: { 'Content-Type': 'application/json' }
    });
    return next(updatedRequest);
  }

  return next(request);
};
