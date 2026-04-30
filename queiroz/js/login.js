document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const btnSubmit = document.getElementById('btnSubmit');
  const errorMessage = document.getElementById('errorMessage');
  const loginCard = document.getElementById('loginCard');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede recarregamento da página

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Estado de Loading
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    btnSubmit.style.opacity = '0.8';
    btnSubmit.disabled = true;
    errorMessage.style.display = 'none';

    // Simulação de tempo de resposta de API (1.5 segundos)
    setTimeout(() => {
      // Validação fake de usuário (admin / 1234)
      if (email === 'admin' && password === '1234') {
        window.location.href = 'index.html'; // Redireciona para o projeto
      } else {
        // Erro
        btnSubmit.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar no Sistema';
        btnSubmit.style.opacity = '1';
        btnSubmit.disabled = false;
        
        errorMessage.style.display = 'block';
        
        // Animação visual de erro (shake)
        loginCard.style.animation = 'none'; // Reseta animação
        setTimeout(() => {
          loginCard.style.animation = 'shake 0.4s ease-in-out';
        }, 10);
      }
    }, 1500);
  });
});