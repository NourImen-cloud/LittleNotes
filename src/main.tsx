import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  const { registerSW } = await import('virtual:pwa-register')
  registerSW({ immediate: true })
} catch (e) {
  console.warn('PWA registration skipped or unsupported:', e)
}

class RootErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF6EF', padding: '24px', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '440px', backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌿</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#37343C', marginBottom: '8px' }}>LittleNotes Recovery</h2>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '16px' }}>
              The app encountered an unexpected issue while loading data. Click below to refresh safely:
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#37343C', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                Reload App
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('littlenotes_sync_room_v1');
                  window.location.reload();
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#f1f1f1', color: '#333', border: '1px solid #ccc', cursor: 'pointer' }}
              >
                Reset Sync
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
