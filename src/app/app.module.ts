import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './contents/login/login.component';
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB429x8lwBvwlPS1HgcHdncMmE10yAMaWY",
  authDomain: "markhub-e75e1.firebaseapp.com",
  projectId: "markhub-e75e1",
  storageBucket: "markhub-e75e1.appspot.com",
  messagingSenderId: "477057600122",
  appId: "1:477057600122:web:99c3cba482c587ca7bc9c3",
  measurementId: "G-RNX0R4BFXX"
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    /*provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => {
      const firestore = getFirestore();
      enableIndexedDbPersistence(firestore);
      return firestore;
    }),
    provideAuth(() => initializeAuth(getApp()))*/
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
