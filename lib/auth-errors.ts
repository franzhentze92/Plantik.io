// Maps Supabase Auth error messages to friendly Spanish copy.
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (m.includes("email not confirmed")) {
    return "Tu cuenta aún no está activa. Intenta iniciar sesión de nuevo.";
  }
  if (m.includes("oauth") || m.includes("provider")) {
    return "No se pudo conectar con Google. Inténtalo de nuevo.";
  }
  if (m.includes("already registered") || m.includes("user already")) {
    return "Ya existe una cuenta con este correo. Inicia sesión.";
  }
  if (m.includes("password should be at least")) {
    return "La contraseña es muy corta (mínimo 6 caracteres).";
  }
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return "El correo no es válido.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }
  return message;
}
