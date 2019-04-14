import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Note} from '../../common';

const serverUrl = 'http://localhost:3000';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public notes;

  @ViewChild('newnote') newNoteInput;

  constructor(
    private httpClient: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.httpClient.get(serverUrl + '/api/notes').subscribe(
      notes => this.notes = notes,
      e => this.showError(e)
    );
  }

  onNoteEdited(note: Note) {
    const {id, text} = note;
    this.notes.find(n => n.id === id).text = text;
    this.httpClient.put<Note>(serverUrl + '/api/notes/' + id, {text}).subscribe(
      n => console.log(n),
      e => this.showError(e)
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
    alert(e.error.message);
    console.error(e);
  }
}
