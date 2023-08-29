// Holds important information queried from the database: allows us to only query the database once to obtain important user information.  Should run after successful login.

class Session{
  // Instance Variables
  auth_id: string | null
  // Not obtained through the database: changes everytime the client is closed and opened -> included here to have all important information in one place
  socket_id: string | null
  username: string | null
  color: string | null
  email: string | null
  bio: string | null
  numPersistantLobbies: number
  // Constructor
  constructor(auth_id:string | null, socket_id:string | null, username:string | null, color:string | null, email:string | null, bio:string | null, numPersistantLobbies:number) {
    this.auth_id = auth_id;
    this.socket_id = socket_id
    this.username = username
    this.color = color
    this.email = email
    this.bio = bio
    this.numPersistantLobbies = numPersistantLobbies
  }
  // Function to change multiple variables at once
  changeInfo(auth_id: string | null, socket_id:string | null, username:string | null, color:string | null, email:string | null, bio:string | null, numPersistantLobbies:number) {
    this.auth_id = auth_id ?? this.auth_id
    this.socket_id = socket_id ?? this.socket_id
    this.username = username ?? this.username
    this.color = color ?? this.color
    this.email = email ?? this.email
    this.bio = bio ?? this.bio
    if(numPersistantLobbies !== -1) {
      this.numPersistantLobbies = numPersistantLobbies
    }
  }
 }

// Create a null session object for now, will be updated when the server sends a signal that the user is authenticated and their database queried
const sessionInfo = new Session(null, null, null, null, null, null, -1)

export default sessionInfo
