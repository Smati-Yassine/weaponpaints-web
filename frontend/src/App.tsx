import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WeaponsPage from './pages/WeaponsPage';
import KnivesPage from './pages/KnivesPage';
import GlovesPage from './pages/GlovesPage';
import AgentsPage from './pages/AgentsPage';
import MusicPage from './pages/MusicPage';
import PinsPage from './pages/PinsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout>
                  <HomePage />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/weapons"
            element={
              <AuthGuard>
                <Layout>
                  <WeaponsPage />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/knives"
            element={
              <AuthGuard>
                <Layout>
                  <KnivesPage />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/gloves"
            element={
              <AuthGuard>
                <Layout>
                  <GlovesPage />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/agents"
            element={
              <AuthGuard>
                <Layout>
                  <AgentsPage />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/music"
            element={
              <AuthGuard>
                <Layout>
                  <MusicPage />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/pins"
            element={
              <AuthGuard>
                <Layout>
                  <PinsPage />
                </Layout>
              </AuthGuard>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
