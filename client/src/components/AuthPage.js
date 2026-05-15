import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.username, form.password);
      } else {
        if (!form.nickname) return setError('닉네임을 입력해주세요.');
        await register(form.username, form.password, form.nickname);
      }
    } catch (err) {
      setError(err.response?.data?.error || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>💬</div>
          <h1 style={styles.logoText}>채팅</h1>
          <p style={styles.logoSub}>친구들과 언제 어디서나</p>
        </div>

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }} onClick={() => { setIsLogin(true); setError(''); }}>로그인</button>
          <button style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }} onClick={() => { setIsLogin(false); setError(''); }}>회원가입</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} name="username" placeholder="아이디" value={form.username} onChange={handleChange} required autoComplete="username" />
          <input style={styles.input} name="password" type="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required autoComplete={isLogin ? 'current-password' : 'new-password'} />
          {!isLogin && (
            <input style={styles.input} name="nickname" placeholder="닉네임" value={form.nickname} onChange={handleChange} />
          )}
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'linear-gradient(135deg, #FEE500 0%, #FFD700 100%)', width: '100%', padding: 16 },
  card: { background: '#fff', borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  logo: { textAlign: 'center', marginBottom: 28 },
  logoIcon: { fontSize: 48, marginBottom: 8 },
  logoText: { fontSize: 28, fontWeight: 700, color: '#3A1D96' },
  logoSub: { color: '#888', fontSize: 14, marginTop: 4 },
  tabs: { display: 'flex', marginBottom: 20, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' },
  tab: { flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#888', transition: 'all 0.2s' },
  tabActive: { background: '#FEE500', color: '#3A1D96', fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '12px 14px', border: '1.5px solid #eee', borderRadius: 8, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' },
  error: { color: '#e74c3c', fontSize: 13, textAlign: 'center' },
  button: { padding: '13px', background: '#FEE500', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, color: '#3A1D96', cursor: 'pointer', marginTop: 4, transition: 'background 0.2s' },
};
