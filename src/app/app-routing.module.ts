import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./contents/login/login.component";
import {MainComponent} from "./contents/main/main.component";
import {GabyComponent} from "./contents/gaby/gaby.component";
import {PageNotFoundComponent} from "./contents/page-not-found/page-not-found.component";
import {AuthGuard} from "./services/auth.guard";
import {ProjectsComponent} from "./contents/projects/projects.component";
import {HangmanComponent} from "./contents/projects/hangman/hangman.component";

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'gaby', component: GabyComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/hangbanana', component: HangmanComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
