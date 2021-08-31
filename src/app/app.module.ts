import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './contents/login/login.component';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {enableIndexedDbPersistence, getFirestore, provideFirestore} from "@angular/fire/firestore";
import {getAuth, provideAuth} from "@angular/fire/auth";
import {environment} from "../environments/environment";
// import {AngularFireModule} from "@angular/fire/compat";
// import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
// import {AngularFireAuthModule} from "@angular/fire/compat/auth";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => {
      const firestore = getFirestore();
      enableIndexedDbPersistence(firestore);
      return firestore;
    }),
    provideAuth(() => getAuth())
    /*AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule*/

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
