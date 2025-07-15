import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, displayName } = await request.json();

    if (action === 'login') {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return NextResponse.json({ 
        success: true, 
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      });
    }

    if (action === 'register') {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // You can add additional user profile creation here
      return NextResponse.json({ 
        success: true, 
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}