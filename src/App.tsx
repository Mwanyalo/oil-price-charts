import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ApiKeyGate } from './components/ApiKeyGate';
import { Dashboard } from './pages/Dashboard';
import { Markets } from './pages/Markets';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { isConfigured } from './api/oilApi';

const App = () => {
  if (!isConfigured()) return <ApiKeyGate />;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path='/' element={<Dashboard />} />
        <Route path='/markets' element={<Markets />} />
        <Route path='/history' element={<History />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
