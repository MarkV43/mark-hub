import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {doc, docData, Firestore, getDoc, setDoc} from "@angular/fire/firestore";
import {Auth, GoogleAuthProvider, authState, signInWithPopup} from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<any | null>;

  constructor(
    private auth: Auth,
    private afs: Firestore,
    private router: Router
  ) {
    this.user$ = authState(auth).pipe(
    // this.user$ = this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          this.updateUserData(user);
          return docData(doc(this.afs, `users/${user.uid}`))
          // return doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignIn() {
    // const credential = await this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    // const credential = await this.auth.signInWithPopup(provider);
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    this.updateUserData(credential);
  }

  async signOut() {
    await this.auth.signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData(credential: any) {
    const user = credential?.user;
    if (!user) return;
    const userRef = doc(this.afs, `users/${user.uid}`);
    getDoc(userRef).then((docSnapshot) => {
      if (!docSnapshot.exists()) {
        console.log("Creating Document")
        const data = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          admin: false
        };
        setDoc(userRef, data, {merge: true});
      } else {
        console.log("Document exists, ignoring");
      }
    });
    // return userRef.set(data as User, {merge: true});
  }
}
