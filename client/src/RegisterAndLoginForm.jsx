import { useContext, useState } from "react";
import axios from 'axios';
import { UserContext } from "./UserContext.jsx";

export default function RegisterAndLoginForm()
{
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister,setIsLoginOrRegister] = useState('register');
    const {setLoggedInUsername,setId}=useContext(UserContext);

    async function handleSubmit(ev){
        ev.preventDefault();
        const url = isLoginOrRegister === 'register'? '/register' : '/login';
        const {data} = await axios.post(url,{username,password});
        setLoggedInUsername(username);
        setId(data.id);
    }

    return(
        <div className="bg-blue-200 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input value = {username}
                onChange={ev => setUsername(ev.target.value)}
                type = "text" placeholder="Username" 
                className="block w-full rounded-sm p-2 mb-2 border"/>
                <input value = {password}
                onChange={ev => setPassword(ev.target.value)}
                type = "password" placeholder="Password" 
                className="block w-full rounded-sm p-2 mb-2 border"/>
                <button className="bg-blue-500 text-white block w-full rounded-md p-2" type="submit">
                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                </button>
                <div className="text-center mt-2">
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member? 
                            <button  onClick={()=> setIsLoginOrRegister('login')}>
                                Click here to login!
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Not a member? 
                            <button onClick={()=> setIsLoginOrRegister('register')}>
                                Register for an account!
                            </button>
                        </div>
                    )}
                    
                </div>
            </form>
        </div>
    );
}