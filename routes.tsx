import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SearchSkills from './pages/SearchSkills';
import SkillDetails from './pages/SkillDetails';
import NewSkill from './pages/NewSkill';
import BookSession from './pages/BookSession';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
    visible: true,
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false,
  },
  {
    name: 'Register',
    path: '/register',
    element: <Register />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
    visible: false,
  },
  {
    name: 'Search Skills',
    path: '/search',
    element: <SearchSkills />,
    visible: true,
  },
  {
    name: 'Skill Details',
    path: '/skills/:id',
    element: <SkillDetails />,
    visible: false,
  },
  {
    name: 'New Skill',
    path: '/skills/new',
    element: <NewSkill />,
    visible: false,
  },
  {
    name: 'Book Session',
    path: '/booking/:skillId',
    element: <BookSession />,
    visible: false,
  },
  {
    name: 'Sessions',
    path: '/sessions',
    element: <Sessions />,
    visible: false,
  },
  {
    name: 'Settings',
    path: '/settings',
    element: <Settings />,
    visible: false,
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <Profile />,
    visible: false,
  },
  {
    name: 'User Profile',
    path: '/profile/:id',
    element: <Profile />,
    visible: false,
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
    visible: false,
  },
];

export default routes;
