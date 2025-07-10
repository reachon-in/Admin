import { Routes, Route } from 'react-router-dom';
import AllPost from './All Posts/AllPost';
import Createpost from './All Posts/Createpost';
import FirstRpost from './All Posts/FirstRpost';

const Post = () => {
  return (
    <Routes>
      <Route path="/" element={<AllPost />} />
      <Route path="/createpost" element={<Createpost />} />
      <Route path="/firstr" element={<FirstRpost />} />
    </Routes>
  );
};

export default Post;
