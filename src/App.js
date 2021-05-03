import './App.css';
import React from 'react';
import $ from 'jquery';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUserId:1,
      currentMessageId:0,
      users: [{id:0, name:'--NONE--'}],
      messages: [],
      targetComp: "",
      outputXml: "",
      outputLines: 1
    };
  }

  changeUser(idx, newvalue) {
    let {users} = this.state;
    users[idx].name = newvalue;
    this.setState({"users":users});
  }

  user(user, idx) {
    return (
      <div key={user.id} className="row border">
          <div className="col-1">
            <button className="btn btn-danger w-100" onClick={()=>this.removeUser(idx)}>X</button>
          </div>
          <div className="col">
            <input className="form-control col" type="text" placeholder="username"
              value={user.name}
              onChange={((e)=>{this.changeUser(idx, e.target.value)})}/>
          </div>
      </div>
    )
  }

  removeUser(idx) {
    let {users, messages} = this.state;
    for(let i=0; i<messages.length; i++) {
      if (messages[i].useridx === idx)
        messages[i].useridx = 0;
      else if (messages[i].useridx > idx)
        messages[i].useridx -= 1;
    }
    let newusers = [];
    for (let i=0; i<users.length; i++) {
      if (i===idx)
        continue;
      newusers.push(users[i])
    }
    this.setState({
      "users":newusers,
      "messages":messages
    });
  }

  addUser() {
    let {users, currentUserId} = this.state;
    currentUserId += 1;
    users.push({id:currentUserId, name:''});
    this.setState({
      "users":users,
      "currentUserId":currentUserId
    });
  }

  updateMessage(message, index) {
    let {messages} = this.state;
    messages[index] = message;
    this.setState({"messages":messages});
  }

  addMessage() {
    let {messages, currentMessageId} = this.state;
    currentMessageId += 1;
    messages.push({
      id:currentMessageId,
      useridx: 0,
      time: "0.0",
      content: ''
    })
    this.setState({
      "messages":messages,
      "currentMessageId":currentMessageId
    })
  }

  removeMessage(idx) {
    let {messages} = this.state;
    let newmessages = []
    for (let i=0; i<messages.length; i++) {
      if (i===idx)
        continue;
      newmessages.push(messages[i])
    }
    this.setState({"messages":newmessages})
  }

  moveMessageUp(idx) {
    if (idx===0)
      return;
    let {messages} = this.state;
    let tmp = messages[idx];
    messages[idx] = messages[idx-1];
    messages[idx-1] = tmp;
    this.setState({"messages":messages});
  }

  moveMessageDown(idx) {
    let {messages} = this.state;
    if (idx === messages.length-1)
      return;
    let tmp = messages[idx];
    messages[idx] = messages[idx+1];
    messages[idx+1] = tmp;
    this.setState({"messages":messages});
  }

  message(message, index) {
    let {users} = this.state;
    let {time,useridx,content,id} = message;

    return (
      <div key={id} className="row border">
          <div className="col-1">
              <button className="btn btn-danger w-100"
                onClick={()=>{this.removeMessage(index)}}>X</button>
          </div>
          <div className="col-1">
              <button className="btn btn-light" onClick={()=>{this.moveMessageUp(index)}}>/\</button>
              <button className="btn btn-light" onClick={()=>{this.moveMessageDown(index)}}>\/</button>
          </div>
          <div className="col-2">
              <input className="form-control" type="number" min="0" value={time}
                onChange={(e)=>{message.time = e.target.value; this.updateMessage(message,index)}}/>
          </div>
          <div className="col-2">
              <select className="form-select" value={users[useridx].name}
                onChange={(e)=>{message.useridx=e.target.selectedIndex; this.updateMessage(message,index)}}>
                  {users.map((value, idx) => {
                    return <option key={value.id}>{value.name}</option>
                  })}
              </select>
          </div>
          <div className="col-6">
              <textarea className="form-control" type="text" rows="1" value={content}
                onChange={(e)=>{message.content=e.target.value; this.updateMessage(message,index)}}></textarea>
          </div>
      </div>
    )
  }

  generateXml() {
    let {messages, users, targetComp} = this.state;
    let xmlDoc = $.parseXML("<Action/>");
    let output="<Action>\n";
    let serializer = new XMLSerializer();
    messages.forEach((message) => {
      let messageXML = xmlDoc.createElement("AddIRCMessage");
      $(messageXML).attr("Author", users[message.useridx].name);
      $(messageXML).attr("TargetComp", targetComp);
      $(messageXML).attr("Delay", parseFloat(message.time).toFixed(1));
      if (message.content.length !== 0)
        $(messageXML).append(message.content);
      else
        $(messageXML).append(" ");
      output += "\t" + serializer.serializeToString(messageXML) + "\n";
    })
    output += "</Action>"
    this.setState({
      outputXml:output,
      outputLines:output.split("\n").length
    });
  }

  render() {
    let {users, messages, targetComp, outputXml, outputLines} = this.state;
    return (
      <div className="container App">
              <div className="row border p-2 mediumtall scroll">
                  <div className="col">
                      <div className="row"><h3>Users</h3></div>
                      {users.slice(1).map((value, index) => this.user(value, index+1))}
                      <div className="d-grid gap-2 pt-2">
                          <button className="btn btn-outline-primary" onClick={()=>{this.addUser()}}>
                            Add new user
                          </button>
                      </div>
                  </div>
              </div>
              <div className="row border p-2 tall scroll">
                  <div className="col">
                      <div id="messages">
                          {messages.map((value, idx) => {
                            return this.message(value, idx)
                          })}
                      </div>
                      <div className="d-grid gap-2 pt-2">
                          <button className="btn btn-outline-primary" onClick={()=>{this.addMessage()}}>Add next message</button>
                      </div>
                  </div>
              </div>
              <div className="row border">
                  <div className="col">
                      <div className="row">
                        <div className="col input-group input-group-sm">
                          <span class="input-group-text">Target Comp</span>
                          <input type="text" className="form-control" value={targetComp}
                            onChange={(e)=>{this.setState({"targetComp":e.target.value})}}/>
                        </div>
                      </div>
                      <div className="d-grid gap-2 pt-2">
                          <button className="btn btn-outline-primary" onClick={()=>{this.generateXml()}}>Generate</button>
                      </div>
                      <textarea className="form-control w-100 nonresizable" type="text" value={outputXml} rows={outputLines} readOnly>
                      </textarea>
                  </div>
              </div>
          </div>
    );
  }
}



export default App;
