interface Student {
  id: string;
  name: string;
  isMin: boolean;
}
interface Group {
  name: string;
  id: string;
  users: string[];
  owner: string;
}
type Message = {
  sender: string;
  receiver: string;
  time: string;
  content: string;
  isRead: boolean;
};
interface User {
  uid: string;
  name: string;
  id: string;
  messages: Message[];
  isMin: boolean;
}

export { Student, Group, User };
