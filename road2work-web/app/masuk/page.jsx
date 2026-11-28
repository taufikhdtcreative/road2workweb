import AuthForm from '../../components/AuthForm';

export const metadata = { title: 'Masuk — Road2Work' };

export default function MasukPage() {
  return (
    <main className="auth-page">
      <div className="glow g1" aria-hidden="true" />
      <div className="glow g2" aria-hidden="true" />
      <a className="logo auth-logo" href="/">
        <span className="logo-dot" aria-hidden="true" />
        Road2Work
      </a>
      <AuthForm />
    </main>
  );
}
