import { ChatService } from './../chat.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { User, Group } from './interface';

import { createOfflineCompileUrlResolver } from '@angular/compiler';
@Component({
  selector: 'app-root',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  students: User[];
  userlist: User[];
  currentuid: string;
  currentStudents: User[];
  inactiveStudents: User[];
  userid: string;
  group_id: string;
  groupList: Group[];
  username: string;
  input_userid: string;
  @ViewChild('group') groupRef: ElementRef;
  isList: boolean; //for popup of student list
  isListIcon: boolean; //for list icon of students
  constructor(private chatService: ChatService) {
    this.isList = false;
    this.isListIcon = false;
    this.username = '';
    this.group_id = '';
    this.userid = '';
  }
  ngOnInit(): void {
    this.getUserList();
    this.getGroupList();
    this.getStudents();
    this.getCurrentStudents();
    this.getInactiveStudents();
  }

  //get all students
  getStudents() {
    this.chatService.studentsChanged$.subscribe((students) => {
      this.students = students;
    });
  }

  //get the list of students who is currently showing chatbox
  getCurrentStudents() {
    // this.currentStudents = this.chatService.currentStudents;
    const obj = this;
    this.chatService.currentStudentsChanged$.subscribe((currentStudents) => {
      this.currentStudents = currentStudents.map((student) => {
        let tmp = student;
        tmp.messages = tmp.messages.map((message) => {
          const arr = obj.userlist.filter(
            (user) => user.uid === message.receiver
          );
          return { ...message, receivername: arr[0].name };
        });
        const arr = this.userlist.filter((user) => user.id === this.userid);
        this.currentuid = arr[0].uid;
        tmp.messages = tmp.messages.filter((message) => {
          if (
            (message.sender === student.uid &&
              message.receiver === this.currentuid) ||
            (message.sender === this.currentuid &&
              message.receiver === student.uid)
          )
            return true;
          else return false;
        });
        return tmp;
      });
      console.log('current', currentStudents);
    });
  }

  //get the list of users
  getUserList() {
    // this.currentStudents = this.chatService.currentStudents;
    this.chatService.userListChanged$.subscribe((userlist) => {
      this.userlist = userlist;
    });
  }

  //get the list of students who is not showing chatbox
  getInactiveStudents() {
    // this.currentStudents = this.chatService.currentStudents;
    this.chatService.inactiveStudentsChanged$.subscribe((inactiveStudents) => {
      if (inactiveStudents.length >= 1) this.isListIcon = true;
      else this.isListIcon = false;
      this.inactiveStudents = inactiveStudents;
    });
  }

  //Show the popup of students
  showList() {
    this.isList = !this.isList;
  }

  //add new Student
  //This is called when a new student sen
  addCurrentStudent(id, name) {
    this.chatService.addCurrentStudent(id);
  }

  // when clicking the Joing button
  onJoin() {
    if (this.input_userid === '') alert('Please inupt user ID');
    else if (this.username === '') alert('Please input user name');
    else if (this.group_id === '') alert('Please input group id');
    else {
      this.userid = this.input_userid;
      this.chatService.addUser(this.userid, this.username, this.group_id);
    }
  }
  getGroupList() {
    this.chatService.groupListChanged$.subscribe((grouplist) => {
      this.groupList = grouplist;
    });
  }
  //select group
  onSelectGroup(group_id) {
    this.group_id = group_id;
    const divs = this.groupRef.nativeElement.children;
    this.groupList.map((group) => {
      if (group.id === this.group_id) {
        document.getElementById(group_id).className = 'selected';
      } else document.getElementById(group.id).className = '';
      return group;
    });

    // divs.map((div) => {
    //   if (div.id === group_id) div.class = 'selected';
    //   else div.class = '';
    //   return div;
    // });
  }
  onCreateGroup() {
    const groupname = prompt('Please input Group name');
    const arr = this.groupList.map((item) => {
      return item.name;
    });
    if (arr.includes(groupname)) alert('This group name is already exist.');
    else this.chatService.createGroup(groupname);
  }
}
