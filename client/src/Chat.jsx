import { useContext, useEffect, useState,useRef } from "react";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import { uniqBy } from 'lodash';
import axios from 'axios';
import Contact from "./Contact";

export default function Chat()
{
    const [ws,setWs] = useState(null);
    const [onlinePeople,setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] =  useState(null);
    const [newMessageText, setNewMessageText] = useState("");
    const [sentMessages, setSentMessages] = useState([]);
    const [offlinePeople, setOfflinePeople] = useState({});
    const divUnderMessages = useRef();
    const {id,loggedInUsername,setId,setLoggedInUsername} = useContext(UserContext);


    useEffect(() =>{
        connectToWs();
    },[]);

    function connectToWs()
    {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(()=>{
                console.log("Disconnected! Trying to reconnect.")
            },1000);
            connectToWs();
        })
    }

    function showOnlinePeople(peopleArray)
    {
        const people = {};
        peopleArray.forEach(({userId,username}) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(ev)
    {
        const messageData = JSON.parse(ev.data);
        console.log({ev,messageData});
        if('online' in messageData)
        {
            showOnlinePeople(messageData.online);
        }
        else if('text' in messageData){
            if(messageData.sender === selectedUserId)
            {
                setSentMessages(prev=>([...prev,{...messageData}]));
            }
        }
    }

    function sendMessage(ev, file=null)
    {
        if(ev)
        {
            ev.preventDefault();
        }
        ws.send(JSON.stringify({
            recipient:selectedUserId,
            text : newMessageText,
            file,
        }));
        setSentMessages(prev => ([...prev,{
            text:newMessageText,
            sender:id,
            recipient:selectedUserId,
            _id: Date.now(),
            }]));
            setNewMessageText('');
        if(file)
        {
            axios.get('/messages/'+selectedUserId).then(res => {
                setSentMessages(res.data)
            })
        }
    }

    function logOut(){
        axios.post('/logout').then(() => {
            setLoggedInUsername(null);
            setId(null);
            window.location.reload();
        })
    }

    function sendFile(ev){
        const reader = new FileReader();
        reader.readAsDataURL(ev.target.files[0]);
        reader.onload=()=>{
            sendMessage(null,{
                data:reader.result,
                name:ev.target.files[0].name,
            })
        }
    }

    useEffect(()=>{
        const div = divUnderMessages.current;
        if(div)
            div.scrollIntoView({behavior:'smooth', block:'end'});

    },[sentMessages]);

    useEffect( () => {
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data
            .filter(p=> p._id !== id)
            .filter(p => !Object.keys(onlinePeople).includes(p._id));
            const offlinePeople = {};
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id]= p;
            })
            setOfflinePeople(offlinePeople);
        });
    }, [onlinePeople])

    useEffect(()=>{
        if(selectedUserId)
        {
            axios.get('/messages/'+selectedUserId).then(res => {
                const {data} = res;
                setSentMessages(res.data);
            });
        }
    },[selectedUserId])

    const onlinePeopleExcludingOurUser = {...onlinePeople};
    delete onlinePeopleExcludingOurUser[id];

    const messagesWithoutDup =uniqBy(sentMessages, '_id') ;

    return (
        <div className="flex h-screen">
            <div className="w-1/4 flex flex-col">
                <div className="flex-grow">
                <Logo />
                {Object.keys(onlinePeopleExcludingOurUser).map(userId => (
                    <Contact id={userId} username={onlinePeopleExcludingOurUser[userId]}
                    onClick={() => setSelectedUserId(userId)} 
                    selected={selectedUserId === userId} 
                    online = {true}
                    key={userId}/>
                ))}
                {Object.keys(offlinePeople).map(userId => (
                    <Contact id={userId} username={offlinePeople[userId].username}
                    onClick={() => setSelectedUserId(userId)} 
                    selected={selectedUserId === userId} 
                    online = {false}
                    key={userId}/>
                ))}
            </div>
            <div className="p-2 text-center">
                <span className="p-2 text-md">Hello {loggedInUsername}!</span>
                <button className="text-sm text-gray-750 bg-blue-300 border rounded-md p-2"
                onClick={logOut}>LogOut</button>
            </div>
            </div>
            <div className="flex flex-col bg-blue-200 w-3/4 p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-gray-500">Please select a user to start chatting</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div className="relative h-full ">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                {messagesWithoutDup.map(message => (
                                    <div className={(message.sender === id ? 'text-right' : 'text-left')} 
                                    key = {messagesWithoutDup.indexOf(message)}>
                                    <div className={"text-left inline-block p-2 m-2 rounded-lg " + (message.sender === id ? 'bg-green-500 text-white' : 'bg-gray-300 ')} >
                                        {message.text}
                                        {message.file && (
                                            <div>
                                                <a target="_blank" className="underline"
                                                 href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                                    {message.file}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    </div>
                                ))}
                                <div ref = {divUnderMessages}></div>
                            </div>
                        </div>
                    )}
                    </div>
                
                {!!selectedUserId && (
                <form className="flex gap-1" onSubmit={sendMessage}>
                    <input type = "text" value={newMessageText} placeholder="Type your message here"
                    className="bg-white flex-grow border p-2 rounded-lg"
                    onChange={ev => setNewMessageText(ev.target.value)} />
                    <label type="button" className="p-5 bg-gray-300 border rounded-md cursor-pointer">
                        <input type="file" className="hidden" onChange={sendFile}/>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                        </svg>
                    </label>
                    <button type="submit" className="bg-blue-500 p-5 text-white rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
                )}
            </div>
        </div>
    )
}