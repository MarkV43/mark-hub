import { Component, OnInit } from '@angular/core';
import {collection, collectionData, Firestore, query, where} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  public projects$: Observable<any>;

  constructor(
    private afs: Firestore,
    private router: Router
  ) {
    const collectionRef = collection(this.afs, 'projects');
    const q = query(collectionRef, where("public", "==", true));
    this.projects$ = collectionData(q);
  }

  ngOnInit(): void {}

  goToProject(path: string) {
    this.router.navigate(['/projects', path])
      .catch(console.error);
  }
}
