import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  User,
} from '@react-native-firebase/auth';
import {
  GoogleSignin,
  isCancelledResponse,
} from '@react-native-google-signin/google-signin';

import {GOOGLE_WEB_CLIENT_ID} from '../../config/googleAuth';
import {AuthSession} from '../../domain/models/AuthSession';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export class FirebaseAuthService {
  public async restoreSession(): Promise<AuthSession | null> {
    const auth = getAuth();

    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        user => {
          unsubscribe();
          resolve(user ? this.toSession(user) : null);
        },
        error => {
          unsubscribe();
          reject(error);
        },
      );
    });
  }

  public async login(email: string, password: string): Promise<AuthSession> {
    const credential = await signInWithEmailAndPassword(
      getAuth(),
      email.trim(),
      password,
    );
    return this.toSession(credential.user);
  }

  public async register(email: string, password: string): Promise<AuthSession> {
    const credential = await createUserWithEmailAndPassword(
      getAuth(),
      email.trim(),
      password,
    );
    return this.toSession(credential.user);
  }

  public async loginWithGoogle(): Promise<AuthSession> {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const result = await GoogleSignin.signIn();

    if (isCancelledResponse(result)) {
      throw new Error('Google sign-in was cancelled.');
    }

    const idToken = result.data.idToken;
    if (!idToken) {
      throw new Error('Google did not return an identity token.');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const credential = await signInWithCredential(getAuth(), googleCredential);
    return this.toSession(credential.user);
  }

  public async logout(): Promise<void> {
    await signOut(getAuth());
    await GoogleSignin.signOut().catch(() => undefined);
  }

  private toSession(user: User): AuthSession {
    const email = user.email ?? '';
    const fallbackName = email.split('@')[0] || 'Cook';

    return {
      user: {
        id: user.uid,
        email,
        displayName: user.displayName?.trim() || fallbackName,
        photoUrl: user.photoURL,
      },
    };
  }
}

export function toFirebaseAuthMessage(error: unknown): string {
  const code = getErrorCode(error);

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account already uses this email address.',
    'auth/account-exists-with-different-credential':
      'This email already uses another sign-in method.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/network-request-failed': 'Check your internet connection and try again.',
    'auth/operation-not-allowed':
      'Email/password sign-in is not enabled in Firebase Console.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'The email or password is incorrect.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/wrong-password': 'The email or password is incorrect.',
    DEVELOPER_ERROR:
      'Google sign-in is not configured for this build. Add its SHA-1 in Firebase, then install the updated app.',
    '10':
      'Google sign-in is not configured for this build. Add its SHA-1 in Firebase, then install the updated app.',
    PLAY_SERVICES_NOT_AVAILABLE:
      'Google Play services are unavailable or need to be updated.',
  };

  if (code && messages[code]) {
    return messages[code];
  }

  if (
    error instanceof Error &&
    /DEVELOPER_ERROR|developer console is not set up|\bcode:?\s*10\b/i.test(
      error.message,
    )
  ) {
    return 'Google sign-in is not configured for this build. Add its SHA-1 in Firebase, then install the updated app.';
  }

  return error instanceof Error
    ? error.message
    : 'Authentication failed. Please try again.';
}

function getErrorCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (typeof error.code === 'string' || typeof error.code === 'number')
  ) {
    return String(error.code);
  }
  return null;
}
