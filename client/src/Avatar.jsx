export default function Avatar({username,userId,online})
{
    const colours=['bg-red-200','bg-green-200',
                    'bg-purple-200','bg-blue-200',
                    'bg-yellow-200','bg-teal-200'];
    const userIdBase10 = parseInt(userId,16);
    const colour = colours[userIdBase10 % colours.length];
    return (
        <div className={"w-10 h-10 relative rounded-full flex items-center "+ colour}>
            <div className="text-center w-full opacity-75">{username[0]}</div>
            {online && (
                <div className="absolute w-3 h-3 bg-green-600 bottom-0 right-0 rounded-full border border-white"></div>
            )}
            {!online && (
                <div className="absolute w-3 h-3 bg-gray-600 bottom-0 right-0 rounded-full border border-white"></div>
            )}
        </div>
    );
}