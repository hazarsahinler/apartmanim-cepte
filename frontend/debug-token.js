// Token debug script - Browser console'da çalıştırın

const token = localStorage.getItem('token');
console.log('Token:', token);

if (token) {
  try {
    // Token'ı decode et (JWT header olmadan base64 decode)
    const tokenParts = token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('Token payload:', payload);
    console.log('UserId:', payload.userId);
    console.log('Subject:', payload.sub);
    console.log('Expiration:', new Date(payload.exp * 1000));
  } catch (e) {
    console.error('Token decode hatası:', e);
  }
} else {
  console.log('Token bulunamadı');
}