import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {User} from '../interfaces';
import {Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {doc, docData, Firestore} from "@angular/fire/firestore";
import {Auth, authState} from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User | null | undefined>;

  constructor(
    private auth: Auth,
    private afs: Firestore,
    private router: Router
  ) {
    this.user$ = authState(auth).pipe(
    // this.user$ = this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          return docData<User>(doc(this.afs, `users/${user.uid}`))
          // return doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignIn() {
    const credential = await this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    // const credential = await this.auth.signInWithPopup(provider);
    return this.updateUserData(credential);
  }

  async signOut() {
    await this.auth.signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData(credential: any | null) {
    const user = credential?.user;
    const userRef = this.afs.doc<User>(`users/${user?.uid}`);
    const data = {
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      photoURL: user?.photoURL,
      admin: false
    };
    return userRef.set(data as User, {merge: true});
  }
}
