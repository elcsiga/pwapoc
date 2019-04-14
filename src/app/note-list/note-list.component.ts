import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Note} from '../../../common';

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.css']
})
export class NoteListComponent implements OnInit {

  @Input() notes: Note[];
  @Output() onNoteEdited = new EventEmitter<{ note: Note }>();
  @Output() onNoteDeleted = new EventEmitter<{ note: Note }>();

  editedNoteId = -1;

  constructor() {
  }

  ngOnInit() {
  }

}
