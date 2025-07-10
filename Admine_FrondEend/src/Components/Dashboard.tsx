import { Routes, Route } from 'react-router-dom';
import Overview from './Dashboard/Overview';

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
    </Routes>
  );
};

export default Dashboard;
