import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    console.log("LOGIN");
  }

  ngOnInit(): void {
  }

  googleSignIn() {
    this.auth.googleSignIn().then(() => {
      this.router.navigate(['/']).catch(console.error);
    });
  }

}
