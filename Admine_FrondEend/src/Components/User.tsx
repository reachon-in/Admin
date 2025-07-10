import { Routes, Route } from 'react-router-dom';
import UserOverView from './Users/UserOverView';

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<UserOverView />} />
    </Routes>
  );
};

export default Dashboard;
