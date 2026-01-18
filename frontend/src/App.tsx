import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <h1 className="text-3xl font-bold text-center py-8">
            CS2 WeaponPaints Web Interface
          </h1>
          <p className="text-center text-gray-600">
            Project structure initialized. Ready for implementation.
          </p>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
