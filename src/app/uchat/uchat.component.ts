import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { User } from '../chat/interface';
import { ChatService } from './../chat.service';
import { UploadService } from '../upload.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  templateUrl: './uchat.component.html',
  styleUrls: ['./uchat.component.css'],
})
export class UchatComponent implements OnInit, AfterViewInit {
  message = ''; //inputbox for message
  filename: string; //for file upload

  // @ViewChild('message_body') message_body: ElementRef;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @ViewChild('message_container') message_container: ElementRef;
  @ViewChild('input_message') input_message: ElementRef;
  @Input() student: User; //get the information from the parent
  @Input() currentuid: User; //get the information from the parent
  constructor(
    private chatService: ChatService,
    private uploadService: UploadService
  ) {
    this.filename = '';
  }

  ngOnInit(): void {
    console.log('currentuid', this.currentuid);
    // this.message_container.nativeElement.scrollTop = this.message_container.nativeElement.scrollHeight;
  }

  ngAfterViewInit() {
    // changes.prop contains the old and the new value...

    this.message_container.nativeElement.scrollTop = this.message_container.nativeElement.scrollHeight;
    this.input_message.nativeElement.focus();
  }

  //Send message
  //when press Enter or click send button
  sendMessage(): void {
    if (this.message === '') return;
    const time = this.chatService.getCurrentTime();

    // scrolldown automatically
    this.message_container.nativeElement.scrollIntoView();
    this.message_container.nativeElement.scrollTop = this.message_container.nativeElement.scrollHeight;
    this.chatService.sendMessage(this.student.uid, this.message);
    this.message = '';
    this.filename = '';
  }

  //Close the chatbox
  onClose() {
    this.chatService.removeStudent(this.student.id);
  }
  //Minimize or maximize the chatbox
  onMinium() {
    this.chatService.changeState(this.student.id);
  }
  // onLink() {
  //   document.getElementById('file').click();
  // }
  // onFileUpload($event) {
  //   this.filename = $event.target.value;
  //   console.log($event);
  // }

  //Cancell the upload
  onCloseUpload() {
    this.filename = '';
  }

  //Upload file
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    this.uploadService
      .upload(formData)
      .pipe(
        map((event) => {}),
        catchError((error: HttpErrorResponse) => {
          return of(`Upload failed:${file.name}`);
        })
      )
      .subscribe((event: any) => {
        if (typeof event === 'object') {
          console.log(event.body);
        }
      });
  }

  // This is called when click the upload button
  onLink() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      //for (let index = 0; index < fileUpload.files.length; index++)
      //{
      const file = fileUpload.files[0];
      console.log(file);
      this.filename = file.name;
      //this.files.push({ data: file, inProgress: false, progress: 0});
      //}
      this.uploadFile(file);
    };
    fileUpload.click();
  }
}
