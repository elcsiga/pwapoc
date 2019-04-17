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
  loading = false;

  @ViewChild('newnote') newNoteInput;

  constructor(
    private httpClient: HttpClient
  ) {
  }

  updateNotes() {
    this.loading = true;
    this.httpClient.get<Note[]>(serverUrl + '/api/notes').subscribe(
      notes => { this.notes = notes; this.loading = false; },
      e => { this.showError(e); this.loading = false; }
    );
  }

  getCachedNotes() {
    return this.notes ? this.notes.filter(n => n.status === 'cached' || n.status === 'deleted') : [];
  }
  getVisibleNotes() {
    return this.notes ? this.notes.filter(n => n.status !== 'deleted') : [];
  }


  sync() {
    const cachedNotes = this.getCachedNotes();
    console.log('Sync:', cachedNotes);

    this.httpClient.post<Note[]>(serverUrl + '/api/notes/sync', {
      notes: cachedNotes
    }).subscribe(
      notes => {
        alert('SUCCESS!');
      },
      e => {
        alert('ERROR!');
        this.showError(e);
      }
    );
  }

  ngOnInit(): void {
    this.updateNotes();
  }

  onNoteEdited(note: Note) {
    const {id, text} = note;
    const index = this.notes.findIndex(n => n.id === id);
    this.notes[index].text = text;
    this.notes[index].status = 'touched';

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
    const index = this.notes.findIndex(n => n.id === id);
    this.notes[index].status = 'touched';

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
