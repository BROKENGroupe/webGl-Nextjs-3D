import { memo } from "react";

const LoadingComponent = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <div>Cargando...</div>
    </div>
  </div>
));

LoadingComponent.displayName = 'LoadingComponent';

export { LoadingComponent };