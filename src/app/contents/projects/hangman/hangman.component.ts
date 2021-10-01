import {Component, Input, OnInit} from '@angular/core';
import {getDownloadURL, ref, Storage} from "@angular/fire/storage";
import {doc, Firestore, getDoc} from "@angular/fire/firestore";
import db from './database';

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  styleUrls: ['./hangman.component.scss']
})
export class HangmanComponent implements OnInit {

  private db: any = db;
  @Input() language = 'portuguese';

  constructor(
    private afs: Firestore,
    private storage: Storage
  ) {}

  async ngOnInit() {
    const realVersion = (await getDoc(doc(this.afs, `dictionaries/${this.language}`))).data()?.version;
    if (localStorage.getItem(`hangmanDictionary${this.language}`) != realVersion) {
      localStorage.setItem(`hangmanDictionary${this.language}`, realVersion);

      const dictRef = ref(this.storage, `dictionaries/dictionary-${this.language}.txt`);
      getDownloadURL(dictRef)
        .then((url) => {
          console.log(`Got URL "${url}"`)
          const xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = async () => {
            console.log(xhr.response);
            this.updateDict(await xhr.response.text());
          };
          xhr.open('GET', url);
          xhr.send();
        }).catch(console.error);
    }

    // const hm = Hangman.new();
    // const pointer = hm.create_array_for_size(5, 3);
    // const array = new Uint8Array(memory.buffer, pointer, 15);
    // const words = ["chave", "carro"];
    // for (let k = 0; k < 2; k++) {
    //   const word = words[k];
    //   for (let i = 0; i < 5; i++) {
    //     array[k * 5 + i] = word.charCodeAt(i);
    //   }
    // }
    // hm.get_word(5, 1);
    // console.log(hm.get_data());
  }

  updateDict(text: string) {
    const words = text.split('\r\n').map(line => line.split(' ')).filter(line => line.length === 2);
    this.db[this.language].clear();
    console.log(words.length);
    for (let i = 0; i < words.length; i++) {
      const line = words[i];
      try {
        const word = line[0].trim();
        const value = line[1].trim();
        this.db[this.language].put({name: word, value, length: value.length});
      } catch (e) {
        console.log({line});
      }
    }
  }
}
