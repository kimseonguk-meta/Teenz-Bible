const plugin =
  globalThis.Capacitor?.Plugins?.FirebaseAuthentication ||
  globalThis.FirebaseAuthentication ||
  null;

const unavailable = async () => {
  throw new Error("FirebaseAuthentication plugin is unavailable");
};

const FirebaseAuthentication = plugin || {
  signInWithGoogle: unavailable,
  signInWithApple: unavailable,
  signOut: async () => {},
};

export { FirebaseAuthentication };
