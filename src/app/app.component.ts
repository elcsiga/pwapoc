import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Note} from '../../common';
import {fromEvent} from 'rxjs/internal/observable/fromEvent';

const serverUrl = 'http://localhost:3000';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  notes: Note[];
  @ViewChild('newnote') newNoteInput;

  constructor(
    private httpClient: HttpClient
  ) {
  }

  updateNotes() {
    this.notes = [];
    this.httpClient.get<Note[]>(serverUrl + '/api/notes').subscribe(
      notes => this.notes = notes,
      e => this.showError(e)
    );
  }
  ngOnInit(): void {
    this.updateNotes();
  }

  onNoteEdited(note: Note) {
    const {id, text} = note;
    const index = this.notes.findIndex(n => n.id === id);
    this.notes[index].text = text;
    this.notes[index].status = 'edited';

    this.httpClient.put<Note>(serverUrl + '/api/notes/' + id, {text}).subscribe(
      n => {
        const index = this.notes.findIndex(n => n.id === id);
        this.notes[index] = n;
      },
      e => {
        this.notes[index].status = 'invalid';
        this.showError(e);
      }
    );
  }

  onNoteDeleted(note: Note) {
    const {id} = note;
    this.httpClient.delete<Note>(serverUrl + '/api/notes/' + id).subscribe(
      noteDeleted => this.notes.splice(this.notes.findIndex(n => noteDeleted.id === n.id), 1),
      e => this.showError(e)
    );
  }

  onNoteAdded() {
    const text = this.newNoteInput.nativeElement.value;
    if (text) {
      this.httpClient.post<Note>(serverUrl + '/api/notes', {text}).subscribe(
        n => {
          this.notes.push(n);
          this.newNoteInput.nativeElement.value = '';
        },
        e => this.showError(e)
      );
    }
  }

  showError(e) {
    //alert(e.error.message);
    console.error(e);
  }
}
