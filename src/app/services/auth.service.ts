/*
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {User} from '../interfaces';
import {Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from "firebase/app";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User | null | undefined>;

  constructor(
    private auth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    // this.user$ = authState(auth).pipe(
    this.user$ = this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          // return docData(doc(this.afs, `users/${user.uid}`))
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
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
*/

import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {User} from '../interfaces';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import firebase from 'firebase/compat/app';
const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User | null | undefined>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  async googleSignIn() {
    const provider = new GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData(user: firebase.User | null) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user?.uid}`);
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
