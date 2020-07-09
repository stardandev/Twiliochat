import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { Student, User, Group } from './chat/interface';

import {
  AngularFireDatabase,
  AngularFireObject,
  AngularFireList,
} from '@angular/fire/database';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  students: User[] = [];
  groupid: string;
  groupRef: AngularFireList<any>;
  grouplist: Group[] = [];
  usersRef: AngularFireList<any>;
  userlist: User[] = [];
  currentuserid: string;
  currentStudents: User[] = [];
  inactiveStudents: User[] = [];
  groupListChanged$ = new BehaviorSubject<Group[]>([]);
  userListChanged$ = new BehaviorSubject<User[]>([]);
  currentStudentsChanged$ = new BehaviorSubject<User[]>([]);
  studentsChanged$ = new BehaviorSubject<User[]>([]);
  inactiveStudentsChanged$ = new BehaviorSubject<User[]>([]);

  constructor(private db: AngularFireDatabase) {
    this.groupRef = db.list('grouplist');
    this.usersRef = db.list('userlist');
    // this.groupid = '';
    this.getGroupList();
    this.getUserList();
  }
  addStudent(id) {
    const arr = this.userlist.filter((user) => user.id === id);
    arr[0].isMin = false;
    this.students.unshift(arr[0]);
  }
  addCurrentStudent(id) {
    const tmp = this.currentStudents.filter((student) => student.id === id);
    if (tmp.length === 0) {
      const arr = this.userlist.filter((user) => user.id === id);
      arr[0].isMin = false;
      this.currentStudents.unshift(arr[0]);
      console.log(this.currentStudents);
      this.currentStudentsChanged$.next(this.currentStudents);
    }
    let count = 0;
    if (this.currentStudents.length > 4) {
      const tmp = this.currentStudents[this.currentStudents.length - 1];
      this.currentStudents.pop();
      this.inactiveStudents.unshift(tmp);
    } else {
      this.currentStudents.map((student) => {
        if (!student.isMin) count++;
      });
      if (this.currentStudents.length > 3)
        if (count >= 2) {
          const tmp = this.currentStudents[this.currentStudents.length - 1];
          this.currentStudents.pop();
          this.inactiveStudents.unshift(tmp);
        }
    }
    this.inactiveStudents = this.inactiveStudents.filter(
      (student) => student.id !== id
    );
    this.inactiveStudentsChanged$.next(this.inactiveStudents);
  }
  removeStudent(id) {
    this.currentStudents = this.currentStudents.filter(
      (student) => student.id !== id
    );
    if (this.inactiveStudents.length > 0) {
      let tmp = this.inactiveStudents[0];
      tmp.isMin = true;
      this.currentStudents.push(tmp);
      this.inactiveStudents.shift();
      this.inactiveStudentsChanged$.next(this.inactiveStudents);
    }

    this.currentStudentsChanged$.next(this.currentStudents);
  }
  activeStudent(id) {
    let index = 0;
    let tmp;
    this.students.map((student, i) => {
      if (student.id === id) {
        tmp = student;
        index = i;
      }
      return student;
    });
    this.students.splice(index, 1);
    this.students.unshift(tmp);
  }
  changeState(id) {
    this.currentStudents = this.currentStudents.map((student) => {
      if (student.id === id) student.isMin = !student.isMin;
      return student;
    });
  }
  getStudents() {
    const obj = this.db.object('grouplist/' + this.groupid);
    obj.snapshotChanges().subscribe((group) => {
      const data = group.payload.val() as Group;
      const users = data.users;
      let arr = this.userlist.filter((user) => users.includes(user.uid));
      arr = arr.filter((user) => user.uid !== this.currentuserid);
      this.students = arr;

      this.studentsChanged$.next(this.students);
    });
  }
  getCurrentTime(): string {
    let today = new Date();
    const h = today.getHours();
    const c_h = h >= 12 ? h - 12 : h;
    const am = h >= 12 ? ' PM' : 'AM';
    const m = today.getMinutes();
    let m_s = '';
    if (m < 10) m_s = '0' + m;
    else m_s = m.toString();
    let time = c_h + ':' + m_s + am;

    return time;
  }

  getFullTime(): string {
    let today = new Date();
    const h = today.getHours();
    const c_h = h >= 12 ? h - 12 : h;
    const am = h >= 12 ? ' PM' : 'AM';
    const m = today.getMinutes();
    let m_s = '';
    if (m < 10) m_s = '0' + m;
    else m_s = m.toString();
    const mm = today.getMonth();
    const d = today.getDay();
    let time = mm + ':' + d + '  ' + c_h + ':' + m_s + am;

    return time;
  }
  //get group list
  getGroupList() {
    this.groupRef.snapshotChanges().subscribe((list) => {
      this.grouplist = [];
      list.map((group) => {
        const data = group.payload.val();
        this.grouplist.push({ id: group.key, ...data });
        return 0;
      });
      this.groupListChanged$.next(this.grouplist);
    });
  }
  //create group
  createGroup(name) {
    this.groupRef.push({ name, owner: 'test', users: [] });
  }

  //get user list
  getUserList() {
    this.usersRef.snapshotChanges().subscribe((list) => {
      this.userlist = [];
      list.map((user) => {
        const data = user.payload.val();
        this.userlist.push({ uid: user.key, ...data });
        return 0;
      });
      this.userListChanged$.next(this.userlist);
      if (this.currentuserid) {
        this.currentStudents = this.currentStudents.map((student) => {
          const arr = this.userlist.filter((user) => user.uid === student.uid);
          return arr[0];
        });
        this.currentStudentsChanged$.next(this.currentStudents);
        this.getStudents();
      }
    });
  }
  addUser(id, name, groupid) {
    this.groupid = groupid;
    const arr = this.userlist.filter((user) => user.id === id);

    const group = this.grouplist.filter((group) => group.id === groupid);
    const obj = this.db.object('grouplist/' + groupid);
    if (!group[0].users) group[0].users = [];
    if (arr.length === 0) {
      const res = this.usersRef.push({ id, name, messages: [] });
      this.currentuserid = res.key;
      delete group[0].id;
      group[0].users.push(res.key);
      obj.update(group[0]);
    } else {
      this.currentuserid = arr[0].uid;
      if (!group[0].users.includes(arr[0].uid)) {
        group[0].users.push(arr[0].uid);
        obj.update(group[0]);
      }
    }
    this.getStudents();
  }

  //send message
  sendMessage(receiverid, message) {
    const senderobj = this.db.object('userlist/' + this.currentuserid);
    const sender = this.userlist.filter(
      (user) => user.uid === this.currentuserid
    );
    console.log('currentuiser id', this.currentuserid);
    const receiver = this.userlist.filter((user) => user.uid === receiverid);
    if (!sender[0].messages) sender[0].messages = [];
    const tmp_data = {
      sender: this.currentuserid,
      receiver: receiverid,
      content: message,
      time: this.getFullTime(),
      isRead: false,
    };
    sender[0].messages.push(tmp_data);
    senderobj.update(sender[0]);
    const receiveobj = this.db.object('userlist/' + receiverid);
    if (!receiver[0].messages) receiver[0].messages = [];
    receiver[0].messages.push(tmp_data);
    receiveobj.update(receiver[0]);
    // this.currentStudents = this.currentStudents.map((student) => {
    //   if (student.uid === receiverid || student.uid === this.currentuserid) {
    //     student.messages.push(tmp_data);
    //   }
    //   return student;
    // });
  }
}
