import { useContext } from "react";
import { UserContext, UserContextProvider } from "./UserContext";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import Chat from "./Chat";



export default function Routes(){
    const {loggedInUsername} = useContext(UserContext);
    if(loggedInUsername)
    {
        return (
            <UserContextProvider>
                <Chat />
            </UserContextProvider>
        );
    }
    return(
        <RegisterAndLoginForm />
    )
}