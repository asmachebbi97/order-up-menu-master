
import { Navigate } from 'react-router-dom';

// Redirects to the HomePage component
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
