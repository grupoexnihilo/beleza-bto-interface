import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth, db } from '../firebaseconfig';
import './LoginForm.css';

// Lembre-se de colocar a sua logo na pasta 'src'
import logoBelezaBTO from '../logo-beleza-bto.png';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const auth = getAuth(app);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O login foi bem-sucedido, o nosso App.jsx irá detetar a mudança
    } catch (err) {
      setError('Email ou senha inválidos. Por favor, tente novamente.');
      console.error("Erro de autenticação:", error);
    }
  };
  // FUNÇÃO DE RECUPERAÇÃO DE SENHA
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Por favor, digite o seu email para redefinir a senha.");
      return;
    }
    const auth = getAuth(app);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Email de redefinição de senha enviado! Verifique a sua caixa de entrada.");
    } catch (err) {
      setError("Não foi possível enviar o email de redefinição.");
      console.error("Erro ao redefinir senha:", err);
    }
  };
  return (
    <div className="login-container">
<img src={logoBelezaBTO} alt="Beleza BTO Logo" className="login-logo" />      <form onSubmit={handleLogin} className="login-form">
        <h2>Acesso ao Painel</h2>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">Entrar</button>
             <a href="#" onClick={handlePasswordReset} className="forgot-password-link">
        Esqueci minha senha
      </a>
      </form>
    </div>
  );
}

export default LoginForm;