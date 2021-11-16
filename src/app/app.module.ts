import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './contents/login/login.component';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {enableIndexedDbPersistence, getFirestore, provideFirestore} from "@angular/fire/firestore";
import {getAuth, provideAuth} from "@angular/fire/auth";
import {environment} from "../environments/environment";
import {MainComponent} from './contents/main/main.component';
import {PageNotFoundComponent} from './contents/page-not-found/page-not-found.component';
import {GabyComponent} from './contents/gaby/gaby.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {ServiceWorkerModule} from '@angular/service-worker';
import {MatToolbarModule} from "@angular/material/toolbar";
import {ProjectsComponent} from './contents/projects/projects.component';
import {HangmanComponent} from './contents/projects/hangman/hangman.component';
import {getStorage, provideStorage} from "@angular/fire/storage";
import { SkillsComponent } from './contents/skills/skills.component';
import { AboutComponent } from './contents/about/about.component';
import { FabrikDemonstrationComponent } from './contents/projects/fabrik-demonstration/fabrik-demonstration.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    PageNotFoundComponent,
    GabyComponent,
    ProjectsComponent,
    HangmanComponent,
    SkillsComponent,
    AboutComponent,
    FabrikDemonstrationComponent
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
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()), // it is only used on Hangman so far, and lazy loaded
    FormsModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatCardModule,
    MatInputModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatToolbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
