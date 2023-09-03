import Avatar from "./Avatar"

export default function Contact({id,onClick,selected,username,online}){
    return(
        <div onClick= {() => onClick(id)} 
                    className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer "+(selected ? 'bg-blue-100' : '')}
                    key={id}> 
                        {selected && (
                            <div className="w-2 bg-blue-900 h-20 rounded-r-md"></div>
                        )}
                        <div className="flex gap-2 items-center py-5 pl-4">
                            <Avatar online={online} username = {username} userId = {id} />
                            <span className="text-gray-800">{username}</span>
                        </div>
                    </div>
    )
}