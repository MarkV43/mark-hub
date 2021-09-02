import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {collection, collectionSnapshots, deleteDoc, doc, Firestore, setDoc} from "@angular/fire/firestore";
import {Observable} from "rxjs";
import {debounceTime, map} from "rxjs/operators";
import {FormControl, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {ErrorStateMatcher} from "@angular/material/core";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

type Punishment = {
  id: string,
  description: string,
  difficulty: number,
  explanation: string,
  afar: boolean,
  tell: boolean
}

const defaultPunishment = { id: '', description: '', difficulty: 0, explanation: '', afar: true, tell: true };

@Component({
  selector: 'app-gaby',
  templateUrl: './gaby.component.html',
  styleUrls: ['./gaby.component.scss']
})
export class GabyComponent implements OnInit {

  @ViewChild('formHolder') formHolder?: ElementRef;
  punishments: Observable<Punishment[]>;
  seed: string = '';
  formVisible: boolean = false;
  addEditPunishment = {...defaultPunishment} as Punishment;
  editOver: boolean[] = [];
  deleteOver: boolean[] = [];

  descriptionFormControl = new FormControl('', [
    Validators.required
  ]);
  difficultyFormControl = new FormControl('', [
    Validators.min(0),
    Validators.max(10)
  ]);

  matcher = new MyErrorStateMatcher()

  constructor(
    private afs: Firestore
  ) {
    this.punishments = collectionSnapshots(collection(this.afs, 'punishments')).pipe(
      debounceTime(150),
      map(actions =>
        actions.map(act => {
          return {id: act.id, ...act.data()} as Punishment;
        })
      )
    );
  }

  addPunishment() {
    this.addEditPunishment = {...defaultPunishment} as Punishment;
    this.formVisible = true;
  }

  editPunishment(pun: Punishment) {
    this.addEditPunishment = {...pun} as Punishment;
    this.formVisible = true;
  }

  deletePunishment(id: string) {
    deleteDoc(doc(collection(this.afs, 'punishments'), id))
      .catch(console.error);
  }

  addOrEditPunishmentSubmit() {
    let docRef;
    if (!this.addEditPunishment.id) {
      docRef = doc(collection(this.afs, 'punishments'));
      this.addEditPunishment.id = docRef.id;
    } else {
      docRef = doc(collection(this.afs, 'punishments'), this.addEditPunishment.id);
    }
    setDoc(docRef, this.addEditPunishment).then(() => {
      this.formVisible = false;
    });
  }

  ngOnInit() {
  }

  start = false;

  dialogMouseDown($event: MouseEvent) {
    if ($event.target === this.formHolder!!.nativeElement) {
      this.start = true;
    }
  }

  dialogMouseUp($event: MouseEvent) {
    if ($event.target === this.formHolder!!.nativeElement && this.start) {
      this.formVisible = false;
    }
    this.start = false;
  }
}
